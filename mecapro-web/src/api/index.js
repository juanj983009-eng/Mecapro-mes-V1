// Clientes Axios centralizados para todos los módulos del backend

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para inyectar automáticamente el token JWT en las peticiones
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mecapro_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ---- Autenticación ----
export const authApi = {
  login: (credentials) => API.post('/auth/login', credentials)
};


// ---- Tiempos ----
export const tiemposApi = {
  iniciar: (data) => API.post('/tiempos/iniciar', data),
  terminar: (dniOperario, justificacion) =>
    API.post('/tiempos/terminar', null, { params: { dniOperario, justificacion } }),
  historialOperario: (dni) => API.get(`/tiempos/historial/operario/${dni}`),
  historialHp: (idHp) => API.get(`/tiempos/historial/hp/${idHp}`)
};

// ---- Hojas de Proceso ----
export const hpsApi = {
  listarTodas: () => API.get('/hps'),
  listarActivas: () => API.get('/hps/activas'),
  buscar: (idHp) => API.get(`/hps/${idHp}`),
  crear: (data) => API.post('/hps', data),
  actualizarEstado: (idHp, nuevoEstado) =>
    API.patch(`/hps/${idHp}/estado`, null, { params: { nuevoEstado } }),
  registrarProduccion: (idHp, cantidadBuenas, cantidadMalas) =>
    API.patch(`/hps/${idHp}/produccion`, null, { params: { cantidadBuenas, cantidadMalas } })
};

// ---- Paradas Técnicas ----
export const paradasApi = {
  iniciar: (data) => API.post('/paradas/iniciar', data),
  finalizar: (idParada, descripcionAdicional) =>
    API.post(`/paradas/${idParada}/finalizar`, null, { params: { descripcionAdicional } }),
  listarPorHp: (idHp) => API.get(`/paradas/hp/${idHp}`),
  historialOperario: (dni) => API.get(`/paradas/operario/${dni}`),
  reporteRrhh: (desde, hasta) => API.get('/paradas/reporte-rrhh', { params: { desde, hasta } })
};

// ---- Solicitudes (EPPs + Herramientas) ----
export const solicitudesApi = {
  crear: (data) => API.post('/solicitudes', data),
  actualizarEstado: (idSolicitud, nuevoEstado, dniAtiende) =>
    API.patch(`/solicitudes/${idSolicitud}/estado`, null, { params: { nuevoEstado, dniAtiende } }),
  pendientesEpps: () => API.get('/solicitudes/pendientes/epps'),
  pendientesHerramientas: () => API.get('/solicitudes/pendientes/herramientas'),
  historialOperario: (dni) => API.get(`/solicitudes/operario/${dni}`)
};

// ---- Recursos (Catálogo) ----
export const recursosApi = {
  listarEpps: () => API.get('/recursos/epps'),
  listarHerramientas: () => API.get('/recursos/herramientas'),
  stockBajo: () => API.get('/recursos/stock-bajo')
};

// ---- Costos ----
export const costosApi = {
  registrar: (data) => API.post('/costos', data),
  listarPorHp: (idHp) => API.get(`/costos/hp/${idHp}`),
  resumen: (idHp) => API.get(`/costos/hp/${idHp}/resumen`),
  total: (idHp) => API.get(`/costos/hp/${idHp}/total`)
};
