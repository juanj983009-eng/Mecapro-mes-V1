package com.mecapro.api.service;

import com.mecapro.api.dto.CostoProduccionDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface CostoProduccionService {

    CostoProduccionDTO registrar(CostoProduccionDTO dto);

    List<CostoProduccionDTO> listarPorHp(String idHp);

    Map<String, BigDecimal> resumenPorConcepto(String idHp);

    BigDecimal costoTotal(String idHp);
}
