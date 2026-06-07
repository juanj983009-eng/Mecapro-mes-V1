package com.mecapro.api.dto;

import com.mecapro.api.entity.RegistroTiempo.TipoActividad;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IniciarActividadRequest {

    private String idHp;

    @NotNull(message = "El tipo de actividad es obligatorio")
    private TipoActividad tipoActividad;
}
