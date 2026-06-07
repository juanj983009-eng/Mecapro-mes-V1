import React, { useState, useEffect } from 'react';
import { paradasApi, hpsApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import { Zap, Play, Square, FileText, Wrench, Disc3, Settings2, X, Download, Clock } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

const CAUSAS = [
  { value: 'FALLA_MECANICA',     label: '🔧 Falla Mecánica' },
  { value: 'FALLA_ELECTRICA',    label: '⚡ Falla Eléctrica' },
  { value: 'FALTA_MATERIAL',     label: '📦 Falta de Material' },
  { value: 'CAMBIO_HERRAMIENTA', label: '🔩 Cambio de Herramienta' },
  { value: 'PROGRAMACION',       label: '💻 Programación CNC' },
  { value: 'OTRO',               label: '❓ Otro' },
];

/* Máquinas con iconos Lucide en lugar de emojis planos */
const MAQUINAS_PREDEFINIDAS = [
  { name: 'Mandrinadora 3', Icon: Wrench,   iconColor: '#A78BFA' },
  { name: 'Torno CNC 1',   Icon: Disc3,    iconColor: '#818CF8' },
  { name: 'Fresa CNC 2',   Icon: Settings2, iconColor: '#C4B5FD' },
];

/* ─────────────────────────────────────────────────────────────────
   Paleta de estilos reutilizable  — Midnight Amethyst
───────────────────────────────────────────────────────────────── */
const S = {
  /* Paso activo — violeta neón */
  stepActive: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    background: 'var(--accent-purple)',            /* #7C3AED */
    boxShadow: '0 0 12px rgba(124, 58, 237, 0.50)',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  },
  /* Paso pendiente — morado oscuro opaco */
  stepInactive: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    background: '#2E224D',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  },

  /* Tarjeta de máquina — estado base */
  maquinaCard: {
    cursor: 'pointer',
    textAlign: 'center',
    padding: '28px 20px',
    background: 'var(--bg-card)',                  /* #120E1E */
    border: '1px solid rgba(124, 58, 237, 0.15)',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
    overflow: 'hidden',
  },
  /* Tarjeta de máquina — seleccionada */
  maquinaCardSelected: {
    background: 'rgba(124,58,237,0.12)',
    border: '2px solid rgba(124, 58, 237, 0.70)',
    boxShadow: '0 0 24px rgba(124,58,237,0.30), inset 0 1px 0 rgba(124,58,237,0.15)',
  },

  /* Ícono de máquina envuelto */
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: 'rgba(124,58,237,0.10)',
    border: '1px solid rgba(124,58,237,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Input manual — fondo oscuro integrado */
  inputManual: {
    flex: 1,
    background: '#1A1625',
    border: '1px solid rgba(124,58,237,0.22)',
    borderRadius: 10,
    color: '#EDE9F8',
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },

  /* Btn Continuar — violeta oscuro, gradiente en hover */
  btnContinuar: {
    minHeight: 48,
    padding: '0 24px',
    fontSize: '0.88rem',
    fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    letterSpacing: '0.3px',
    color: '#C4B5FD',                              /* lavanda */
    background: '#311C5B',
    border: '1px solid rgba(124,58,237,0.35)',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap',
  },

  /* Botones de causa — Paso 2 */
  btnCausaBase: {
    minHeight: 110,
    border: '2px solid rgba(124,58,237,0.15)',
    borderRadius: 12,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'var(--font-ui)',
    fontSize: '0.9rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#C4B5FD',
    background: '#1A1625',
    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  },
  btnCausaSelected: {
    border: '2px solid rgba(124,58,237,0.75)',
    background: 'rgba(124,58,237,0.14)',
    boxShadow: '0 0 16px rgba(124,58,237,0.25)',
    color: '#EDE9F8',
  },

  /* Tarjeta resumen paso 3 */
  resumenCard: {
    background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.18)',
    borderRadius: 12,
    padding: '18px 20px',
    marginBottom: 20,
  },

  /* Panel inferior RRHH */
  rrhhPanel: {
    background: 'var(--bg-card)',                  /* #120E1E */
    border: '1px solid rgba(124,58,237,0.12)',
    borderRadius: 14,
    overflow: 'hidden',
  },

  /* Badges refinados */
  badgeIndigo: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 9999,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'rgba(99,102,241,0.15)',
    color: '#A5B4FC',
    border: 'none',
  },
  badgeEmerald: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 9999,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'rgba(16,185,129,0.13)',
    color: '#6EE7B7',
    border: 'none',
  },
  badgeAmber: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 9999,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'rgba(245,158,11,0.13)',
    color: '#FCD34D',
    border: 'none',
  },
};

/* ─── Hover handlers para Btn Continuar ─── */
const handleContinuarEnter = (e) => {
  e.currentTarget.style.background  = 'linear-gradient(135deg, #7C3AED, #5B21B6)';
  e.currentTarget.style.color       = '#FFFFFF';
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.6)';
  e.currentTarget.style.boxShadow   = '0 0 18px rgba(124,58,237,0.35)';
};
const handleContinuarLeave = (e) => {
  e.currentTarget.style.background  = '#311C5B';
  e.currentTarget.style.color       = '#C4B5FD';
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)';
  e.currentTarget.style.boxShadow   = 'none';
};

/* ─── Hover handlers para tarjetas de máquina ─── */
const handleMaquinaEnter = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.border     = '1px solid rgba(124,58,237,0.45)';
  e.currentTarget.style.boxShadow  = '0 0 20px rgba(124,58,237,0.18)';
  e.currentTarget.style.background = 'rgba(124,58,237,0.06)';
};
const handleMaquinaLeave = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.border     = '1px solid rgba(124, 58, 237, 0.15)';
  e.currentTarget.style.boxShadow  = 'none';
  e.currentTarget.style.background = 'var(--bg-card)';
};

/* ─── Hover handlers para botones de causa ─── */
const handleCausaEnter = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)';
  e.currentTarget.style.background  = 'rgba(124,58,237,0.08)';
};
const handleCausaLeave = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)';
  e.currentTarget.style.background  = '#1A1625';
};

/* ─── Focus handler para input manual ─── */
const handleInputFocus = (e) => {
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.65)';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(124,58,237,0.20)';
};
const handleInputBlur = (e) => {
  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.22)';
  e.currentTarget.style.boxShadow   = 'none';
};

/* ═════════════════════════════════════════════════════
   Modal — Descripción al finalizar parada
   (reemplaza al prompt() nativo)
═════════════════════════════════════════════════════ */
function ModalDescripcion({ onConfirm, onCancel }) {
  const [desc, setDesc] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      background: 'rgba(8,6,13,0.72)',
    }}>
      <div style={{
        background: '#120E1E',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 16,
        padding: '32px 28px',
        maxWidth: 440, width: '90%',
        boxShadow: '0 0 60px rgba(124,58,237,0.20), 0 24px 80px rgba(0,0,0,0.70)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.60), transparent)' }} />
        <h3 style={{ margin: '0 0 8px', color: '#EDE9F8', fontWeight: 700 }}>
          ¿Detalle adicional?
        </h3>
        <p style={{ margin: '0 0 16px', color: '#94A3B8', fontSize: '0.85rem' }}>
          (Opcional) Agrega un comentario antes de cerrar la parada técnica.
        </p>
        <textarea
          rows={3}
          placeholder="Ej: Se cambió la broca #12 por desgaste..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#1A1625',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 10, color: '#EDE9F8',
            padding: '10px 14px', fontSize: '0.9rem',
            fontFamily: 'var(--font-ui)', resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', background: 'transparent',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: 9,
            color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
          }}>Cancelar</button>
          <button onClick={() => onConfirm(desc)} style={{
            padding: '8px 24px',
            background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            border: '1px solid rgba(124,58,237,0.50)', borderRadius: 9,
            color: '#FFFFFF', cursor: 'pointer', fontWeight: 700,
            fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
            boxShadow: '0 0 16px rgba(124,58,237,0.30)',
          }}>Finalizar Parada</button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════
   Modal — Justificación RRHH (reemplaza al alert() nativo)
═════════════════════════════════════════════════════ */
function JustificacionModal({ texto, parada, onClose }) {
  /* Copiar al portapapeles */
  const copiar = () => {
    navigator.clipboard.writeText(texto).then(() => {
      onClose();
    }).catch(() => onClose());
  };

  /* Datos para el header de resumen */
  const causaLabel = {
    FALLA_MECANICA: 'Falla Mecánica', FALLA_ELECTRICA: 'Falla Eléctrica',
    FALTA_MATERIAL: 'Falta de Material', CAMBIO_HERRAMIENTA: 'Cambio de Herramienta',
    PROGRAMACION: 'Programación CNC', OTRO: 'Otro',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      background: 'rgba(8,6,13,0.75)',
      padding: 16,
    }}>
      <div style={{
        background: '#120E1E',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 18,
        padding: '28px 28px 24px',
        maxWidth: 560, width: '100%',
        boxShadow: '0 0 80px rgba(124,58,237,0.25), 0 32px 100px rgba(0,0,0,0.75)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Línea superior */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.70), transparent)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{
              fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
              color: 'rgba(124,58,237,0.65)', letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: 5,
            }}>DOCUMENTO GENERADO — JUSTIFICACIÓN RRHH</div>
            <h3 style={{ margin: 0, color: '#EDE9F8', fontWeight: 800, fontSize: '1.05rem' }}>
              Reporte de Parada Técnica
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(124,58,237,0.10)',
            border: '1px solid rgba(124,58,237,0.22)',
            borderRadius: 8, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#94A3B8',
            flexShrink: 0,
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Resumen rápido */}
        {parada && (
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.14)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px',
          }}>
            {[
              { label: 'Máquina',  value: parada.maquina },
              { label: 'Causa',    value: causaLabel[parada.causa] || parada.causa },
              { label: 'Inicio',   value: new Date(parada.horaInicio).toLocaleTimeString('es-PE') },
              { label: 'Parada',   value: `#${parada.idParada}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(124,58,237,0.55)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#C4B5FD', fontWeight: 600, fontSize: '0.83rem' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bloque de texto formateado */}
        <div style={{
          background: '#1A1625',
          border: '1px solid rgba(124,58,237,0.18)',
          borderRadius: 10, padding: '16px 18px',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
            color: 'rgba(124,58,237,0.55)', textTransform: 'uppercase',
            letterSpacing: '0.8px', marginBottom: 10,
          }}>
            <Clock size={10} /> CONTENIDO DE LA JUSTIFICACIÓN
          </div>
          <pre style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: '#C4B5FD',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>{texto}</pre>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={copiar}
            style={{
              flex: 1, minHeight: 52,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              border: '1px solid rgba(124,58,237,0.55)',
              borderRadius: 12, color: '#FFFFFF', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-ui)',
              boxShadow: '0 0 20px rgba(124,58,237,0.35)',
              letterSpacing: '0.3px',
            }}
          >
            <Download size={16} /> Copiar y Cerrar
          </button>
          <button onClick={onClose} style={{
            padding: '0 20px',
            background: 'transparent',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: 12, color: '#94A3B8', cursor: 'pointer',
            fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
          }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════ */
export default function ParadasPage() {
  const { dniOperario, paradaActiva, sincronizarPlanta, loadingGlobal } = useUiStore();
  const [hps, setHps]               = useState([]);
  const [alerta, setAlerta]         = useState(null);
  const [form, setForm]             = useState({ maquina: '', causa: '', idHp: '', descripcion: '' });
  const [cargando, setCargando]     = useState(false);
  const [pasoActual, setPasoActual] = useState(1);

  /* ── Estado del Modal de descripción al finalizar ── */
  const [showModalDesc, setShowModalDesc]                 = useState(false);
  /* ── Estado del Modal de justificación RRHH ── */
  const [modalJustificacion, setModalJustificacion]       = useState(null);  // { texto, parada }

  const cargarDatos = async () => {
    try {
      const [hpsRes] = await Promise.all([
        hpsApi.listarActivas(),
        sincronizarPlanta()
      ]);
      setHps(hpsRes.data);
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar datos de paradas técnicas.' });
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dniOperario]);

  const iniciarParada = async (e) => {
    e.preventDefault();
    if (!form.maquina || !form.causa) {
      setAlerta({ tipo: 'error', mensaje: 'Por favor complete la máquina y la causa de la parada.' });
      return;
    }
    setCargando(true);
    setAlerta(null);
    try {
      await paradasApi.iniciar({
        maquina:     form.maquina,
        causa:       form.causa,
        idHp:        form.idHp || undefined,
        descripcion: form.descripcion,
      });
      await sincronizarPlanta();
      setAlerta({ tipo: 'warning', mensaje: `🚨 Parada técnica iniciada en ${form.maquina}. El tiempo se está registrando.` });
      setForm({ maquina: '', causa: '', idHp: '', descripcion: '' });
      setPasoActual(1);
      cargarDatos();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al iniciar parada.' });
    } finally {
      setCargando(false);
    }
  };

  /* Paso 1: abre el modal de descripción (reemplaza al prompt nativo) */
  const finalizarParada = () => {
    if (!paradaActiva) return;
    setShowModalDesc(true);
  };

  /* Paso 2: ejecuta la llamada al backend con la descripción opcional */
  const confirmarFinalizar = async (desc) => {
    setShowModalDesc(false);
    setCargando(true);
    try {
      const res = await paradasApi.finalizar(paradaActiva.idParada, desc || undefined);
      await sincronizarPlanta();
      setAlerta({ tipo: 'success', mensaje: '✅ Parada finalizada. Justificación RRHH generada automáticamente.' });
      setForm({ maquina: '', causa: '', idHp: '', descripcion: '' });
      /* Mostrar modal con la justificación en lugar del alert() nativo */
      if (res.data.justificacionRrhh) {
        setModalJustificacion({
          texto:  res.data.justificacionRrhh,
          parada: { ...paradaActiva },
        });
      }
      cargarDatos();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al finalizar.' });
    } finally {
      setCargando(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div>
      {/* Modales — montados sobre todo el layout */}
      {showModalDesc && (
        <ModalDescripcion
          onConfirm={confirmarFinalizar}
          onCancel={() => setShowModalDesc(false)}
        />
      )}
      {modalJustificacion && (
        <JustificacionModal
          texto={modalJustificacion.texto}
          parada={modalJustificacion.parada}
          onClose={() => setModalJustificacion(null)}
        />
      )}
      {/* ── Cabecera de Página ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.10))',
          border: '1px solid rgba(245,158,11,0.30)',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(245,158,11,0.15)',
        }}>
          <Zap size={22} style={{ color: 'var(--accent-yellow)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ lineHeight: 1.15 }}>
            Control de Paradas Técnicas
          </h1>
          <p style={{
            fontSize: '0.72rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginTop: 2,
          }}>
            REGISTRO Y GESTIÓN DE TIEMPO MUERTO
          </p>
        </div>
      </div>

      {alerta && <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* ════════════════════════════════════
          BLOQUE: Parada activa en curso
      ════════════════════════════════════ */}
      {paradaActiva && (
        <div style={{
          marginBottom: 24,
          background: 'rgba(239,68,68,0.07)',
          border: '2px solid rgba(239,68,68,0.45)',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 0 32px rgba(239,68,68,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="pulse-dot" style={{
              background:  'var(--accent-red)',
              boxShadow:   '0 0 0 0 rgba(239,68,68,0.6)',
              width: 14, height: 14,
            }} />
            <div style={{ flex: 1 }}>
              <div className="font-bold text-xl" style={{ color: 'var(--accent-red)', letterSpacing: '-0.3px' }}>
                PARADA ACTIVA — {paradaActiva.maquina}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                Causa: {CAUSAS.find(c => c.value === paradaActiva.causa)?.label || paradaActiva.causa}
                {' · '}
                Inicio: {new Date(paradaActiva.horaInicio).toLocaleTimeString('es-PE')}
              </div>
            </div>
            <button
              id="btn-finalizar-parada"
              onClick={finalizarParada}
              disabled={cargando || loadingGlobal}
              className="btn-giant red"
              style={{ width: 200, minHeight: 76, fontSize: '0.95rem' }}
            >
              <Square size={22} />
              FINALIZAR PARADA
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          BLOQUE: Stepper — solo si no hay parada
      ════════════════════════════════════ */}
      {!paradaActiva && (
        <div style={{
          marginBottom: 24,
          background: 'var(--bg-card)',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}>
          {/* Header del stepper */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 0',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 700 }}>
              <Play size={16} style={{ color: 'var(--accent-purple)' }} />
              Registrar Nueva Parada
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'rgba(124,58,237,0.8)',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(124,58,237,0.10)',
              border: '1px solid rgba(124,58,237,0.20)',
              borderRadius: 99,
              padding: '3px 10px',
            }}>
              PASO {pasoActual} / 3
            </span>
          </div>

          {/* ── Stepper Progress Bar — Midnight Amethyst ── */}
          <div style={{ display: 'flex', gap: 6, padding: '16px 24px', marginBottom: 0 }}>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                style={pasoActual >= n ? S.stepActive : S.stepInactive}
              />
            ))}
          </div>

          <div style={{ padding: '8px 24px 24px' }}>
            <form onSubmit={iniciarParada}>

              {/* ─────────── PASO 1: Selección de Máquina ─────────── */}
              {pasoActual === 1 && (
                <div>
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: '#C4B5FD', fontWeight: 600 }}>
                    1. Seleccionar la Máquina Afectada
                  </h3>
                  <div className="grid-3" style={{ marginBottom: 20 }}>
                    {MAQUINAS_PREDEFINIDAS.map(({ name, Icon, iconColor }) => {
                      const isSelected = form.maquina === name;
                      return (
                        <div
                          key={name}
                          style={{
                            ...S.maquinaCard,
                            ...(isSelected ? S.maquinaCardSelected : {}),
                          }}
                          onMouseEnter={e => handleMaquinaEnter(e, isSelected)}
                          onMouseLeave={e => handleMaquinaLeave(e, isSelected)}
                          onClick={() => {
                            setForm(f => ({ ...f, maquina: name }));
                            setPasoActual(2);
                          }}
                        >
                          {/* Ícono Lucide estilizado */}
                          <div style={{
                            ...S.iconWrap,
                            ...(isSelected ? {
                              background: 'rgba(124,58,237,0.22)',
                              borderColor: 'rgba(124,58,237,0.55)',
                            } : {}),
                          }}>
                            <Icon size={26} style={{ color: isSelected ? '#EDE9F8' : iconColor }} />
                          </div>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: isSelected ? '#EDE9F8' : '#C4B5FD',
                            letterSpacing: '0.2px',
                          }}>
                            {name}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input manual */}
                  <div style={{
                    marginTop: 20,
                    borderTop: '1px solid rgba(124,58,237,0.12)',
                    paddingTop: 20,
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.6px',
                      marginBottom: 8,
                    }}>
                      O ingresar otra máquina manualmente
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        id="inp-maquina-manual"
                        style={S.inputManual}
                        value={form.maquina}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (form.maquina.trim()) setPasoActual(2);
                          }
                        }}
                        onChange={e => setForm(f => ({ ...f, maquina: e.target.value }))}
                        placeholder="Escribir nombre de la máquina (Ej: Mandrinadora 4)..."
                      />
                      <button
                        type="button"
                        style={S.btnContinuar}
                        disabled={!form.maquina.trim()}
                        onMouseEnter={handleContinuarEnter}
                        onMouseLeave={handleContinuarLeave}
                        onClick={() => setPasoActual(2)}
                      >
                        Continuar →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── PASO 2: Selección de Causa ─────────── */}
              {pasoActual === 2 && (
                <div>
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: '#C4B5FD', fontWeight: 600 }}>
                    2. Causa de Parada en{' '}
                    <span style={{ color: '#818CF8', fontFamily: 'var(--font-mono)' }}>
                      {form.maquina}
                    </span>
                  </h3>
                  <div className="grid-3" style={{ marginBottom: 24 }}>
                    {CAUSAS.map(c => {
                      const isSelected = form.causa === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          style={{
                            ...S.btnCausaBase,
                            ...(isSelected ? S.btnCausaSelected : {}),
                          }}
                          onMouseEnter={e => handleCausaEnter(e, isSelected)}
                          onMouseLeave={e => handleCausaLeave(e, isSelected)}
                          onClick={() => {
                            setForm(f => ({ ...f, causa: c.value }));
                            setPasoActual(3);
                          }}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setPasoActual(1)}
                    >
                      ← Atrás
                    </button>
                  </div>
                </div>
              )}

              {/* ─────────── PASO 3: Confirmación y Detalles ─────────── */}
              {pasoActual === 3 && (
                <div>
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: '#C4B5FD', fontWeight: 600 }}>
                    3. Detalles Finales y Confirmación
                  </h3>

                  {/* Resumen de la parada */}
                  <div style={S.resumenCard}>
                    <div style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      color: 'rgba(124,58,237,0.7)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 14,
                    }}>
                      Resumen de la Parada
                    </div>
                    <div className="grid-2">
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Máquina:</span>{' '}
                        <strong style={{ color: '#EDE9F8', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                          {form.maquina}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Causa:</span>{' '}
                        <strong style={{ color: '#EDE9F8', fontSize: '0.88rem' }}>
                          {CAUSAS.find(c => c.value === form.causa)?.label || form.causa}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="form-group">
                      <label className="form-label">HP Asociada (opcional)</label>
                      <select
                        className="form-control"
                        value={form.idHp}
                        onChange={e => setForm(f => ({ ...f, idHp: e.target.value }))}
                      >
                        <option value="">Sin HP asociada</option>
                        {hps.map(h => (
                          <option key={h.idHp} value={h.idHp}>
                            {h.idHp} — {h.pieza || h.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción Adicional (opcional)</label>
                      <input
                        className="form-control"
                        value={form.descripcion}
                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                        placeholder="Detalles sobre la falla o situación..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ minHeight: 60, padding: '0 24px' }}
                      onClick={() => setPasoActual(2)}
                    >
                      ← Atrás
                    </button>
                    <button
                      id="btn-iniciar-parada"
                      type="submit"
                      disabled={cargando || loadingGlobal}
                      className="btn-giant yellow"
                      style={{ flex: 1, minHeight: 60, fontSize: '1.05rem' }}
                    >
                      <Zap size={20} />
                      {cargando || loadingGlobal ? 'Registrando...' : 'REGISTRAR PARADA TÉCNICA'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          BLOQUE: Justificación RRHH — cristal violeta
      ════════════════════════════════════ */}
      <div style={S.rrhhPanel}>
        {/* Header del panel */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(124,58,237,0.12)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.95rem' }}>
            <FileText size={16} style={{ color: '#A78BFA' }} />
            Justificación Automática para RRHH
          </span>
        </div>

        {/* Contenido del panel */}
        <div style={{ padding: '18px 24px 20px' }}>
          <p style={{ color: '#94A3B8', lineHeight: 1.8, fontSize: '0.88rem' }}>
            Al finalizar una parada técnica, el sistema genera automáticamente un texto formal
            de justificación que incluye: operario, máquina, HP asociada, causa, duración y descripción.
            Este documento queda registrado en la base de datos y puede exportarse para el área de RRHH.
          </p>

          {/* Badges refinados — sin bordes, fondos translúcidos */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={S.badgeIndigo}>Tiempo muerto justificado</span>
            <span style={S.badgeEmerald}>Descargo automático</span>
            <span style={S.badgeAmber}>Reporte RRHH</span>
          </div>
        </div>
      </div>
    </div>
  );
}
