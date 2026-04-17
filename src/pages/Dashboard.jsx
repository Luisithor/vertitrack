import React, { useState, useEffect, useRef } from "react";

const ITEMS_PER_PAGE = 5;

const Dashboard = () => {
  const [fallas, setFallas] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]); 
  const [pagina, setPagina] = useState(0);
  const [time, setTime] = useState(new Date());
  const [lastCriticosCount, setLastCriticosCount] = useState(0);
  const audioAlert = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"));

  const [stats, setStats] = useState({
    pendientes: 0,
    enProceso: 0,
    criticas: 0,
    total: 0,
    eficiencia: "0%",
  });

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
      const proxSieteDias = new Date();
      proxSieteDias.setDate(hoy.getDate() + 7);

      const listaMantenimientos = dataElevadores.map(el => ({
        ...el,
        fechaProx: calcularProximoMantenimiento(el.ultima_revision, el.frecuencia_mantenimiento)
      })).filter(el => el.fechaProx && el.fechaProx <= proxSieteDias)
         .sort((a, b) => a.fechaProx - b.fechaProx);

      const newCriticas = dataFallas.filter((f) => f.urgencia === "Crítica").length;
      
      // Reproducir alerta solo si aumentan los críticos
      setLastCriticosCount(prev => {
        if (newCriticas > prev) audioAlert.current.play().catch(() => {});
        return newCriticas;
      });

      const atendidas = dataFallas.filter(f => f.estado_reporte !== "Pendiente").length;
      const eficienciaCalculada = dataFallas.length > 0 ? Math.round((atendidas / dataFallas.length) * 100) : 100;

      setFallas(dataFallas);
      setMantenimientos(listaMantenimientos);
      setStats({
        pendientes: dataFallas.filter((f) => f.estado_reporte === "Pendiente").length,
        enProceso: dataFallas.filter((f) => f.estado_reporte === "En Proceso").length,
        criticas: newCriticas,
        total: dataFallas.length,
        eficiencia: `${eficienciaCalculada}%`,
      });
    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchData();
    const refresh = setInterval(fetchData, 15000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(refresh); clearInterval(clock); };
  }, []); // Dependencias vacías para evitar duplicar intervalos

  useEffect(() => {
    const rotation = setInterval(() => {
      setPagina((prev) => {
        const total = Math.ceil(fallas.length / ITEMS_PER_PAGE);
        return total <= 1 ? 0 : (prev + 1 >= total ? 0 : prev + 1);
      });
    }, 10000);
    return () => clearInterval(rotation);
  }, [fallas.length]);

  const fallasVisibles = fallas.slice(pagina * ITEMS_PER_PAGE, (pagina * ITEMS_PER_PAGE) + ITEMS_PER_PAGE);

  return (
    <div className={`dashboard-pro ${stats.criticas > 0 ? 'alarm-active' : ''}`}>
      
      <header className="main-header">
        <div className="logo-section">
          <div className="client-badge">CONTROL PREVENTIVO Y CORRECTIVO</div>
          <h1>VERTITRACK <span className="live-text">PRO</span></h1>
        </div>
        
        <div className="header-metrics">
          <div className="h-item">
            <span className="h-label">EFICIENCIA</span>
            <span className="h-value">{stats.eficiencia}</span>
          </div>
          <div className="v-line"></div>
          <div className="clock-box">
            <div className="time">{time.toLocaleTimeString([], { hour12: false })}</div>
            <div className="date">{time.toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className={`stat-card ${stats.criticas > 0 ? 'critical-bg' : ''}`}>
          <span className="label">CRÍTICOS</span>
          <h2 className="value">{stats.criticas}</h2>
        </div>
        <div className="stat-card">
          <span className="label">PENDIENTES</span>
          <h2 className="value">{stats.pendientes}</h2>
        </div>
        <div className="stat-card">
          <span className="label">MANT. PRÓXIMOS</span>
          <h2 className="value yellow-text">{mantenimientos.length}</h2>
        </div>
        <div className="stat-card">
          <span className="label">TOTAL REPORTES</span>
          <h2 className="value">{stats.total}</h2>
        </div>
      </section>

      <div className="main-content-grid">
        <main className="table-section">
          <h3 className="section-title">INCIDENCIAS ACTIVAS</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>CLIENTE</th>
                  <th>FALLA</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody key={pagina}>
                {fallasVisibles.map((f) => (
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
          <h3 className="section-title">MANTENIMIENTOS <span className="yellow-text">SEMANALES</span></h3>
          <div className="maint-list">
            {mantenimientos.length === 0 ? (
              <p className="no-data">No hay revisiones programadas.</p>
            ) : (
              mantenimientos.map(m => (
                <div key={m.id_elevador} className="maint-card">
                  <div className={`maint-indicator ${m.fechaProx < new Date() ? 'bg-red' : 'bg-yellow'}`}></div>
                  <div className="maint-info">
                    <div className="maint-client">{m.nombre_cliente}</div>
                    <div className="maint-loc">{m.ubicacion_especifica}</div>
                    <div className="maint-date">
                      {m.fechaProx < new Date() ? 'VENCIDO: ' : 'FECHA: '}
                      {m.fechaProx.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>

      <footer className="news-ticker">
        <div className="ticker-track">
          <div className="ticker-content">
            {fallas.concat(fallas).map((f, i) => (
              <span key={i} className="ticker-msg">
                <strong>{f.nombre_cliente}:</strong> {f.tipo_falla} | 
              </span>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        :root { --bg: #050505; --card: #121214; --accent: #22c55e; --red: #ff4d4d; --yellow: #fbbf24; --border: #27272a; --text: #ffffff; }
        
        * { box-sizing: border-box; }

        .dashboard-pro { 
          min-height: 100vh; 
          background: var(--bg); 
          color: var(--text); 
          font-family: 'Inter', sans-serif; 
          padding: 15px; 
          display: flex;
          flex-direction: column;
          gap: 20px; 
        }

        .main-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          flex-wrap: wrap;
          gap: 20px;
          border-bottom: 1px solid var(--border); 
          padding-bottom: 15px; 
        }

        .logo-section h1 { font-size: 1.5rem; margin: 5px 0; }
        .client-badge { font-size: 0.6rem; letter-spacing: 2px; color: #666; }
        .live-text { color: var(--accent); font-weight: 800; }

        .header-metrics { display: flex; gap: 20px; align-items: center; }
        .v-line { width: 1px; height: 30px; background: var(--border); }
        .h-value { font-size: 1.2rem; font-weight: bold; color: var(--accent); display: block; }
        .h-label { font-size: 0.6rem; color: #666; }
        .time { font-size: 1.5rem; font-weight: bold; font-family: monospace; }
        .date { font-size: 0.7rem; color: #666; text-align: right; }

        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
          gap: 15px; 
        }

        .stat-card { 
          background: var(--card); 
          padding: 20px; 
          border-radius: 12px; 
          border: 1px solid var(--border); 
        }
        .stat-card .value { font-size: 2.5rem; margin: 5px 0; font-weight: 800; }
        .stat-card .label { font-size: 0.65rem; color: #888; text-transform: uppercase; }
        .yellow-text { color: var(--yellow); }

        .main-content-grid { 
          display: grid; 
          grid-template-columns: 1fr 320px; 
          gap: 20px; 
          flex-grow: 1;
        }

        .table-section { 
          background: var(--card); 
          border-radius: 12px; 
          border: 1px solid var(--border); 
          padding: 15px; 
          min-width: 0; 
        }

        .table-responsive { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 500px; }
        th { text-align: left; padding: 12px; color: #555; font-size: 0.7rem; border-bottom: 1px solid var(--border); }
        td { padding: 14px 12px; font-size: 0.9rem; border-bottom: 1px solid #18181a; }

        .maintenance-sidebar { 
          background: #0a0a0c; 
          border-radius: 12px; 
          border: 1px solid var(--border); 
          padding: 15px; 
        }

        .maint-card { 
          background: #161618; 
          padding: 12px; 
          border-radius: 8px; 
          margin-bottom: 10px;
          border-left: 4px solid var(--yellow); 
          display: flex; 
          align-items: center; 
          gap: 12px; 
        }

        .news-ticker { 
          background: #000; 
          margin: 0 -15px -15px -15px;
          height: 35px; 
          overflow: hidden; 
          display: flex; 
          align-items: center; 
        }
        .ticker-content { display: flex; animation: scroll 60s linear infinite; }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* RESPONSIVIDAD */
        @media (max-width: 1024px) {
          .main-content-grid { grid-template-columns: 1fr; }
          .maintenance-sidebar { order: 2; }
          .table-section { order: 1; }
        }

        @media (max-width: 600px) {
          .main-header { justify-content: center; text-align: center; }
          .header-metrics { width: 100%; justify-content: space-around; }
          .stat-card .value { font-size: 2rem; }
        }

        .critical-bg { background: rgba(255, 77, 77, 0.05); border-color: var(--red); }
        .row-alert { background: rgba(255, 77, 77, 0.03); }
        .alarm-active { animation: alarmGlow 2s infinite; }
        @keyframes alarmGlow { 0% { box-shadow: inset 0 0 20px rgba(255,0,0,0); } 50% { box-shadow: inset 0 0 40px rgba(255,0,0,0.1); } }
      `}</style>
    </div>
  );
};

export default Dashboard;