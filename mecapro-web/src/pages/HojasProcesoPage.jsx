import React, { useState, useEffect } from 'react';
import { hpsApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { ClipboardList, Plus, Play, CheckCircle2 } from 'lucide-react';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'TERMINADA', 'CANCELADA'];

/* ── Estilos inline reutilizables (Midnight Amethyst) ── */
const S = {
  /* Contenedor de tabla: cristal violeta */
  tableWrap: {
    background:   'var(--bg-card)',          /* #120E1E */
    border:       '1px solid rgba(124, 58, 237, 0.15)',
    borderRadius: '14px',
    overflow:     'hidden',
    boxShadow:    '0 8px 32px rgba(0,0,0,0.55)',
  },

  /* Cabecera de tabla */
  th: {
    padding:         '12px 16px',
    textAlign:       'left',
    fontSize:        '0.68rem',
    fontWeight:      700,
    textTransform:   'uppercase',
    letterSpacing:   '0.9px',
    color:           'rgba(124,58,237,0.75)',
    background:      'rgba(124,58,237,0.06)',
    borderBottom:    '1px solid rgba(124,58,237,0.12)',
    fontFamily:      'var(--font-mono)',
    whiteSpace:      'nowrap',
  },

  /* ID de la HP — fuente mono, violeta/azul brillante */
  hpId: {
    fontFamily:  'var(--font-mono)',
    fontSize:    '0.88rem',
    fontWeight:  700,
    color:       '#818CF8',                  /* indigo-400 — alta visibilidad */
    letterSpacing: '0.3px',
  },

  /* Descripción secundaria — gris platino elegante */
  hpDesc: {
    fontSize:   '0.72rem',
    color:      '#94A3B8',                   /* slate-400 platino */
    marginTop:  3,
    lineHeight: 1.4,
  },

  /* Pieza (nombre principal) */
  piezaPrincipal: {
    fontWeight: 600,
    fontSize:   '0.88rem',
    color:      '#EDE9F8',
  },

  /* Material / texto secundario */
  materialSecundario: {
    fontSize: '0.76rem',
    color:    '#94A3B8',
    marginTop: 2,
  },

  /* Progreso — tabular-nums estricto */
  progreso: {
    fontFamily:          'var(--font-mono)',
    fontSize:            '0.88rem',
    fontVariantNumeric:  'tabular-nums',
    display:             'flex',
    alignItems:          'center',
    gap:                 4,
  },

  /* Btn Iniciar — slate oscuro, brillo azul/violeta en hover */
  btnIniciar: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           6,
    padding:       '6px 14px',
    fontSize:      '0.78rem',
    fontWeight:    700,
    fontFamily:    'var(--font-ui)',
    letterSpacing: '0.3px',
    color:         '#C4B5FD',                /* violet-300 */
    background:    '#1A1625',
    border:        '1px solid rgba(124,58,237,0.25)',
    borderRadius:  8,
    cursor:        'pointer',
    transition:    'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace:    'nowrap',
  },

  /* Btn Terminar — gradiente esmeralda de alta definición */
  btnTerminar: {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           6,
    padding:       '6px 14px',
    fontSize:      '0.78rem',
    fontWeight:    700,
    fontFamily:    'var(--font-ui)',
    letterSpacing: '0.3px',
    color:         '#FFFFFF',
    background:    'linear-gradient(135deg, #10B981 0%, #047857 100%)',
    border:        '1px solid rgba(16,185,129,0.40)',
    borderRadius:  8,
    cursor:        'pointer',
    boxShadow:     '0 2px 8px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
    transition:    'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace:    'nowrap',
  },

  /* Celda vacía */
  emptyCell: {
    textAlign:  'center',
    color:      'var(--text-muted)',
    padding:    '40px 0',
    fontSize:   '0.875rem',
    fontFamily: 'var(--font-mono)',
  },

  /* Responsable */
  responsable: {
    fontSize:   '0.82rem',
    color:      '#94A3B8',
    fontFamily: 'var(--font-mono)',
  },
};

/* Hover handlers para btn-iniciar (no se puede hacer con CSS-in-JS puro) */
const handleIniciarEnter = (e) => {
  e.currentTarget.style.background    = 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)';
  e.currentTarget.style.color         = '#FFFFFF';
  e.currentTarget.style.borderColor   = 'rgba(124,58,237,0.6)';
  e.currentTarget.style.boxShadow     = '0 0 16px rgba(124,58,237,0.35)';
};
const handleIniciarLeave = (e) => {
  e.currentTarget.style.background    = '#1A1625';
  e.currentTarget.style.color         = '#C4B5FD';
  e.currentTarget.style.borderColor   = 'rgba(124,58,237,0.25)';
  e.currentTarget.style.boxShadow     = 'none';
};
const handleTerminarEnter = (e) => {
  e.currentTarget.style.boxShadow     = '0 4px 16px rgba(16,185,129,0.45)';
  e.currentTarget.style.filter        = 'brightness(1.08)';
};
const handleTerminarLeave = (e) => {
  e.currentTarget.style.boxShadow     = '0 2px 8px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.08)';
  e.currentTarget.style.filter        = 'none';
};

export default function HojasProcesoPage() {
  const [hps, setHps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [form, setForm] = useState({
    idHp: '', descripcion: '', pieza: '', material: '', cantidadTotal: 1, dniResponsable: ''
  });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await hpsApi.listarTodas();
      setHps(res.data);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar Hojas de Proceso.' });
    } finally {
      setLoading(false);
    }
  };

  const crear = async (e) => {
    e.preventDefault();
    try {
      await hpsApi.crear({ ...form, cantidadTotal: Number(form.cantidadTotal) });
      setAlerta({ tipo: 'success', mensaje: `✅ HP ${form.idHp} creada correctamente.` });
      setMostrarForm(false);
      setForm({ idHp: '', descripcion: '', pieza: '', material: '', cantidadTotal: 1, dniResponsable: '' });
      cargar();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al crear HP.' });
    }
  };

  const cambiarEstado = async (idHp, nuevoEstado) => {
    try {
      await hpsApi.actualizarEstado(idHp, nuevoEstado);
      setAlerta({ tipo: 'success', mensaje: `HP ${idHp} → ${nuevoEstado}` });
      cargar();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al cambiar estado.' });
    }
  };

  const hpsFiltradas = filtroEstado ? hps.filter(h => h.estado === filtroEstado) : hps;

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        Cargando Hojas de Proceso...
      </span>
    </div>
  );

  return (
    <div>
      {/* ── Cabecera de Página ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Ícono con resplandor violeta */}
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(37,99,235,0.12))',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,58,237,0.20)',
          }}>
            <ClipboardList size={22} style={{ color: '#A78BFA' }} />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ lineHeight: 1.15 }}>
              Hojas de Proceso
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginTop: 2 }}>
              CONTROL DE ÓRDENES DE PRODUCCIÓN
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Filtro de estado */}
          <select
            className="form-control"
            style={{ width: 'auto', minHeight: 40, fontSize: '0.82rem' }}
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          {/* Btn Nueva HP */}
          <button
            id="btn-nueva-hp"
            onClick={() => setMostrarForm(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 18px',
              fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-ui)',
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              border: '1px solid rgba(124,58,237,0.5)',
              borderRadius: 10,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(124,58,237,0.25)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={15} /> Nueva HP
          </button>
        </div>
      </div>

      {alerta && <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* ── Formulario nueva HP ── */}
      {mostrarForm && (
        <div className="card" style={{
          marginBottom: 24,
          border: '1px solid rgba(124,58,237,0.20)',
          borderRadius: 14,
          background: 'var(--bg-card)',
        }}>
          <div className="card-header" style={{ borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
            <span className="card-title" style={{ color: '#A78BFA' }}>
              <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Nueva Hoja de Proceso
            </span>
          </div>
          <form onSubmit={crear}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">ID HP *</label>
                <input id="inp-id-hp" className="form-control" required value={form.idHp}
                  onChange={e => setForm(f => ({ ...f, idHp: e.target.value }))}
                  placeholder="Ej: HP2026-010"
                  style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Pieza</label>
                <input className="form-control" value={form.pieza}
                  onChange={e => setForm(f => ({ ...f, pieza: e.target.value }))}
                  placeholder="Ej: Carcasa BH-200" />
              </div>
              <div className="form-group">
                <label className="form-label">Material</label>
                <input className="form-control" value={form.material}
                  onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
                  placeholder="Ej: Acero 1045" />
              </div>
              <div className="form-group">
                <label className="form-label">Cantidad Total *</label>
                <input className="form-control" type="number" min="1" required value={form.cantidadTotal}
                  onChange={e => setForm(f => ({ ...f, cantidadTotal: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Descripción</label>
                <input className="form-control" value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción del trabajo a realizar" />
              </div>
              <div className="form-group">
                <label className="form-label">DNI Responsable</label>
                <input className="form-control" value={form.dniResponsable}
                  onChange={e => setForm(f => ({ ...f, dniResponsable: e.target.value }))}
                  placeholder="DNI del operario"
                  style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button id="btn-guardar-hp" type="submit" style={{
                ...S.btnTerminar,
                padding: '9px 20px',
                fontSize: '0.85rem',
              }}>
                <CheckCircle2 size={15} /> Guardar HP
              </button>
              <button type="button" className="btn btn-outline"
                onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla principal — contenedor cristal violeta ── */}
      <div style={S.tableWrap}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>ID HP</th>
              <th style={S.th}>Pieza / Material</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Progreso</th>
              <th style={S.th}>Estado</th>
              <th style={S.th}>Responsable</th>
              <th style={{ ...S.th, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {hpsFiltradas.map((hp, idx) => (
              <tr
                key={hp.idHp}
                style={{
                  background: idx % 2 === 1
                    ? 'rgba(124, 58, 237, 0.03)'  /* banding violeta sutil */
                    : 'transparent',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1
                  ? 'rgba(124, 58, 237, 0.03)' : 'transparent'}
              >
                {/* ── Columna ID HP ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                  <span style={S.hpId}>{hp.idHp}</span>
                  {hp.descripcion && (
                    <div style={S.hpDesc}>{hp.descripcion}</div>
                  )}
                </td>

                {/* ── Columna Pieza / Material ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                  <div style={S.piezaPrincipal}>{hp.pieza || '—'}</div>
                  {hp.material && (
                    <div style={S.materialSecundario}>{hp.material}</div>
                  )}
                </td>

                {/* ── Columna Progreso (tabular-nums estricto) ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={S.progreso}>
                    <span style={{ color: 'var(--accent-green)' }}>✅</span>
                    <span style={{ color: '#EDE9F8', fontWeight: 600 }}>{hp.cantidadBuenas}</span>
                    <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>/</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{hp.cantidadTotal}</span>
                    {hp.cantidadMalas > 0 && (
                      <>
                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>·</span>
                        <span style={{ color: 'var(--accent-red)' }}>❌{hp.cantidadMalas}</span>
                      </>
                    )}
                  </div>
                </td>

                {/* ── Columna Estado ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                  <StatusBadge estado={hp.estado} />
                </td>

                {/* ── Columna Responsable ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                  <span style={S.responsable}>{hp.nombreResponsable || '—'}</span>
                </td>

                {/* ── Columna Acción ── */}
                <td style={{ padding: '13px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
                  {hp.estado === 'PENDIENTE' && (
                    <button
                      style={S.btnIniciar}
                      onMouseEnter={handleIniciarEnter}
                      onMouseLeave={handleIniciarLeave}
                      onClick={() => cambiarEstado(hp.idHp, 'EN_PROCESO')}
                    >
                      <Play size={12} /> Iniciar
                    </button>
                  )}
                  {hp.estado === 'EN_PROCESO' && (
                    <button
                      style={S.btnTerminar}
                      onMouseEnter={handleTerminarEnter}
                      onMouseLeave={handleTerminarLeave}
                      onClick={() => cambiarEstado(hp.idHp, 'TERMINADA')}
                    >
                      <CheckCircle2 size={12} /> Terminar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {hpsFiltradas.length === 0 && (
              <tr>
                <td colSpan={6} style={S.emptyCell}>
                  No hay HPs con este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
