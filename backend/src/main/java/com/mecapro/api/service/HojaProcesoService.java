package com.mecapro.api.service;

import com.mecapro.api.dto.HojaProcesoDTO;
import com.mecapro.api.entity.HojaProceso.EstadoHp;

import java.util.List;

public interface HojaProcesoService {

    HojaProcesoDTO crear(HojaProcesoDTO dto);

    HojaProcesoDTO buscarPorId(String idHp);

    List<HojaProcesoDTO> listarTodas();

    List<HojaProcesoDTO> listarActivas();

    HojaProcesoDTO actualizarEstado(String idHp, EstadoHp nuevoEstado);

    HojaProcesoDTO registrarProduccion(String idHp, int cantidadBuenas, int cantidadMalas);
}
