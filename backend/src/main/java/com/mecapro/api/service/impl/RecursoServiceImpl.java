package com.mecapro.api.service.impl;

import com.mecapro.api.dto.RecursoDTO;
import com.mecapro.api.entity.Recurso;
import com.mecapro.api.repository.RecursoRepository;
import com.mecapro.api.service.RecursoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class RecursoServiceImpl implements RecursoService {

    private final RecursoRepository recursoRepository;

    public RecursoServiceImpl(RecursoRepository recursoRepository) {
        this.recursoRepository = recursoRepository;
    }

    @Override
    public List<RecursoDTO> listarActivos() {
        return recursoRepository.findByActivoTrue()
                .stream()
                .map(RecursoDTO::from)
                .toList();
    }

    @Override
    public List<RecursoDTO> listarEpps() {
        return recursoRepository.findByTipoRecursoAndActivoTrue(Recurso.TipoRecurso.EPP)
                .stream()
                .map(RecursoDTO::from)
                .toList();
    }

    @Override
    public List<RecursoDTO> listarHerramientas() {
        return recursoRepository.findByTipoRecursoAndActivoTrue(Recurso.TipoRecurso.HERRAMIENTA)
                .stream()
                .map(RecursoDTO::from)
                .toList();
    }

    @Override
    public List<RecursoDTO> listarStockBajo() {
        return recursoRepository.findRecursosBajoStockMinimo()
                .stream()
                .map(RecursoDTO::from)
                .toList();
    }
}
