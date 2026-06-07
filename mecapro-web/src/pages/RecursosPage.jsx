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

/* ─────────────────────────────────────────────────────
   Hover handlers para el botón Solicitar
   (declarados fuera del render para evitar recreación)
───────────────────────────────────────────────────── */
const handleSolicitarEnter = (e) => {
  e.currentTarget.style.background  = 'linear-gradient(135deg, #7C3AED, #5B21B6)';
  e.currentTarget.style.color       = '#FFFFFF';
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.65)';
  e.currentTarget.style.boxShadow   = '0 0 16px rgba(124,58,237,0.35)';
};
const handleSolicitarLeave = (e) => {
  e.currentTarget.style.background  = '#1A1625';
  e.currentTarget.style.color       = '#C4B5FD';
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.28)';
  e.currentTarget.style.boxShadow   = 'none';
};

/* Estilos base del botón Solicitar */
const BTN_SOLICITAR_BASE = {
  display:      'inline-flex',
  alignItems:   'center',
  justifyContent: 'center',
  gap:          6,
  padding:      '0 16px',
  fontSize:     '0.82rem',
  fontWeight:   700,
  fontFamily:   'var(--font-ui)',
  letterSpacing:'0.3px',
  color:        '#C4B5FD',
  background:   '#1A1625',
  border:       '1px solid rgba(124,58,237,0.28)',
  borderRadius: 9,
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

  return (
    <div className={`resource-card${low ? ' resource-card--alert' : ''}`}>
      {low && <div className="resource-card__alert-stripe" />}

      <div className="resource-card__header">
        <span className="resource-card__name">{recurso.nombreEspecifico}</span>
        <StockPill recurso={recurso} />
      </div>

      <div className="resource-card__meta">
        <span className="resource-card__cat">{recurso.categoria}</span>
        {low && (
          <span className="resource-card__warn">
            ⚡ Stock crítico — mín. {recurso.stockMinimo}
          </span>
        )}
      </div>

      <div className="resource-card__actions">
        {/* Input de cantidad — fondo oscuro integrado */}
        <input
          type="number"
          min="1"
          max={recurso.stockActual}
          value={cantidades[recurso.idRecurso] || 1}
          onChange={(e) =>
            setCantidades((prev) => ({ ...prev, [recurso.idRecurso]: e.target.value }))
          }
          className="form-control resource-card__qty"
          style={{
            background:  '#1A1625',
            border:      '1px solid rgba(124,58,237,0.22)',
            color:       '#EDE9F8',
            fontFamily:  'var(--font-mono)',
            fontVariantNumeric: 'tabular-nums',
          }}
          aria-label={`Cantidad de ${recurso.nombreEspecifico}`}
        />

        {/* Btn Solicitar — violeta dormido, gradiente en hover */}
        <button
          id={`btn-solicitar-${recurso.idRecurso}`}
          style={{
            ...BTN_SOLICITAR_BASE,
            flex: 1,
            minHeight: 40,
            opacity: (sending || noStock) ? 0.5 : 1,
            cursor: (sending || noStock) ? 'not-allowed' : 'pointer',
          }}
          onClick={() => onSolicitar(recurso)}
          disabled={sending || noStock}
          onMouseEnter={!sending && !noStock ? handleSolicitarEnter : undefined}
          onMouseLeave={!sending && !noStock ? handleSolicitarLeave : undefined}
        >
          <Send size={13} />
          {sending ? 'Enviando…' : 'Solicitar'}
        </button>
      </div>
    </div>
  );
}

/* ResourceTable — vista lista con banding y tabular-nums */
function ResourceTable({ items, cantidades, setCantidades, enviando, onSolicitar }) {
  return (
    <div style={{
      background:   'var(--bg-card)',
      border:       '1px solid rgba(124,58,237,0.12)',
      borderRadius: 14,
      overflow:     'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Recurso','Categoría','Stock','Unidad','Cant.','Acción'].map(h => (
              <th
                key={h}
                style={{
                  padding:       '11px 16px',
                  textAlign:     'left',
                  fontSize:      '0.68rem',
                  fontWeight:    700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color:         'rgba(124,58,237,0.70)',
                  background:    'rgba(124,58,237,0.05)',
                  borderBottom:  '1px solid rgba(124,58,237,0.10)',
                  fontFamily:    'var(--font-mono)',
                  whiteSpace:    'nowrap',
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
                    ? 'rgba(124,58,237,0.03)' : 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                  ? 'rgba(124,58,237,0.03)' : 'transparent'}
              >
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#EDE9F8' }}>
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
                      background: '#1A1625',
                      border: '1px solid rgba(124,58,237,0.22)',
                      color: '#EDE9F8',
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
                    {sending ? '…' : 'Solicitar'}
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
  const [recursos, setRecursos]     = useState([]);
  const [stockBajo, setStockBajo]   = useState([]);
  const [historial, setHistorial]   = useState([]);
  const [alerta, setAlerta]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [cantidades, setCantidades] = useState({});
  const [enviando, setEnviando]     = useState(null);
  const [filtro, setFiltro]         = useState('');
  const [viewMode, setViewMode]     = useState('cards');
  const [expandedCats, setExpandedCats] = useState({});

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [eppsRes, herRes, stockRes, histRes] = await Promise.all([
        recursosApi.listarEpps(),
        recursosApi.listarHerramientas(),
        recursosApi.stockBajo(),
        solicitudesApi.historialOperario(DNI_OPERARIO),
      ]);
      setRecursos({ epps: eppsRes.data, herramientas: herRes.data });
      setStockBajo(stockRes.data);
      setHistorial(histRes.data.slice(0, 10));
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar inventario de recursos.' });
    } finally {
      setLoading(false);
    }
  }, [DNI_OPERARIO]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const categorias = [...new Set(filtrados.map((r) => r.categoria))];
  const toggleCat  = (cat) => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="recursos-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header__left">
          {/* Ícono con resplandor violeta */}
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(37,99,235,0.10))',
            border: '1px solid rgba(124,58,237,0.30)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.20)',
            color: '#A78BFA',
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
          style={{ gap: 6 }}
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
        <div className="critical-callout" style={{ marginBottom: 24 }}>
          <AlertTriangle size={18} className="critical-callout__icon" />
          <div>
            <strong>Stock crítico detectado:</strong>{' '}
            {stockBajo.map((r) => r.nombreEspecifico).join(' · ')}
          </div>
        </div>
      )}

      {/* ── Toolbar: Tabs + Filtro + View Toggle ── */}
      <div className="recursos-toolbar">
        {/* Tabs — Midnight Amethyst */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 12,
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
                  borderRadius: 8,
                  cursor:       'pointer',
                  fontFamily:   'var(--font-ui)',
                  fontSize:     '0.875rem',
                  fontWeight:   600,
                  whiteSpace:   'nowrap',
                  transition:   'all 0.18s ease',
                  border:       active ? '1px solid rgba(124,58,237,0.45)' : '1px solid transparent',
                  background:   active ? 'rgba(124,58,237,0.14)' : 'transparent',
                  color:        active ? '#C4B5FD' : 'var(--text-muted)',
                  boxShadow:    active ? '0 0 12px rgba(124,58,237,0.18)' : 'none',
                }}
              >
                <Icon size={15} style={{ color: active ? '#A78BFA' : 'inherit' }} />
                {label}
                <span style={{
                  background:    active ? 'rgba(124,58,237,0.22)' : 'rgba(124,58,237,0.08)',
                  border:        active ? '1px solid rgba(124,58,237,0.50)' : '1px solid rgba(124,58,237,0.15)',
                  borderRadius:  9999,
                  fontSize:      '0.68rem',
                  fontWeight:    700,
                  padding:       '1px 7px',
                  fontFamily:    'var(--font-mono)',
                  color:         active ? '#C4B5FD' : 'var(--text-muted)',
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
                background:  '#1A1625',
                border:      '1px solid rgba(124,58,237,0.20)',
                color:       '#EDE9F8',
              }}
            />
          </div>
          {/* View Toggle */}
          <div style={{
            display:      'flex',
            background:   'var(--bg-secondary)',
            border:       '1px solid rgba(124,58,237,0.15)',
            borderRadius: 10,
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
                    background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                    color:      active ? '#C4B5FD' : 'var(--text-muted)',
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
          background: 'var(--bg-card)',
          border: '1px solid rgba(124,58,237,0.10)',
          borderRadius: 14,
          fontFamily: 'var(--font-mono)',
        }}>
          Sin resultados para «{filtro}»
        </div>
      ) : viewMode === 'table' ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(124,58,237,0.10)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              {tab === 'epps' ? <ShieldCheck size={16} style={{ color: '#A78BFA' }} /> : <Wrench size={16} style={{ color: '#A78BFA' }} />}
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
        categorias.map((cat) => {
          const items      = filtrados.filter((r) => r.categoria === cat);
          const isOpen     = expandedCats[cat] !== false;
          const hasCritical = items.some(isLowStock);
          return (
            <div
              key={cat}
              className={`cat-section${hasCritical ? ' cat-section--alert' : ''}`}
              style={{ border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14 }}
            >
              <button className="cat-section__header" onClick={() => toggleCat(cat)}>
                <span className="cat-section__title">
                  {tab === 'epps' ? '🛡️' : '🔩'} {cat}
                  {hasCritical && (
                    <span style={{
                      marginLeft: 10, fontSize: '0.65rem',
                      background: 'rgba(245,158,11,0.14)',
                      color: '#FCD34D',
                      padding: '2px 8px', borderRadius: 9999, fontWeight: 700, letterSpacing: '0.3px',
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
                    background: 'rgba(124,58,237,0.10)',
                    border: '1px solid rgba(124,58,237,0.22)',
                    borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#A78BFA',
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

      {/* ═══════════════════════════════════════════════
          Historial reciente — Midnight Amethyst table
      ═══════════════════════════════════════════════ */}
      {historial.length > 0 && (
        <div style={{
          marginTop: 28,
          background: 'var(--bg-card)',
          border: '1px solid rgba(124,58,237,0.12)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(124,58,237,0.10)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              📋 Mis Últimas Solicitudes
            </span>
            <span style={{
              color: 'rgba(124,58,237,0.7)', fontSize: '0.7rem',
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
                      color:         'rgba(124,58,237,0.70)',
                      background:    'rgba(124,58,237,0.05)',
                      borderBottom:  '1px solid rgba(124,58,237,0.10)',
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
                      ? 'rgba(124,58,237,0.03)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                    ? 'rgba(124,58,237,0.03)' : 'transparent'}
                >
                  {/* Recurso */}
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#EDE9F8' }}>
                    {s.nombreRecurso}
                  </td>

                  {/* Tipo — badge translúcido */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 9px',
                      borderRadius: 9999,
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.3px',
                      background: s.tipoRecurso === 'EPP'
                        ? 'rgba(16,185,129,0.13)' : 'rgba(99,102,241,0.14)',
                      color: s.tipoRecurso === 'EPP'
                        ? '#6EE7B7' : '#A5B4FC',
                    }}>
                      {s.tipoRecurso}
                    </span>
                  </td>

                  {/* Cant. — tabular-nums */}
                  <td style={{
                    padding: '12px 16px',
                    fontFamily: 'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    color: '#EDE9F8',
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
                        borderRadius: 9999,
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.4px',
                        background: 'rgba(100,116,139,0.15)',
                        color: '#94A3B8',
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
