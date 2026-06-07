import React from 'react';

const ESTADO_CONFIG = {
  // HPs
  PENDIENTE:   { label: 'Pendiente',   cls: 'badge-gray' },
  EN_PROCESO:  { label: 'En Proceso',  cls: 'badge-blue' },
  TERMINADA:   { label: 'Terminada',   cls: 'badge-green' },
  CANCELADA:   { label: 'Cancelada',   cls: 'badge-red' },
  // Solicitudes
  PREPARANDO:  { label: 'Preparando',  cls: 'badge-yellow' },
  LISTO:       { label: 'Listo',       cls: 'badge-blue' },
  ENTREGADO:   { label: 'Entregado',   cls: 'badge-green' },
  CANCELADO:   { label: 'Cancelado',   cls: 'badge-red' },
  // Tipos de actividad
  PRODUCCION:      { label: 'Producción',      cls: 'badge-green' },
  REFRIGERIO:      { label: 'Refrigerio',      cls: 'badge-blue' },
  APOYO:           { label: 'Apoyo',           cls: 'badge-yellow' },
  PARADA_TECNICA:  { label: 'Parada Técnica',  cls: 'badge-red' },
};

export default function StatusBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, cls: 'badge-gray' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
