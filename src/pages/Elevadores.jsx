import React, { useState, useEffect } from "react";
import LayoutPublic from "../layout/LayoutPublic";
import { 
  Plus, Search, Edit, Building, Settings, 
  Calendar, Clock, CheckCircle, AlertTriangle, 
  PauseCircle,  
} from "lucide-react";

const Elevadores = () => {
  const [elevadores, setElevadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentElevador, setCurrentElevador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    id_cliente: "",
    ubicacion_especifica: "",
    tipo_equipo: "",
    frecuencia_mantenimiento: "",
    ultima_revision: "",
    estatus_operativo: "Activo",
  });

  useEffect(() => {
    fetchData();
    fetchClientes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/elevadores");
      const data = await res.json();
      setElevadores(data);
    } catch (error) {
      console.error("Error fetching elevadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch("https://vertitrack-backend.onrender.com/api/clientes/lista");
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  const handleFilter = async (idCliente) => {
    setFiltroCliente(idCliente);
    setLoading(true);
    try {
      const url = idCliente === ""
          ? "https://vertitrack-backend.onrender.com/api/elevadores"
          : `https://vertitrack-backend.onrender.com/api/elevadores/cliente/${idCliente}`;
      const res = await fetch(url);
      const data = await res.json();
      setElevadores(data);
    } catch (error) {
      console.error("Error filtering elevadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (elevador = null) => {
    if (elevador) {
      setCurrentElevador(elevador);
      const formattedDate = elevador.ultima_revision ? elevador.ultima_revision.split("T")[0] : "";
      setFormData({ ...elevador, ultima_revision: formattedDate });
    } else {
      setCurrentElevador(null);
      setFormData({
        id_cliente: "",
        ubicacion_especifica: "",
        tipo_equipo: "",
        frecuencia_mantenimiento: "",
        ultima_revision: "",
        estatus_operativo: "Activo",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = currentElevador
        ? `https://vertitrack-backend.onrender.com/api/elevadores/actualizar/${currentElevador.id_elevador}`
        : "https://vertitrack-backend.onrender.com/api/elevadores/crear";

      const res = await fetch(url, {
        method: currentElevador ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await res.json();
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularProximoMantenimiento = (ultimaRevision, frecuencia) => {
    if (!ultimaRevision || !frecuencia) return null;
    const fecha = new Date(ultimaRevision);
    const f = frecuencia.toLowerCase();
    if (f.includes("mensual")) fecha.setMonth(fecha.getMonth() + 1);
    else if (f.includes("bimestral")) fecha.setMonth(fecha.getMonth() + 2);
    else if (f.includes("trimestral")) fecha.setMonth(fecha.getMonth() + 3);
    else if (f.includes("semestral")) fecha.setMonth(fecha.getMonth() + 6);
    else if (f.includes("anual")) fecha.setFullYear(fecha.getFullYear() + 1);
    else return null;
    return fecha.toISOString().split("T")[0];
  };

  const getStatusBadge = (status) => {
    const badges = {
      Activo: { class: "bg-success", icon: CheckCircle },
      Inactivo: { class: "bg-secondary", icon: PauseCircle },
      "En Reparación": { class: "bg-warning", icon: AlertTriangle },
    };
    return badges[status] || badges["Activo"];
  };

  const getMantenimientoStatus = (fechaProx) => {
    if (!fechaProx) return { class: "text-secondary", text: "No programado" };
    const diasRestantes = Math.ceil((new Date(fechaProx) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 0) return { class: "text-danger", text: `Vencido (${Math.abs(diasRestantes)}d)` };
    if (diasRestantes <= 7) return { class: "text-warning", text: `Próximo (${diasRestantes}d)` };
    return { class: "text-success", text: fechaProx };
  };

  const filteredElevadores = elevadores.filter(
    (el) =>
      el.ubicacion_especifica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.nombre_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.tipo_equipo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <LayoutPublic rol="admin">
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Gestión de Elevadores</h4>
            <p className="text-muted small">Control centralizado de equipos por cliente</p>
          </div>
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => openModal()}>
            <Plus size={18} /> Nuevo Elevador
          </button>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                  <Building className="text-primary" size={24} />
                </div>
                <div>
                  <h6 className="text-muted small mb-0">Equipos</h6>
                  <h4 className="fw-bold mb-0">{elevadores.length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-0 ps-0"
                    placeholder="Buscar cliente, ubicación o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select border-0 bg-light"
                  value={filtroCliente}
                  onChange={(e) => handleFilter(e.target.value ? parseInt(e.target.value) : "")}
                >
                  <option value="">Todos los Clientes</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : filteredElevadores.length === 0 ? (
            <div className="col-12 text-center py-5 bg-white rounded-3 shadow-sm">
              <Building size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="text-muted">Sin resultados</h5>
            </div>
          ) : (
            filteredElevadores.map((el) => {
              const fechaProx = calcularProximoMantenimiento(el.ultima_revision, el.frecuencia_mantenimiento);
              const mantStatus = getMantenimientoStatus(fechaProx);
              const statusBadge = getStatusBadge(el.estatus_operativo);
              const IconComponent = statusBadge.icon;

              return (
                <div className="col-md-6 col-lg-4 col-xl-3" key={el.id_elevador}>
                  <div className="card border-0 shadow-sm h-100 lift-card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={`badge ${statusBadge.class} bg-opacity-10 text-${statusBadge.class.replace('bg-', '')} d-flex align-items-center gap-1 p-2`}>
                          <IconComponent size={14} /> {el.estatus_operativo}
                        </span>
                        <button className="btn btn-sm btn-light text-primary rounded-circle p-2" onClick={() => openModal(el)}>
                          <Edit size={16} />
                        </button>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Building size={14} className="text-primary" />
                          <small className="text-uppercase fw-bold text-muted" style={{ letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                            {el.nombre_cliente || "Cliente Desconocido"}
                          </small>
                        </div>
                        <h5 className="fw-bold mb-0 text-dark">{el.ubicacion_especifica}</h5>
                        <small className="text-muted">ID Equipo: #{el.id_elevador}</small>
                      </div>

                      <div className="bg-light rounded-3 p-3 mb-3">
                        <div className="d-flex justify-content-between mb-2 small">
                          <span className="text-muted">Tipo:</span>
                          <span className="fw-semibold">{el.tipo_equipo || "---"}</span>
                          
                        </div>
                        <div className="d-flex justify-content-between mb-2 small">
                          <span className="text-muted">Frecuencia:</span>
                          <span className="badge bg-white text-dark border fw-normal">{el.frecuencia_mantenimiento}</span>
                        </div>
                        <div className="d-flex justify-content-between small">
                          <span className="text-muted">Última rev:</span>
                          <span className="fw-semibold">{el.ultima_revision ? new Date(el.ultima_revision).toLocaleDateString() : "N/A"}</span>
                        </div>
                      </div>

                      <div className={`p-2 rounded-3 text-center small fw-bold ${mantStatus.class} bg-white border`}>
                        <Calendar size={14} className="me-2" />
                        Próximo: {mantStatus.text}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {isModalOpen && (
          <div className="modal show d-block shadow" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold">{currentElevador ? "Actualizar Equipo" : "Registrar Nuevo Equipo"}</h5>
                  <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body py-4">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">CLIENTE RESPONSABLE</label>
                        <select
                          className="form-select form-select-lg"
                          value={formData.id_cliente}
                          onChange={(e) => setFormData({ ...formData, id_cliente: parseInt(e.target.value) || "" })}
                          required
                        >
                          <option value="">Seleccione un cliente...</option>
                          {clientes.map((c) => (
                            <option key={c.id_cliente} value={c.id_cliente}>{c.nombre_cliente}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">UBICACIÓN ESPECÍFICA</label>
                        <input
                          className="form-control form-control-lg"
                          placeholder="Ej: Elevador Principal / Torre B"
                          value={formData.ubicacion_especifica}
                          onChange={(e) => setFormData({ ...formData, ubicacion_especifica: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted" placeholder="Ej: Tracción, Hidráulico">TIPO</label>
                        <input className="form-control" value={formData.tipo_equipo} onChange={(e) => setFormData({ ...formData, tipo_equipo: e.target.value })} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">FRECUENCIA</label>
                        <select className="form-select" value={formData.frecuencia_mantenimiento} onChange={(e) => setFormData({ ...formData, frecuencia_mantenimiento: e.target.value })}>
                          <option value="Mensual">Mensual</option>
                          <option value="Bimestral">Bimestral</option>
                          <option value="Trimestral">Trimestral</option>
                          <option value="Anual">Anual</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">ESTATUS</label>
                        <select className="form-select" value={formData.estatus_operativo} onChange={(e) => setFormData({ ...formData, estatus_operativo: e.target.value })}>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="En Reparación">En Reparación</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">FECHA ÚLTIMA REVISIÓN</label>
                        <input type="date" className="form-control" value={formData.ultima_revision} onChange={(e) => setFormData({ ...formData, ultima_revision: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-link text-muted text-decoration-none" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                      {loading ? "Procesando..." : currentElevador ? "Actualizar Equipo" : "Confirmar Registro"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .lift-card { transition: transform 0.2s ease, shadow 0.2s ease; }
          .lift-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        `}</style>
      </div>
    </LayoutPublic>
  );
};

export default Elevadores;