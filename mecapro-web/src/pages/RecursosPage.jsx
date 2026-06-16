import React, { useState, useEffect, useCallback } from 'react';
import { recursosApi, solicitudesApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import {
  Package, ShieldCheck, Wrench, Search, Send, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, Layers, CheckCircle
} from 'lucide-react';

/* ─────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────── */
const isLowStock = (r) => r.stockActual <= r.stockMinimo;

const parseNombreEspecifico = (nombre) => {
  if (!nombre) return { nombre: '—', codigo: 'RECURSO' };
  const match = nombre.match(/(.*)\[(.*?)]/);
  if (match) {
    return {
      nombre: match[1].trim(),
      codigo: match[2].trim()
    };
  }
  return {
    nombre: nombre,
    codigo: 'RECURSO'
  };
};

/* ─────────────────────────────────────────────────────
   Hover handlers para el botón Solicitar
   (declarados fuera del render para evitar recreación)
───────────────────────────────────────────────────── */
const handleSolicitarEnter = (e) => {
  e.currentTarget.style.filter = 'brightness(1.08)';
};
const handleSolicitarLeave = (e) => {
  e.currentTarget.style.filter = 'none';
};

/* Estilos base del botón Solicitar */
const BTN_SOLICITAR_BASE = {
  display:      'inline-flex',
  alignItems:   'center',
  justifyContent: 'center',
  gap:          6,
  padding:      '0 16px',
  fontSize:     '0.82rem',
  fontWeight:   800,
  fontFamily:   'var(--font-ui)',
  letterSpacing:'0.3px',
  textTransform:'uppercase',
  color:        '#1A2E39',
  background:   'var(--hmi-accent)',
  border:       '1px solid var(--hmi-bg-surface-elevated)',
  borderRadius: 4,
  cursor:       'pointer',
  transition:   'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  whiteSpace:   'nowrap',
};

/* ─────────────────────────────────────────────────────
   Sub-componentes
───────────────────────────────────────────────────── */
function StockPill({ recurso }) {
  const low = isLowStock(recurso);
  return (
    <span className={low ? 'stock-pill stock-pill--critical' : 'stock-pill stock-pill--ok'}>
      {low && <span className="stock-pill__pulse" />}
      {recurso.stockActual} {recurso.unidadMedida}
      {low && <AlertTriangle size={11} style={{ marginLeft: 4 }} />}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, accent, sublabel }) {
  return (
    <div className={`glow-card glow-card--${accent}`}>
      <div className="glow-card__icon">
        <Icon size={22} />
      </div>
      <div className="glow-card__body">
        <span className="glow-card__label">{label}</span>
        <span className="glow-card__value">{value}</span>
        {sublabel && <span className="glow-card__sub">{sublabel}</span>}
      </div>
    </div>
  );
}

/* ResourceCard — botón Solicitar con gradiente violeta en hover */
function ResourceCard({ recurso, cantidades, setCantidades, enviando, onSolicitar }) {
  const low     = isLowStock(recurso);
  const sending = enviando === recurso.idRecurso;
  const noStock = recurso.stockActual === 0;

  const qty = Number(cantidades[recurso.idRecurso]) || 1;

  const handleDecrement = () => {
    const newVal = qty - 1;
    if (newVal >= 1) {
      setCantidades(prev => ({ ...prev, [recurso.idRecurso]: newVal }));
    }
  };

  const handleIncrement = () => {
    const newVal = qty + 1;
    if (newVal <= recurso.stockActual) {
      setCantidades(prev => ({ ...prev, [recurso.idRecurso]: newVal }));
    }
  };

  return (
    <div
      className={`resource-card${low ? ' resource-card--alert' : ''}`}
      style={{
        background: 'var(--hmi-bg-surface)',
        border: '1px solid var(--hmi-bg-surface-elevated)',
      }}
    >
      {low && <div className="resource-card__alert-stripe" />}

      <div className="resource-card__header">
        <span className="resource-card__name">{recurso.nombreEspecifico}</span>
        <StockPill recurso={recurso} />
      </div>

      <div className="resource-card__meta">
        <span className="resource-card__cat">{recurso.categoria}</span>
        {low && (
          <span className="resource-card__warn">
            Stock crítico — mín. {recurso.stockMinimo}
          </span>
        )}
      </div>

      <div className="resource-card__actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* Control numérico de planta compacto */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          overflow: 'hidden',
          height: 40,
        }}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={qty <= 1 || noStock}
            style={{
              width: 36,
              height: '100%',
              background: 'var(--hmi-bg-surface-elevated)',
              border: 'none',
              color: 'var(--hmi-text-main)',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: qty <= 1 || noStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: qty <= 1 || noStock ? 0.5 : 1,
            }}
          >
            -
          </button>
          
          <input
            type="number"
            min="1"
            max={recurso.stockActual}
            value={cantidades[recurso.idRecurso] || 1}
            onChange={(e) => {
              const val = Number(e.target.value) || 1;
              const maxVal = recurso.stockActual;
              setCantidades((prev) => ({ ...prev, [recurso.idRecurso]: Math.max(1, Math.min(val, maxVal)) }));
            }}
            className="resource-card__qty"
            style={{
              width: 44,
              height: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--hmi-text-main)',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'center',
              fontSize: '0.95rem',
              padding: 0,
              margin: 0,
              outline: 'none',
            }}
            aria-label={`Cantidad de ${recurso.nombreEspecifico}`}
            disabled={noStock}
          />

          <button
            type="button"
            onClick={handleIncrement}
            disabled={qty >= recurso.stockActual || noStock}
            style={{
              width: 36,
              height: '100%',
              background: 'var(--hmi-bg-surface-elevated)',
              border: 'none',
              color: 'var(--hmi-text-main)',
              fontSize: '1.2rem',
              fontWeight: 800,
              cursor: qty >= recurso.stockActual || noStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: qty >= recurso.stockActual || noStock ? 0.5 : 1,
            }}
          >
            +
          </button>
        </div>

        {/* Btn Solicitar — Tema Pumpkin */}
        <button
          id={`btn-solicitar-${recurso.idRecurso}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '0 16px',
            fontSize: '0.82rem',
            fontWeight: 800,
            fontFamily: 'var(--font-ui)',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            color: '#1A2E39', // Alto contraste
            background: (sending || noStock) ? 'var(--hmi-accent-disabled)' : 'var(--hmi-accent)', // Pumpkin plano
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            flex: 1,
            minHeight: 40,
            opacity: (sending || noStock) ? 0.5 : 1,
            cursor: (sending || noStock) ? 'not-allowed' : 'pointer',
            boxShadow: 'none',
          }}
          onClick={() => onSolicitar(recurso)}
          disabled={sending || noStock}
        >
          <Send size={13} />
          {sending ? 'Procesando...' : 'Solicitar'}
        </button>
      </div>
    </div>
  );
}

/* ResourceTable — vista lista con banding y tabular-nums */
function ResourceTable({ items, cantidades, setCantidades, enviando, onSolicitar }) {
  return (
    <div style={{
      background: 'var(--hmi-bg-surface)',
      border: '1px solid var(--hmi-bg-surface-elevated)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Recurso','Categoría','Stock','Unidad','Cant.','Acción'].map(h => (
              <th
                key={h}
                style={{
                  padding: '11px 16px',
                  textAlign: 'left',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--hmi-text-muted)',
                  background: 'var(--hmi-bg-surface-elevated)',
                  borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
                  fontFamily: 'var(--font-mono)',
                  whiteSpace: 'nowrap',
                }}
              >{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r, idx) => {
            const sending = enviando === r.idRecurso;
            const noStock = r.stockActual === 0;
            return (
              <tr
                key={r.idRecurso}
                style={{
                  background: idx % 2 === 1
                    ? 'var(--hmi-bg-surface)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                  ? 'var(--hmi-bg-surface)' : 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--hmi-text-main)' }}>
                  {r.nombreEspecifico}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {r.categoria}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <StockPill recurso={r} />
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {r.unidadMedida}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <input
                    type="number"
                    min="1"
                    max={r.stockActual}
                    value={cantidades[r.idRecurso] || 1}
                    onChange={(e) =>
                      setCantidades((prev) => ({ ...prev, [r.idRecurso]: e.target.value }))
                    }
                    className="form-control"
                    style={{
                      width: 68, minHeight: 36,
                      textAlign: 'center', padding: '5px 6px',
                      background: 'var(--hmi-bg-main)',
                      border: '1px solid var(--hmi-bg-surface-elevated)',
                      color: 'var(--hmi-text-main)',
                      fontFamily: 'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <button
                    id={`btn-table-${r.idRecurso}`}
                    style={{
                      ...BTN_SOLICITAR_BASE,
                      minHeight: 36,
                      opacity: (sending || noStock) ? 0.5 : 1,
                      cursor:  (sending || noStock) ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => onSolicitar(r)}
                    disabled={sending || noStock}
                    onMouseEnter={!sending && !noStock ? handleSolicitarEnter : undefined}
                    onMouseLeave={!sending && !noStock ? handleSolicitarLeave : undefined}
                  >
                    <Send size={12} />
                    {sending ? 'Procesando...' : 'Solicitar'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Page
═══════════════════════════════════════════════════════ */
export default function RecursosPage() {
  const DNI_OPERARIO = localStorage.getItem('mecapro_dni') || '77777777';
  const [tab, setTab]               = useState('epps');
  const [recursos, setRecursos]     = useState({ epps: [], herramientas: [] });
  const [stockBajo, setStockBajo]   = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [alerta, setAlerta]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cantidades, setCantidades] = useState({});
  const [enviando, setEnviando]     = useState(null);
  const [filtro, setFiltro]         = useState('');
  const [viewMode, setViewMode]     = useState('cards');
  const [expandedCats, setExpandedCats] = useState({});

  // Estados de paginacion
  const [paginaEpps, setPaginaEpps] = useState(0);
  const [totalPagesEpps, setTotalPagesEpps] = useState(1);
  const [paginaHerramientas, setPaginaHerramientas] = useState(0);
  const [totalPagesHerramientas, setTotalPagesHerramientas] = useState(1);

  const cargar = useCallback(async (pageE = paginaEpps, pageH = paginaHerramientas) => {
    try {
      setLoading(true);
      const [eppsRes, herRes, stockRes, histRes] = await Promise.all([
        recursosApi.listarEpps(pageE, 10),
        recursosApi.listarHerramientas(pageH, 10),
        recursosApi.stockBajo(0, 100),
        solicitudesApi.historialOperario(DNI_OPERARIO),
      ]);
      
      const eppsData = eppsRes.data.content || eppsRes.data || [];
      const herramientasData = herRes.data.content || herRes.data || [];
      const stockData = stockRes.data.content || stockRes.data || [];
      const histData = histRes.data.content || histRes.data || [];

      setRecursos({ epps: eppsData, herramientas: herramientasData });
      setStockBajo(stockData);
      setHistorial(histData.slice(0, 10));

      setTotalPagesEpps(eppsRes.data.totalPages || 1);
      setTotalPagesHerramientas(herRes.data.totalPages || 1);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar inventario de recursos.' });
    } finally {
      setLoading(false);
    }
  }, [DNI_OPERARIO, paginaEpps, paginaHerramientas]);

  useEffect(() => {
    cargar(paginaEpps, paginaHerramientas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaEpps, paginaHerramientas, cargar]);

  const solicitar = async (recurso) => {
    const cantidad = cantidades[recurso.idRecurso] || 1;
    setEnviando(recurso.idRecurso);
    setAlerta(null);
    try {
      await solicitudesApi.crear({ idRecurso: recurso.idRecurso, cantidad: Number(cantidad) });
      setAlerta({
        tipo: 'success',
        mensaje: `✅ Solicitud enviada: ${cantidad}× ${recurso.nombreEspecifico}. Área SIG/Almacén notificada.`,
      });
      cargar();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al enviar solicitud.' });
    } finally {
      setEnviando(null);
    }
  };

  if (loading || !recursos.epps) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Cargando inventario…
        </span>
      </div>
    );
  }

  const listaActual  = tab === 'epps' ? recursos.epps : recursos.herramientas;
  const allRecursos  = [...(recursos.epps || []), ...(recursos.herramientas || [])];
  const totalItems   = allRecursos.length;
  const alertasCount = stockBajo.length;
  const activosCount = allRecursos.filter((r) => r.activo).length;

  const filtrados = filtro
    ? listaActual.filter(
        (r) =>
          r.nombreEspecifico.toLowerCase().includes(filtro.toLowerCase()) ||
          r.categoria?.toLowerCase().includes(filtro.toLowerCase())
      )
    : listaActual;

  const agrupadosPorCategoria = filtrados.reduce((acc, r) => {
    const cat = r.categoria || 'Sin Categoría';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(r);
    return acc;
  }, {});
  const toggleCat  = (cat) => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="recursos-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header__left">
          {/* Ícono plano HMI */}
          <div style={{
            width: 52, height: 52,
            background: 'var(--hmi-bg-surface)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
            color: 'var(--hmi-accent)',
          }}>
            <Package size={24} />
          </div>
          <div>
            <h1 className="page-header__title">Gestión de Recursos</h1>
            <p className="page-header__sub">Inventario · EPPs · Herramental</p>
          </div>
        </div>
        <button
          id="btn-refresh-recursos"
          className="btn btn-outline"
          onClick={cargar}
          style={{ gap: 6, borderRadius: 4 }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── KPI Glow Cards ── */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        <KpiCard icon={Layers}         label="Total en Inventario" value={totalItems}   accent="blue"  sublabel="EPPs + Herramental" />
        <KpiCard icon={AlertTriangle}  label="Alertas de Stock"    value={alertasCount} accent={alertasCount > 0 ? 'amber' : 'green'} sublabel={alertasCount > 0 ? 'Requiere reposición' : 'Todo en nivel OK'} />
        <KpiCard icon={CheckCircle}    label="Recursos Activos"    value={activosCount} accent="green" sublabel={`de ${totalItems} en catálogo`} />
      </div>

      {/* ── Banner alertas ── */}
      {alerta && (
        <div style={{ marginBottom: 20 }}>
          <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
        </div>
      )}

      {/* ── Stock Crítico callout ── */}
      {stockBajo.length > 0 && (
        <div className="critical-callout" style={{
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '16px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} className="critical-callout__icon" style={{ color: 'var(--hmi-accent)' }} />
            <strong style={{ color: 'var(--hmi-text-main)', fontSize: '0.9rem' }}>ALERTAS DE REPOSICIÓN CRÍTICA</strong>
          </div>
          
          <div style={{
            maxHeight: 180,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            rowGap: 10,
            columnGap: 16,
            alignItems: 'center',
            paddingRight: 6,
          }}>
            {stockBajo.map((r, i) => {
              const { nombre, codigo } = parseNombreEspecifico(r.nombreEspecifico);
              return (
                <React.Fragment key={r.idRecurso || i}>
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'var(--hmi-bg-surface-elevated)',
                    color: 'var(--hmi-text-muted)',
                    padding: '3px 8px',
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.05)',
                    whiteSpace: 'nowrap',
                  }}>
                    {codigo}
                  </span>
                  
                  <span style={{
                    color: 'var(--hmi-text-main)',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}>
                    {nombre}
                  </span>
                  
                  <span style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--hmi-accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}>
                    REPOSICIÓN REQUERIDA
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar: Tabs + Filtro + View Toggle ── */}
      <div className="recursos-toolbar">
        {/* Tabs — HMI Charcoal & Pumpkin */}
        <div style={{
          display: 'flex',
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          padding: 4,
          gap: 4,
        }}>
          {[
            { id: 'tab-epps',         key: 'epps',          Icon: ShieldCheck, label: 'EPPs',        count: recursos.epps.length },
            { id: 'tab-herramientas', key: 'herramientas',  Icon: Wrench,      label: 'Herramental', count: recursos.herramientas.length },
          ].map(({ id, key, Icon, label, count }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                id={id}
                onClick={() => { setTab(key); setFiltro(''); }}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          7,
                  padding:      '8px 18px',
                  borderRadius: 4,
                  cursor:       'pointer',
                  fontFamily:   'var(--font-ui)',
                  fontSize:     '0.875rem',
                  fontWeight:   600,
                  whiteSpace:   'nowrap',
                  transition:   'all 0.18s ease',
                  border:       active ? '1px solid var(--hmi-accent)' : '1px solid transparent',
                  background:   active ? 'var(--hmi-accent)' : 'transparent',
                  color:        active ? '#1A2E39' : 'var(--hmi-text-muted)',
                  boxShadow:    'none',
                }}
              >
                <Icon size={15} style={{ color: active ? '#1A2E39' : 'inherit' }} />
                {label}
                <span style={{
                  background:    active ? 'var(--hmi-bg-surface)' : 'var(--hmi-bg-surface-elevated)',
                  border:        active ? '1px solid var(--hmi-bg-surface)' : '1px solid var(--hmi-bg-surface-elevated)',
                  borderRadius:  '9999px',
                  fontSize:      '0.68rem',
                  fontWeight:    700,
                  padding:       '2px 8px',
                  fontFamily:    'var(--font-mono)',
                  color:         active ? 'var(--hmi-accent)' : 'var(--hmi-text-muted)',
                  display:       'inline-flex',
                  alignItems:    'center',
                  justifyContent: 'center',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="recursos-toolbar__right">
          <div className="search-box">
            <Search size={14} className="search-box__icon" />
            <input
              id="input-buscar-recursos"
              className="form-control search-box__input"
              placeholder="Buscar…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={{
                background:  'var(--hmi-bg-surface)',
                border:      '1px solid var(--hmi-bg-surface-elevated)',
                color:       'var(--hmi-text-main)',
                borderRadius: 4,
                boxShadow:   'none',
                outline:     'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--hmi-accent)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.outline = 'none';
              }}
            />
          </div>
          {/* View Toggle */}
          <div style={{
            display:      'flex',
            background:   'var(--hmi-bg-surface)',
            border:       '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            overflow:     'hidden',
          }}>
            {[
              { id: 'btn-view-cards', mode: 'cards', title: 'Vista tarjetas', label: <Layers size={15} /> },
              { id: 'btn-view-table', mode: 'table', title: 'Vista tabla',    label: '☰' },
            ].map(({ id, mode, title, label }) => {
              const active = viewMode === mode;
              return (
                <button
                  key={mode}
                  id={id}
                  title={title}
                  onClick={() => setViewMode(mode)}
                  style={{
                    width:      38, height: 38,
                    display:    'flex', alignItems: 'center', justifyContent: 'center',
                    border:     'none',
                    cursor:     'pointer',
                    background: active ? 'var(--hmi-bg-surface-elevated)' : 'transparent',
                    color:      active ? 'var(--hmi-accent)' : 'var(--hmi-text-muted)',
                    fontSize:   '1rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {filtrados.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 40,
          color: 'var(--text-muted)',
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          fontFamily: 'var(--font-mono)',
        }}>
          Sin resultados para «{filtro}»
        </div>
      ) : (
        <div>
          {viewMode === 'table' ? (
            <div style={{
              background: 'var(--hmi-bg-surface)',
              border: '1px solid var(--hmi-bg-surface-elevated)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  {tab === 'epps' ? <ShieldCheck size={16} style={{ color: 'var(--hmi-accent)' }} /> : <Wrench size={16} style={{ color: 'var(--hmi-accent)' }} />}
                  {tab === 'epps' ? ' Catálogo EPPs' : ' Catálogo Herramental'}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                  {filtrados.length} ítems
                </span>
              </div>
              <ResourceTable
                items={filtrados}
                cantidades={cantidades}
                setCantidades={setCantidades}
                enviando={enviando}
                onSolicitar={solicitar}
              />
            </div>
          ) : (
            Object.keys(agrupadosPorCategoria).map((cat) => {
              const items      = agrupadosPorCategoria[cat];
              const isOpen     = expandedCats[cat] !== false;
              const hasCritical = items.some(isLowStock);
              return (
                <div
                  key={cat}
                  className={`cat-section${hasCritical ? ' cat-section--alert' : ''}`}
                  style={{ border: '1px solid var(--hmi-bg-surface-elevated)', borderRadius: 4, marginBottom: 20 }}
                >
                  <button className="cat-section__header" onClick={() => toggleCat(cat)}>
                    <span className="cat-section__title" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      {tab === 'epps' ? (
                        <ShieldCheck size={16} style={{ color: 'var(--hmi-accent)' }} />
                      ) : (
                        <Wrench size={16} style={{ color: 'var(--hmi-accent)' }} />
                      )}
                      <span>{cat}</span>
                      {hasCritical && (
                        <span style={{
                          marginLeft: 10, fontSize: '0.65rem',
                          background: 'rgba(253, 128, 46, 0.14)',
                          color: 'var(--hmi-accent)',
                          padding: '2px 8px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.3px',
                        }}>
                          ⚠ ALERTA
                        </span>
                      )}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                        {items.length} ítems
                      </span>
                      {/* Flecha estilizada */}
                      <span style={{
                        width: 24, height: 24,
                        background: 'var(--hmi-bg-surface-elevated)',
                        border: '1px solid var(--hmi-bg-surface-elevated)',
                        borderRadius: 4,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--hmi-accent)',
                      }}>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="grid-3 cat-section__grid">
                      {items.map((r) => (
                        <ResourceCard
                          key={r.idRecurso}
                          recurso={r}
                          cantidades={cantidades}
                          setCantidades={setCantidades}
                          enviando={enviando}
                          onSolicitar={solicitar}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Controles de paginacion */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: 'var(--hmi-bg-surface)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: '4px',
            marginTop: 16
          }}>
            <button
              className="btn btn-outline"
              disabled={tab === 'epps' ? paginaEpps === 0 : paginaHerramientas === 0}
              onClick={() => {
                if (tab === 'epps') {
                  setPaginaEpps(p => Math.max(0, p - 1));
                } else {
                  setPaginaHerramientas(p => Math.max(0, p - 1));
                }
              }}
              style={{
                minHeight: 64,
                padding: '0 24px',
                fontSize: '1rem',
                cursor: (tab === 'epps' ? paginaEpps === 0 : paginaHerramientas === 0) ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--hmi-bg-surface)',
                border: '1px solid var(--hmi-bg-surface-elevated)',
                color: (tab === 'epps' ? paginaEpps === 0 : paginaHerramientas === 0) ? 'var(--hmi-accent-disabled)' : 'var(--hmi-text-main)',
                opacity: (tab === 'epps' ? paginaEpps === 0 : paginaHerramientas === 0) ? 0.5 : 1,
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'none',
              }}
            >
              Anterior
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Página {(tab === 'epps' ? paginaEpps : paginaHerramientas) + 1} de {tab === 'epps' ? totalPagesEpps : totalPagesHerramientas}
            </span>
            <button
              className="btn btn-outline"
              disabled={tab === 'epps' ? (paginaEpps + 1 >= totalPagesEpps) : (paginaHerramientas + 1 >= totalPagesHerramientas)}
              onClick={() => {
                if (tab === 'epps') {
                  setPaginaEpps(p => p + 1);
                } else {
                  setPaginaHerramientas(p => p + 1);
                }
              }}
              style={{
                minHeight: 64,
                padding: '0 24px',
                fontSize: '1rem',
                cursor: (tab === 'epps' ? (paginaEpps + 1 >= totalPagesEpps) : (paginaHerramientas + 1 >= totalPagesHerramientas)) ? 'not-allowed' : 'pointer',
                backgroundColor: 'var(--hmi-bg-surface)',
                border: '1px solid var(--hmi-bg-surface-elevated)',
                color: (tab === 'epps' ? (paginaEpps + 1 >= totalPagesEpps) : (paginaHerramientas + 1 >= totalPagesHerramientas)) ? 'var(--hmi-accent-disabled)' : 'var(--hmi-text-main)',
                opacity: (tab === 'epps' ? (paginaEpps + 1 >= totalPagesEpps) : (paginaHerramientas + 1 >= totalPagesHerramientas)) ? 0.5 : 1,
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'none',
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          Historial reciente — Midnight Amethyst table
      ═══════════════════════════════════════════════ */}
      {historial.length > 0 && (
        <div style={{
          marginTop: 28,
          background: 'var(--bg-card)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 'none',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Mis Últimas Solicitudes
            </span>
            <span style={{
              color: 'var(--hmi-accent)', fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
            }}>
              {historial.length} REGISTROS
            </span>
          </div>

          {/* Tabla */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Recurso','Tipo','Cant.','Estado','Fecha'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding:       '11px 16px',
                      textAlign:     'left',
                      fontSize:      '0.68rem',
                      fontWeight:    700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      color:         'var(--hmi-text-muted)',
                      background:    'var(--hmi-bg-surface-elevated)',
                      borderBottom:  '1px solid var(--hmi-bg-surface-elevated)',
                      fontFamily:    'var(--font-mono)',
                    }}
                  >{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historial.map((s, idx) => (
                <tr
                  key={s.idSolicitud}
                  style={{
                    background: idx % 2 === 1
                      ? 'var(--hmi-bg-surface)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                    ? 'var(--hmi-bg-surface)' : 'transparent'}
                >
                  {/* Recurso */}
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--hmi-text-main)' }}>
                    {s.nombreRecurso}
                  </td>

                  {/* Tipo — badge translúcido */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 9px',
                      borderRadius: 4,
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px',
                      background: 'var(--hmi-bg-surface-elevated)',
                      border: '1px solid var(--hmi-bg-surface-elevated)',
                      color: 'var(--hmi-text-muted)',
                    }}>
                      {s.tipoRecurso}
                    </span>
                  </td>

                  {/* Cant. — tabular-nums */}
                  <td style={{
                    padding: '12px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--hmi-text-main)',
                    fontWeight: 600,
                  }}>
                    {s.cantidad}
                  </td>

                  {/* Estado — StatusBadge + fallback slate para PENDIENTE */}
                  <td style={{ padding: '12px 16px', fontVariantNumeric: 'tabular-nums' }}>
                    {s.estadoSolicitud === 'PENDIENTE' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 9px',
                        borderRadius: 4,
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.4px',
                        background: 'var(--hmi-bg-surface-elevated)',
                        border: '1px solid var(--hmi-bg-surface-elevated)',
                        color: 'var(--hmi-accent)',
                      }}>
                        PENDIENTE
                      </span>
                    ) : (
                      <StatusBadge estado={s.estadoSolicitud} />
                    )}
                  </td>

                  {/* Fecha — tabular-nums, mono */}
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '0.76rem',
                    color: '#94A3B8',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                  }}>
                    {new Date(s.fechaSolicitud).toLocaleString('es-PE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
