// Clientes Axios centralizados para todos los módulos del backend

import axios from 'axios';

const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
  if (envUrl) {
    if (envUrl.includes('localhost') && typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return envUrl.replace('localhost', window.location.hostname);
    }
    return envUrl;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `http://${window.location.hostname}:8081/api`;
    }
  }
  return 'http://localhost:8081/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
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
  historialOperario: () => API.get('/tiempos/historial/mi-registro'),
  historialHp: (idHp) => API.get(`/tiempos/historial/hp/${idHp}`)
};

// ---- Hojas de Proceso ----
export const hpsApi = {
  listarTodas: (page = 0, size = 10) => API.get('/hps', { params: { page, size } }),
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
  listarEpps: (page = 0, size = 10) => API.get('/recursos/epps', { params: { page, size } }),
  listarHerramientas: (page = 0, size = 10, categoria) => API.get('/recursos/herramientas', { params: { page, size, categoria } }),
  stockBajo: (page = 0, size = 10) => API.get('/recursos/stock-bajo', { params: { page, size } })
};

// ---- Máquinas ----
export const maquinasApi = {
  listarTodas: () => API.get('/maquinas')
};

// ---- Costos ----
export const costosApi = {
  registrar: (data) => API.post('/costos', data),
  listarPorHp: (idHp) => API.get(`/costos/hp/${idHp}`),
  resumen: (idHp) => API.get(`/costos/hp/${idHp}/resumen`),
  total: (idHp) => API.get(`/costos/hp/${idHp}/total`)
};
