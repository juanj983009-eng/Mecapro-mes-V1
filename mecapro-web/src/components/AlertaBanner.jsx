import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

/**
 * Banner de notificación con auto-dismiss opcional.
 */
export default function AlertaBanner({ tipo = 'info', mensaje, onClose }) {
  if (!mensaje) return null;
  const Icon = ICONS[tipo] || Info;

  return (
    <div className={`alert alert-${tipo}`} style={{ marginBottom: 16 }}>
      <Icon size={20} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ flex: 1 }}>{mensaje}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.2rem', lineHeight: 1 }}
        >×</button>
      )}
    </div>
  );
}
