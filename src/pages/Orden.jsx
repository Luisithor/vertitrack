import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { ClipboardList, Plus, Calendar, Settings, Package, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [fallas, setFallas] = useState([]); // Estado para la lista de fallas
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrden, setCurrentOrden] = useState(null);

  const [formData, setFormData] = useState({
    id_falla: "",
    fecha_limite: "",
    piezas_requeridas: "",
    estado_orden: "Pendiente"
  });

  useEffect(() => {
    fetchData();
    fetchFallas(); // Cargamos las fallas para tenerlas listas
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/ordenes/lista");
      const data = await res.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFallas = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/fallas/lista");
      const data = await res.json();
      // Filtramos solo las que no tengan orden o estén activas (opcional)
      setFallas(data);
    } catch (error) {
      console.error("Error al cargar fallas:", error);
    }
  };

  const openModal = (orden = null) => {
    if (orden) {
      setCurrentOrden(orden);
      setFormData({
        id_falla: orden.id_falla,
        fecha_limite: orden.fecha_limite ? orden.fecha_limite.split("T")[0] : "",
        piezas_requeridas: orden.piezas_requeridas || "",
        estado_orden: orden.estado_orden || "Pendiente"
      });
    } else {
      setCurrentOrden(null);
      setFormData({ id_falla: "", fecha_limite: "", piezas_requeridas: "", estado_orden: "Pendiente" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = currentOrden 
      ? `http://localhost:3000/api/ordenes/actualizar/${currentOrden.id_orden}`
      : "http://localhost:3000/api/ordenes/crear";
    
    try {
      await fetch(url, {
        method: currentOrden ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Abierta': return <span className="badge bg-secondary bg-opacity-10 text-secondary"><ClipboardList size={12} className="me-1"/> Abierta</span>;
      case 'En Curso': return <span className="badge bg-primary bg-opacity-10 text-primary"><Settings size={12} className="me-1 pulse"/> En Curso</span>;
      case 'Cerrada': return <span className="badge bg-success bg-opacity-10 text-success"><CheckCircle2 size={12} className="me-1"/> Cerrada</span>;
      case 'Cancelada': return <span className="badge bg-danger bg-opacity-10 text-danger"><AlertCircle size={12} className="me-1"/> Cancelada</span>;
      default: return <span className="badge bg-warning bg-opacity-10 text-warning"><Clock size={12} className="me-1"/> Pendiente</span>;
    }
  };

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Órdenes de Trabajo</h4>
            <p className="text-muted small">Gestión de reparaciones basadas en reportes de fallas</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => openModal()}>
            <Plus size={18} /> Nueva Orden
          </button>
        </div>

        {/* Lista de Órdenes */}
        <div className="row g-3">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            ordenes.map((o) => (
              <div key={o.id_orden} className="col-12">
                <div className="card border-0 shadow-sm overflow-hidden">
                  <div className="card-body d-flex align-items-center justify-content-between py-3">
                    <div className="d-flex align-items-center gap-4">
                      <div className="bg-light p-2 rounded-3 text-center" style={{ minWidth: '80px' }}>
                        <small className="text-muted d-block small">ORDEN</small>
                        <span className="fw-bold text-primary">#{o.id_orden}</span>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0 fw-bold">Reporte de Falla: #{o.id_falla}</h6>
                          {getStatusBadge(o.estado_orden)}
                        </div>
                        <div className="d-flex gap-3 text-muted small">
                          <span className="d-flex align-items-center gap-1"><Calendar size={14}/> Límite: {new Date(o.fecha_limite).toLocaleDateString()}</span>
                          <span className="d-flex align-items-center gap-1"><Package size={14}/> {o.piezas_requeridas || "Sin piezas asignadas"}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-outline-primary btn-sm px-3" onClick={() => openModal(o)}>Gestionar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light">
                  <h5 className="fw-bold mb-0">{currentOrden ? "Actualizar Orden" : "Nueva Orden de Trabajo"}</h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Seleccionar Reporte de Falla</label>
                        <div className="input-group">
                          <span className="input-group-text bg-white"><AlertCircle size={18} className="text-warning"/></span>
                          <select 
                            className="form-select" 
                            required 
                            disabled={!!currentOrden} // No se puede cambiar la falla una vez creada la orden
                            value={formData.id_falla}
                            onChange={(e) => setFormData({...formData, id_falla: e.target.value})}
                          >
                            <option value="">-- Seleccione una falla pendiente --</option>
                            {fallas.map(f => (
                              <option key={f.id_falla} value={f.id_falla}>
                                Falla #{f.id_falla} - {f.descripcion_falla?.substring(0, 40)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Fecha Límite</label>
                        <input 
                          type="date" className="form-control" required
                          value={formData.fecha_limite}
                          onChange={(e) => setFormData({...formData, fecha_limite: e.target.value})}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Estado</label>
                        <select 
                          className="form-select"
                          value={formData.estado_orden}
                          onChange={(e) => setFormData({...formData, estado_orden: e.target.value})}
                        >
                          <option value="Abierta">Abierta</option>
                          <option value="En Curso">En Curso</option>
                          <option value="Cerrada">Cerrada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Piezas y Materiales</label>
                        <textarea 
                          className="form-control" rows="3" 
                          placeholder="Indique las piezas necesarias para la reparación"
                          value={formData.piezas_requeridas}
                          onChange={(e) => setFormData({...formData, piezas_requeridas: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light border-0">
                    <button type="button" className="btn btn-secondary opacity-75" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                      {loading ? "Guardando..." : "Confirmar Orden"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .pulse { animation: pulse-animation 2s infinite; }
        @keyframes pulse-animation { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </LayoutPublic>
  );
};

export default Ordenes;