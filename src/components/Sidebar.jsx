import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  House, Users, Building2, AlertTriangle, 
  Wrench, LogOut, UserCircle, ArrowUpRight, 
  ClipboardCheck, Menu, X 
} from 'lucide-react';
import { Paperclip } from 'react-bootstrap-icons';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); 
  
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

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { path: '/dashboard', label: 'Inicio', icon: House },
    { path: '/clientes', label: 'Clientes', icon: Users, roles: ['admin'] },
    { path: '/elevadores', label: 'Elevadores', icon: Building2, roles: ['admin'] },
    { path: '/reporte-falla', label: 'Reportes de Fallas', icon: AlertTriangle, roles: ['admin'] },
    { path: '/ordenes', label: 'Órdenes de Trabajo', icon: Paperclip, roles: ['admin', 'tecnico'] },
    { path: '/mantenimiento', label: 'Mantenimientos', icon: Wrench, roles: ['admin', 'tecnico'] },
    { path: '/historial-mantenimientos', label: 'Historial de Mantenimientos', icon: ClipboardCheck, roles: ['admin', 'tecnico'] },
    { path: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    if (userData.rol === 'admin') return true;
    return item.roles.includes(userData.rol);
  });

  return (
    <>
      <button 
        className="btn btn-primary d-lg-none position-fixed top-0 start-0 m-3 z-3 shadow"
        onClick={toggleSidebar}
        style={{ borderRadius: '10px', padding: '10px' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="position-fixed vh-100 vw-100 d-lg-none shadow-lg" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, top: 0, left: 0 }}
          onClick={toggleSidebar}
        />
      )}

      <div className={`sidebar-container d-flex flex-column vh-100 bg-white shadow-sm ${isOpen ? 'open' : ''}`}>
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

        <nav className="flex-grow-1 px-3 py-4 overflow-auto">
          <ul className="nav nav-pills flex-column gap-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)}
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
              <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white" style={{ width: '12px', height: '12px' }} />
            </div>
            
            <div className="flex-grow-1 overflow-hidden text-nowrap">
              <p className="mb-0 fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>{userData.nombre}</p>
              <p className="mb-0 text-muted text-truncate text-uppercase" style={{ fontSize: '0.75rem' }}>{userData.rol}</p>
            </div>

            <button onClick={handleLogout} className="btn btn-link p-1 text-muted border-0"><LogOut size={18} /></button>
          </div>
        </div>

        <style>{`
          .sidebar-container {
            width: 280px;
            position: fixed;
            left: -280px;
            z-index: 1050;
            transition: all 0.3s ease;
          }
          
          .sidebar-container.open {
            left: 0;
          }

          @media (min-width: 992px) {
            .sidebar-container {
              position: sticky;
              top: 0;
              left: 0;
            }
          }

          .hover-bg-light:hover { background-color: #f8f9fa; }
          .nav-link:not(.active):hover { background-color: #f8f9fa; }
          .nav-link.active {
            background-color: #0d6efd !important;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);
          }
          .text-nowrap { white-space: nowrap; }
        `}</style>
      </div>
    </>
  );
};

export default Sidebar;