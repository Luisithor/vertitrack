import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { UserPlus, Search, MapPin, Phone, Edit, Trash2, Building } from "lucide-react";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);

  const [formData, setFormData] = useState({
    nombre_cliente: "",
    contacto: "",
    direccion: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/clientes/lista");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (cliente = null) => {
    if (cliente) {
      setCurrentCliente(cliente);
      setFormData({
        nombre_cliente: cliente.nombre_cliente,
        contacto: cliente.contacto || "",
        direccion: cliente.direccion || "",
      });
    } else {
      setCurrentCliente(null);
      setFormData({ nombre_cliente: "", contacto: "", direccion: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = currentCliente 
      ? `http://localhost:3000/api/clientes/actualizar/${currentCliente.id_cliente}`
      : "http://localhost:3000/api/clientes/crear";
    
    try {
      await fetch(url, {
        method: currentCliente ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente? Se borrarán sus datos asociados.")) {
      try {
        await fetch(`http://localhost:3000/api/clientes/eliminar/${id}`, { method: "DELETE" });
        fetchData();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const filteredClientes = clientes.filter(c =>
    c.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Gestión de Clientes</h4>
            <p className="text-muted small">Administra las empresas y contactos de la red Vertitrack</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openModal()}>
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        </div>

        {/* Search Bar */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar cliente por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="row g-4">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            filteredClientes.map((c) => (
              <div key={c.id_cliente} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                        <Building className="text-primary" size={24} />
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-light text-primary" onClick={() => openModal(c)}><Edit size={16} /></button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(c.id_cliente)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h5 className="fw-bold mb-3">{c.nombre_cliente}</h5>
                    <div className="space-y-2 text-muted small">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Phone size={14} /> {c.contacto || "Sin contacto"}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={14} /> {c.direccion || "Sin dirección"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0">
                <div className="modal-header">
                  <h5 className="fw-bold">{currentCliente ? "Editar Cliente" : "Nuevo Cliente"}</h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Nombre del Cliente / Empresa</label>
                      <input 
                        type="text" className="form-control" required 
                        value={formData.nombre_cliente}
                        onChange={(e) => setFormData({...formData, nombre_cliente: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Contacto (Tel/Email)</label>
                      <input 
                        type="text" className="form-control" 
                        value={formData.contacto}
                        onChange={(e) => setFormData({...formData, contacto: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Dirección</label>
                      <textarea 
                        className="form-control" rows="3"
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Guardando..." : "Guardar Cliente"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutPublic>
  );
};

export default Clientes;