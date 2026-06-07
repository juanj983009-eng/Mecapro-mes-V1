import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Zap, Package, DollarSign, Clock, LogOut, User
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',         label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/hps',      label: 'Hojas Proceso', icon: ClipboardList },
  { to: '/paradas',  label: 'Paradas',       icon: Zap },
  { to: '/recursos', label: 'Recursos',      icon: Package },
  { to: '/costos',   label: 'Costos',        icon: DollarSign },
];

export default function NavBar({ operario, onLogout }) {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* tabular-nums ya está forzado vía CSS .navbar-clock,
     pero lo reforzamos aquí también por si acaso */
  const formatHora = (d) =>
    d.toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  return (
    <nav className="navbar">
      {/* ── Brand ── */}
      <div className="navbar-brand">
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.30), rgba(37,99,235,0.20))',
          border: '1px solid rgba(124,58,237,0.35)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 10px rgba(124,58,237,0.25)',
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 900,
            background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>M</span>
        </div>
        <span className="navbar-logo">
          MECA-PRO <span>MES v1.0</span>
        </span>
      </div>

      {/* ── Nav Links ── */}
      <div className="navbar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>

      {/* ── Info derecha ── */}
      <div className="navbar-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Reloj — tabular-nums vía CSS + inline para doble seguridad */}
        <span className="navbar-clock" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
          {formatHora(hora)}
        </span>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'rgba(124,58,237,0.25)' }} />

        {/* Operario */}
        {operario && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: 99,
            padding: '4px 12px 4px 8px',
          }}>
            <div style={{
              width: 22, height: 22,
              background: 'rgba(124,58,237,0.22)',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={11} style={{ color: '#A78BFA' }} />
            </div>
            <span style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: '#C4B5FD', fontFamily: 'var(--font-mono)',
              letterSpacing: '0.2px',
            }}>
              {operario}
            </span>
          </div>
        )}

        {/* Btn Salir */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              display:     'inline-flex', alignItems: 'center', gap: 5,
              padding:     '5px 12px',
              fontSize:    '0.75rem', fontWeight: 700, fontFamily: 'var(--font-ui)',
              color:       '#94A3B8',
              background:  'transparent',
              border:      '1px solid rgba(124,58,237,0.15)',
              borderRadius: 8,
              cursor:      'pointer',
              transition:  'all 0.18s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background   = 'rgba(239,68,68,0.10)';
              e.currentTarget.style.borderColor  = 'rgba(239,68,68,0.35)';
              e.currentTarget.style.color        = '#FCA5A5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background   = 'transparent';
              e.currentTarget.style.borderColor  = 'rgba(124,58,237,0.15)';
              e.currentTarget.style.color        = '#94A3B8';
            }}
          >
            <LogOut size={12} /> Salir
          </button>
        )}
      </div>
    </nav>
  );
}
