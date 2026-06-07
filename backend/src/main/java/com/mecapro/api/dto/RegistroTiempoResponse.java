package com.mecapro.api.dto;

import com.mecapro.api.entity.RegistroTiempo;
import com.mecapro.api.entity.RegistroTiempo.TipoActividad;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class RegistroTiempoResponse {

    private Long idRegistro;
    private String dniOperario;
    private String nombreOperario;
    private String idHp;
    private TipoActividad tipoActividad;
    private ZonedDateTime horaInicio;
    private ZonedDateTime horaFin;
    private Integer duracionMinutos;
    private boolean activo;

    public static RegistroTiempoResponse from(RegistroTiempo r) {
        RegistroTiempoResponse dto = new RegistroTiempoResponse();
        dto.setIdRegistro(r.getIdRegistro());
        dto.setDniOperario(r.getOperario().getDni());
        dto.setNombreOperario(r.getOperario().getNombreCompleto());
        dto.setIdHp(r.getHojaProceso() != null ? r.getHojaProceso().getIdHp() : null);
        dto.setTipoActividad(r.getTipoActividad());
        dto.setHoraInicio(r.getHoraInicio());
        dto.setHoraFin(r.getHoraFin());
        dto.setDuracionMinutos(r.getDuracionMinutos());
        dto.setActivo(r.getHoraFin() == null);
        return dto;
    }
}
