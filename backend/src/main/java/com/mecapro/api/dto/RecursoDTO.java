package com.mecapro.api.dto;

import com.mecapro.api.entity.Recurso;
import com.mecapro.api.entity.Recurso.TipoRecurso;
import lombok.Data;

@Data
public class RecursoDTO {
    
    private Integer idRecurso;
    private String nombreEspecifico;
    private String categoria;
    private String codigoInterno;
    private Integer stockActual;
    private Integer stockMinimo;
    private TipoRecurso tipoRecurso;
    private String unidadMedida;
    private Boolean activo;

    public static RecursoDTO from(Recurso r) {
        if (r == null) {
            return null;
        }
        RecursoDTO dto = new RecursoDTO();
        dto.setIdRecurso(r.getIdRecurso());
        dto.setNombreEspecifico(r.getNombreEspecifico());
        dto.setCategoria(r.getCategoria());
        // El entity original no posee codigoInterno en DB; se mapea un código autoderivado para el DTO
        dto.setCodigoInterno(r.getTipoRecurso() != null ? r.getTipoRecurso().name() + "-" + r.getIdRecurso() : null);
        dto.setStockActual(r.getStockActual());
        dto.setStockMinimo(r.getStockMinimo());
        dto.setTipoRecurso(r.getTipoRecurso());
        dto.setUnidadMedida(r.getUnidadMedida());
        dto.setActivo(r.getActivo());
        return dto;
    }
}
