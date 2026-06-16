import React, { useState, useEffect, useCallback } from 'react';
import { costosApi, hpsApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import { DollarSign, PlusCircle, TrendingUp, BarChart3, CheckCircle2, Save, Users, Package, Wrench, Factory, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import { HMI_FADE_IN } from '../constants/theme';

/* ─────────────────────────────────────────────────────────────
   Configuración de conceptos
───────────────────────────────────────────────────────────── */
const CONCEPTOS = [
  { value: 'MANO_OBRA',   label: 'Mano de Obra', Icon: Users },
  { value: 'MATERIAL',    label: 'Material',     Icon: Package },
  { value: 'HERRAMENTAL', label: 'Herramental',   Icon: Wrench },
  { value: 'OVERHEAD',    label: 'Overhead',     Icon: Factory },
  { value: 'OTRO',        label: 'Otro',         Icon: Pin },
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

/* Focus/Blur handlers para selects — cromo y Pumpkin */
const handleSelectFocus = (e) => {
  e.currentTarget.style.borderColor = 'var(--hmi-accent)';
  e.currentTarget.style.boxShadow   = 'none';
};
const handleSelectBlur = (e) => {
  e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 28 }}>
        {PLACEHOLDERS.map(({ icon: Icon, label, value, sub }) => (
          <motion.div
            key={label}
            className="stat-card"
            {...HMI_FADE_IN}
            style={{
              gridColumn: 'span 4',
              opacity: 0.65,
              filter: 'saturate(0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 36, height: 36,
                background: 'var(--hmi-bg-surface-elevated)',
                border: '1px solid var(--hmi-bg-surface-elevated)',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} style={{ color: 'var(--hmi-text-muted)' }} />
              </div>
              <span className="stat-label" style={{ color: 'var(--hmi-text-muted)' }}>{label}</span>
            </div>
            <span
              className="stat-value"
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '1.6rem',
                color: 'var(--hmi-text-muted)',
                opacity: 0.5,
              }}
            >
              {value}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--hmi-text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.3px' }}>
              {sub}
            </span>
          </motion.div>
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
        border:         '1px solid var(--hmi-bg-surface-elevated)',
        borderRadius:   4,
        textAlign:      'center',
        position:       'relative',
        overflow:       'hidden',
      }}>
        {/* Ícono principal */}
        <div style={{
          width: 80, height: 80,
          background: 'var(--hmi-bg-surface-elevated)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'none',
          marginBottom: 24,
        }}>
          <BarChart3 size={40} style={{ color: 'var(--hmi-text-muted)', opacity: 0.85 }} />
        </div>

        {/* Título HMI */}
        <div style={{
          fontSize:      '0.65rem',
          fontWeight:    700,
          fontFamily:    'var(--font-mono)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color:         'var(--hmi-text-muted)',
          marginBottom:  10,
        }}>
          MONITOREO FINANCIERO MES
        </div>

        <h2 style={{
          fontSize:     '1.15rem',
          fontWeight:   700,
          color:        'var(--hmi-text-main)',
          marginBottom: 12,
          letterSpacing: '-0.2px',
        }}>
          Análisis de Costos Operativos
        </h2>

        <p style={{
          maxWidth:   520,
          lineHeight: 1.75,
          color:      'var(--hmi-text-muted)',
          fontSize:   '0.88rem',
        }}>
          Seleccione una <strong style={{ color: 'var(--hmi-accent)' }}>Hoja de Proceso</strong> en el panel
          superior para desglosar costos operativos y márgenes de utilidad en tiempo real —
          Mano de Obra, Materiales, Herramental y Overhead.
        </p>

        {/* Indicadores de estado en línea */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Mano de Obra', 'Materiales', 'Herramental', 'Overhead'].map((item) => (
            <span key={item} style={{
              padding:    '4px 12px',
              borderRadius: 4,
              fontSize:   '0.7rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.3px',
              background: 'var(--hmi-bg-surface-elevated)',
              color:      'var(--hmi-text-muted)',
              border:     '1px solid var(--hmi-bg-surface-elevated)',
            }}>
              {item}
            </span>
          ))}
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
      setAlerta({ tipo: 'success', mensaje: `Costo registrado: S/. ${form.monto} (${form.concepto})` });
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
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'none',
        }}>
          <DollarSign size={22} style={{ color: 'var(--hmi-accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ lineHeight: 1.15 }}>
            Costos de Producción
          </h1>
          <p style={{
            fontSize: '0.72rem', color: 'var(--hmi-text-muted)',
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

      {/* ── Selector de HP ── */}
      <div style={{
        background: 'var(--hmi-bg-surface)',
        border: '1px solid var(--hmi-bg-surface-elevated)',
        borderRadius: 4,
        padding: '16px',
        marginBottom: 24,
        boxShadow: 'none',
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.68rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--hmi-text-muted)',
          fontFamily: 'var(--font-ui)',
          marginBottom: 10,
        }}>
          Seleccionar Hoja de Proceso
        </label>
        <select
          style={{
            width: '100%',
            background: 'var(--hmi-bg-surface)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            color: 'var(--hmi-text-main)',
            padding: '12px 16px',
            fontSize: '0.95rem',
            fontFamily: 'var(--font-ui)',
            appearance: 'none',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23FD802E' stroke-width='2' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            minHeight: 48,
          }}
          value={hpSeleccionada}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
          onChange={e => setHpSeleccionada(e.target.value)}
        >
          <option value="" style={{ background: 'var(--hmi-bg-surface)', color: 'var(--hmi-text-muted)' }}>
            Elegir HP...
          </option>
          {hps.map(h => (
            <option key={h.idHp} value={h.idHp} style={{ background: 'var(--hmi-bg-surface)', color: 'var(--hmi-text-main)' }}>
              {h.idHp} — {h.pieza || h.descripcion}
            </option>
          ))}
        </select>
        {hpSeleccionada && (
          <div style={{
            marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
            color: 'var(--hmi-accent)',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--hmi-accent)',
              boxShadow: 'none',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, marginBottom: 24 }}>
            {CONCEPTOS.map(c => {
              const val   = resumen[c.value];
              const color = CONCEPTO_COLORS[c.value];
              const glow  = CONCEPTO_GLOWS[c.value];
              return (
                <motion.div
                  key={c.value}
                  className="stat-card"
                  {...HMI_FADE_IN}
                  style={{
                    gridColumn: 'span 3',
                  }}
                >
                  <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <c.Icon size={14} style={{ color: 'var(--hmi-text-muted)' }} />
                    {c.label.toUpperCase()}
                  </span>
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
                </motion.div>
              );
            })}

            {/* Tarjeta COSTO TOTAL */}
            <motion.div className="stat-card" {...HMI_FADE_IN} style={{
              gridColumn: 'span 12',
            }}>
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={14} style={{ color: 'var(--hmi-text-muted)' }} />
                COSTO TOTAL
              </span>
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
            </motion.div>
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
                color:      '#1A2E39',
                background: 'var(--hmi-accent)',
                border:     '1px solid var(--hmi-accent)',
                borderRadius: 4,
                cursor:     'pointer',
                boxShadow:  'none',
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
              border:       '1px solid var(--hmi-bg-surface-elevated)',
              borderRadius: 4,
              overflow:     'hidden',
              marginBottom: 20,
            }}>
              <div style={{
                padding:      '18px 24px',
                borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
                display:      'flex', alignItems: 'center', gap: 8,
                fontWeight:   700, fontSize: '0.95rem',
              }}>
                <PlusCircle size={16} style={{ color: 'var(--hmi-accent)' }} />
                <span style={{ color: 'var(--hmi-text-main)' }}>Nuevo Registro de Costo</span>
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
                          background:  'var(--hmi-bg-surface)',
                          border:      '1px solid var(--hmi-bg-surface-elevated)',
                          color:       'var(--hmi-text-main)',
                          borderRadius: 4,
                        }}
                      >
                        <option value="" style={{ background: 'var(--hmi-bg-surface)', color: 'var(--hmi-text-muted)' }}>Seleccionar...</option>
                        {CONCEPTOS.map(c => (
                          <option key={c.value} value={c.value} style={{ background: 'var(--hmi-bg-surface)', color: 'var(--hmi-text-main)' }}>{c.label}</option>
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
                          background:         'var(--hmi-bg-surface)',
                          border:             '1px solid var(--hmi-bg-surface-elevated)',
                          color:              'var(--hmi-text-main)',
                          fontFamily:         'var(--font-mono)',
                          fontVariantNumeric: 'tabular-nums',
                          textAlign:          'right',
                          letterSpacing:      '0.5px',
                          borderRadius:       4,
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
                          background: 'var(--hmi-bg-surface)',
                          border:     '1px solid var(--hmi-bg-surface-elevated)',
                          color:      'var(--hmi-text-main)',
                          borderRadius: 4,
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
                        color:       '#1A2E39',
                        background:  'var(--hmi-accent)',
                        border:      '1px solid var(--hmi-accent)',
                        borderRadius: 4,
                        cursor:      cargando ? 'not-allowed' : 'pointer',
                        opacity:     cargando ? 0.7 : 1,
                        boxShadow:   'none',
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
                      style={{ borderRadius: 4 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Tabla de Detalle ── */}
          <div style={{
            background:   'var(--bg-card)',
            border:       '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            overflow:     'hidden',
            boxShadow:    'none',
          }}>
            {/* Header */}
            <div style={{
              display:      'flex', alignItems: 'center', justifyContent: 'space-between',
              padding:      '18px 24px',
              borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <TrendingUp size={16} style={{ color: 'var(--hmi-accent)' }} />
                Detalle de Costos —{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-main)', fontSize: '0.9rem' }}>
                  {hpSeleccionada}
                </span>
              </span>
              <span style={{
                fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
                color: 'var(--hmi-accent)', letterSpacing: '0.5px',
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
                        color:         'var(--hmi-text-muted)',
                        background:    'var(--hmi-bg-surface-elevated)',
                        borderBottom:  '1px solid var(--hmi-bg-surface-elevated)',
                        fontFamily:    'var(--font-mono)',
                        whiteSpace:    'nowrap',
                      }}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costos.map((c, idx) => (
                  <tr
                    key={c.idCosto}
                    style={{
                      background: idx % 2 === 1
                        ? 'var(--hmi-bg-surface)' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                      ? 'var(--hmi-bg-surface)' : 'transparent'}
                  >
                    {/* Concepto — badge plano cromo neutro */}
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{
                        display:       'inline-flex', alignItems: 'center',
                        padding:       '3px 10px',
                        borderRadius:  4,
                        fontSize:      '0.7rem', fontWeight: 700, letterSpacing: '0.3px',
                        background:    'var(--hmi-bg-surface-elevated)',
                        border:        '1px solid var(--hmi-bg-surface-elevated)',
                        color:         'var(--hmi-text-muted)',
                        whiteSpace:    'nowrap',
                      }}>
                        {c.concepto}
                      </span>
                    </td>

                    {/* Descripción */}
                    <td style={{ padding: '13px 16px', color: 'var(--hmi-text-muted)', fontSize: '0.85rem' }}>
                      {c.descripcion || '—'}
                    </td>

                    {/* Monto */}
                    <td style={{
                      padding: '13px 16px',
                      ...CELL_MONEY,
                      color:   'var(--hmi-text-main)',
                      fontSize: '0.92rem',
                    }}>
                      {fmt(c.monto)}
                    </td>

                    {/* Registrado Por */}
                    <td style={{
                      padding:    '13px 16px',
                      fontSize:   '0.8rem',
                      color:      'var(--hmi-text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {c.nombreRegistradoPor || '—'}
                    </td>

                    {/* Fecha */}
                    <td style={{
                      padding:            '13px 16px',
                      fontSize:           '0.76rem',
                      color:              'var(--hmi-text-muted)',
                      fontFamily:         'var(--font-mono)',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace:         'nowrap',
                    }}>
                      {new Date(c.fechaRegistro).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}

                {costos.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign:  'center',
                        color:      'var(--hmi-text-muted)',
                        padding:    '40px 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize:   '0.85rem',
                      }}
                    >
                      Sin costos registrados para <strong style={{ color: 'var(--hmi-accent)' }}>{hpSeleccionada}</strong>.
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Footer con totales visibles */}
              {costos.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '1px solid var(--hmi-bg-surface-elevated)' }}>
                    <td colSpan={2} style={{
                      padding:    '13px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize:   '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color:      'var(--hmi-text-muted)',
                    }}>
                      TOTAL ACUMULADO
                    </td>
                    <td style={{
                      padding: '13px 16px',
                      ...CELL_MONEY,
                      fontSize:   '1rem',
                      fontWeight: 900,
                      color:      'var(--hmi-accent)',
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
