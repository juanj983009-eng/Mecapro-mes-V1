package com.mecapro.api.service;

import com.mecapro.api.dto.ParadaTecnicaDTO;

import java.time.ZonedDateTime;
import java.util.List;

public interface ParadaTecnicaService {

    ParadaTecnicaDTO iniciarParada(ParadaTecnicaDTO dto);

    ParadaTecnicaDTO finalizarParada(Long idParada, String descripcionAdicional);

    List<ParadaTecnicaDTO> listarPorOperario(String dni);

    List<ParadaTecnicaDTO> listarPorHp(String idHp);

    List<ParadaTecnicaDTO> generarReporteRrhh(ZonedDateTime desde, ZonedDateTime hasta);

    int marcarComoReportadas(List<Long> ids);
}
