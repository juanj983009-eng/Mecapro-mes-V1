import React, { useState, useEffect } from 'react';
import { hpsApi, recursosApi, tiemposApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { Timer, ShieldCheck, Wrench, ClipboardList } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';
import { motion } from 'framer-motion';
import { HMI_FADE_IN } from '../constants/theme';

export default function Dashboard() {
  const {
    dniOperario,
    operarioNombre,
    actividadActiva,
    sincronizarPlanta,
    loadingGlobal
  } = useUiStore();

  const [hpsActivas, setHpsActivas] = useState([]);
  const [stockBajo, setStockBajo] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesandoRefrigerio, setProcesandoRefrigerio] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dniOperario]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        hpsApi.listarActivas().then(res => setHpsActivas(res.data)),
        recursosApi.stockBajo().then(res => setStockBajo(res.data)),
        sincronizarPlanta()
      ]);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar datos del servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const gestionarRefrigerio = async () => {
    setProcesandoRefrigerio(true);
    setAlerta(null);
    try {
      if (!actividadActiva) {
        await tiemposApi.iniciar({ tipoActividad: 'REFRIGERIO' });
        setAlerta({ tipo: 'info', mensaje: '🍽️ Refrigerio iniciado. ¡Buen provecho! (Límite: 30 min)' });
      } else {
        try {
          await tiemposApi.terminar(null);
        } catch (e) {
          const errMsg = e.response?.data?.mensaje || e.message;
          const justificacion = errMsg?.includes('justificación')
            ? prompt('⚠️ Exceso de tiempo detectado. Ingrese la justificación:') : null;
          if (justificacion !== null) {
            await tiemposApi.terminar(null, justificacion);
          } else {
            throw new Error(errMsg || 'Error al terminar refrigerio');
          }
        }
        setAlerta({ tipo: 'success', mensaje: '✅ Refrigerio finalizado. Volviendo a producción.' });
      }
      await sincronizarPlanta();
    } catch (e) {
      const errorMsg = e.response?.data?.mensaje || e.message || 'Error en la operación';
      setAlerta({ tipo: 'error', mensaje: errorMsg });
    } finally {
      setProcesandoRefrigerio(false);
    }
  };

  if (loading || loadingGlobal) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span>Cargando datos de planta...</span>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, gridColumn: 'span 12' }}>
        <motion.div
          className="stat-card"
          {...HMI_FADE_IN}
          style={{
            gridColumn: 'span 3',
            borderTop: '1px solid var(--hmi-bg-surface-elevated)',
          }}
        >
          <span className="stat-label">HPs Activas</span>
          <span className="stat-value" style={{ color: 'var(--hmi-text-main)', fontWeight: 'bold', fontSize: '2.25rem' }}>{hpsActivas.length}</span>
          <span className="stat-sub">En proceso + pendientes</span>
        </motion.div>
        <motion.div
          className="stat-card"
          {...HMI_FADE_IN}
          style={{
            gridColumn: 'span 3',
            borderTop: '2px solid var(--hmi-accent)',
          }}
        >
          <span className="stat-label">Operario Activo</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="stat-value" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-ui)', fontWeight: 'bold', color: 'var(--hmi-text-main)' }}>
              {operarioNombre || 'Invitado'}
            </span>
            <div className="pulse-dot"></div>
          </div>
          <span className="stat-sub" style={{ fontFamily: 'var(--font-ui)', marginTop: 8 }}>
            DNI: {dniOperario || 'N/A'}
          </span>
        </motion.div>
        <motion.div
          className="stat-card"
          {...HMI_FADE_IN}
          style={{
            gridColumn: 'span 3',
            borderTop: '2px solid var(--hmi-accent)',
          }}
        >
          <span className="stat-label">Stock Bajo</span>
          <span className="stat-value" style={{ color: 'var(--hmi-text-main)', fontWeight: 'bold', fontSize: '2.25rem' }}>
            {stockBajo.length}
          </span>
          <span className="stat-sub">{stockBajo.length > 0 ? 'Requiere atención' : 'Todo OK'}</span>
        </motion.div>
        <motion.div
          className="stat-card"
          {...HMI_FADE_IN}
          style={{
            gridColumn: 'span 3',
            borderTop: '1px solid var(--hmi-bg-surface-elevated)',
          }}
        >
          <span className="stat-label">Refrigerio</span>
          <span className="stat-value" style={{ color: 'var(--hmi-text-main)', fontWeight: 'bold', fontSize: '2.25rem' }}>
            {actividadActiva ? 'ACTIVO' : 'LIBRE'}
          </span>
          <span className="stat-sub">Estado actual</span>
        </motion.div>
      </div>

      {alerta && (
        <div style={{ gridColumn: 'span 12' }}>
          <AlertaBanner
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            onClose={() => setAlerta(null)}
          />
        </div>
      )}

      {stockBajo.length > 0 && (
        <div style={{ gridColumn: 'span 12' }}>
          <AlertaBanner
            tipo="warning"
            mensaje={`⚠️ ${stockBajo.length} recurso(s) con stock bajo: ${stockBajo.map(r => r.nombreEspecifico).join(', ')}`}
          />
        </div>
      )}

      {/* Botones de Acción Rápida — Layout Asimétrico Midnight Amethyst */}
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="card-header">
          <span className="card-title">⚡ Acciones Rápidas</span>
          {actividadActiva && (
            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-red)',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 99,
              padding: '3px 10px',
              letterSpacing: '0.5px'
            }}>
              ⬤ REFRIGERIO ACTIVO
            </span>
          )}
        </div>
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'stretch',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Btn Refrigerio — prioritario cuando activo */}
          <button
            id="btn-refrigerio"
            onClick={gestionarRefrigerio}
            disabled={procesandoRefrigerio}
            style={{
              flex: actividadActiva ? '0 0 65%' : '1',
              minHeight: 80,
              border: actividadActiva
                ? '1px solid #EF4444'
                : '1px solid var(--hmi-bg-surface-elevated)',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'var(--font-ui)',
              fontSize: '1rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              color: '#FFFFFF',
              background: actividadActiva ? '#EF4444' : 'var(--hmi-bg-surface-elevated)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--hmi-accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = actividadActiva ? '#EF4444' : 'var(--hmi-bg-surface-elevated)';
            }}
          >
            <Timer size={24} />
            {procesandoRefrigerio ? 'Procesando...' : actividadActiva ? 'TERMINAR REFRIGERIO' : 'INICIAR REFRIGERIO'}
          </button>

          {/* Btns secundarios — duermen en oscuro, brillan en hover */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a href="/epps" style={{ textDecoration: 'none', flex: 1 }}>
              <button
                id="btn-epp"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: actividadActiva ? 36 : 80,
                  border: '1px solid var(--hmi-bg-surface-elevated)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: actividadActiva ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: actividadActiva ? '0.85rem' : '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#FFFFFF',
                  background: 'var(--hmi-bg-surface-elevated)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--hmi-accent)';
                  e.currentTarget.style.color = '#1A2E39';
                  e.currentTarget.style.borderColor = 'var(--hmi-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
                }}
              >
                <ShieldCheck size={20} />
                SOLICITAR EPP
              </button>
            </a>

            <a href="/herramientas" style={{ textDecoration: 'none', flex: 1 }}>
              <button
                id="btn-herramienta"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: actividadActiva ? 36 : 80,
                  border: '1px solid var(--hmi-bg-surface-elevated)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: actividadActiva ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: actividadActiva ? '0.85rem' : '0.95rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#FFFFFF',
                  background: 'var(--hmi-bg-surface-elevated)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--hmi-accent)';
                  e.currentTarget.style.color = '#1A2E39';
                  e.currentTarget.style.borderColor = 'var(--hmi-accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
                }}
              >
                <Wrench size={20} />
                SOLICITAR HERRAMIENTA
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* HPs Activas */}
      <div className="card" style={{ gridColumn: 'span 12' }}>
        <div className="card-header">
          <span className="card-title"><ClipboardList size={18} /> HPs en Producción</span>
          <button onClick={cargarDatos} className="btn btn-outline">↻ Actualizar</button>
        </div>
        {hpsActivas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
            No hay HPs activas en este momento.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID HP</th>
                  <th>Pieza</th>
                  <th>Material</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {hpsActivas.map(hp => (
                  <tr key={hp.idHp}>
                    <td className="text-mono text-blue">{hp.idHp}</td>
                    <td className="font-bold">{hp.pieza || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{hp.material || '—'}</td>
                    <td>
                      {(() => {
                        const actual = hp.cantidadBuenas || 0;
                        const total = hp.cantidadTotal || 0;
                        const porcentaje = total > 0 ? Math.min((actual / total) * 100, 100) : 0;
                        return (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            justifyContent: 'center',
                            width: '100%',
                            maxWidth: 140,
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              color: 'var(--hmi-text-muted)',
                            }}>
                              <span>{actual}/{total}</span>
                              <span>{Math.round(porcentaje)}%</span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: 6,
                              borderRadius: 2,
                              background: 'var(--hmi-bg-surface-elevated)',
                              overflow: 'hidden',
                            }}>
                              <div style={{
                                width: `${porcentaje}%`,
                                height: '100%',
                                background: porcentaje === 100 ? '#10B981' : (porcentaje > 0 ? 'var(--hmi-accent)' : '#4A6080'),
                                transition: 'width 0.3s ease, background-color 0.3s ease',
                              }} />
                            </div>
                            {hp.cantidadMalas > 0 && (
                              <div style={{
                                fontFamily: 'var(--font-ui)',
                                fontSize: '0.72rem',
                                color: 'var(--red)',
                                marginTop: 1,
                                textAlign: 'left',
                              }}>
                                Rechazadas: {hp.cantidadMalas}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td><StatusBadge estado={hp.estado} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{hp.nombreResponsable || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
