package com.mecapro.api.dto;

import com.mecapro.api.entity.Solicitud;
import com.mecapro.api.entity.Solicitud.EstadoSolicitud;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class SolicitudDTO {

    // Request
    private String dniOperario;

    @NotNull(message = "El ID del recurso es obligatorio")
    private Integer idRecurso;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad = 1;

    private String observaciones;

    // Response
    private Long idSolicitud;
    private String nombreOperario;
    private String nombreRecurso;
    private String tipoRecurso;
    private EstadoSolicitud estadoSolicitud;
    private ZonedDateTime fechaSolicitud;
    private ZonedDateTime fechaEntrega;
    private String atendidoPor;

    public static SolicitudDTO from(Solicitud s) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setIdSolicitud(s.getIdSolicitud());
        dto.setDniOperario(s.getOperario().getDni());
        dto.setNombreOperario(s.getOperario().getNombreCompleto());
        dto.setIdRecurso(s.getRecurso().getIdRecurso());
        dto.setNombreRecurso(s.getRecurso().getNombreEspecifico());
        dto.setTipoRecurso(s.getRecurso().getTipoRecurso().name());
        dto.setCantidad(s.getCantidad());
        dto.setObservaciones(s.getObservaciones());
        dto.setEstadoSolicitud(s.getEstadoSolicitud());
        dto.setFechaSolicitud(s.getFechaSolicitud());
        dto.setFechaEntrega(s.getFechaEntrega());
        if (s.getAtendidoPor() != null) {
            dto.setAtendidoPor(s.getAtendidoPor().getNombreCompleto());
        }
        return dto;
    }
}
