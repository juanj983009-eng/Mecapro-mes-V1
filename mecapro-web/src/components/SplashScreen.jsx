import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [porcentaje, setPorcentaje] = useState(0);
  const [subTexto, setSubTexto] = useState("INITIALIZING SYSTEM CORE...");

  useEffect(() => {
    // 1800ms total loading time (18ms * 100 increments)
    const intervalTime = 18;
    
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      if (current >= 100) {
        setPorcentaje(100);
        clearInterval(timer);
        
        // Slight delay of 200ms for clean transition
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 200);
      } else {
        setPorcentaje(current);
        
        // Dynamically change visual status texts
        if (current > 85) {
          setSubTexto("SYNCHRONIZING PRODUCTION METRICS...");
        } else if (current > 60) {
          setSubTexto("CONNECTING TO PLANT HMI SENSORS...");
        } else if (current > 35) {
          setSubTexto("LOADING ASSETS & SYNCING...");
        } else if (current > 15) {
          setSubTexto("INITIALIZING SYSTEM CORE...");
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Circular HUD calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (porcentaje / 100) * circumference;

  return (
    <div className="splash-screen-container">
      {/* Decorative layout elements */}
      <div className="splash-grid-overlay"></div>
      <div className="splash-glow-orb"></div>

      <div className="splash-content">
        {/* Top Header */}
        <div className="splash-header">
          <div className="splash-tag">HMI SYSTEM PROTOCOL</div>
          <h1 className="splash-title">
            MECA-PRO MES <span className="version-tag">v1.1</span>
          </h1>
          <div className="splash-line"></div>
        </div>

        {/* Central HUD Ring */}
        <div className="splash-hud-container">
          <svg className="splash-hud-svg" width="240" height="240" viewBox="0 0 240 240">
            {/* Outer spinning ring (Clockwise) */}
            <circle
              className="hud-ring-outer"
              cx="120"
              cy="120"
              r="110"
              fill="none"
              stroke="var(--accent-purple, #7C3AED)"
              strokeWidth="2"
              strokeDasharray="15 30 45 30"
              opacity="0.4"
            />
            {/* Inner spinning ring (Counter-clockwise) */}
            <circle
              className="hud-ring-inner"
              cx="120"
              cy="120"
              r="100"
              fill="none"
              stroke="var(--accent-purple, #7C3AED)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              opacity="0.6"
            />
            {/* Base track circle */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="rgba(124, 58, 237, 0.08)"
              strokeWidth="6"
            />
            {/* Progress fill circle */}
            <circle
              className="hud-progress-fill"
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--accent-purple, #7C3AED)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
            />
            {/* Progress glow circle */}
            <circle
              className="hud-progress-glow"
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="var(--accent-purple, #7C3AED)"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
              opacity="0.5"
            />
          </svg>

          {/* Central Percentage */}
          <div className="hud-center-text">
            <span className="hud-percentage" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {porcentaje}
            </span>
            <span className="hud-percent-symbol">%</span>
          </div>
        </div>

        {/* Lower Loader Bar */}
        <div className="splash-loader-bar-wrapper">
          <div className="splash-loader-bar-container">
            <div className="splash-loader-bar-fill" style={{ width: `${porcentaje}%` }}>
              <div className="splash-loader-bar-glow"></div>
            </div>
          </div>
          <div className="splash-loader-bar-metrics">
            <span>SYS_STATUS: RUNNING</span>
            <span className="text-mono">HEX_DEC: 0x{porcentaje.toString(16).toUpperCase().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="splash-footer">
          <div className="splash-status-text">{subTexto}</div>
          <div className="splash-sub-status">SECURE PIPELINE ESTABLISHED // TLS_AES_256_GCM</div>
        </div>
      </div>
    </div>
  );
}
