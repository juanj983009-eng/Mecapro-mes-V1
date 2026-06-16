import React, { useState, useEffect } from 'react';
import { hpsApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { ClipboardList, Plus, Play, CheckCircle2 } from 'lucide-react';

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'TERMINADA', 'CANCELADA'];

/* ── Estilos inline reutilizables (Midnight Amethyst) ── */
const S = {
  /* Contenedor de tabla: Charcoal */
  tableWrap: {
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    boxShadow: 'none',
  },

  /* Cabecera de tabla */
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    color: 'var(--hmi-text-muted)',
    background: 'var(--hmi-bg-surface-elevated)',
    borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
    fontFamily: 'var(--font-mono)',
    whiteSpace: 'nowrap',
  },

  /* ID de la HP — fuente mono, acento Pumpkin */
  hpId: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--hmi-accent)',
    letterSpacing: '0.3px',
  },

  /* Descripción secundaria — gris platino elegante */
  hpDesc: {
    fontSize: '0.72rem',
    color: '#94A3B8',                   /* slate-400 platino */
    marginTop: 3,
    lineHeight: 1.4,
  },

  /* Pieza (nombre principal) */
  piezaPrincipal: {
    fontWeight: 600,
    fontSize: '0.88rem',
    color: 'var(--hmi-text-main)',
  },

  /* Material / texto secundario */
  materialSecundario: {
    fontSize: '0.76rem',
    color: '#94A3B8',
    marginTop: 2,
  },

  /* Progreso — tabular-nums estricto */
  progreso: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.88rem',
    fontVariantNumeric: 'tabular-nums',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },

  /* Btn Iniciar — Charcoal, borde sutil */
  btnIniciar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    letterSpacing: '0.3px',
    color: 'var(--hmi-text-muted)',
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap',
  },

  /* Btn Terminar — Acento Pumpkin plano */
  btnTerminar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    fontSize: '0.78rem',
    fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    letterSpacing: '0.3px',
    color: '#000000',
    background: 'var(--hmi-accent)',
    border: '1px solid var(--hmi-accent)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    boxShadow: 'none',
    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap',
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
  e.currentTarget.style.background    = 'var(--hmi-bg-surface-elevated)';
  e.currentTarget.style.color         = 'var(--hmi-text-main)';
  e.currentTarget.style.borderColor   = 'var(--hmi-accent)';
  e.currentTarget.style.boxShadow     = 'none';
};
const handleIniciarLeave = (e) => {
  e.currentTarget.style.background    = 'var(--hmi-bg-surface)';
  e.currentTarget.style.color         = 'var(--hmi-text-muted)';
  e.currentTarget.style.borderColor   = 'var(--hmi-bg-surface-elevated)';
  e.currentTarget.style.boxShadow     = 'none';
};
const handleTerminarEnter = (e) => {
  e.currentTarget.style.filter        = 'brightness(1.1)';
  e.currentTarget.style.boxShadow     = 'none';
};
const handleTerminarLeave = (e) => {
  e.currentTarget.style.filter        = 'none';
  e.currentTarget.style.boxShadow     = 'none';
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
      const res = await hpsApi.listarTodas(page, 10);
      const data = res.data.content || res.data || [];
      setHps(data);
      setTotalPages(res.data.totalPages || 1);
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
          {/* Ícono plano HMI */}
          <div style={{
            width: 48, height: 48,
            background: 'var(--hmi-bg-surface)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'none',
          }}>
            <ClipboardList size={22} style={{ color: 'var(--hmi-accent)' }} />
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
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{
              width: 'auto',
              minHeight: 40,
              fontSize: '0.82rem',
              background: 'var(--hmi-bg-surface)',
              border: '1px solid var(--hmi-bg-surface-elevated)',
              color: 'var(--hmi-text-main)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'none',
            }}
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
              color: '#000000',
              background: 'var(--hmi-accent)',
              border: '1px solid var(--hmi-accent)',
              borderRadius: 4,
              cursor: 'pointer',
              boxShadow: 'none',
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
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          background: 'var(--bg-card)',
        }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--hmi-bg-surface-elevated)' }}>
            <span className="card-title" style={{ color: 'var(--hmi-accent)' }}>
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
              <tr key={hp.idHp}>
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
                  {(() => {
                    const actual = Number(hp.cantidadBuenas) || 0;
                    const total = Number(hp.cantidadTotal) || 0;
                    const pct = total > 0 ? (actual / total) * 100 : 0;
                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto',
                        width: '100%',
                        maxWidth: 140,
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: 'var(--hmi-text-main)',
                        }}>
                          <span>{actual} / {total}</span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: 6,
                          borderRadius: 2,
                          background: 'var(--hmi-bg-surface-elevated)',
                          overflow: 'hidden',
                          boxShadow: 'none',
                        }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: pct === 100 ? '#10B981' : (pct > 0 ? 'var(--hmi-accent)' : '#4A6080'),
                            transition: 'width 0.3s ease, background-color 0.3s ease',
                          }} />
                        </div>
                        {hp.cantidadMalas > 0 && (
                          <div style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.72rem',
                            color: 'var(--red)',
                            marginTop: 1,
                            width: '100%',
                            textAlign: 'left',
                          }}>
                            Rechazadas: {hp.cantidadMalas}
                          </div>
                        )}
                      </div>
                    );
                  })()}
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

        {/* Controles de paginacion */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--hmi-bg-surface-elevated)'
        }}>
          <button
            className="btn btn-outline"
            disabled={pagina === 0}
            onClick={() => setPagina(p => Math.max(0, p - 1))}
            style={{
              minHeight: 64,
              padding: '0 24px',
              fontSize: '1rem',
              cursor: pagina === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: 'var(--hmi-bg-surface)',
              border: '1px solid var(--hmi-bg-surface-elevated)',
              color: pagina === 0 ? 'var(--hmi-accent-disabled)' : 'var(--hmi-text-main)',
              opacity: pagina === 0 ? 0.5 : 1,
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'none',
            }}
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
            style={{
              minHeight: 64,
              padding: '0 24px',
              fontSize: '1rem',
              cursor: pagina + 1 >= totalPages ? 'not-allowed' : 'pointer',
              backgroundColor: 'var(--hmi-bg-surface)',
              border: '1px solid var(--hmi-bg-surface-elevated)',
              color: pagina + 1 >= totalPages ? 'var(--hmi-accent-disabled)' : 'var(--hmi-text-main)',
              opacity: pagina + 1 >= totalPages ? 0.5 : 1,
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'none',
            }}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
