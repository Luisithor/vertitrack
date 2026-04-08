import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import {
  ClipboardCheck, Search, Calendar, Cog, FileText,
  Edit, Trash2, Plus, Box, User, DollarSign, AlertCircle
} from "lucide-react";

const Mantenimiento = () => {
  // 1. RECUPERAR DATOS DEL USUARIO LOGUEADO
  const nombreUsuarioLogueado = localStorage.getItem("nombre_usuario") || "Usuario";
  const idUsuarioLogueado = localStorage.getItem("id_usuario");

  const [mantenimientos, setMantenimientos] = useState([]);
  const [elevadores, setElevadores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaint, setCurrentMaint] = useState(null);
  const [requiereOT, setRequiereOT] = useState(false);

  const [formData, setFormData] = useState({
    id_elevador: "",
    fecha_servicio: new Date().toISOString().split("T")[0],
    actividades: "",
    piezas_reemplazadas: "",
    observaciones_tecnicas: "",
    ot_responsable: nombreUsuarioLogueado, // Inicializado con el nombre logueado
    ot_fecha_limite: "",
    ot_subtotal: 0,
    ot_descripcion: ""
  });

  useEffect(() => {
    fetchData();
    fetchElevadores();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/mantenimientos/lista");
      const data = await res.json();
      setMantenimientos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar bitácora:", error);
      setMantenimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchElevadores = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/elevadores/lista");
      const data = await res.json();
      setElevadores(data);
    } catch (error) {
      console.error("Error al cargar elevadores:", error);
    }
  };

  const openModal = (maint = null) => {
    setRequiereOT(false);
    if (maint) {
      setCurrentMaint(maint);
      setFormData({
        ...maint,
        fecha_servicio: maint.fecha_servicio.split("T")[0],
        ot_responsable: nombreUsuarioLogueado, // Siempre asegurar que sea el actual
        ot_fecha_limite: "",
        ot_subtotal: 0,
        ot_descripcion: ""
      });
    } else {
      setCurrentMaint(null);
      setFormData({
        id_elevador: "",
        fecha_servicio: new Date().toISOString().split("T")[0],
        actividades: "",
        piezas_reemplazadas: "",
        observaciones_tecnicas: "",
        ot_responsable: nombreUsuarioLogueado, // Auto-llenado
        ot_fecha_limite: "",
        ot_subtotal: 0,
        ot_descripcion: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const subtotal = parseFloat(formData.ot_subtotal) || 0;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    const payload = {
      ...formData,
      id_usuario: idUsuarioLogueado, // ID para la tabla mantenimientos
      requiereOT,
      ot_iva: iva,
      ot_total: total
    };

    const url = currentMaint
      ? `http://localhost:3000/api/mantenimientos/actualizar/${currentMaint.id_mantenimiento}`
      : "http://localhost:3000/api/mantenimientos/crear";

    try {
      await fetch(url, {
        method: currentMaint ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error al guardar servicio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Deseas eliminar este registro?")) {
      try {
        await fetch(`http://localhost:3000/api/mantenimientos/eliminar/${id}`, { method: "DELETE" });
        fetchData();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const filteredMaint = mantenimientos.filter((m) => {
    const cliente = m.nombre_cliente?.toLowerCase() || "";
    const ubicacion = m.ubicacion_especifica?.toLowerCase() || "";
    const busqueda = searchTerm.toLowerCase();
    return cliente.includes(busqueda) || ubicacion.includes(busqueda);
  });

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        {/* ... Header y Buscador se mantienen igual ... */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Bitácora de Servicios</h4>
            <p className="text-muted small">Historial técnico y órdenes de trabajo correctivas</p>
          </div>
          <button className="btn btn-success d-flex align-items-center gap-2 shadow-sm" onClick={() => openModal()}>
            <Plus size={18} /> Registrar Mantenimiento
          </button>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Buscar por cliente o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="row g-4">
          {loading && mantenimientos.length === 0 ? (
            <div className="text-center py-5"><div className="spinner-border text-success" /></div>
          ) : (
            filteredMaint.map((m) => (
              <div key={m.id_mantenimiento} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="bg-success bg-opacity-10 p-3 rounded-3">
                        <ClipboardCheck className="text-success" size={24} />
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-light text-primary" onClick={() => openModal(m)}><Edit size={16} /></button>
                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(m.id_mantenimiento)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h6 className="text-muted small mb-1">#{m.id_elevador} - {m.nombre_cliente}</h6>
                    <h5 className="fw-bold mb-3">{m.ubicacion_especifica}</h5>
                    <div className="space-y-3 text-muted small">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Calendar size={14} className="text-success" /> 
                        <span className="fw-bold">{new Date(m.fecha_servicio).toLocaleDateString()}</span>
                      </div>
                      <p className="mb-0 ps-4"><Cog size={14} className="me-2" />{m.actividades}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold">{currentMaint ? "Editar Registro" : "Nuevo Registro de Servicio"}</h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3 mb-4">
                      {/* Datos del mantenimiento se mantienen igual... */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Elevador *</label>
                        <select className="form-select" required value={formData.id_elevador} 
                          onChange={(e) => setFormData({ ...formData, id_elevador: e.target.value })} disabled={currentMaint}>
                          <option value="">Seleccionar equipo...</option>
                          {elevadores.map((e) => (
                            <option key={e.id_elevador} value={e.id_elevador}>#{e.id_elevador} - {e.ubicacion_especifica} ({e.nombre_cliente})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Fecha de Servicio *</label>
                        <input type="date" className="form-control" required value={formData.fecha_servicio} 
                          onChange={(e) => setFormData({ ...formData, fecha_servicio: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold">Actividades Realizadas *</label>
                        <textarea className="form-control" rows="2" required placeholder="Detalle del mantenimiento preventivo..." 
                          value={formData.actividades} onChange={(e) => setFormData({ ...formData, actividades: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Piezas Reemplazadas (Preventivo)</label>
                        <input type="text" className="form-control" placeholder="Ej: Sensores, aceite..." 
                          value={formData.piezas_reemplazadas} onChange={(e) => setFormData({ ...formData, piezas_reemplazadas: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Observaciones Técnicas</label>
                        <input type="text" className="form-control" placeholder="Estado general del equipo..." 
                          value={formData.observaciones_tecnicas} onChange={(e) => setFormData({ ...formData, observaciones_tecnicas: e.target.value })} />
                      </div>
                    </div>

                    {/* SECCIÓN ORDEN DE TRABAJO DINÁMICA */}
                    <div className={`p-4 rounded-3 border-start border-4 ${requiereOT ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light border-secondary'}`}>
                      <div className="form-check form-switch d-flex align-items-center gap-3 mb-3">
                        <input className="form-check-input" type="checkbox" id="otSwitch" checked={requiereOT} onChange={(e) => setRequiereOT(e.target.checked)} />
                        <label className="form-check-label fw-bold h6 mb-0" htmlFor="otSwitch">
                          ¿Se detectaron fallas que requieren Orden de Trabajo?
                        </label>
                      </div>

                      {requiereOT && (
                        <div className="row g-3 animate__animated animate__fadeIn">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold"><User size={14} className="me-1"/> Técnico Responsable</label>
                            <input 
                                type="text" 
                                className="form-control bg-white border-warning fw-bold" 
                                readOnly 
                                value={nombreUsuarioLogueado} 
                                style={{ cursor: "not-allowed" }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold"><Calendar size={14} className="me-1"/> Fecha Límite de Reparación</label>
                            <input type="date" className="form-control" required={requiereOT} 
                              value={formData.ot_fecha_limite} onChange={(e) => setFormData({...formData, ot_fecha_limite: e.target.value})} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold"><FileText size={14} className="me-1"/> Descripción del Trabajo Correctivo</label>
                            <textarea className="form-control" rows="2" required={requiereOT} placeholder="¿Qué se necesita reparar o cambiar?" 
                              value={formData.ot_descripcion} onChange={(e) => setFormData({...formData, ot_descripcion: e.target.value})} />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold"><DollarSign size={14} className="me-1"/> Presupuesto Estimado (Subtotal)</label>
                            <div className="input-group">
                              <span className="input-group-text bg-white">$</span>
                              <input type="number" className="form-control" required={requiereOT} 
                                value={formData.ot_subtotal} onChange={(e) => setFormData({...formData, ot_subtotal: e.target.value})} />
                            </div>
                            <div className="mt-2 d-flex justify-content-between small text-muted px-2">
                              <span>IVA (16%): ${(formData.ot_subtotal * 0.16).toFixed(2)}</span>
                              <span className="fw-bold text-dark">Total: ${(formData.ot_subtotal * 1.16).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-success px-4" disabled={loading}>
                      {loading ? "Procesando..." : "Finalizar y Guardar"}
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

export default Mantenimiento;