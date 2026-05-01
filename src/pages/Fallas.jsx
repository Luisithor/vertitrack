import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import {
  Search, Plus, Edit, AlertTriangle, Clock, 
  CheckCircle, ShieldAlert, ClipboardList, 
  Activity, Info, Calendar, Building, User
} from "lucide-react";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "vertitrack-f6f00.firebaseapp.com",
  projectId: "vertitrack-f6f00",
  storageBucket: "vertitrack-f6f00.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

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
    const habilitarNotificaciones = async () => {
      try {
        const permiso = await Notification.requestPermission();
        if (permiso === "granted") {
          const tokenActual = await getToken(messaging, {
            vapidKey: "BF-TBxOz3GpCZW4iczgoDS8j05pcCEGAc80ThHOhzK_EdYKh4SAhMuG9ZMhWzjp0Um386lyfDOL-As6QfWwK6pg",
          });

          if (tokenActual) {
            await fetch("https://vertitrack-backend.onrender.com/api/usuarios/actualizar-token", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario: idUsuarioLogueado,
                token_push: tokenActual,
              }),
            });
          }
        }
      } catch (error) {
        console.error("Error al configurar notificaciones:", error);
      }
    };

    habilitarNotificaciones();
    fetchFallas();
    fetchElevadores();
  }, [idUsuarioLogueado]);

  const fetchFallas = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/fallas/lista");
      const data = await res.json();
      setFallas(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchElevadores = async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/elevadores/lista");
      const data = await res.json();
      setElevadores(data);
    } catch (error) { console.error(error); }
  };

  const openModal = (falla = null) => {
    if (falla) {
      setCurrentFalla(falla);
      setFormData({ ...falla, descripcion_falla: falla.descripcion_falla || "" });
    } else {
      setCurrentFalla(null);
      setFormData({ id_elevador: "", tipo_falla: "", descripcion_falla: "", urgencia: "Media", estado_reporte: "Pendiente" });
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
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const getUrgenciaBadge = (urgencia) => {
    const badges = {
      Crítica: { class: "bg-danger text-danger", icon: ShieldAlert },
      Alta: { class: "bg-warning text-warning", icon: AlertTriangle },
      Media: { class: "bg-info text-info", icon: Info },
      Baja: { class: "bg-secondary text-secondary", icon: Activity },
    };
    return badges[urgencia] || badges["Media"];
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      Pendiente: { class: "bg-warning text-warning", icon: Clock },
      "En Proceso": { class: "bg-info text-info", icon: Edit },
      Atendido: { class: "bg-success text-success", icon: CheckCircle },
    };
    return badges[estado] || badges["Pendiente"];
  };

  const filteredFallas = fallas.filter((falla) => {
    const elevador = elevadores.find(e => e.id_elevador === falla.id_elevador);
    const matchesSearch =
      falla.tipo_falla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      falla.descripcion_falla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elevador?.ubicacion_especifica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elevador?.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgencia = !filtroUrgencia || falla.urgencia === filtroUrgencia;
    const matchesEstado = filtroEstado ? falla.estado_reporte === filtroEstado : falla.estado_reporte !== "Atendido";
    
    return matchesSearch && matchesUrgencia && matchesEstado;
  });

  return (
    <LayoutPublic>
      <div className="container-fluid px-4 py-4 bg-light min-vh-100">
        
        {/* Header Superior al estilo Elevadores */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Gestión de Fallas</h4>
            <p className="text-muted small">Control técnico de incidencias y reportes</p>
          </div>
          <button className="btn btn-danger d-flex align-items-center gap-2 shadow-sm px-4 py-2" onClick={() => openModal()}>
            <Plus size={18} /> Nuevo Reporte
          </button>
        </div>

        {/* Stats Grid con diseño de Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
                  <ShieldAlert className="text-danger" size={24} />
                </div>
                <div>
                  <h6 className="text-muted small mb-0">Incidencias Activas</h6>
                  <h4 className="fw-bold mb-0">{filteredFallas.length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-0 ps-0"
                    placeholder="Buscar por falla, cliente o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select className="form-select border-0 bg-light" value={filtroUrgencia} onChange={(e) => setFiltroUrgencia(e.target.value)}>
                  <option value="">Todas las Urgencias</option>
                  <option value="Crítica">Crítica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select border-0 bg-light" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                  <option value="">Pendientes y En Proceso</option>
                  <option value="Pendiente">Solo Pendientes</option>
                  <option value="En Proceso">Solo En Proceso</option>
                  <option value="Atendido">Ver Historial (Atendidos)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Fallas (Cards Responsivas) */}
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5"><div className="spinner-border text-danger" /></div>
          ) : filteredFallas.length === 0 ? (
            <div className="col-12 text-center py-5 bg-white rounded-3 shadow-sm">
              <ClipboardList size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="text-muted">No hay reportes que coincidan</h5>
            </div>
          ) : (
            filteredFallas.map((f) => {
              const elevador = elevadores.find(e => e.id_elevador === f.id_elevador);
              const urgBadge = getUrgenciaBadge(f.urgencia);
              const estBadge = getEstadoBadge(f.estado_reporte);
              const StatusIcon = estBadge.icon;
              const UrgenciaIcon = urgBadge.icon;

              return (
                <div className="col-md-6 col-lg-4 col-xl-3" key={f.id_falla}>
                  <div className="card border-0 shadow-sm h-100 lift-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={`badge ${urgBadge.class} bg-opacity-10 d-flex align-items-center gap-1 p-2`}>
                          <UrgenciaIcon size={14} /> {f.urgencia}
                        </span>
                        <button className="btn btn-sm btn-light text-danger rounded-circle p-2" onClick={() => openModal(f)}>
                          <Edit size={16} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Building size={14} className="text-danger" />
                          <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                            {elevador?.nombre_cliente || "Cargando..."}
                          </small>
                        </div>
                        <h5 className="fw-bold mb-0 text-dark">{f.tipo_falla}</h5>
                        <p className="text-muted small mb-2">{elevador?.ubicacion_especifica}</p>
                      </div>

                      <div className="bg-light rounded-3 p-3 mb-3">
                        <p className="small text-muted mb-0" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {f.descripcion_falla || "Sin descripción adicional."}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                        <div className="d-flex align-items-center gap-2">
                           <User size={14} className="text-muted" />
                           <span className="x-small fw-bold text-muted">{f.nombre_usuario || "Sistema"}</span>
                        </div>
                        <div className={`d-flex align-items-center gap-1 small fw-bold ${estBadge.class.replace('bg-', 'text-')}`}>
                          <StatusIcon size={14} /> {f.estado_reporte}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Reporte */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold">{currentFalla ? "Actualizar Reporte" : "Nueva Incidencia"}</h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body py-4">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">ELEVADOR AFECTADO</label>
                        <select className="form-select form-select-lg" required value={formData.id_elevador} 
                          onChange={(e) => setFormData({ ...formData, id_elevador: parseInt(e.target.value) })}>
                          <option value="">Seleccione equipo...</option>
                          {elevadores.map((e) => (
                            <option key={e.id_elevador} value={e.id_elevador}>{e.nombre_cliente} - {e.ubicacion_especifica}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TIPO DE FALLA</label>
                        <input className="form-control form-control-lg" required value={formData.tipo_falla} onChange={(e) => setFormData({ ...formData, tipo_falla: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">URGENCIA</label>
                        <select className="form-select" value={formData.urgencia} onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}>
                          <option value="Baja">Baja</option>
                          <option value="Media">Media</option>
                          <option value="Alta">Alta</option>
                          <option value="Crítica">Crítica</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">ESTATUS</label>
                        <select className="form-select" value={formData.estado_reporte} onChange={(e) => setFormData({ ...formData, estado_reporte: e.target.value })}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Atendido">Atendido</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">DESCRIPCIÓN DETALLADA</label>
                        <textarea className="form-control" rows="3" value={formData.descripcion_falla} onChange={(e) => setFormData({ ...formData, descripcion_falla: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-danger px-4 py-2" disabled={loading}>
                      {loading ? "Enviando..." : currentFalla ? "Guardar Cambios" : "Crear Reporte"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .lift-card { transition: all 0.3s ease; border-radius: 12px; }
          .lift-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
          .x-small { font-size: 0.75rem; }
        `}</style>
      </div>
    </LayoutPublic>
  );
};

export default Fallas;