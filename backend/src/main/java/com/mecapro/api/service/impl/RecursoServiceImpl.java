package com.mecapro.api.service.impl;

import com.mecapro.api.dto.RecursoDTO;
import com.mecapro.api.entity.Recurso;
import com.mecapro.api.repository.RecursoRepository;
import com.mecapro.api.service.RecursoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecursoServiceImpl implements RecursoService {

    private final RecursoRepository recursoRepository;

    public RecursoServiceImpl(RecursoRepository recursoRepository) {
        this.recursoRepository = recursoRepository;
    }

    @Override
    public Page<RecursoDTO> listarActivos(Pageable pageable) {
        return recursoRepository.findByActivoTrue(pageable)
                .map(RecursoDTO::from);
    }

    @Override
    public Page<RecursoDTO> listarEpps(Pageable pageable) {
        return recursoRepository.findByTipoRecursoAndActivoTrue(Recurso.TipoRecurso.EPP, pageable)
                .map(RecursoDTO::from);
    }

    @Override
    public Page<RecursoDTO> listarHerramientas(Pageable pageable) {
        return recursoRepository.findByTipoRecursoAndActivoTrue(Recurso.TipoRecurso.HERRAMIENTA, pageable)
                .map(RecursoDTO::from);
    }

    @Override
    public Page<RecursoDTO> listarHerramientasPorCategoria(String categoria, Pageable pageable) {
        return recursoRepository.findByTipoRecursoAndCategoriaAndActivoTrue(Recurso.TipoRecurso.HERRAMIENTA, categoria, pageable)
                .map(RecursoDTO::from);
    }

    @Override
    public Page<RecursoDTO> listarStockBajo(Pageable pageable) {
        return recursoRepository.findRecursosBajoStockMinimo(pageable)
                .map(RecursoDTO::from);
    }
}
