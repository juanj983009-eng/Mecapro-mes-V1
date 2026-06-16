import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen({ onComplete }) {
  const [porcentaje, setPorcentaje] = useState(0);
  const [sysStatus, setSysStatus] = useState("RUNNING");
  const [fadeOut, setFadeOut] = useState(false);

  // Animación del porcentaje de 0 a 100 en 500ms (10ms * 50 incrementos de 2)
  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      if (current >= 100) {
        setPorcentaje(100);
        clearInterval(timer);
      } else {
        setPorcentaje(current);
      }
    }, 10);
    return () => clearInterval(timer);
  }, []);

  // Ciclo de vida asíncrono y concurrencia
  useEffect(() => {
    let isMounted = true;
    let fadeTimeout = null;

    const loadOperation = async () => {
      // Promesa de duración mínima de 500ms
      const minDelay = new Promise(resolve => setTimeout(resolve, 500));
      
      // Promesa de validación de conexión con el backend
      const apiCheck = new Promise(async (resolve, reject) => {
        try {
          const url = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:8081/api';
          const healthUrl = url.replace('/api', '/actuator/health');
          const res = await fetch(healthUrl, { mode: 'cors' });
          if (res.ok) {
            resolve();
          } else {
            reject(new Error("Health check returned status " + res.status));
          }
        } catch (e) {
          reject(e);
        }
      });

      // Timeout absoluto de 800ms para cortocircuitar si el backend tarda en responder
      const absoluteTimeout = new Promise(resolve => setTimeout(() => {
        resolve("TIMEOUT_FORCED");
      }, 800));

      try {
        // Ejecución concurrente
        await Promise.race([
          Promise.all([apiCheck, minDelay]).then(() => "SUCCESS"),
          absoluteTimeout
        ]);

        if (isMounted) {
          setFadeOut(true);
          fadeTimeout = setTimeout(() => {
            if (onComplete) onComplete();
          }, 300); // 300ms de transición CSS
        }
      } catch (error) {
        // Excepción silenciosa, actualizando a DEGRADED sin colgar el UI-Thread
        console.warn("System Status: DEGRADED", error);
        if (isMounted) {
          setSysStatus("DEGRADED");
          setFadeOut(true);
          fadeTimeout = setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
        }
      }
    };

    loadOperation();

    return () => {
      isMounted = false;
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [onComplete]);

  // Selección de texto de diagnóstico dinámico
  const getDiagnostico = () => {
    if (porcentaje < 33) return "SYNCHRONIZING TRACEABILITY PIPELINE...";
    if (porcentaje < 66) return "VALIDATING BROKER CONNECTION...";
    return "FETCHING CORE PRODUCTION METRICS...";
  };

  const SEGMENTOS_COUNT = 20;

  return (
    <div className={`splash-screen-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-grid-overlay"></div>
      <div className="splash-content">
        
        {/* Cabecera HUD */}
        <div className="splash-header">
          <div className="splash-tag">HMI SYSTEM MONITOR</div>
          <h1 className="splash-title">
            MECA-PRO MES <span className="version-tag">v1.1</span>
          </h1>
          <div className="splash-line"></div>
        </div>

        {/* Barra de progreso segmentada industrial */}
        <div className="segmented-bar-container">
          <div className="segmented-bar">
            {Array.from({ length: SEGMENTOS_COUNT }).map((_, i) => {
              const active = porcentaje >= ((i + 1) / SEGMENTOS_COUNT) * 100;
              return (
                <div 
                  key={i} 
                  className={`segment ${active ? 'active' : ''}`}
                />
              );
            })}
          </div>
        </div>

        {/* Métricas de sistema monoespaciadas */}
        <div className="splash-metrics">
          <span className="metric-item">SYS_STATUS: {sysStatus}</span>
          <span className="metric-item font-mono">{porcentaje}% COMPLETE</span>
          <span className="metric-item font-mono">0x{porcentaje.toString(16).toUpperCase().padStart(2, '0')}</span>
        </div>

        {/* Diagnóstico inferior de terminal */}
        <div className="splash-footer">
          <div className="splash-status-text">{getDiagnostico()}</div>
          <div className="splash-sub-status">SECURE HMI CONNECTION // TLS_AES_256_GCM</div>
        </div>
      </div>
    </div>
  );
}
