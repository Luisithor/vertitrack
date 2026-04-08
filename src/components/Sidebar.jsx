import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  House, 
  Users, 
  Building2, 
  AlertTriangle, 
  Wrench,
  LogOut,
  UserCircle,
  ArrowUpRight,
  ClipboardCheck
} from 'lucide-react';
import { Paperclip } from 'react-bootstrap-icons';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    nombre: 'Usuario',
    rol: 'Invitado',
    correo: 'sesion@vertitrack.com' 
  });

  useEffect(() => {
    const nombre = localStorage.getItem("nombre_usuario");
    const rol = localStorage.getItem("rol");
    const id = localStorage.getItem("id_usuario");

    if (nombre || rol) {
      setUserData({
        nombre: nombre || 'Usuario',
        rol: rol || 'Sin Rol',
        correo: `ID: ${id || '000'}` 
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Inicio', icon: House },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/elevadores', label: 'Elevadores', icon: Building2 },
    { path: '/reporte-falla', label: 'Reportes de Fallas', icon: AlertTriangle },
    { path: '/ordenes', label: 'Órdenes de Trabajo', icon: Paperclip },
    { path: '/mantenimiento', label: 'Mantenimientos', icon: Wrench },
    { path: '/historial-mantenimientos', label: 'Historial de Mantenimientos', icon: ClipboardCheck },
  ];

  return (
    <div className="d-flex flex-column vh-100 bg-white shadow-sm" style={{ width: '280px' }}>
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary rounded-3 p-2 shadow-sm">
            <ArrowUpRight size={24} className="text-white" />
          </div>
          <div>
            <h5 className="fw-bold mb-0">Vertitrack</h5>
            <small className="text-muted">Mantenimiento inteligente</small>
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 px-3 py-4">
        <ul className="nav nav-pills flex-column gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center gap-3 px-3 py-2 ${
                      isActive ? 'active bg-primary' : 'text-dark'
                    }`
                  }
                  style={{ borderRadius: '10px' }}
                >
                  <Icon size={20} />
                  <span className="fw-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-top p-3">
        <div className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg-light position-relative group">
          <div className="position-relative">
            <UserCircle size={40} className="text-secondary" />
            <span 
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" 
              style={{ width: '12px', height: '12px' }} 
            />
          </div>
          
          <div className="flex-grow-1 overflow-hidden">
            <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
              {userData.nombre}
            </p>
            <p className="mb-0 text-muted text-truncate text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              {userData.rol}
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="btn btn-link p-1 text-muted hover-text-danger border-0"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        .hover-text-danger:hover {
          color: #dc3545 !important;
          transform: translateX(2px);
          transition: all 0.2s;
        }
        .nav-link:not(.active):hover {
          background-color: #f8f9fa;
        }
        .nav-link.active {
          background-color: #0d6efd !important;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
        }
        .text-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;