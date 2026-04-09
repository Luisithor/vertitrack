import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { 
  Search, Plus, Edit, Trash2, User, Building, 
  AlertTriangle, Clock, CheckCircle, ShieldAlert,
  ClipboardList, Activity, Info, X, Calendar
} from "lucide-react";

const Fallas = () => {
  // ... (Estados y funciones se mantienen exactamente igual que en tu código)
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
      <div className="container-fluid px-2 px-md-4 py-4 bg-light min-vh-100">
        
        {/* Header Responsivo */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="bg-white rounded-3 shadow-sm px-3 px-md-4 py-3 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center w-100">
                <div className="bg-danger bg-opacity-10 rounded-3 p-2 me-3">
                  <ShieldAlert className="text-danger" size={24} />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">Gestión de Fallas</h5>
                  <small className="text-muted d-none d-sm-block">Control técnico de incidencias</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 text-muted small w-100 justify-content-md-end border-top pt-2 pt-md-0 border-md-0">
                <Calendar size={16} />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Scrollable en móvil */}
        <div className="row g-3 mb-4 overflow-auto flex-nowrap flex-md-wrap pb-2 pb-md-0">
          {[
            { label: "Total", val: stats.total, color: "primary", icon: ClipboardList },
            { label: "Críticas", val: stats.criticas, color: "danger", icon: ShieldAlert },
            { label: "Pendientes", val: stats.pendientes, color: "warning", icon: Clock },
            { label: "Proceso", val: stats.enProceso, color: "info", icon: Edit },
          ].map((item, idx) => (
            <div className="col-8 col-sm-6 col-md-3" key={idx}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center p-3">
                  <div className={`bg-${item.color} bg-opacity-10 rounded-3 p-2 p-md-3 me-3`}>
                    <item.icon className={`text-${item.color}`} size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted small mb-0">{item.label}</h6>
                    <h4 className="mb-0 fw-bold">{item.val}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros y Acciones */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                  <input type="text" className="form-control border-start-0 ps-0" placeholder="Buscar falla o cliente..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="col-6 col-lg-2">
                <select className="form-select" value={filtroUrgencia} onChange={(e) => setFiltroUrgencia(e.target.value)}>
                  <option value="">Urgencia</option>
                  <option value="Crítica">Crítica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div className="col-6 col-lg-2">
                <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Atendido">Atendido</option>
                </select>
              </div>
              <div className="col-12 col-lg-4 text-lg-end">
                <button onClick={() => openModal()} className="btn btn-danger w-100 w-lg-auto px-4 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm">
                  <Plus size={18} /> Nuevo Reporte
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listado - Vista de Tabla (Desktop) y Tarjetas (Móvil) */}
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* Tabla Oculta en XS/SM */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small fw-bold">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">ELEVADOR / CLIENTE</th>
                  <th className="py-3">Técnico</th>
                  <th className="py-3 text-center">URGENCIA</th>
                  <th className="py-3 text-center">ESTADO</th>
                  <th className="py-3 text-end px-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-danger" /></td></tr>
                ) : filteredFallas.map((f) => {
                  const elevador = getElevadorInfo(f.id_elevador);
                  const urgencia = getUrgenciaBadge(f.urgencia);
                  const estado = getEstadoBadge(f.estado_reporte);
                  return (
                    <tr key={f.id_falla}>
                      <td className="px-4 fw-bold text-muted">#{f.id_falla}</td>
                      <td>
                        <div className="fw-bold">{elevador?.ubicacion_especifica || "..."}</div>
                        <small className="text-muted text-uppercase">{elevador?.nombre_cliente || "---"}</small>
                      </td>
                      <td><span className="small fw-semibold">{f.nombre_usuario || "SISTEMA"}</span></td>
                      <td className="text-center">
                        <span className={`badge ${urgencia.class} bg-opacity-10 text-dark p-2`}><urgencia.icon size={14} className="me-1"/>{f.urgencia}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${estado.class} bg-opacity-10 text-dark p-2`}><estado.icon size={14} className="me-1"/>{f.estado_reporte}</span>
                      </td>
                      <td className="text-end px-4">
                        <button onClick={() => openModal(f)} className="btn btn-sm btn-light border me-1"><Edit size={16} /></button>
                        <button className="btn btn-sm btn-light text-danger border"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas Visibles en XS/SM */}
          <div className="d-md-none">
            {loading ? (
              <div className="text-center py-5"><div className="spinner-border text-danger" /></div>
            ) : filteredFallas.map((f) => {
              const elevador = getElevadorInfo(f.id_elevador);
              const urgencia = getUrgenciaBadge(f.urgencia);
              const estado = getEstadoBadge(f.estado_reporte);
              return (
                <div key={f.id_falla} className="p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-muted small">#{f.id_falla}</span>
                    <div className="d-flex gap-2">
                      <span className={`badge ${urgencia.class} bg-opacity-10 text-dark small`}><urgencia.icon size={12}/></span>
                      <span className={`badge ${estado.class} bg-opacity-10 text-dark small`}><estado.icon size={12}/></span>
                    </div>
                  </div>
                  <h6 className="mb-0 fw-bold">{elevador?.ubicacion_especifica}</h6>
                  <p className="small text-muted mb-2">{elevador?.nombre_cliente}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-primary fw-bold"><User size={12} /> {f.nombre_usuario || "Sistema"}</small>
                    <div className="btn-group gap-2">
                      <button onClick={() => openModal(f)} className="btn btn-sm btn-light border"><Edit size={16}/></button>
                      <button className="btn btn-sm btn-light border text-danger"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Responsivo */}
        {isModalOpen && (
          <div className="modal show d-block p-2" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered mx-auto" style={{ maxWidth: '100%', width: 'auto' }}>
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 bg-light p-3">
                  <h5 className="modal-title fw-bold small d-flex align-items-center gap-2">
                    <ShieldAlert className="text-danger" size={18} />
                    {currentFalla ? "Editar Reporte" : "Nueva Incidencia"}
                  </h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Responsable</label>
                        <input type="text" className="form-control bg-light" value={nombreUsuarioLogueado} readOnly disabled />
                      </div>
                      <div className="col-12">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Equipo *</label>
                        <select className="form-select" required value={formData.id_elevador} 
                          onChange={(e) => setFormData({ ...formData, id_elevador: parseInt(e.target.value) })}>
                          <option value="">Seleccionar...</option>
                          {elevadores.map((e) => (
                            <option key={e.id_elevador} value={e.id_elevador}>{e.nombre_cliente} - {e.ubicacion_especifica}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Tipo de Falla *</label>
                        <input type="text" className="form-control" required value={formData.tipo_falla} onChange={(e) => setFormData({ ...formData, tipo_falla: e.target.value })} />
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Urgencia</label>
                        <select className="form-select" value={formData.urgencia} onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}>
                          <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option>
                        </select>
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Estatus</label>
                        <select className="form-select" value={formData.estado_reporte} onChange={(e) => setFormData({ ...formData, estado_reporte: e.target.value })}>
                          <option value="Pendiente">Pendiente</option><option value="En Proceso">En Proceso</option><option value="Atendido">Atendido</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label x-small fw-bold text-muted text-uppercase">Descripción</label>
                        <textarea className="form-control" rows="3" value={formData.descripcion_falla} onChange={(e) => setFormData({ ...formData, descripcion_falla: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 bg-light p-2 d-flex flex-column flex-md-row">
                    <button type="button" className="btn btn-link text-muted w-100 w-md-auto mb-2 mb-md-0" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-danger w-100 w-md-auto px-4 shadow-sm" disabled={loading}>
                      {currentFalla ? "Guardar" : "Reportar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .x-small { font-size: 0.7rem; }
          .border-md-0 { border: none !important; }
          @media (max-width: 768px) {
            .container-fluid { padding-bottom: 80px !important; }
          }
        `}</style>

      </div>
    </LayoutPublic>
  );
};

export default Fallas;