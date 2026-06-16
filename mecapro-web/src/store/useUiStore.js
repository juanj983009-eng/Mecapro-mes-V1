import { create } from 'zustand';
import { tiemposApi, paradasApi } from '../api';

export const useUiStore = create((set, get) => ({
  // --- Estados de Sesión ---
  dniOperario: localStorage.getItem('mecapro_dni') || '',
  operarioNombre: localStorage.getItem('mecapro_nombre') || '',
  token: localStorage.getItem('mecapro_token') || '',

  // --- Estados Operativos ---
  actividadActiva: null,
  paradaActiva: null,
  loadingGlobal: false,

  // --- Acciones de Sesión ---
  setSesion: (dni, nombre, token) => {
    localStorage.setItem('mecapro_dni', dni);
    localStorage.setItem('mecapro_nombre', nombre);
    localStorage.setItem('mecapro_token', token);
    set({ dniOperario: dni, operarioNombre: nombre, token });
  },

  cerrarSesion: () => {
    localStorage.removeItem('mecapro_dni');
    localStorage.removeItem('mecapro_nombre');
    localStorage.removeItem('mecapro_token');
    set({
      dniOperario: '',
      operarioNombre: '',
      token: '',
      actividadActiva: null,
      paradaActiva: null
    });
  },

  // --- Sincronización con el Servidor ---
  sincronizarPlanta: async () => {
    const { dniOperario, token } = get();
    if (!token || !dniOperario) return;

    set({ loadingGlobal: true });
    try {
      const [tiemposRes, paradasRes] = await Promise.all([
        tiemposApi.historialOperario(),
        paradasApi.historialOperario(dniOperario)
      ]);

      // Extraer y validar el estado del refrigerio activo (índice 0, ya ordenado DESC por el backend)
      const ultimaActividad = tiemposRes.data[0];
      const refrigerioActivo = (ultimaActividad && !ultimaActividad.horaFin && ultimaActividad.tipoActividad === 'REFRIGERIO') 
        ? ultimaActividad 
        : null;

      // Extraer y validar el estado de la parada técnica activa (índice 0, ya ordenado DESC por el backend)
      const ultimaParada = paradasRes.data[0];
      const paradaActiva = (ultimaParada && !ultimaParada.horaFin) 
        ? ultimaParada 
        : null;

      set({ actividadActiva: refrigerioActivo, paradaActiva });
    } catch (error) {
      console.error('Error al sincronizar datos de la planta:', error);
    } finally {
      set({ loadingGlobal: false });
    }
  }
}));
