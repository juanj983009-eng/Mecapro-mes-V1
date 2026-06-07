package com.mecapro.api.dto;

import com.mecapro.api.entity.ParadaTecnica;
import com.mecapro.api.entity.ParadaTecnica.CausaParada;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class ParadaTecnicaDTO {

    // Request (inicio de parada)
    private String idHp;

    private String dniOperario;

    @NotBlank(message = "La máquina afectada es obligatoria")
    private String maquina;

    @NotNull(message = "La causa de la parada es obligatoria")
    private CausaParada causa;

    private String descripcion;

    // Response
    private Long idParada;
    private String nombreOperario;
    private ZonedDateTime horaInicio;
    private ZonedDateTime horaFin;
    private Integer duracionMinutos;
    private String justificacionRrhh;
    private Boolean reportadaRrhh;

    public static ParadaTecnicaDTO from(ParadaTecnica p) {
        ParadaTecnicaDTO dto = new ParadaTecnicaDTO();
        dto.setIdParada(p.getIdParada());
        dto.setIdHp(p.getHojaProceso() != null ? p.getHojaProceso().getIdHp() : null);
        dto.setDniOperario(p.getOperario().getDni());
        dto.setNombreOperario(p.getOperario().getNombreCompleto());
        dto.setMaquina(p.getMaquina());
        dto.setCausa(p.getCausa());
        dto.setDescripcion(p.getDescripcion());
        dto.setHoraInicio(p.getHoraInicio());
        dto.setHoraFin(p.getHoraFin());
        dto.setDuracionMinutos(p.getDuracionMinutos());
        dto.setJustificacionRrhh(p.getJustificacionRrhh());
        dto.setReportadaRrhh(p.getReportadaRrhh());
        return dto;
    }
}
