import React, { useState, useEffect } from 'react';
import { paradasApi, hpsApi, maquinasApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import { Zap, Play, Square, FileText, Wrench, Disc3, Settings2, X, Download, Clock, Box, Hammer, Monitor, HelpCircle } from 'lucide-react';
import { useUiStore } from '../store/useUiStore';

const CAUSAS = [
  { value: 'FALLA_MECANICA',     label: 'Falla Mecánica',       Icon: Wrench },
  { value: 'FALLA_ELECTRICA',    label: 'Falla Eléctrica',      Icon: Zap },
  { value: 'FALTA_MATERIAL',     label: 'Falta de Material',    Icon: Box },
  { value: 'CAMBIO_HERRAMIENTA', label: 'Cambio de Herramienta', Icon: Hammer },
  { value: 'PROGRAMACION',       label: 'Programación CNC',     Icon: Monitor },
  { value: 'OTRO',               label: 'Otro',                 Icon: HelpCircle },
];

/* Máquinas con iconos Lucide en lugar de emojis planos */
const MAQUINAS_PREDEFINIDAS = [
  { name: 'Mandrinadora 3', Icon: Wrench,   iconColor: 'var(--hmi-text-muted)' },
  { name: 'Torno CNC 1',   Icon: Disc3,    iconColor: 'var(--hmi-text-muted)' },
  { name: 'Fresa CNC 2',   Icon: Settings2, iconColor: 'var(--hmi-text-muted)' },
];

/* ─────────────────────────────────────────────────────────────────
   Paleta de estilos reutilizable  — HMI Charcoal & Pumpkin (Flat)
───────────────────────────────────────────────────────────────── */
const S = {
  /* Paso activo — Pumpkin sólido */
  stepActive: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    background: 'var(--hmi-accent)',
    boxShadow: 'none',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  },
  /* Paso pendiente — Charcoal elevado */
  stepInactive: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    background: 'var(--hmi-bg-surface-elevated)',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  },

  /* Tarjeta de máquina — estado base */
  maquinaCard: {
    cursor: 'pointer',
    textAlign: 'center',
    padding: '28px 20px',
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
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
    background: 'var(--hmi-bg-surface-elevated)',
    border: '1px solid var(--hmi-accent)',
    boxShadow: 'none',
  },

  /* Ícono de máquina envuelto */
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 4,
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Input manual — fondo Charcoal */
  inputManual: {
    flex: 1,
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
    color: 'var(--hmi-text-main)',
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },

  /* Dropdown selector de máquinas — HMI Flat */
  selectMaquina: {
    flex: 1,
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
    color: 'var(--hmi-text-main)',
    padding: '12px 16px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-ui)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    cursor: 'pointer',
  },

  /* Btn Continuar — Pumpkin plano */
  btnContinuar: {
    minHeight: 48,
    padding: '0 24px',
    fontSize: '0.88rem',
    fontWeight: 700,
    fontFamily: 'var(--font-ui)',
    letterSpacing: '0.3px',
    color: '#000000',
    background: 'var(--hmi-accent)',
    border: '1px solid var(--hmi-accent)',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace: 'nowrap',
  },

  /* Botones de causa — Paso 2 */
  btnCausaBase: {
    minHeight: 110,
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
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
    color: 'var(--hmi-text-muted)',
    background: 'var(--hmi-bg-surface)',
    transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
  },
  btnCausaSelected: {
    border: '1px solid var(--hmi-accent)',
    background: 'var(--hmi-bg-surface-elevated)',
    boxShadow: 'none',
    color: 'var(--hmi-accent)',
  },

  /* Tarjeta resumen paso 3 */
  resumenCard: {
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
    padding: '18px 20px',
    marginBottom: 20,
  },

  /* Panel inferior RRHH */
  rrhhPanel: {
    background: 'var(--hmi-bg-surface)',
    border: '1px solid var(--hmi-bg-surface-elevated)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  /* Badges refinados — sin bordes, fondos translúcidos */
  badgeIndigo: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'var(--hmi-bg-surface-elevated)',
    color: 'var(--hmi-text-muted)',
    border: 'none',
  },
  badgeEmerald: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'var(--hmi-bg-surface-elevated)',
    color: 'var(--hmi-text-muted)',
    border: 'none',
  },
  badgeAmber: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 11px',
    borderRadius: 4,
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.4px',
    background: 'var(--hmi-bg-surface-elevated)',
    color: 'var(--hmi-text-muted)',
    border: 'none',
  },
};

/* ─── Hover handlers para Btn Continuar ─── */
const handleContinuarEnter = (e) => {
  e.currentTarget.style.filter      = 'brightness(1.1)';
};
const handleContinuarLeave = (e) => {
  e.currentTarget.style.filter      = 'none';
};

/* ─── Hover handlers para tarjetas de máquina ─── */
const handleMaquinaEnter = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.border     = '1px solid var(--hmi-accent)';
  e.currentTarget.style.background = 'var(--hmi-bg-surface-elevated)';
};
const handleMaquinaLeave = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.border     = '1px solid var(--hmi-bg-surface-elevated)';
  e.currentTarget.style.background = 'var(--hmi-bg-surface)';
};

/* ─── Hover handlers para botones de causa ─── */
const handleCausaEnter = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.borderColor = 'var(--hmi-accent)';
  e.currentTarget.style.background  = 'var(--hmi-bg-surface-elevated)';
};
const handleCausaLeave = (e, isSelected) => {
  if (isSelected) return;
  e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
  e.currentTarget.style.background  = 'var(--hmi-bg-surface)';
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
        background: 'var(--hmi-bg-surface)',
        border: '1px solid var(--hmi-bg-surface-elevated)',
        borderRadius: 4,
        padding: '32px 28px',
        maxWidth: 440, width: '90%',
        boxShadow: 'none',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'var(--hmi-accent)' }} />
        <h3 style={{ margin: '0 0 8px', color: 'var(--hmi-text-main)', fontWeight: 700 }}>
          ¿Detalle adicional?
        </h3>
        <p style={{ margin: '0 0 16px', color: 'var(--hmi-text-muted)', fontSize: '0.85rem' }}>
          (Opcional) Agrega un comentario antes de cerrar la parada técnica.
        </p>
        <textarea
          rows={3}
          placeholder="Ej: Se cambió la broca #12 por desgaste..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--hmi-bg-surface)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4, color: 'var(--hmi-text-main)',
            padding: '10px 14px', fontSize: '0.9rem',
            fontFamily: 'var(--font-ui)', resize: 'vertical',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', background: 'transparent',
            border: '1px solid var(--hmi-bg-surface-elevated)', borderRadius: 4,
            color: 'var(--hmi-text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
          }}>Cancelar</button>
          <button onClick={() => onConfirm(desc)} style={{
            padding: '8px 24px',
            background: 'var(--hmi-accent)',
            border: '1px solid var(--hmi-accent)', borderRadius: 4,
            color: '#000000', cursor: 'pointer', fontWeight: 700,
            fontSize: '0.85rem', fontFamily: 'var(--font-ui)',
            boxShadow: 'none',
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
        background: 'var(--hmi-bg-surface)',
        border: '1px solid var(--hmi-bg-surface-elevated)',
        borderRadius: 4,
        padding: '28px 28px 24px',
        maxWidth: 560, width: '100%',
        boxShadow: 'none',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Línea superior */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'var(--hmi-accent)' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{
              fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
              color: 'var(--hmi-text-muted)', letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: 5,
            }}>DOCUMENTO GENERADO — JUSTIFICACIÓN RRHH</div>
            <h3 style={{ margin: 0, color: 'var(--hmi-text-main)', fontWeight: 800, fontSize: '1.05rem' }}>
              Reporte de Parada Técnica
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--hmi-bg-surface-elevated)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4, width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--hmi-text-muted)',
            flexShrink: 0,
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Resumen rápido */}
        {parada && (
          <div style={{
            background: 'var(--hmi-bg-surface-elevated)',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4, padding: '12px 16px', marginBottom: 16,
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px',
          }}>
            {[
              { label: 'Máquina',  value: parada.maquina },
              { label: 'Causa',    value: causaLabel[parada.causa] || parada.causa },
              { label: 'Inicio',   value: new Date(parada.horaInicio).toLocaleTimeString('es-PE') },
              { label: 'Parada',   value: `#${parada.idParada}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '0.62rem', color: 'var(--hmi-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--hmi-accent)', fontWeight: 600, fontSize: '0.83rem' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bloque de texto formateado */}
        <div style={{
          background: 'var(--hmi-bg-surface-elevated)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4, padding: '16px 18px',
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.62rem', fontFamily: 'var(--font-mono)',
            color: 'var(--hmi-text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.8px', marginBottom: 10,
          }}>
            <Clock size={10} /> CONTENIDO DE LA JUSTIFICACIÓN
          </div>
          <pre style={{
            margin: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--hmi-text-main)',
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
              background: 'var(--hmi-accent)',
              border: '1px solid var(--hmi-accent)',
              borderRadius: 4, color: '#000000', cursor: 'pointer',
              fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-ui)',
              boxShadow: 'none',
              letterSpacing: '0.3px',
            }}
          >
            <Download size={16} /> Copiar y Cerrar
          </button>
          <button onClick={onClose} style={{
            padding: '0 20px',
            background: 'transparent',
            border: '1px solid var(--hmi-bg-surface-elevated)',
            borderRadius: 4, color: 'var(--hmi-text-muted)', cursor: 'pointer',
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
  const [maquinasCatalogo, setMaquinasCatalogo] = useState([]);
  const [selectedMaquina, setSelectedMaquina] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isHpOpen, setIsHpOpen] = useState(false);

  useEffect(() => {
    if (form.maquina && form.maquina !== selectedMaquina) {
      setSelectedMaquina(form.maquina);
    }
  }, [form.maquina, selectedMaquina]);

  /* ── Estado del Modal de descripción al finalizar ── */
  const [showModalDesc, setShowModalDesc]                 = useState(false);
  /* ── Estado del Modal de justificación RRHH ── */
  const [modalJustificacion, setModalJustificacion]       = useState(null);  // { texto, parada }

  const cargarDatos = async () => {
    try {
      const [hpsRes, maquinasRes] = await Promise.all([
        hpsApi.listarActivas(),
        maquinasApi.listarTodas(),
        sincronizarPlanta()
      ]);
      setHps(hpsRes.data);
      const list = maquinasRes.data || [];
      const allMaquinas = list.map(m => m.nombreEspecifico);
      setMaquinasCatalogo(allMaquinas);
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

  const selectedHp = hps.find(h => String(h.idHp) === String(form.idHp));
  const selectedHpLabel = selectedHp ? `${selectedHp.idHp} — ${selectedHp.pieza || selectedHp.descripcion}` : 'Sin HP asociada';

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
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'none',
        }}>
          <Zap size={22} style={{ color: 'var(--hmi-accent)' }} />
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
          background: 'var(--hmi-bg-surface)',
          border: '1px solid var(--hmi-bg-surface-elevated)',
          borderRadius: 4,
          overflow: 'visible',
          boxShadow: 'none',
        }}>
          {/* Header del stepper */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 0',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 700 }}>
              <Play size={16} style={{ color: 'var(--hmi-accent)' }} />
              Registrar Nueva Parada
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--hmi-text-muted)',
              fontFamily: 'var(--font-mono)',
              background: 'var(--hmi-bg-surface-elevated)',
              border: '1px solid var(--hmi-bg-surface-elevated)',
              borderRadius: 4,
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
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: 'var(--hmi-text-main)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
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
                             setSelectedMaquina(name);
                             setPasoActual(2);
                           }}
                         >
                           {/* Ícono Lucide estilizado */}
                           <div style={S.iconWrap}>
                             <Icon size={26} style={{ color: isSelected ? 'var(--hmi-accent)' : 'var(--hmi-text-muted)' }} />
                           </div>
                           <span style={{
                             fontWeight: 700,
                             fontSize: '0.9rem',
                             color: isSelected ? 'var(--hmi-accent)' : 'var(--hmi-text-main)',
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
                    borderTop: '1px solid var(--hmi-bg-surface-elevated)',
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
                      O seleccionar otra máquina del catálogo
                    </label>
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                      <div style={{ position: 'relative', flex: 1, zIndex: 20 }}>
                        <div
                          id="sel-maquina-catalog"
                          onClick={() => setIsOpen(!isOpen)}
                          style={{
                            ...S.selectMaquina,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderColor: isOpen ? 'var(--hmi-accent)' : 'var(--hmi-bg-surface-elevated)',
                          }}
                        >
                          <span>{selectedMaquina || '-- Seleccione otra máquina --'}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="12" 
                            height="8" 
                            viewBox="0 0 12 8"
                            style={{
                              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <path d="M1 1l5 5 5-5" stroke="var(--hmi-accent)" strokeWidth="2" fill="none" />
                          </svg>
                        </div>
                        {isOpen && (
                          <div 
                            className="custom-dropdown-options"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              width: '100%',
                              zIndex: 50,
                              marginTop: 4,
                            }}
                          >
                            {maquinasCatalogo.map(name => (
                              <div
                                key={name}
                                className="custom-dropdown-option"
                                onClick={() => {
                                  setSelectedMaquina(name);
                                  setForm(f => ({ ...f, maquina: name }));
                                  setIsOpen(false);
                                }}
                              >
                                {name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: 'var(--hmi-text-main)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                    2. Causa de Parada en{' '}
                    <span style={{ color: 'var(--hmi-accent)', fontFamily: 'var(--font-mono)' }}>
                      {form.maquina}
                    </span>
                  </h3>
                  <div className="grid-3" style={{ marginBottom: 24 }}>
                    {CAUSAS.map(c => {
                      const isSelected = form.causa === c.value;
                      const Icon = c.Icon;
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
                          <Icon size={24} style={{ color: isSelected ? 'var(--hmi-accent)' : 'var(--hmi-text-muted)', transition: 'color 0.2s ease' }} />
                          <span>{c.label}</span>
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
                  <h3 style={{ marginBottom: 18, fontSize: '1rem', color: 'var(--hmi-text-main)', fontFamily: 'var(--font-ui)', fontWeight: 700 }}>
                    3. Detalles Finales y Confirmación
                  </h3>

                  {/* Resumen de la parada */}
                  <div style={S.resumenCard}>
                    <div style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.7px',
                      color: 'var(--hmi-accent)',
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 14,
                    }}>
                      Resumen de la Parada
                    </div>
                    <div className="grid-2">
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Máquina:</span>{' '}
                        <strong style={{ color: 'var(--hmi-text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                          {form.maquina}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Causa:</span>{' '}
                        <strong style={{ color: 'var(--hmi-text-main)', fontSize: '0.88rem' }}>
                          {CAUSAS.find(c => c.value === form.causa)?.label || form.causa}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="form-group" style={{ position: 'relative', zIndex: 20 }}>
                      <label className="form-label">HP Asociada (opcional)</label>
                      <div
                        id="sel-hp-asociada"
                        onClick={() => setIsHpOpen(!isHpOpen)}
                        style={{
                          ...S.selectMaquina,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderColor: isHpOpen ? 'var(--hmi-accent)' : 'var(--hmi-bg-surface-elevated)',
                        }}
                      >
                        <span>{selectedHpLabel}</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="12" 
                          height="8" 
                          viewBox="0 0 12 8"
                          style={{
                            transform: isHpOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          <path d="M1 1l5 5 5-5" stroke="var(--hmi-accent)" strokeWidth="2" fill="none" />
                        </svg>
                      </div>
                      {isHpOpen && (
                        <div 
                          className="custom-dropdown-options"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            zIndex: 50,
                            marginTop: 4,
                          }}
                        >
                          <div
                            className="custom-dropdown-option"
                            style={{ height: 44, display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                              setForm(f => ({ ...f, idHp: '' }));
                              setIsHpOpen(false);
                            }}
                          >
                            Sin HP asociada
                          </div>
                          {hps.map(h => (
                            <div
                              key={h.idHp}
                              className="custom-dropdown-option"
                              style={{ height: 44, display: 'flex', alignItems: 'center' }}
                              onClick={() => {
                                setForm(f => ({ ...f, idHp: h.idHp }));
                                setIsHpOpen(false);
                              }}
                            >
                              {h.idHp} — {h.pieza || h.descripcion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción Adicional (opcional)</label>
                      <input
                        className="form-control"
                        value={form.descripcion}
                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                        placeholder="Detalles sobre la falla o situation..."
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
                      style={{
                        flex: 1,
                        minHeight: 60,
                        fontSize: '1.05rem',
                        background: 'var(--hmi-accent)',
                        color: '#1A2E39',
                        border: 'none',
                        borderRadius: 4,
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.75px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        boxShadow: 'none',
                        filter: 'none',
                        transition: 'opacity 0.2s ease',
                      }}
                    >
                      <Zap size={20} stroke="#1A2E39" />
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
          borderBottom: '1px solid var(--hmi-bg-surface-elevated)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.95rem' }}>
            <FileText size={16} style={{ color: 'var(--hmi-accent)' }} />
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
