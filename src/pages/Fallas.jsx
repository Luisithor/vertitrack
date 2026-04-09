import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { 
  Search, Plus, Edit, Trash2, User, Building, 
  AlertTriangle, Clock, CheckCircle, ShieldAlert,
  ClipboardList, Activity, Info, X, Calendar
} from "lucide-react";

const Fallas = () => {
  const [fallas, setFallas] = useState([]);
  const [elevadores, setElevadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFalla, setCurrentFalla] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroUrgencia, setFiltroUrgencia] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const nombreUsuarioLogueado = localStorage.getItem("nombre_usuario") || "Usuario";
  const idUsuarioLogueado = localStorage.getItem("id_usuario");

  const [formData, setFormData] = useState({
    id_elevador: "",
    tipo_falla: "",
    descripcion_falla: "",
    urgencia: "Media",
    estado_reporte: "Pendiente",
  });

  useEffect(() => {
    fetchFallas();
    fetchElevadores();
  }, []);

  const fetchFallas = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/fallas/lista");
      const data = await res.json();
      setFallas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando fallas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchElevadores = async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/elevadores/lista");
      const data = await res.json();
      setElevadores(data);
    } catch (error) {
      console.error("Error cargando elevadores:", error);
    }
  };

  const openModal = (falla = null) => {
    if (falla) {
      setCurrentFalla(falla);
      setFormData({
        id_elevador: falla.id_elevador,
        tipo_falla: falla.tipo_falla,
        descripcion_falla: falla.descripcion_falla || "",
        urgencia: falla.urgencia,
        estado_reporte: falla.estado_reporte,
      });
    } else {
      setCurrentFalla(null);
      setFormData({
        id_elevador: "",
        tipo_falla: "",
        descripcion_falla: "",
        urgencia: "Media",
        estado_reporte: "Pendiente",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...formData, id_usuario: idUsuarioLogueado };
    try {
      const url = currentFalla
        ? `https://vertitrack-backend.onrender.com/api/fallas/actualizar/${currentFalla.id_falla}`
        : "https://vertitrack-backend.onrender.com/api/fallas/crear";
      await fetch(url, {
        method: currentFalla ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      fetchFallas();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const getElevadorInfo = (id_elevador) => {
    return elevadores.find((e) => e.id_elevador === id_elevador) || null;
  };

  const getUrgenciaBadge = (urgencia) => {
    const badges = {
      Crítica: { class: "bg-danger", icon: ShieldAlert },
      Alta: { class: "bg-warning text-dark", icon: AlertTriangle },
      Media: { class: "bg-info", icon: Info },
      Baja: { class: "bg-secondary", icon: Activity },
    };
    return badges[urgencia] || { class: "bg-info", icon: Info };
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      Pendiente: { class: "bg-warning text-dark", icon: Clock },
      "En Proceso": { class: "bg-info", icon: Edit },
      Atendido: { class: "bg-success", icon: CheckCircle },
    };
    return badges[estado] || { class: "bg-warning text-dark", icon: Clock };
  };

  const filteredFallas = fallas.filter((falla) => {
    const elevador = getElevadorInfo(falla.id_elevador);
    const matchesSearch =
      falla.tipo_falla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      falla.descripcion_falla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elevador?.ubicacion_especifica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elevador?.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgencia = !filtroUrgencia || falla.urgencia === filtroUrgencia;
    const matchesEstado = !filtroEstado || falla.estado_reporte === filtroEstado;
    return matchesSearch && matchesUrgencia && matchesEstado;
  });

  const stats = {
    total: fallas.length,
    criticas: fallas.filter((f) => f.urgencia === "Crítica").length,
    pendientes: fallas.filter((f) => f.estado_reporte === "Pendiente").length,
    enProceso: fallas.filter((f) => f.estado_reporte === "En Proceso").length,
  };

  return (
    <LayoutPublic>
      <div className="container-fluid px-4 py-4 bg-light min-vh-100">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <nav className="navbar navbar-expand-lg navbar-light bg-white rounded-3 shadow-sm px-4 py-3">
              <div className="container-fluid px-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
                    <ShieldAlert className="text-danger" size={28} />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">Gestión de Fallas Vertitrack</h5>
                    <small className="text-muted">Control técnico de incidencias</small>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 text-muted small border-start ps-3">
                  <Calendar size={16} />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </nav>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: "Total", val: stats.total, color: "primary", icon: ClipboardList },
            { label: "Críticas", val: stats.criticas, color: "danger", icon: ShieldAlert },
            { label: "Pendientes", val: stats.pendientes, color: "warning", icon: Clock },
            { label: "En Proceso", val: stats.enProceso, color: "info", icon: Edit },
          ].map((item, idx) => (
            <div className="col-md-3" key={idx}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center">
                  <div className={`bg-${item.color} bg-opacity-10 rounded-3 p-3 me-3`}>
                    <item.icon className={`text-${item.color}`} size={24} />
                  </div>
                  <div>
                    <h6 className="text-muted small mb-1">{item.label}</h6>
                    <h4 className="mb-0 fw-bold">{item.val}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar falla o cliente..." 
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filtroUrgencia} onChange={(e) => setFiltroUrgencia(e.target.value)}>
                <option value="">Todas las urgencias</option>
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Atendido">Atendido</option>
              </select>
            </div>
            <div className="col-md-4 text-end">
              <button onClick={() => openModal()} className="btn btn-danger px-4 d-inline-flex align-items-center gap-2 shadow-sm">
                <Plus size={18} /> Nuevo Reporte
              </button>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small fw-bold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">ELEVADOR / CLIENTE</th>
                  <th className="py-3">ATENDIDO POR</th>
                  <th className="py-3">TIPO FALLA</th>
                  <th className="py-3 text-center">URGENCIA</th>
                  <th className="py-3 text-center">ESTADO</th>
                  <th className="py-3 text-end px-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-danger" /></td></tr>
                ) : filteredFallas.map((f) => {
                  const elevador = getElevadorInfo(f.id_elevador);
                  const urgencia = getUrgenciaBadge(f.urgencia);
                  const estado = getEstadoBadge(f.estado_reporte);
                  const UrgIcon = urgencia.icon;
                  const EstIcon = estado.icon;

                  return (
                    <tr key={f.id_falla}>
                      <td className="px-4 fw-bold text-muted">#{f.id_falla}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Building size={16} className="text-muted" />
                          <div>
                            <div className="fw-bold">{elevador?.ubicacion_especifica || "..."}</div>
                            <small className="text-muted text-uppercase">{elevador?.nombre_cliente || "---"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2 text-primary">
                          <User size={14} />
                          <span className="small fw-semibold">{f.nombre_usuario || "SISTEMA"}</span>
                        </div>
                      </td>
                      <td><span className="small text-dark fw-medium">{f.tipo_falla}</span></td>
                      <td className="text-center">
                        <span className={`badge ${urgencia.class} bg-opacity-10 text-${urgencia.class.includes('danger') ? 'danger' : 'dark'} d-inline-flex align-items-center gap-1 p-2`}>
                          <UrgIcon size={14} /> {f.urgencia}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${estado.class} bg-opacity-10 text-${estado.class.includes('success') ? 'success' : 'dark'} d-inline-flex align-items-center gap-1 p-2`}>
                          <EstIcon size={14} /> {f.estado_reporte}
                        </span>
                      </td>
                      <td className="text-end px-4">
                        <div className="btn-group gap-1">
                          <button onClick={() => openModal(f)} className="btn btn-sm btn-light text-primary border" title="Editar">
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-sm btn-light text-danger border" title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg animate__animated animate__zoomIn animate__faster">
                <div className="modal-header border-0 bg-light p-4">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <ShieldAlert className="text-danger" />
                    {currentFalla ? "Actualizar Reporte" : "Nueva Incidencia Técnica"}
                  </h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-md-12 mb-2">
                        <label className="form-label small fw-bold text-muted text-uppercase">Responsable</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white border-end-0 text-success"><User size={18} /></span>
                          <input type="text" className="form-control bg-white border-start-0 fw-bold" value={nombreUsuarioLogueado} readOnly disabled />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted text-uppercase">Elevador *</label>
                        <select className="form-select form-select-lg" required value={formData.id_elevador} 
                          onChange={(e) => setFormData({ ...formData, id_elevador: parseInt(e.target.value) })}>
                          <option value="">Seleccionar equipo...</option>
                          {elevadores.map((e) => (
                            <option key={e.id_elevador} value={e.id_elevador}>
                              {e.nombre_cliente} — {e.ubicacion_especifica} ({e.tipo_equipo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted text-uppercase">Tipo de Falla *</label>
                        <input type="text" className="form-control" required placeholder="Ej: Ruido en motor" 
                          value={formData.tipo_falla} onChange={(e) => setFormData({ ...formData, tipo_falla: e.target.value })} />
                      </div>

                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Urgencia</label>
                        <select className="form-select" value={formData.urgencia} onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}>
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                          <option value="Crítica">Crítica</option>
                        </select>
                      </div>

                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-muted text-uppercase">Estatus</label>
                        <select className="form-select" value={formData.estado_reporte} onChange={(e) => setFormData({ ...formData, estado_reporte: e.target.value })}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Atendido">Atendido</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted text-uppercase">Descripción técnica</label>
                        <textarea className="form-control" rows="3" placeholder="Detalles de lo observado..." 
                          value={formData.descripcion_falla} onChange={(e) => setFormData({ ...formData, descripcion_falla: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 bg-light p-3">
                    <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-danger px-4 shadow-sm fw-bold d-flex align-items-center gap-2" disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm" /> : <CheckCircle size={18} />}
                      {currentFalla ? "Guardar Cambios" : "Emitir Reporte"}
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

export default Fallas;