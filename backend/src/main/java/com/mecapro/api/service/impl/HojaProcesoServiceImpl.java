package com.mecapro.api.service.impl;

import com.mecapro.api.dto.HojaProcesoDTO;
import com.mecapro.api.entity.HojaProceso;
import com.mecapro.api.entity.HojaProceso.EstadoHp;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.exception.ResourceNotFoundException;
import com.mecapro.api.repository.HojaProcesoRepository;
import com.mecapro.api.repository.UsuarioRepository;
import com.mecapro.api.service.HojaProcesoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@Transactional
public class HojaProcesoServiceImpl implements HojaProcesoService {

    private final HojaProcesoRepository hpRepository;
    private final UsuarioRepository usuarioRepository;

    public HojaProcesoServiceImpl(HojaProcesoRepository hpRepository,
                                  UsuarioRepository usuarioRepository) {
        this.hpRepository = hpRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public HojaProcesoDTO crear(HojaProcesoDTO dto) {
        if (hpRepository.existsById(dto.getIdHp())) {
            throw new BusinessRuleException("Ya existe una HP con el ID: " + dto.getIdHp());
        }

        HojaProceso hp = new HojaProceso();
        hp.setIdHp(dto.getIdHp());
        hp.setDescripcion(dto.getDescripcion());
        hp.setPieza(dto.getPieza());
        hp.setMaterial(dto.getMaterial());
        hp.setCantidadTotal(dto.getCantidadTotal() != null ? dto.getCantidadTotal() : 1);

        if (dto.getDniResponsable() != null) {
            Usuario responsable = usuarioRepository.findById(dto.getDniResponsable())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", dto.getDniResponsable()));
            hp.setResponsable(responsable);
        }

        return HojaProcesoDTO.from(hpRepository.save(hp));
    }

    @Override
    @Transactional(readOnly = true)
    public HojaProcesoDTO buscarPorId(String idHp) {
        return HojaProcesoDTO.from(
                hpRepository.findById(idHp)
                        .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", idHp)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HojaProcesoDTO> listarTodas() {
        return hpRepository.findAll().stream().map(HojaProcesoDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HojaProcesoDTO> listarActivas() {
        return hpRepository.findActivas().stream().map(HojaProcesoDTO::from).toList();
    }

    @Override
    public HojaProcesoDTO actualizarEstado(String idHp, EstadoHp nuevoEstado) {
        HojaProceso hp = hpRepository.findById(idHp)
                .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", idHp));

        if (hp.getEstado() == EstadoHp.TERMINADA || hp.getEstado() == EstadoHp.CANCELADA) {
            throw new BusinessRuleException("No se puede cambiar el estado de una HP " + hp.getEstado());
        }

        hp.setEstado(nuevoEstado);
        if (nuevoEstado == EstadoHp.EN_PROCESO && hp.getFechaInicio() == null) {
            hp.setFechaInicio(ZonedDateTime.now());
        }
        if (nuevoEstado == EstadoHp.TERMINADA || nuevoEstado == EstadoHp.CANCELADA) {
            hp.setFechaFin(ZonedDateTime.now());
        }

        return HojaProcesoDTO.from(hpRepository.save(hp));
    }

    @Override
    public HojaProcesoDTO registrarProduccion(String idHp, int cantidadBuenas, int cantidadMalas) {
        HojaProceso hp = hpRepository.findById(idHp)
                .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", idHp));

        int totalRegistrado = hp.getCantidadBuenas() + cantidadBuenas +
                              hp.getCantidadMalas() + cantidadMalas;
        if (totalRegistrado > hp.getCantidadTotal()) {
            throw new BusinessRuleException(
                    "La producción registrada supera la cantidad total de la HP (" + hp.getCantidadTotal() + " piezas).");
        }

        hp.setCantidadBuenas(hp.getCantidadBuenas() + cantidadBuenas);
        hp.setCantidadMalas(hp.getCantidadMalas() + cantidadMalas);

        return HojaProcesoDTO.from(hpRepository.save(hp));
    }
}
