import React, { useState, useEffect, useCallback } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  Search, Plus, Edit, AlertTriangle, Clock, 
  CheckCircle, ShieldAlert, ClipboardList, 
  Activity, Info, Building, User, Bell, BellOff
} from "lucide-react";

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCqOZagQ0aQrt0toSMHOg2La1QKq6b2l-o",
    authDomain: "vertitrack-f6f00.firebaseapp.com",
    projectId: "vertitrack-f6f00",
    storageBucket: "vertitrack-f6f00.firebasestorage.app",
    messagingSenderId: "406370468247",
    appId: "1:406370468247:web:d01754c3909ea3ef82c4d2"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const Fallas = () => {
  // Estados de Datos
  const [fallas, setFallas] = useState([]);
  const [elevadores, setElevadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Estados de UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFalla, setCurrentFalla] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroUrgencia, setFiltroUrgencia] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const idUsuarioLogueado = localStorage.getItem("id_usuario");

  const [formData, setFormData] = useState({
    id_elevador: "",
    tipo_falla: "",
    descripcion_falla: "",
    urgencia: "Media",
    estado_reporte: "Pendiente",
  });

  // --- MÉTODOS DE DATOS ---
  const fetchFallas = useCallback(async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/fallas/lista");
      const data = await res.json();
      setFallas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetch fallas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchElevadores = async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/elevadores/lista");
      const data = await res.json();
      setElevadores(data);
    } catch (error) {
      console.error("Error fetch elevadores:", error);
    }
  };

  // --- LÓGICA DE NOTIFICACIONES ---
  useEffect(() => {
    const habilitarNotificaciones = async () => {
      if (!idUsuarioLogueado) return;
      
      try {
        const permiso = await Notification.requestPermission();
        if (permiso === "granted") {
          const tokenActual = await getToken(messaging, {
            vapidKey: "BF-TBxOz3GpCZW4iczgoDS8j05pcCEGAc80ThHOhzK_EdYKh4SAhMuG9ZMhWzjp0Um386lyfDOL-As6QfWwK6pg",
          });

          if (tokenActual) {
            setPushEnabled(true);
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
        console.error("Error Push:", error);
      }
    };

    // Escuchar mensajes en primer plano (Foreground)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Mensaje recibido:", payload);
      // Opcional: Implementar un Toast aquí
      fetchFallas(); // Refrescar lista automáticamente
    });

    habilitarNotificaciones();
    fetchFallas();
    fetchElevadores();

    return () => unsubscribe();
  }, [idUsuarioLogueado, fetchFallas]);

  // --- HANDLERS ---
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
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  // --- HELPERS UI ---
  const getUrgenciaBadge = (urgencia) => {
    const badges = {
      Crítica: { class: "pill-critical", icon: ShieldAlert },
      Alta: { class: "pill-high", icon: AlertTriangle },
      Media: { class: "pill-medium", icon: Info },
      Baja: { class: "pill-low", icon: Activity },
    };
    return badges[urgencia] || badges["Media"];
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      Pendiente: { color: "#fbbf24", icon: Clock },
      "En Proceso": { color: "#3b82f6", icon: Edit },
      Atendido: { color: "#22c55e", icon: CheckCircle },
    };
    return badges[estado] || badges["Pendiente"];
  };

  const filteredFallas = fallas.filter((falla) => {
    const elevador = elevadores.find(e => e.id_elevador === falla.id_elevador);
    const matchesSearch = 
      falla.tipo_falla?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      elevador?.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgencia = !filtroUrgencia || falla.urgencia === filtroUrgencia;
    const matchesEstado = filtroEstado ? falla.estado_reporte === filtroEstado : falla.estado_reporte !== "Atendido";
    
    return matchesSearch && matchesUrgencia && matchesEstado;
  });

  return (
    <LayoutPublic>
      <div className="fallas-container">
        
        {/* HEADER */}
        <header className="fallas-header">
          <div>
            <h1 className="title">Gestión de Fallas</h1>
            <div className="status-indicator">
              {pushEnabled ? <Bell size={14} className="text-success" /> : <BellOff size={14} className="text-muted" />}
              <span>{pushEnabled ? "Notificaciones Activas" : "Push Desactivado"}</span>
            </div>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            <Plus size={20} /> <span className="hide-mobile">Nuevo Reporte</span>
          </button>
        </header>

        {/* FILTROS RESPONSIVOS */}
        <div className="filter-bar">
          <div className="search-input">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar falla o cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="select-group">
            <select value={filtroUrgencia} onChange={(e) => setFiltroUrgencia(e.target.value)}>
              <option value="">Todas</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
            </select>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Activas</option>
              <option value="Atendido">Historial</option>
            </select>
          </div>
        </div>

        {/* GRID DE CARDS */}
        <div className="fallas-grid">
          {loading ? (
            <div className="loader">Cargando reportes...</div>
          ) : filteredFallas.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} />
              <p>No hay incidencias activas</p>
            </div>
          ) : (
            filteredFallas.map((f) => {
              const elevador = elevadores.find(e => e.id_elevador === f.id_elevador);
              const urg = getUrgenciaBadge(f.urgencia);
              const est = getEstadoBadge(f.estado_reporte);
              const EstIcon = est.icon;

              return (
                <div key={f.id_falla} className="falla-card shadow-sm">
                  <div className="card-header">
                    <span className={`urgencia-pill ${urg.class}`}>
                      <urg.icon size={12} /> {f.urgencia}
                    </span>
                    <button className="btn-edit" onClick={() => openModal(f)}>
                      <Edit size={14} />
                    </button>
                  </div>

                  <div className="card-body">
                    <div className="client-info">
                      <Building size={12} />
                      <span>{elevador?.nombre_cliente || "Cargando..."}</span>
                    </div>
                    <h3 className="falla-title">{f.tipo_falla}</h3>
                    <p className="location-text">{elevador?.ubicacion_especifica}</p>
                    
                    <div className="description-box">
                      {f.descripcion_falla || "Sin detalles adicionales."}
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="user-info">
                      <User size={12} /> <span>{f.nombre_usuario || "Sistema"}</span>
                    </div>
                    <div className="status-label" style={{ color: est.color }}>
                      <EstIcon size={14} /> {f.estado_reporte}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <div className="modal-header">
                <h2>{currentFalla ? "Editar Reporte" : "Nuevo Reporte"}</h2>
                <button onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label>ELEVADOR</label>
                    <select 
                      required 
                      value={formData.id_elevador} 
                      onChange={(e) => setFormData({ ...formData, id_elevador: parseInt(e.target.value) })}
                    >
                      <option value="">Seleccionar equipo...</option>
                      {elevadores.map((e) => (
                        <option key={e.id_elevador} value={e.id_elevador}>{e.nombre_cliente} - {e.ubicacion_especifica}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>TIPO DE FALLA</label>
                    <input 
                      required 
                      value={formData.tipo_falla} 
                      onChange={(e) => setFormData({ ...formData, tipo_falla: e.target.value })} 
                    />
                  </div>
                  <div className="field">
                    <label>URGENCIA</label>
                    <select value={formData.urgencia} onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                      <option value="Crítica">Crítica</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>ESTADO</label>
                    <select value={formData.estado_reporte} onChange={(e) => setFormData({ ...formData, estado_reporte: e.target.value })}>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Atendido">Atendido</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label>DESCRIPCIÓN</label>
                    <textarea 
                      rows="3" 
                      value={formData.descripcion_falla} 
                      onChange={(e) => setFormData({ ...formData, descripcion_falla: e.target.value })} 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Reporte"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .fallas-container { padding: 20px; background: #f8f9fa; min-height: 100vh; padding-bottom: 80px; }
          .fallas-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
          .title { font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin: 0; }
          .status-indicator { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #666; margin-top: 4px; }
          
          .btn-add { background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: 0.2s; }
          .btn-add:hover { background: #bb2d3b; transform: scale(1.02); }

          .filter-bar { display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; }
          .search-input { flex: 1; min-width: 250px; background: white; display: flex; align-items: center; padding: 0 15px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          .search-input input { border: none; padding: 12px; width: 100%; outline: none; font-size: 0.9rem; }
          .select-group { display: flex; gap: 10px; }
          .select-group select { border: none; padding: 0 15px; border-radius: 10px; background: white; font-size: 0.85rem; height: 45px; }

          .fallas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .falla-card { background: white; border-radius: 15px; padding: 18px; display: flex; flex-direction: column; transition: 0.3s; }
          .falla-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
          
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .urgencia-pill { font-size: 0.7rem; font-weight: 700; padding: 5px 10px; border-radius: 6px; display: flex; align-items: center; gap: 5px; text-transform: uppercase; }
          .pill-critical { background: #fee2e2; color: #dc2626; }
          .pill-high { background: #fef3c7; color: #d97706; }
          .pill-medium { background: #e0f2fe; color: #0284c7; }
          .pill-low { background: #f3f4f6; color: #4b5563; }

          .client-info { display: flex; align-items: center; gap: 6px; color: #dc3545; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-bottom: 5px; }
          .falla-title { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
          .location-text { font-size: 0.8rem; color: #666; margin-bottom: 12px; }
          .description-box { background: #f8f9fa; padding: 12px; border-radius: 10px; font-size: 0.85rem; color: #444; line-height: 1.4; min-height: 60px; }

          .card-footer { margin-top: 15px; padding-top: 12px; border-top: 1px solid #f1f1f1; display: flex; justify-content: space-between; align-items: center; }
          .user-info { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #888; font-weight: 600; }
          .status-label { font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 4px; }

          .btn-edit { background: #f3f4f6; border: none; width: 30px; height: 30px; border-radius: 50%; color: #4b5563; transition: 0.2s; }
          .btn-edit:hover { background: #e5e7eb; color: #111827; }

          /* MODAL STYLES */
          .custom-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
          .custom-modal { background: white; width: 100%; max-width: 650px; border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
          .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
          .modal-header h2 { font-weight: 800; font-size: 1.4rem; margin: 0; }
          .modal-header button { background: none; border: none; font-size: 2rem; color: #999; cursor: pointer; }
          
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .field { display: flex; flex-direction: column; gap: 8px; }
          .field.full { grid-column: span 2; }
          .field label { font-size: 0.7rem; font-weight: 800; color: #888; }
          .field input, .field select, .field textarea { padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; font-size: 0.9rem; transition: 0.2s; }
          .field input:focus { border-color: #dc3545; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1); }
          
          .modal-footer { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; }
          .btn-cancel { background: none; border: none; font-weight: 600; color: #666; cursor: pointer; }
          .btn-submit { background: #dc3545; color: white; border: none; padding: 12px 25px; border-radius: 10px; font-weight: 700; transition: 0.2s; }
          .btn-submit:hover { background: #bb2d3b; }

          @media (max-width: 600px) {
            .hide-mobile { display: none; }
            .form-grid { grid-template-columns: 1fr; }
            .field.full { grid-column: span 1; }
            .fallas-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </LayoutPublic>
  );
};

export default Fallas;