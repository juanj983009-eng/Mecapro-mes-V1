package com.mecapro.api.dto;

import com.mecapro.api.entity.CostoProduccion;
import com.mecapro.api.entity.CostoProduccion.ConceptoCosto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
public class CostoProduccionDTO {

    // Request
    @NotBlank(message = "El ID de HP es obligatorio")
    private String idHp;

    @NotNull(message = "El concepto de costo es obligatorio")
    private ConceptoCosto concepto;

    private String descripcion;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private BigDecimal monto;

    private String moneda = "PEN";
    private String dniRegistradoPor;

    // Response
    private Long idCosto;
    private String nombreRegistradoPor;
    private ZonedDateTime fechaRegistro;

    public static CostoProduccionDTO from(CostoProduccion c) {
        CostoProduccionDTO dto = new CostoProduccionDTO();
        dto.setIdCosto(c.getIdCosto());
        dto.setIdHp(c.getHojaProceso().getIdHp());
        dto.setConcepto(c.getConcepto());
        dto.setDescripcion(c.getDescripcion());
        dto.setMonto(c.getMonto());
        dto.setMoneda(c.getMoneda());
        if (c.getRegistradoPor() != null) {
            dto.setDniRegistradoPor(c.getRegistradoPor().getDni());
            dto.setNombreRegistradoPor(c.getRegistradoPor().getNombreCompleto());
        }
        dto.setFechaRegistro(c.getFechaRegistro());
        return dto;
    }
}
