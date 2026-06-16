package com.mecapro.api.dto;

import com.mecapro.api.entity.Maquina;
import lombok.Data;

@Data
public class MaquinaDTO {
    private Integer idMaquina;
    private String nombreEspecifico;
    private String tipo;
    private Boolean activo;

    public static MaquinaDTO from(Maquina m) {
        if (m == null) return null;
        MaquinaDTO dto = new MaquinaDTO();
        dto.setIdMaquina(m.getIdMaquina());
        dto.setNombreEspecifico(m.getNombreEspecifico());
        dto.setTipo(m.getTipo());
        dto.setActivo(m.getActivo());
        return dto;
    }
}
