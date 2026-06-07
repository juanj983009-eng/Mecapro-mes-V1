import React, { useState, useEffect, useCallback } from 'react';
import { costosApi, hpsApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import { DollarSign, PlusCircle, TrendingUp, BarChart3, CheckCircle2, Save } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Configuración de conceptos
───────────────────────────────────────────────────────────── */
const CONCEPTOS = [
  { value: 'MANO_OBRA',   label: '👷 Mano de Obra' },
  { value: 'MATERIAL',    label: '🪨 Material' },
  { value: 'HERRAMENTAL', label: '🔧 Herramental' },
  { value: 'OVERHEAD',    label: '🏭 Overhead' },
  { value: 'OTRO',        label: '📌 Otro' },
];

/* Colores de acento por concepto — Midnight Amethyst */
const CONCEPTO_COLORS = {
  MANO_OBRA:   '#818CF8',   /* indigo-400  */
  MATERIAL:    '#10B981',   /* emerald     */
  HERRAMENTAL: '#F59E0B',   /* amber       */
  OVERHEAD:    '#A78BFA',   /* violet-400  */
  OTRO:        '#94A3B8',   /* slate-400   */
};
const CONCEPTO_GLOWS = {
  MANO_OBRA:   'rgba(129,140,248,0.18)',
  MATERIAL:    'rgba(16,185,129,0.15)',
  HERRAMENTAL: 'rgba(245,158,11,0.15)',
  OVERHEAD:    'rgba(167,139,250,0.18)',
  OTRO:        'rgba(148,163,184,0.12)',
};

const DNI_OPERARIO = localStorage.getItem('mecapro_dni') || '77777777';

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const fmt = (m) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(m ?? 0);

/* Focus/Blur handlers para selects — glow violeta */
const handleSelectFocus = (e) => {
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.65)';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.20)';
};
const handleSelectBlur = (e) => {
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)';
  e.currentTarget.style.boxShadow   = 'none';
};

/* Estilos de celda numérica para columnas financieras */
const CELL_MONEY = {
  fontFamily:         'var(--font-mono)',
  fontVariantNumeric: 'tabular-nums',
  textAlign:          'right',
  fontWeight:         600,
  whiteSpace:         'nowrap',
};

/* ═══════════════════════════════════════════════════════════
   Empty State — visible cuando no hay HP seleccionada
═══════════════════════════════════════════════════════════ */
function EmptyState() {
  /* KPI placeholder data — históricos de planta */
  const PLACEHOLDERS = [
    {
      icon: DollarSign,
      label: 'Total Invertido',
      value: '—',
      sub: 'Seleccione una HP',
      accent: '#818CF8',
      glow: 'rgba(129,140,248,0.18)',
    },
    {
      icon: TrendingUp,
      label: 'Margen Planta Prom.',
      value: '—',
      sub: 'Datos en espera',
      accent: '#10B981',
      glow: 'rgba(16,185,129,0.15)',
    },
    {
      icon: CheckCircle2,
      label: 'Órdenes Liquidadas',
      value: '—',
      sub: 'Sin consulta activa',
      accent: '#F59E0B',
      glow: 'rgba(245,158,11,0.15)',
    },
  ];

  return (
    <div>
      {/* KPI Placeholder Cards */}
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {PLACEHOLDERS.map(({ icon: Icon, label, value, sub, accent, glow }) => (
          <div
            key={label}
            className="stat-card"
            style={{
              borderLeft: `4px solid ${accent}`,
              opacity: 0.65,
              filter: 'saturate(0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36,
                background: glow,
                border: `1px solid ${accent}30`,
                borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} style={{ color: accent }} />
              </div>
              <span className="stat-label" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
            <span
              className="stat-value"
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '1.6rem',
                color: accent,
                opacity: 0.5,
              }}
            >
              {value}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}>
              {sub}
            </span>
          </div>
        ))}
      </div>

      {/* Panel de guía HMI central */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '48px 32px',
        background:     'var(--bg-card)',
        border:         '1px solid rgba(124,58,237,0.12)',
        borderRadius:   16,
        textAlign:      'center',
        position:       'relative',
        overflow:       'hidden',
      }}>
        {/* Gradiente decorativo de fondo */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Ícono principal con resplandor */}
        <div style={{
          width: 80, height: 80,
          background: 'rgba(124,58,237,0.10)',
          border: '1px solid rgba(124,58,237,0.22)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 32px rgba(124,58,237,0.18)',
          marginBottom: 24,
        }}>
          <BarChart3 size={40} style={{ color: '#A78BFA', opacity: 0.85 }} />
        </div>

        {/* Título HMI */}
        <div style={{
          fontSize:      '0.65rem',
          fontWeight:    700,
          fontFamily:    'var(--font-mono)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color:         'rgba(124,58,237,0.6)',
          marginBottom:  10,
        }}>
          MONITOREO FINANCIERO MES
        </div>

        <h2 style={{
          fontSize:     '1.15rem',
          fontWeight:   700,
          color:        '#EDE9F8',
          marginBottom: 12,
          letterSpacing: '-0.2px',
        }}>
          Análisis de Costos Operativos
        </h2>

        <p style={{
          maxWidth:   520,
          lineHeight: 1.75,
          color:      '#94A3B8',
          fontSize:   '0.88rem',
        }}>
          Seleccione una <strong style={{ color: '#C4B5FD' }}>Hoja de Proceso</strong> en el panel
          superior para desglosar costos operativos y márgenes de utilidad en tiempo real —
          Mano de Obra, Materiales, Herramental y Overhead.
        </p>

        {/* Indicadores de estado en línea */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Mano de Obra', 'Materiales', 'Herramental', 'Overhead'].map((item, i) => {
            const colors = ['#818CF8', '#10B981', '#F59E0B', '#A78BFA'];
            return (
              <span key={item} style={{
                padding:    '4px 12px',
                borderRadius: 9999,
                fontSize:   '0.7rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.3px',
                background: `${colors[i]}18`,
                color:      colors[i],
                border:     `1px solid ${colors[i]}30`,
                opacity:    0.7,
              }}>
                {item}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Página principal
═══════════════════════════════════════════════════════════ */
export default function CostosPage() {
  const [hps, setHps]                     = useState([]);
  const [hpSeleccionada, setHpSeleccionada] = useState('');
  const [costos, setCostos]               = useState([]);
  const [resumen, setResumen]             = useState({});
  const [total, setTotal]                 = useState(0);
  const [alerta, setAlerta]               = useState(null);
  const [mostrarForm, setMostrarForm]     = useState(false);
  const [form, setForm]                   = useState({ concepto: '', descripcion: '', monto: '', moneda: 'PEN' });
  const [cargando, setCargando]           = useState(false);

  useEffect(() => {
    hpsApi.listarTodas().then(r => setHps(r.data)).catch(() => {});
  }, []);

  const cargarCostos = useCallback(async () => {
    try {
      const [costosRes, resumenRes, totalRes] = await Promise.all([
        costosApi.listarPorHp(hpSeleccionada),
        costosApi.resumen(hpSeleccionada),
        costosApi.total(hpSeleccionada),
      ]);
      setCostos(costosRes.data);
      setResumen(resumenRes.data);
      setTotal(totalRes.data.costoTotal || 0);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar costos.' });
    }
  }, [hpSeleccionada]);

  useEffect(() => {
    if (hpSeleccionada) cargarCostos();
  }, [hpSeleccionada, cargarCostos]);

  const registrar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await costosApi.registrar({
        idHp:          hpSeleccionada,
        concepto:      form.concepto,
        descripcion:   form.descripcion,
        monto:         parseFloat(form.monto),
        moneda:        form.moneda,
        dniRegistradoPor: DNI_OPERARIO,
      });
      setAlerta({ tipo: 'success', mensaje: `✅ Costo registrado: S/. ${form.monto} (${form.concepto})` });
      setForm({ concepto: '', descripcion: '', monto: '', moneda: 'PEN' });
      setMostrarForm(false);
      cargarCostos();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al registrar costo.' });
    } finally {
      setCargando(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div>
      {/* ── Cabecera de Página ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(124,58,237,0.10))',
          border: '1px solid rgba(16,185,129,0.28)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(16,185,129,0.14)',
        }}>
          <DollarSign size={22} style={{ color: '#10B981' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ lineHeight: 1.15 }}>
            Costos de Producción
          </h1>
          <p style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginTop: 2,
          }}>
            ANÁLISIS FINANCIERO POR HOJA DE PROCESO
          </p>
        </div>
      </div>

      {alerta && (
        <div style={{ marginBottom: 20 }}>
          <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />
        </div>
      )}

      {/* ════════════════════════════════════
          Selector de HP — cristal violeta
      ════════════════════════════════════ */}
      <div style={{
        background:   'var(--bg-card)',
        border:       '1px solid rgba(124,58,237,0.15)',
        borderRadius: 14,
        padding:      '20px 24px',
        marginBottom: 24,
        boxShadow:    '0 4px 24px rgba(0,0,0,0.35)',
      }}>
        <label style={{
          display:       'block',
          fontSize:      '0.68rem',
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color:         'rgba(124,58,237,0.70)',
          fontFamily:    'var(--font-mono)',
          marginBottom:  10,
        }}>
          Seleccionar Hoja de Proceso
        </label>
        <select
          style={{
            width:        '100%',
            background:   '#1A1625',
            border:       '1px solid rgba(124,58,237,0.25)',
            borderRadius: 10,
            color:        '#C4B5FD',              /* lavanda claro */
            padding:      '12px 16px',
            fontSize:     '0.95rem',
            fontFamily:   'var(--font-ui)',
            appearance:   'none',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237C3AED' stroke-width='2' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat:   'no-repeat',
            backgroundPosition: 'right 16px center',
            cursor:       'pointer',
            outline:      'none',
            transition:   'border-color 0.2s ease, box-shadow 0.2s ease',
            minHeight:    48,
          }}
          value={hpSeleccionada}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
          onChange={e => setHpSeleccionada(e.target.value)}
        >
          <option value="" style={{ background: '#1A1625', color: '#94A3B8' }}>
            Elegir HP...
          </option>
          {hps.map(h => (
            <option key={h.idHp} value={h.idHp} style={{ background: '#1A1625', color: '#EDE9F8' }}>
              {h.idHp} — {h.pieza || h.descripcion}
            </option>
          ))}
        </select>
        {hpSeleccionada && (
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
            color: 'rgba(124,58,237,0.6)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#7C3AED',
              boxShadow: '0 0 6px rgba(124,58,237,0.6)',
              display: 'inline-block',
            }} />
            HP activa — {hpSeleccionada}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          Estado Vacío inteligente
      ════════════════════════════════════ */}
      {!hpSeleccionada && <EmptyState />}

      {/* ════════════════════════════════════
          Vista analítica (con HP seleccionada)
      ════════════════════════════════════ */}
      {hpSeleccionada && (
        <>
          {/* ── KPI Cards de Resumen por Concepto ── */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {CONCEPTOS.map(c => {
              const val   = resumen[c.value];
              const color = CONCEPTO_COLORS[c.value];
              const glow  = CONCEPTO_GLOWS[c.value];
              return (
                <div
                  key={c.value}
                  className="stat-card"
                  style={{
                    borderLeft: `4px solid ${val ? color : 'rgba(124,58,237,0.15)'}`,
                  }}
                >
                  <span className="stat-label">{c.label}</span>
                  <span style={{
                    fontFamily:         'var(--font-mono)',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize:           '1.25rem',
                    fontWeight:         700,
                    color:              val ? color : 'var(--text-muted)',
                    letterSpacing:      '-0.3px',
                  }}>
                    {val ? fmt(val) : '—'}
                  </span>
                  {val && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      color:     glow.replace('0.18)', '0.8)').replace('0.15)', '0.8)'),
                      marginTop: 2,
                    }}>
                      {((val / (total || 1)) * 100).toFixed(1)}% del total
                    </span>
                  )}
                </div>
              );
            })}

            {/* Tarjeta COSTO TOTAL */}
            <div className="stat-card" style={{
              borderLeft: '4px solid #10B981',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, var(--bg-card) 60%)',
            }}>
              <span className="stat-label">💰 COSTO TOTAL</span>
              <span style={{
                fontFamily:         'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize:           '1.5rem',
                fontWeight:         900,
                color:              '#10B981',
                letterSpacing:      '-0.5px',
              }}>
                {fmt(total)}
              </span>
              <span style={{
                fontSize: '0.68rem', fontFamily: 'var(--font-mono)',
                color: 'rgba(16,185,129,0.6)',
              }}>
                {costos.length} registros
              </span>
            </div>
          </div>

          {/* ── Btn Registrar Costo ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button
              id="btn-nuevo-costo"
              onClick={() => setMostrarForm(v => !v)}
              style={{
                display:    'inline-flex', alignItems: 'center', gap: 7,
                padding:    '9px 18px',
                fontSize:   '0.85rem', fontWeight: 700, fontFamily: 'var(--font-ui)',
                color:      '#FFFFFF',
                background: mostrarForm
                  ? 'linear-gradient(135deg, #5B21B6, #4C1D95)'
                  : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                border:     '1px solid rgba(124,58,237,0.5)',
                borderRadius: 10,
                cursor:     'pointer',
                boxShadow:  '0 0 16px rgba(124,58,237,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <PlusCircle size={15} />
              {mostrarForm ? 'Cerrar Formulario' : 'Registrar Costo'}
            </button>
          </div>

          {/* ── Formulario de Registro ── */}
          {mostrarForm && (
            <div style={{
              background:   'var(--bg-card)',
              border:       '1px solid rgba(124,58,237,0.18)',
              borderRadius: 14,
              overflow:     'hidden',
              marginBottom: 20,
            }}>
              <div style={{
                padding:      '18px 24px',
                borderBottom: '1px solid rgba(124,58,237,0.10)',
                display:      'flex', alignItems: 'center', gap: 8,
                fontWeight:   700, fontSize: '0.95rem',
              }}>
                <PlusCircle size={16} style={{ color: '#A78BFA' }} />
                <span style={{ color: '#C4B5FD' }}>Nuevo Registro de Costo</span>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <form onSubmit={registrar}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Concepto *</label>
                      <select
                        id="sel-concepto-costo"
                        className="form-control"
                        required
                        value={form.concepto}
                        onFocus={handleSelectFocus}
                        onBlur={handleSelectBlur}
                        onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}
                        style={{
                          background:  '#1A1625',
                          border:      '1px solid rgba(124,58,237,0.22)',
                          color:       '#EDE9F8',
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        {CONCEPTOS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Monto (S/.) *</label>
                      <input
                        id="inp-monto"
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control"
                        required
                        value={form.monto}
                        onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                        placeholder="0.00"
                        style={{
                          background:         '#1A1625',
                          border:             '1px solid rgba(124,58,237,0.22)',
                          color:              '#10B981',        /* verde para inputs de monto */
                          fontFamily:         'var(--font-mono)',
                          fontVariantNumeric: 'tabular-nums',
                          textAlign:          'right',
                          letterSpacing:      '0.5px',
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                      <label className="form-label">Descripción</label>
                      <input
                        className="form-control"
                        value={form.descripcion}
                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                        placeholder="Detalle del costo..."
                        style={{
                          background: '#1A1625',
                          border:     '1px solid rgba(124,58,237,0.22)',
                          color:      '#EDE9F8',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                      type="submit"
                      disabled={cargando}
                      style={{
                        display:     'inline-flex', alignItems: 'center', gap: 7,
                        padding:     '9px 20px',
                        fontSize:    '0.85rem', fontWeight: 700,
                        fontFamily:  'var(--font-ui)',
                        color:       '#FFFFFF',
                        background:  'linear-gradient(135deg, #10B981, #047857)',
                        border:      '1px solid rgba(16,185,129,0.4)',
                        borderRadius: 10,
                        cursor:      cargando ? 'not-allowed' : 'pointer',
                        opacity:     cargando ? 0.7 : 1,
                        boxShadow:   '0 2px 8px rgba(16,185,129,0.25)',
                        transition:  'all 0.2s ease',
                      }}
                    >
                      <Save size={14} />
                      {cargando ? 'Guardando...' : 'Guardar Costo'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setMostrarForm(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              Tabla de Detalle — Midnight Amethyst
          ══════════════════════════════════════════════════ */}
          <div style={{
            background:   'var(--bg-card)',
            border:       '1px solid rgba(124,58,237,0.12)',
            borderRadius: 14,
            overflow:     'hidden',
            boxShadow:    '0 8px 32px rgba(0,0,0,0.50)',
          }}>
            {/* Header */}
            <div style={{
              display:      'flex', alignItems: 'center', justifyContent: 'space-between',
              padding:      '18px 24px',
              borderBottom: '1px solid rgba(124,58,237,0.10)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <TrendingUp size={16} style={{ color: '#A78BFA' }} />
                Detalle de Costos —{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: '#818CF8', fontSize: '0.9rem' }}>
                  {hpSeleccionada}
                </span>
              </span>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                color: 'rgba(124,58,237,0.6)', letterSpacing: '0.5px',
              }}>
                {costos.length} REGISTROS
              </span>
            </div>

            {/* Tabla */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Concepto', 'Descripción', 'Monto (S/.)', 'Registrado Por', 'Fecha'].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding:       '11px 16px',
                        textAlign:     i === 2 ? 'right' : 'left',
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
                {costos.map((c, idx) => {
                  const color = CONCEPTO_COLORS[c.concepto] || '#94A3B8';
                  const glow  = CONCEPTO_GLOWS[c.concepto]  || 'rgba(148,163,184,0.12)';
                  return (
                    <tr
                      key={c.idCosto}
                      style={{
                        background: idx % 2 === 1
                          ? 'rgba(124,58,237,0.03)' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                        ? 'rgba(124,58,237,0.03)' : 'transparent'}
                    >
                      {/* Concepto — badge translúcido con color de acento */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          display:       'inline-flex', alignItems: 'center',
                          padding:       '3px 10px',
                          borderRadius:  9999,
                          fontSize:      '0.7rem', fontWeight: 700, letterSpacing: '0.3px',
                          background:    glow,
                          color:         color,
                          whiteSpace:    'nowrap',
                        }}>
                          {c.concepto}
                        </span>
                      </td>

                      {/* Descripción */}
                      <td style={{ padding: '13px 16px', color: '#94A3B8', fontSize: '0.85rem' }}>
                        {c.descripcion || '—'}
                      </td>

                      {/* Monto — tabular-nums, alineado a la derecha, verde si > 0 */}
                      <td style={{
                        padding: '13px 16px',
                        ...CELL_MONEY,
                        color:   c.monto > 0 ? '#10B981' : '#94A3B8',
                        fontSize: '0.92rem',
                      }}>
                        {fmt(c.monto)}
                      </td>

                      {/* Registrado Por */}
                      <td style={{
                        padding:    '13px 16px',
                        fontSize:   '0.8rem',
                        color:      '#94A3B8',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {c.nombreRegistradoPor || '—'}
                      </td>

                      {/* Fecha — tabular-nums, mono */}
                      <td style={{
                        padding:            '13px 16px',
                        fontSize:           '0.76rem',
                        color:              '#94A3B8',
                        fontFamily:         'var(--font-mono)',
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace:         'nowrap',
                      }}>
                        {new Date(c.fechaRegistro).toLocaleString('es-PE')}
                      </td>
                    </tr>
                  );
                })}

                {costos.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign:  'center',
                        color:      'var(--text-muted)',
                        padding:    '40px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize:   '0.85rem',
                      }}
                    >
                      Sin costos registrados para <strong style={{ color: '#818CF8' }}>{hpSeleccionada}</strong>.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Footer con totales visibles */}
              {costos.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '1px solid rgba(124,58,237,0.15)' }}>
                    <td colSpan={2} style={{
                      padding:    '13px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize:   '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color:      'rgba(124,58,237,0.6)',
                    }}>
                      TOTAL ACUMULADO
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      ...CELL_MONEY,
                      fontSize:   '1rem',
                      fontWeight: 900,
                      color:      '#10B981',
                    }}>
                      {fmt(total)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}
