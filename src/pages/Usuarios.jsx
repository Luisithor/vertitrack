import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { 
  Plus, Search, Edit, User, Mail, 
  Phone, Calendar, Shield, Trash2, Key, 
  UserCheck, X, FileText, ChevronRight
} from "lucide-react";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    usuario: "",
    correo: "",
    telefono: "",
    rol: "Tecnico",
    contrasena: "",
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/usuarios/lista");
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error fetching usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (usuario = null) => {
    if (usuario) {
      setCurrentUsuario(usuario);
      const fechaFormateada = usuario.fecha_nacimiento ? usuario.fecha_nacimiento.split("T")[0] : "";
      setFormData({
        ...usuario,
        fecha_nacimiento: fechaFormateada,
        contrasena: "" 
      });
    } else {
      setCurrentUsuario(null);
      setFormData({
        nombre: "",
        apellido_paterno: "",
        apellido_materno: "",
        fecha_nacimiento: "",
        usuario: "",
        correo: "",
        telefono: "",
        rol: "Tecnico",
        contrasena: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = currentUsuario
        ? `https://vertitrack-backend.onrender.com/api/usuarios/actualizar/${currentUsuario.id_usuario}`
        : "https://vertitrack-backend.onrender.com/api/usuarios/crear";

      const res = await fetch(url, {
        method: currentUsuario ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsuarios();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await fetch(`https://vertitrack-backend.onrender.com/api/usuarios/eliminar/${id}`, {
          method: "DELETE",
        });
        fetchUsuarios();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Gestión de Usuarios</h4>
            <p className="text-muted small">Control de accesos, roles y personal técnico</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            onClick={() => openModal()}
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <Search size={18} className="text-muted" />
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-0" 
                placeholder="Buscar por nombre, cuenta o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 border-0 small fw-bold text-muted">USUARIO</th>
                  <th className="py-3 border-0 small fw-bold text-muted">CONTACTO</th>
                  <th className="py-3 border-0 small fw-bold text-muted">ROL</th>
                  <th className="py-3 border-0 small fw-bold text-muted">REGISTRO</th>
                  <th className="py-3 border-0 small fw-bold text-muted text-end px-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <User size={40} className="mb-2 opacity-25" />
                      <p>No se encontraron usuarios</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((u) => (
                    <tr key={u.id_usuario}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="bg-light p-2 rounded-circle">
                            <User size={20} className="text-primary" />
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{u.nombre} {u.apellido_paterno}</span>
                            <small className="text-muted">@{u.usuario}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="d-flex align-items-center gap-1"><Mail size={12}/> {u.correo}</span>
                          <span className="text-muted d-flex align-items-center gap-1"><Phone size={12}/> {u.telefono}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${
                          u.rol === 'Admin' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'
                        } border-0 px-3`}>
                          {u.rol}
                        </span>
                      </td>
                      <td>
                        <span className="small text-muted">
                          {u.fecha_nacimiento ? new Date(u.fecha_nacimiento).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-light text-primary"
                            onClick={() => openModal(u)}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn btn-sm btn-light text-danger"
                            onClick={() => handleDelete(u.id_usuario)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <UserCheck size={20} /> {currentUsuario ? `Editar Usuario: ${currentUsuario.usuario}` : 'Registrar Nuevo Usuario'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="text-muted small fw-bold text-uppercase">Nombre(s)</label>
                      <input required className="form-control" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small fw-bold text-uppercase">Apellido Paterno</label>
                      <input required className="form-control" value={formData.apellido_paterno} onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="text-muted small fw-bold text-uppercase">Apellido Materno</label>
                      <input className="form-control" value={formData.apellido_materno} onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">Rol de Acceso</label>
                      <select 
                        className="form-select border-start border-primary border-3" 
                        value={formData.rol} 
                        onChange={(e) => setFormData({...formData, rol: e.target.value})}
                        required
                      >
                        <option value="Admin">Administrador</option>
                        <option value="Tecnico">Técnico Operativo</option>
                        <option value="Cliente">Cliente Externo</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">Nombre de Usuario (@)</label>
                      <input required className="form-control" value={formData.usuario} onChange={(e) => setFormData({...formData, usuario: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">Correo Electrónico</label>
                      <input required type="email" className="form-control" value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">Teléfono de Contacto</label>
                      <input className="form-control" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">Fecha de Nacimiento</label>
                      <input required type="date" className="form-control" value={formData.fecha_nacimiento} onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold text-uppercase">
                        {currentUsuario ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><Key size={16}/></span>
                        <input 
                          type="password" 
                          className="form-control" 
                          placeholder={currentUsuario ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"}
                          required={!currentUsuario}
                          value={formData.contrasena} 
                          onChange={(e) => setFormData({...formData, contrasena: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 bg-light p-3">
                  <button type="button" className="btn btn-secondary px-4" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                    {loading ? "Guardando..." : currentUsuario ? "Actualizar Usuario" : "Crear Usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </LayoutPublic>
  );
};

export default Usuarios;