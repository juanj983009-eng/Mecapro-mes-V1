import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const Icon = ICONS[tipo] || Info;

  return (
    <AnimatePresence>
      {mensaje && (
        <motion.div
          className={`alert alert-${tipo}`}
          style={{ marginBottom: 16 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ ease: "easeOut", duration: 0.15 }}
        >
          <Icon size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <span style={{ flex: 1 }}>{mensaje}</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.2rem', lineHeight: 1 }}
            >×</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
