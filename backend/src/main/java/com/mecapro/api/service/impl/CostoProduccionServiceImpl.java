package com.mecapro.api.service.impl;

import com.mecapro.api.dto.CostoProduccionDTO;
import com.mecapro.api.entity.CostoProduccion;
import com.mecapro.api.entity.HojaProceso;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.ResourceNotFoundException;
import com.mecapro.api.repository.CostoProduccionRepository;
import com.mecapro.api.repository.HojaProcesoRepository;
import com.mecapro.api.repository.UsuarioRepository;
import com.mecapro.api.service.CostoProduccionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class CostoProduccionServiceImpl implements CostoProduccionService {

    private final CostoProduccionRepository costoRepository;
    private final HojaProcesoRepository hpRepository;
    private final UsuarioRepository usuarioRepository;

    public CostoProduccionServiceImpl(CostoProduccionRepository costoRepository,
                                      HojaProcesoRepository hpRepository,
                                      UsuarioRepository usuarioRepository) {
        this.costoRepository = costoRepository;
        this.hpRepository = hpRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public CostoProduccionDTO registrar(CostoProduccionDTO dto) {
        HojaProceso hp = hpRepository.findById(dto.getIdHp())
                .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", dto.getIdHp()));

        CostoProduccion costo = new CostoProduccion();
        costo.setHojaProceso(hp);
        costo.setConcepto(dto.getConcepto());
        costo.setDescripcion(dto.getDescripcion());
        costo.setMonto(dto.getMonto());
        costo.setMoneda(dto.getMoneda() != null ? dto.getMoneda() : "PEN");

        if (dto.getDniRegistradoPor() != null) {
            Usuario registrador = usuarioRepository.findById(dto.getDniRegistradoPor())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", dto.getDniRegistradoPor()));
            costo.setRegistradoPor(registrador);
        }

        return CostoProduccionDTO.from(costoRepository.save(costo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CostoProduccionDTO> listarPorHp(String idHp) {
        if (!hpRepository.existsById(idHp)) {
            throw new ResourceNotFoundException("HojaProceso", idHp);
        }
        return costoRepository.findByHojaProceso_IdHpOrderByFechaRegistroDesc(idHp)
                .stream().map(CostoProduccionDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> resumenPorConcepto(String idHp) {
        if (!hpRepository.existsById(idHp)) {
            throw new ResourceNotFoundException("HojaProceso", idHp);
        }
        List<Object[]> resultados = costoRepository.sumByConceptoForHp(idHp);
        Map<String, BigDecimal> resumen = new LinkedHashMap<>();
        for (Object[] fila : resultados) {
            resumen.put(fila[0].toString(), (BigDecimal) fila[1]);
        }
        return resumen;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal costoTotal(String idHp) {
        if (!hpRepository.existsById(idHp)) {
            throw new ResourceNotFoundException("HojaProceso", idHp);
        }
        return costoRepository.costoTotalHp(idHp);
    }
}
