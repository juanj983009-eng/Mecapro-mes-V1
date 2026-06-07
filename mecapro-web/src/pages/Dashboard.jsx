import React, { useState, useEffect } from 'react';
import { hpsApi, recursosApi, tiemposApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { Timer, ShieldCheck, Wrench, ClipboardList } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

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
    <div>
      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="stat-label">HPs Activas</span>
          <span className="stat-value text-blue">{hpsActivas.length}</span>
          <span className="stat-sub">En proceso + pendientes</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Operario Activo</span>
          <span className="stat-value text-green" style={{ fontSize: '1.1rem' }}>
            {operarioNombre || 'Invitado'}
          </span>
          <div className="flex items-center gap-4 mt-4" style={{ gap: 8, justifyContent: 'space-between' }}>
            <span className="stat-sub" style={{ fontFamily: 'var(--font-mono)' }}>DNI: {dniOperario || 'N/A'}</span>
            <div className="pulse-dot"></div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stock Bajo</span>
          <span className="stat-value" style={{ color: stockBajo.length > 0 ? 'var(--red)' : 'var(--green)' }}>
            {stockBajo.length}
          </span>
          <span className="stat-sub">{stockBajo.length > 0 ? 'Requiere atención' : 'Todo OK'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Refrigerio</span>
          <span className="stat-value" style={{ color: actividadActiva ? 'var(--yellow)' : 'var(--text-muted)' }}>
            {actividadActiva ? 'ACTIVO' : 'LIBRE'}
          </span>
          <span className="stat-sub">Estado actual</span>
        </div>
      </div>

      {alerta && (
        <AlertaBanner
          tipo={alerta.tipo}
          mensaje={alerta.mensaje}
          onClose={() => setAlerta(null)}
        />
      )}

      {stockBajo.length > 0 && (
        <AlertaBanner
          tipo="warning"
          mensaje={`⚠️ ${stockBajo.length} recurso(s) con stock bajo: ${stockBajo.map(r => r.nombreEspecifico).join(', ')}`}
        />
      )}

      {/* Botones de Acción Rápida — Layout Asimétrico Midnight Amethyst */}
      <div className="card" style={{ marginBottom: 24 }}>
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
              minHeight: 110,
              border: actividadActiva
                ? '2px solid rgba(239, 68, 68, 0.6)'
                : '2px solid rgba(37, 99, 235, 0.45)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontFamily: 'var(--font-ui)',
              fontSize: '1.15rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              color: '#FFFFFF',
              background: actividadActiva
                ? 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              boxShadow: actividadActiva
                ? '0 0 30px rgba(239, 68, 68, 0.50), 0 8px 32px rgba(239, 68, 68, 0.30)'
                : '0 0 15px rgba(37, 99, 235, 0.25), 0 8px 24px rgba(37, 99, 235, 0.20)',
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Timer size={actividadActiva ? 40 : 36} />
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
                  minHeight: actividadActiva ? 49 : 110,
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: actividadActiva ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: actividadActiva ? '0.85rem' : '1rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)',
                  background: '#1A1625',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10B981, #047857)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1A1625';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <ShieldCheck size={actividadActiva ? 18 : 32} />
                SOLICITAR EPP
              </button>
            </a>

            <a href="/herramientas" style={{ textDecoration: 'none', flex: 1 }}>
              <button
                id="btn-herramienta"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: actividadActiva ? 49 : 110,
                  border: '2px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: actividadActiva ? 'row' : 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-ui)',
                  fontSize: actividadActiva ? '0.85rem' : '1rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-secondary)',
                  background: '#1A1625',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7C3AED, #5B21B6)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1A1625';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Wrench size={actividadActiva ? 18 : 32} />
                SOLICITAR HERRAMIENTA
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* HPs Activas */}
      <div className="card">
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
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        ✅ {hp.cantidadBuenas}/{hp.cantidadTotal}
                        {hp.cantidadMalas > 0 && <span style={{ color: 'var(--red)' }}> ❌{hp.cantidadMalas}</span>}
                      </span>
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
