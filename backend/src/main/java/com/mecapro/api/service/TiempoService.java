package com.mecapro.api.service;

import com.mecapro.api.dto.IniciarActividadRequest;
import com.mecapro.api.dto.RegistroTiempoResponse;

import java.util.List;

public interface TiempoService {

    RegistroTiempoResponse iniciarActividad(IniciarActividadRequest request, String dniOperario);

    RegistroTiempoResponse terminarActividad(String dniOperario, String justificacion);

    List<RegistroTiempoResponse> historialPorOperario(String dniOperario);

    List<RegistroTiempoResponse> historialPorHp(String idHp);
}