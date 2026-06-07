package com.mecapro.api.service;

import com.mecapro.api.dto.SolicitudDTO;
import com.mecapro.api.entity.Recurso;
import com.mecapro.api.entity.Solicitud.EstadoSolicitud;

import java.util.List;

public interface SolicitudService {

    SolicitudDTO crear(SolicitudDTO dto);

    SolicitudDTO actualizarEstado(Long idSolicitud, EstadoSolicitud nuevoEstado, String dniAtiende);

    List<SolicitudDTO> listarPendientesPorTipo(Recurso.TipoRecurso tipo);

    List<SolicitudDTO> historialPorOperario(String dniOperario);
}
