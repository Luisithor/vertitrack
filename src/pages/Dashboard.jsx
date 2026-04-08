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
    tiempoRespuesta: "0 min"
  });

  // Lógica de cálculo que tenías en el otro componente
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
        fetch("http://localhost:3000/api/fallas/lista"),
        fetch("http://localhost:3000/api/elevadores")
      ]);

      const dataFallas = await resFallas.json();
      const dataElevadores = await resElevadores.json();

      // Filtrar mantenimientos (Próximos 7 días o Vencidos)
      const hoy = new Date();
      const proxSieteDias = new Date();
      proxSieteDias.setDate(hoy.getDate() + 7);

      const listaMantenimientos = dataElevadores.map(el => {
        const fechaProx = calcularProximoMantenimiento(el.ultima_revision, el.frecuencia_mantenimiento);
        return { ...el, fechaProx };
      }).filter(el => {
        if (!el.fechaProx) return false;
        return el.fechaProx <= proxSieteDias; // Muestra vencidos y próximos a 7 días
      }).sort((a, b) => a.fechaProx - b.fechaProx);

      const newCriticas = dataFallas.filter((f) => f.urgencia === "Crítica").length;
      if (newCriticas > lastCriticosCount) audioAlert.current.play().catch(() => {});

      const atendidas = dataFallas.filter(f => f.estado_reporte !== "Pendiente").length;
      const eficienciaCalculada = dataFallas.length > 0 ? Math.round((atendidas / dataFallas.length) * 100) : 100;

      setFallas(dataFallas);
      setMantenimientos(listaMantenimientos);
      setLastCriticosCount(newCriticas);
      setStats({
        pendientes: dataFallas.filter((f) => f.estado_reporte === "Pendiente").length,
        enProceso: dataFallas.filter((f) => f.estado_reporte === "En Proceso").length,
        criticas: newCriticas,
        total: dataFallas.length,
        eficiencia: `${eficienciaCalculada}%`,
        tiempoRespuesta: "24 min"
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const refresh = setInterval(fetchData, 10000);
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(refresh); clearInterval(clock); };
  }, [lastCriticosCount]);

  useEffect(() => {
    const rotation = setInterval(() => {
      setPagina((prev) => {
        const total = Math.ceil(fallas.length / ITEMS_PER_PAGE);
        return total <= 1 ? 0 : (prev + 1 >= total ? 0 : prev + 1);
      });
    }, 10000);
    return () => clearInterval(rotation);
  }, [fallas]);

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

      {/* Layout de dos columnas para Fallas y Mantenimientos */}
      <div className="main-content-grid">
        
        {/* Columna Izquierda: Fallas (Tabla principal) */}
        <main className="table-container">
          <h3 className="section-title">INCIDENCIAS ACTIVAS</h3>
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
        </main>

        {/* Columna Derecha: Próximos Mantenimientos */}
        <aside className="maintenance-sidebar">
          <h3 className="section-title">MANTENIMIENTOS <span className="yellow-text">SEMANALES</span></h3>
          <div className="maint-list">
            {mantenimientos.length === 0 ? (
              <p className="no-data">No hay revisiones programadas para esta semana.</p>
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
        .dashboard-pro { height: 100vh; background: var(--bg); color: var(--text); font-family: sans-serif; padding: 20px; display: grid; grid-template-rows: auto auto 1fr auto; gap: 15px; overflow: hidden; }
        .main-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .live-text { color: var(--accent); font-weight: 800; }
        .header-metrics { display: flex; gap: 30px; align-items: center; }
        .h-value { font-size: 1.5rem; font-weight: bold; color: var(--accent); }
        .time { font-size: 2.2rem; font-weight: bold; font-family: monospace; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .stat-card { background: var(--card); padding: 15px; border-radius: 12px; border: 1px solid var(--border); }
        .stat-card .value { font-size: 3.5rem; margin: 5px 0; font-weight: 800; line-height: 1; }
        .stat-card .label { font-size: 0.7rem; color: #888; font-weight: bold; text-transform: uppercase; }

        .main-content-grid { display: grid; grid-template-columns: 1fr 350px; gap: 15px; height: 100%; overflow: hidden; }
        
        .section-title { font-size: 0.9rem; letter-spacing: 1px; color: #666; margin-bottom: 10px; text-transform: uppercase; }
        
        .table-container { background: var(--card); border-radius: 12px; border: 1px solid var(--border); padding: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; color: #444; font-size: 0.7rem; border-bottom: 1px solid var(--border); }
        td { padding: 15px 12px; font-size: 1rem; border-bottom: 1px solid #18181a; }
        .pill { padding: 4px 10px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
        .pill-red { background: rgba(255, 77, 77, 0.1); color: var(--red); border: 1px solid var(--red); }
        .pill-warn { background: rgba(251, 191, 36, 0.1); color: var(--yellow); border: 1px solid var(--yellow); }

        .maintenance-sidebar { background: #0a0a0c; border-radius: 12px; border: 1px solid var(--border); padding: 15px; display: flex; flex-direction: column; }
        .maint-list { display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
        .maint-card { background: #161618; padding: 12px; border-radius: 8px; border-left: 4px solid var(--yellow); display: flex; align-items: center; gap: 12px; }
        .maint-indicator { width: 8px; height: 8px; border-radius: 50%; }
        .maint-client { font-weight: bold; font-size: 0.9rem; }
        .maint-loc { font-size: 0.75rem; color: #777; }
        .maint-date { font-size: 0.75rem; font-weight: bold; margin-top: 4px; }
        .bg-red { background: var(--red); box-shadow: 0 0 8px var(--red); }
        .bg-yellow { background: var(--yellow); }

        .news-ticker { background: #000; height: 40px; display: flex; align-items: center; border-top: 1px solid var(--border); }
        .ticker-content { display: flex; white-space: nowrap; animation: scroll 40s linear infinite; }
        .ticker-msg { margin-right: 50px; font-size: 0.9rem; color: #666; }
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .alarm-active { animation: alarmGlow 3s infinite; }
        @keyframes alarmGlow { 0%, 100% { box-shadow: inset 0 0 50px black; } 50% { box-shadow: inset 0 0 100px rgba(255, 0, 0, 0.1); } }
      `}</style>
    </div>
  );
};

export default Dashboard;