import React, { useState, useEffect, useRef, useMemo } from "react";

const FALLAS_PER_PAGE = 5;
const MAINT_PER_PAGE = 4;
const ROTATION_INTERVAL = 10000;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [fallas, setFallas] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [paginaFallas, setPaginaFallas] = useState(0);
  const [paginaMaint, setPaginaMaint] = useState(0);
  const [time, setTime] = useState(new Date());
  const [lastCriticosCount, setLastCriticosCount] = useState(0);
  
  const audioAlert = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  const calcularProximoMantenimiento = (u, f) => {
    if (!u || !f) return null;
    const fecha = new Date(u);
    const freq = f.toLowerCase();
    if (freq.includes("mensual")) fecha.setMonth(fecha.getMonth() + 1);
    else if (freq.includes("bimestral")) fecha.setMonth(fecha.getMonth() + 2);
    else if (freq.includes("trimestral")) fecha.setMonth(fecha.getMonth() + 3);
    else if (freq.includes("semestral")) fecha.setMonth(fecha.getMonth() + 6);
    else if (freq.includes("anual")) fecha.setFullYear(fecha.getFullYear() + 1);
    return fecha;
  };

  const fetchData = async () => {
    try {
      const [resFallas, resElevadores] = await Promise.all([
        fetch("https://vertitrack-backend.onrender.com/api/fallas/lista"),
        fetch("https://vertitrack-backend.onrender.com/api/elevadores")
      ]);
      const dataFallas = await resFallas.json();
      const dataElevadores = await resElevadores.json();

      const hoy = new Date();
      const proxSieteDias = new Date(hoy);
      proxSieteDias.setDate(hoy.getDate() + 7);

      const listaMaint = dataElevadores.map(el => ({
        ...el,
        fechaProx: calcularProximoMantenimiento(el.ultima_revision, el.frecuencia_mantenimiento)
      })).filter(el => el.fechaProx && el.fechaProx <= proxSieteDias)
         .sort((a, b) => a.fechaProx - b.fechaProx);

      const currentCriticas = dataFallas.filter(f => f.urgencia === "Crítica").length;
      if (currentCriticas > lastCriticosCount) {
        audioAlert.current.play().catch(() => {});
      }

      setFallas(dataFallas);
      setMantenimientos(listaMaint);
      setLastCriticosCount(currentCriticas);
      setLoading(false);
    } catch (e) {
      console.error("Error:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refresh = setInterval(fetchData, 15000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(refresh); clearInterval(clock); };
  }, [lastCriticosCount]);

  useEffect(() => {
    const rotation = setInterval(() => {
      setPaginaFallas(p => (Math.ceil(fallas.length / FALLAS_PER_PAGE) <= 1 ? 0 : (p + 1 >= Math.ceil(fallas.length / FALLAS_PER_PAGE) ? 0 : p + 1)));
      setPaginaMaint(p => (Math.ceil(mantenimientos.length / MAINT_PER_PAGE) <= 1 ? 0 : (p + 1 >= Math.ceil(mantenimientos.length / MAINT_PER_PAGE) ? 0 : p + 1)));
    }, ROTATION_INTERVAL);
    return () => clearInterval(rotation);
  }, [fallas, mantenimientos]);

  const fallasVisibles = useMemo(() => fallas.slice(paginaFallas * FALLAS_PER_PAGE, (paginaFallas * FALLAS_PER_PAGE) + FALLAS_PER_PAGE), [fallas, paginaFallas]);
  const maintVisibles = useMemo(() => mantenimientos.slice(paginaMaint * MAINT_PER_PAGE, (paginaMaint * MAINT_PER_PAGE) + MAINT_PER_PAGE), [mantenimientos, paginaMaint]);

  return (
    <div className={`dashboard-pro ${lastCriticosCount > 0 ? 'alarm-active' : ''}`}>
      <header className="main-header">
        <div className="logo-section">
          <div className="client-badge">CONTROL DE ACTIVOS</div>
          <h1>VERTITRACK <span className="live-dot">●</span></h1>
        </div>
        <div className="clock-box">
          <div className="time">{time.toLocaleTimeString([], { hour12: false })}</div>
          <div className="date">{time.toLocaleDateString()}</div>
        </div>
      </header>

      {/* Stats con Skeleton UI */}
      <section className="stats-grid">
        {['CRÍTICOS', 'PENDIENTES', 'PRÓX. MANT.', 'TOTAL'].map((label, i) => (
          <div key={label} className="stat-card">
            <span className="label">{label}</span>
            <h2 className="value">
              {loading ? <div className="skeleton-box s-value"></div> : [lastCriticosCount, fallas.filter(f => f.estado_reporte === 'Pendiente').length, mantenimientos.length, fallas.length][i]}
            </h2>
          </div>
        ))}
      </section>

      <div className="main-content-grid">
        {/* Tabla con Skeleton UI */}
        <main className="table-section">
          <h3 className="section-title">INCIDENCIAS ACTIVAS</h3>
          <div className="table-responsive">
            <table>
              <thead><tr><th>CLIENTE</th><th>FALLA</th><th>PRIORIDAD</th><th>ESTADO</th></tr></thead>
              <tbody>
                {loading ? [1,2,3,4,5].map(i => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan="4"><div className="skeleton-box s-row"></div></td>
                  </tr>
                )) : 
                fallasVisibles.map(f => (
                  <tr key={f.id_falla} className={f.urgencia === 'Crítica' ? 'row-alert' : ''}>
                    <td className="bold">{f.nombre_cliente}</td>
                    <td>{f.tipo_falla}</td>
                    <td><span className={`pill ${f.urgencia === 'Crítica' ? 'pill-red' : 'pill-warn'}`}>{f.urgencia}</span></td>
                    <td>{f.estado_reporte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <aside className="maintenance-sidebar">
          <h3 className="section-title">PROGRAMA SEMANAL</h3>
          <div className="maint-list">
            {loading ? [1,2,3].map(i => <div key={i} className="skeleton-box s-card"></div>) :
              maintVisibles.map(m => (
                <div key={m.id_elevador} className={`maint-card ${m.fechaProx < time ? 'vencido' : ''}`}>
                  <div className="maint-info">
                    <div className="maint-client">{m.nombre_cliente}</div>
                    <div className="maint-date">FECHA: {m.fechaProx.toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
          </div>
        </aside>
      </div>

      {/* Ticker Pausable */}
      <footer className="news-ticker">
        <div className="ticker-track">
          <div className="ticker-content">
            {loading ? <span className="ticker-msg">Sincronizando flujo de datos...</span> : 
              fallas.concat(fallas).map((f, i) => (
                <span key={i} className="ticker-msg">
                  <strong>{f.nombre_cliente}:</strong> {f.tipo_falla} | 
                </span>
              ))
            }
          </div>
        </div>
      </footer>

      <style>{`
        :root { 
          --bg: #050505; --card: #121214; --accent: #22c55e; 
          --red: #ff4d4d; --yellow: #FCD34D; --border: #27272a; 
        }
        .dashboard-pro { background: var(--bg); color: #fff; font-family: 'Inter', sans-serif; padding: 20px; min-height: 100vh; }
        .main-header { display: flex; justify-content: space-between; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .stat-card { background: var(--card); padding: 20px; border-radius: 12px; border: 1px solid var(--border); }
        .stat-card .value { font-size: 2.5rem; font-weight: 800; margin-top: 10px; }
        
        .main-content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
        .table-section, .maintenance-sidebar { background: var(--card); padding: 20px; border-radius: 12px; border: 1px solid var(--border); }
        
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 0.7rem; color: #666; padding: 10px; }
        td { padding: 14px 10px; border-bottom: 1px solid #1a1a1c; font-size: 0.9rem; }
        
        .pill { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
        .pill-red { background: rgba(255, 77, 77, 0.15); color: var(--red); }
        .pill-warn { background: rgba(252, 211, 77, 0.1); color: var(--yellow); } /* Contraste Optimizado */
        
        /* TICKER PAUSABLE */
        .news-ticker { background: #000; height: 40px; display: flex; align-items: center; overflow: hidden; margin: 20px -20px -20px -20px; }
        .ticker-track:hover .ticker-content { animation-play-state: paused; cursor: pointer; }
        .ticker-content { display: flex; animation: scroll 60s linear infinite; white-space: nowrap; }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        
        /* SKELETON UI */
        .skeleton-box { 
          background: linear-gradient(90deg, #1a1a1c 25%, #27272a 50%, #1a1a1c 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        .s-value { width: 60px; height: 40px; }
        .s-row { width: 100%; height: 20px; }
        .s-card { height: 80px; margin-bottom: 10px; border-radius: 8px; }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .vencido { border-left: 4px solid var(--red) !important; background: rgba(255, 77, 77, 0.05); }
        .alarm-active { animation: alarmGlow 2s infinite; }
        @keyframes alarmGlow { 50% { box-shadow: inset 0 0 60px rgba(255,0,0,0.15); } }
      `}</style>
    </div>
  );
};

export default Dashboard;