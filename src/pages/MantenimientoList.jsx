import React, { useState, useEffect } from 'react';
import LayoutPublic from "../layout/LayoutPublic";
import { 
  ClipboardCheck, Search, Plus, Calendar, 
  FileText, PenTool, AlertCircle, Eye, 
  ChevronRight, Building, User, Settings, X
} from 'lucide-react';

const MantenimientoList = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMantenimientos();
  }, []);

  const fetchMantenimientos = async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/mantenimientos/lista");
      const data = await res.json();
      setMantenimientos(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (mantenimiento) => {
    setSelectedMaint(mantenimiento);
    setShowModal(true);
  };

  const filteredMantenimientos = mantenimientos.filter(m => 
    m.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.ubicacion_especifica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.actividades?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Historial de Mantenimientos</h4>
            <p className="text-muted small">Registro detallado de actividades técnicas y refacciones</p>
          </div>
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
                placeholder="Buscar por cliente, ubicación o tarea realizada..."
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
                  <th className="px-4 py-3 border-0 small fw-bold text-muted">FECHA</th>
                  <th className="py-3 border-0 small fw-bold text-muted">CLIENTE / UBICACIÓN</th>
                  <th className="py-3 border-0 small fw-bold text-muted">TÉCNICO</th>
                  <th className="py-3 border-0 small fw-bold text-muted">ACTIVIDADES</th>
                  <th className="py-3 border-0 small fw-bold text-muted text-end px-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary" /></td></tr>
                ) : filteredMantenimientos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <ClipboardCheck size={40} className="mb-2 opacity-25" />
                      <p>No hay registros de mantenimiento</p>
                    </td>
                  </tr>
                ) : (
                  filteredMantenimientos.map((m) => (
                    <tr key={m.id_mantenimiento}>
                      <td className="px-4">
                        <div className="d-flex flex-column">
                          <span className="fw-bold">{new Date(m.fecha_servicio).toLocaleDateString()}</span>
                          <small className="text-muted">#{m.id_mantenimiento}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-semibold">{m.nombre_cliente}</div>
                        <small className="text-muted">{m.ubicacion_especifica}</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <User size={14} className="text-secondary" />
                          <span className="small">{m.nombre_usuario || 'No asignado'}</span>
                        </div>
                      </td>
                      <td>
                        <p className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>{m.actividades}</p>
                      </td>
                      <td className="text-end px-4">
                        <button 
                          className="btn btn-sm btn-light text-primary"
                          onClick={() => handleVerDetalle(m)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && selectedMaint && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <FileText size={20} /> Detalle de Mantenimiento #{selectedMaint.id_mantenimiento}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase">Cliente y Ubicación</label>
                    <div className="d-flex align-items-center gap-3 mt-1">
                      <div className="bg-light p-2 rounded">
                        <Building className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{selectedMaint.nombre_cliente}</h6>
                        <p className="mb-0 text-muted small">{selectedMaint.ubicacion_especifica}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase">Personal Técnico</label>
                    <div className="d-flex align-items-center gap-3 mt-1">
                      <div className="bg-light p-2 rounded">
                        <User className="text-success" />
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold">{selectedMaint.nombre_usuario || 'Desconocido'}</h6>
                        <p className="mb-0 text-muted small">ID Usuario: {selectedMaint.id_usuario}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-2 opacity-10" />

                  <div className="col-12">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-2">Actividades Realizadas</label>
                    <div className="bg-light p-3 rounded border-start border-primary border-4">
                      {selectedMaint.actividades}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-2">Piezas Reemplazadas</label>
                    <div className="p-3 border rounded h-100">
                      {selectedMaint.piezas_reemplazadas || <span className="text-muted italic small">Ninguna pieza registrada</span>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-2">Observaciones Técnicas</label>
                    <div className="p-3 border rounded h-100">
                      {selectedMaint.observaciones_tecnicas || <span className="text-muted italic small">Sin observaciones adicionales</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary px-4" onClick={() => setShowModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutPublic>
  );
};

export default MantenimientoList;