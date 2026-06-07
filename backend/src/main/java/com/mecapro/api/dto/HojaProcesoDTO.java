package com.mecapro.api.dto;

import com.mecapro.api.entity.HojaProceso;
import com.mecapro.api.entity.HojaProceso.EstadoHp;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class HojaProcesoDTO {

    // Request (creación / actualización)
    @NotBlank(message = "El ID de HP es obligatorio")
    private String idHp;

    private String descripcion;
    private String pieza;
    private String material;

    @Positive(message = "La cantidad total debe ser mayor a cero")
    private Integer cantidadTotal;

    private String dniResponsable;

    // Response (adicional)
    private Integer cantidadBuenas;
    private Integer cantidadMalas;
    private EstadoHp estado;
    private String nombreResponsable;
    private ZonedDateTime fechaInicio;
    private ZonedDateTime fechaFin;
    private ZonedDateTime creadoEn;

    public static HojaProcesoDTO from(HojaProceso hp) {
        HojaProcesoDTO dto = new HojaProcesoDTO();
        dto.setIdHp(hp.getIdHp());
        dto.setDescripcion(hp.getDescripcion());
        dto.setPieza(hp.getPieza());
        dto.setMaterial(hp.getMaterial());
        dto.setCantidadTotal(hp.getCantidadTotal());
        dto.setCantidadBuenas(hp.getCantidadBuenas());
        dto.setCantidadMalas(hp.getCantidadMalas());
        dto.setEstado(hp.getEstado());
        if (hp.getResponsable() != null) {
            dto.setDniResponsable(hp.getResponsable().getDni());
            dto.setNombreResponsable(hp.getResponsable().getNombreCompleto());
        }
        dto.setFechaInicio(hp.getFechaInicio());
        dto.setFechaFin(hp.getFechaFin());
        dto.setCreadoEn(hp.getCreadoEn());
        return dto;
    }
}
