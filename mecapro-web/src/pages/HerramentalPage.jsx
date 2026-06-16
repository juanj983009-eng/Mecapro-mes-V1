import React, { useState, useEffect } from 'react';
import { recursosApi, solicitudesApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { Wrench, Send, Search } from 'lucide-react';

const DNI_OPERARIO = localStorage.getItem('mecapro_dni') || '77777777';

export default function HerramentalPage() {
  const [herramientas, setHerramientas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidades, setCantidades] = useState({});
  const [enviando, setEnviando] = useState(null);

  // Estados de paginacion
  const [pagina, setPagina] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    cargar(pagina);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const cargar = async (page = pagina) => {
    try {
      setLoading(true);
      const [herRes, histRes] = await Promise.all([
        recursosApi.listarHerramientas(page, 10),
        solicitudesApi.historialOperario(DNI_OPERARIO)
      ]);
      const herData = herRes.data.content || herRes.data || [];
      const histData = histRes.data.content || histRes.data || [];
      setHerramientas(herData);
      setHistorial(histData.filter(s => s.tipoRecurso === 'HERRAMIENTA').slice(0, 10));
      setTotalPages(herRes.data.totalPages || 1);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar herramental.' });
    } finally {
      setLoading(false);
    }
  };

  const solicitar = async (herramienta) => {
    const cantidad = cantidades[herramienta.idRecurso] || 1;
    setEnviando(herramienta.idRecurso);
    setAlerta(null);
    try {
      await solicitudesApi.crear({
        dniOperario: DNI_OPERARIO,
        idRecurso: herramienta.idRecurso,
        cantidad: Number(cantidad)
      });
      setAlerta({ tipo: 'success', mensaje: `✅ Solicitud enviada: ${cantidad}x ${herramienta.nombreEspecifico}` });
      cargar(pagina);
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al solicitar.' });
    } finally {
      setEnviando(null);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  const filtradas = filtro
    ? herramientas.filter(h =>
        h.nombreEspecifico.toLowerCase().includes(filtro.toLowerCase()) ||
        h.categoria.toLowerCase().includes(filtro.toLowerCase()))
    : herramientas;

  const agrupadas = (filtro ? filtradas : herramientas).reduce((acc, h) => {
    const cat = filtro ? 'Resultados' : (h.categoria || 'Sin Categoría');
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(h);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <h1 className="text-2xl font-black" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Wrench size={28} style={{ color: 'var(--text-secondary)' }} />
          Herramental — Almacén
        </h1>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 36, width: 240 }}
            placeholder="Buscar herramienta..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {alerta && <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Vista por categorías */}
      {Object.keys(agrupadas).map(cat => {
        const items = agrupadas[cat];
        if (items.length === 0) return null;
        return (
          <div key={cat} className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">🔩 {cat}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{items.length} items</span>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Herramienta</th>
                    <th>Stock</th>
                    <th>Unidad</th>
                    <th>Cantidad</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(h => (
                    <tr key={h.idRecurso}>
                      <td className="font-bold">{h.nombreEspecifico}</td>
                      <td>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: h.stockActual <= h.stockMinimo ? 'var(--red)' : 'var(--green)'
                        }}>
                          {h.stockActual}
                          {h.stockActual <= h.stockMinimo && ' ⚠️'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{h.unidadMedida}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={h.stockActual}
                          value={cantidades[h.idRecurso] || 1}
                          onChange={e => setCantidades(c => ({ ...c, [h.idRecurso]: e.target.value }))}
                          className="form-control"
                          style={{ width: 70, minHeight: 40, textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <button
                          id={`btn-solicitar-her-${h.idRecurso}`}
                          onClick={() => solicitar(h)}
                          disabled={enviando === h.idRecurso || h.stockActual === 0}
                          className="btn btn-primary"
                          style={{ minHeight: 40 }}
                        >
                          <Send size={14} />
                          {enviando === h.idRecurso ? 'Procesando...' : 'Solicitar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Controles de paginacion */}
      {herramientas.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: '14px',
          marginBottom: 20
        }}>
          <button
            className="btn btn-outline"
            disabled={pagina === 0}
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            style={{ minHeight: 64, padding: '0 24px', fontSize: '1rem', cursor: 'pointer' }}
          >
            Anterior
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Página {pagina + 1} de {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={pagina + 1 >= totalPages}
            onClick={() => setPagina(p => p + 1)}
            style={{ minHeight: 64, padding: '0 24px', fontSize: '1rem', cursor: 'pointer' }}
          >
            Siguiente
          </button>
        </div>
      )}

      {historial.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Mis Últimas Solicitudes de Herramental</span></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Herramienta</th>
                  <th>Cant.</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(s => (
                  <tr key={s.idSolicitud}>
                    <td className="font-bold">{s.nombreRecurso}</td>
                    <td className="text-mono">{s.cantidad}</td>
                    <td><StatusBadge estado={s.estadoSolicitud} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(s.fechaSolicitud).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
