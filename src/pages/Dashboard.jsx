import React, { useState, useEffect, useRef, useMemo } from "react";

const FALLAS_PER_PAGE = 5;
const MAINT_PER_PAGE = 3; // Reducido para pantallas de celular
const ROTATION_INTERVAL = 8000;

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
          <div className="time">{time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      {/* Stats - Ahora 2x2 en móviles */}
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
        {/* Tabla Responsiva */}
        <main className="table-section">
          <h3 className="section-title">INCIDENCIAS ACTIVAS</h3>
          <div className="table-wrapper">
            <table className="responsive-table">
              <thead><tr><th>CLIENTE</th><th>FALLA</th><th className="hide-mobile">PRIORIDAD</th><th className="hide-mobile">ESTADO</th></tr></thead>
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
                    <td className="hide-mobile"><span className={`pill ${f.urgencia === 'Crítica' ? 'pill-red' : 'pill-warn'}`}>{f.urgencia}</span></td>
                    <td className="hide-mobile">{f.estado_reporte}</td>
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
                    <div className="maint-date">{m.fechaProx.toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
          </div>
        </aside>
      </div>

      <footer className="news-ticker">
        <div className="ticker-track">
          <div className="ticker-content">
            {loading ? <span className="ticker-msg">Iniciando...</span> : 
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
        * { box-sizing: border-box; }
        .dashboard-pro { background: var(--bg); color: #fff; font-family: 'Inter', sans-serif; padding: 15px; min-height: 100vh; overflow-x: hidden; }
        
        .main-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .logo-section h1 { font-size: 1.2rem; margin: 0; }
        .clock-box .time { font-size: 1.2rem; font-weight: bold; font-family: monospace; color: var(--accent); }

        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
        .stat-card { background: var(--card); padding: 15px; border-radius: 12px; border: 1px solid var(--border); }
        .stat-card .value { font-size: 1.8rem; font-weight: 800; margin: 5px 0 0 0; }
        .stat-card .label { font-size: 0.6rem; color: #888; letter-spacing: 1px; }

        .main-content-grid { display: flex; flex-direction: column; gap: 15px; }
        .table-section, .maintenance-sidebar { background: var(--card); padding: 15px; border-radius: 12px; border: 1px solid var(--border); }

        .responsive-table { width: 100%; border-collapse: collapse; }
        .responsive-table th { text-align: left; font-size: 0.65rem; color: #666; padding: 8px; border-bottom: 1px solid var(--border); }
        .responsive-table td { padding: 12px 8px; border-bottom: 1px solid #1a1a1c; font-size: 0.85rem; }

        .maint-card { background: #1a1a1c; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid var(--yellow); }
        .maint-client { font-weight: bold; font-size: 0.9rem; }
        .maint-date { font-size: 0.75rem; color: #888; margin-top: 4px; }

        /* TICKER MOBILE */
        .news-ticker { background: #000; height: 35px; display: flex; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; }
        .ticker-content { display: flex; animation: scroll 40s linear infinite; }
        .ticker-msg { font-size: 0.75rem; padding: 0 20px; white-space: nowrap; }

        /* MEDIA QUERIES */
        @media (min-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr); }
          .main-content-grid { display: grid; grid-template-columns: 1fr 320px; }
          .logo-section h1 { font-size: 1.5rem; }
          .dashboard-pro { padding: 25px; }
        }

        @media (max-width: 600px) {
          .hide-mobile { display: none; }
          .dashboard-pro { padding-bottom: 50px; } /* Espacio para el ticker fixed */
        }

        /* SKELETON & ANIMATIONS */
        .skeleton-box { background: linear-gradient(90deg, #1a1a1c 25%, #27272a 50%, #1a1a1c 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
        .s-value { width: 40px; height: 30px; }
        .s-row { width: 100%; height: 15px; }
        .s-card { height: 60px; margin-bottom: 8px; }
        @keyframes shimmer { to { background-position: -200% 0; } }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .vencido { border-left-color: var(--red); background: rgba(255, 77, 77, 0.05); }
      `}</style>
    </div>
  );
};


export default Dashboard;