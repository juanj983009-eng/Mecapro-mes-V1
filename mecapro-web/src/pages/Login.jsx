import React, { useState, useEffect } from 'react';
import { authApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import { ShieldCheck, Lock, User, Cpu } from 'lucide-react';

/* Partícula decorativa — sutil punto orbitando */
function Particle({ style }) {
  return (
    <div style={{
      position: 'absolute',
      width: 3, height: 3,
      borderRadius: '50%',
      background: 'rgba(253, 128, 46, 0.25)',
      ...style,
    }} />
  );
}

export default function Login({ onLoginSuccess }) {
  const [dni, setDni]           = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [hora, setHora]         = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ dni, password });
      localStorage.setItem('mecapro_token', res.data.token);
      localStorage.setItem('mecapro_dni', res.data.dni);
      localStorage.setItem('mecapro_nombre', res.data.nombreCompleto);
      localStorage.setItem('mecapro_user', JSON.stringify({
        dni:            res.data.dni,
        nombreCompleto: res.data.nombreCompleto,
        puesto:         res.data.puesto,
        area:           res.data.area,
      }));
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error de red o servidor no disponible.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* Hover handlers del btn de ingreso */
  const handleBtnEnter = (e) => {
    if (loading) return;
    e.currentTarget.style.filter = 'brightness(1.08)';
  };
  const handleBtnLeave = (e) => {
    e.currentTarget.style.filter = 'none';
  };

  return (
    /* ── Pantalla completa bg-main ── */
    <div style={{
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      minHeight:       '100vh',
      background:      'var(--hmi-bg-main)',                 /* Charcoal base */
      padding:         16,
      position:        'relative',
      overflow:        'hidden',
    }}>
      {/* Gradiente radial de fondo — aura sutil Pumpkin central */}
      <div style={{
        position:     'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background:   'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(253, 128, 46, 0.03) 0%, transparent 65%)',
        pointerEvents:'none',
      }} />

      {/* Partículas decorativas */}
      <Particle style={{ top: '18%', left: '22%',  opacity: 0.5 }} />
      <Particle style={{ top: '72%', left: '15%',  opacity: 0.3 }} />
      <Particle style={{ top: '33%', right: '18%', opacity: 0.45 }} />
      <Particle style={{ top: '80%', right: '24%', opacity: 0.35 }} />

      {/* ── Timestamp de planta (esquina superior derecha) ── */}
      <div style={{
        position:  'absolute', top: 20, right: 24,
        fontFamily:'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        fontSize:  '0.72rem',
        color:     'var(--hmi-text-muted)',
        letterSpacing: '0.5px',
      }}>
        {hora.toLocaleTimeString('es-PE')}
      </div>

      {/* ════════════════════════════════════
          Tarjeta de autenticación — cristal
      ════════════════════════════════════ */}
      <div style={{
        maxWidth:     460,
        width:        '100%',
        background:   'var(--hmi-bg-surface)',
        border:       '1px solid var(--hmi-bg-surface-elevated)',
        borderRadius: 4,
        padding:      '40px 36px',
        boxShadow:    'none',
        position:     'relative',
        overflow:     'hidden',
      }}>
        {/* ── Logo y título ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* Ícono de escudo plano */}
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          72, height: 72,
            borderRadius:   4,
            background:     'var(--hmi-bg-surface-elevated)',
            border:         '1px solid var(--hmi-bg-surface-elevated)',
            boxShadow:      'none',
            marginBottom:   20,
          }}>
            <ShieldCheck size={36} style={{ color: 'var(--hmi-accent)' }} />
          </div>

          <h2 style={{
            fontSize:   '1.7rem',
            fontWeight: 900,
            margin:     0,
            color:      'var(--hmi-text-main)',
            letterSpacing:        '-0.5px',
          }}>
            Meca-PRO MES
          </h2>
          <p style={{
            color:     'var(--hmi-text-muted)',
            fontSize:  '0.78rem',
            marginTop: 6,
            fontFamily:'var(--font-mono)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}>
            Control de Producción · Planta CNC
          </p>

          {/* Separador con ícono */}
          <div style={{
            display:     'flex', alignItems: 'center', gap: 8,
            margin:      '20px 0 0',
            opacity:     0.4,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--hmi-bg-surface-elevated)' }} />
            <Cpu size={12} style={{ color: 'var(--hmi-text-muted)' }} />
            <div style={{ flex: 1, height: 1, background: 'var(--hmi-bg-surface-elevated)' }} />
          </div>
        </div>

        {/* ── Alerta de error ── */}
        {error && (
          <div style={{ marginBottom: 20 }}>
            <AlertaBanner tipo="error" mensaje={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Campo DNI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{
              display:       'flex', alignItems: 'center', gap: 6,
              fontSize:      '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.7px',
              color:         'var(--hmi-text-muted)',
              fontFamily:    'var(--font-mono)',
            }}>
              <User size={12} /> DNI del Operario
            </label>
            <input
              id="inp-login-dni"
              type="text"
              required
              placeholder="Ingrese su DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              disabled={loading}
              autoComplete="username"
              style={{
                background:   'var(--hmi-bg-surface)',
                border:       '1px solid var(--hmi-bg-surface-elevated)',
                borderRadius: 4,
                color:        'var(--hmi-text-main)',
                padding:      '13px 16px',
                fontSize:     '1rem',
                fontFamily:   'var(--font-mono)',
                letterSpacing:'0.5px',
                outline:      'none',
                transition:   'border-color 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--hmi-accent)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
            />
          </div>

          {/* Campo Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{
              display:       'flex', alignItems: 'center', gap: 6,
              fontSize:      '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.7px',
              color:         'var(--hmi-text-muted)',
              fontFamily:    'var(--font-mono)',
            }}>
              <Lock size={12} /> Contraseña
            </label>
            <input
              id="inp-login-password"
              type="password"
              required
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              style={{
                background:   'var(--hmi-bg-surface)',
                border:       '1px solid var(--hmi-bg-surface-elevated)',
                borderRadius: 4,
                color:        'var(--hmi-text-main)',
                padding:      '13px 16px',
                fontSize:     '1rem',
                fontFamily:   'var(--font-ui)',
                outline:      'none',
                transition:   'border-color 0.2s ease',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--hmi-accent)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--hmi-bg-surface-elevated)';
                e.currentTarget.style.boxShadow   = 'none';
              }}
            />
          </div>

          {/* ── Botón de ingreso — masivo táctil ── */}
          <button
            id="btn-login-submit"
            type="submit"
            disabled={loading}
            onMouseEnter={handleBtnEnter}
            onMouseLeave={handleBtnLeave}
            style={{
              width:        '100%',
              minHeight:    58,
              marginTop:    8,
              fontSize:     '1rem',
              fontWeight:   800,
              fontFamily:   'var(--font-ui)',
              letterSpacing:'0.5px',
              textTransform:'uppercase',
              color:        '#1A2E39', // Alto contraste
              background:   loading
                ? 'var(--hmi-accent-disabled)'
                : 'var(--hmi-accent)',
              border:       '1px solid var(--hmi-bg-surface-elevated)',
              borderRadius: 4,
              cursor:       loading ? 'not-allowed' : 'pointer',
              boxShadow:    'none',
              transition:   'all 0.22s cubic-bezier(0.4,0,0.2,1)',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:          10,
              opacity:      loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2, margin: 0 }} />
                Verificando...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>

        {/* Footer de la tarjeta */}
        <div style={{
          marginTop:  28,
          textAlign:  'center',
          fontSize:   '0.65rem',
          color:      'var(--hmi-text-muted)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.5px',
          opacity:    0.4,
        }}>
          MECA-PRO MES v1.0 · PRODUCCIÓN CNC · ACCESO RESTRINGIDO
        </div>
      </div>
    </div>
  );
}
