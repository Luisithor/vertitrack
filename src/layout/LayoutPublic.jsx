import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

const LayoutPublic = ({ children, rol }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    const handleSidebarChange = (e) => {
      setSidebarExpanded(e.detail.isExpanded);
    };
    window.addEventListener('sidebarToggle', handleSidebarChange);
    return () => window.removeEventListener('sidebarToggle', handleSidebarChange);
  }, []);

  return (
    <div className="layout-wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar rol={rol} />

      <main style={{ 
        flex: 1, 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        transition: 'all 0.3s ease' 
      }}>
        {children}
      </main>
    </div>
  );
};

export default LayoutPublic;