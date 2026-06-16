package com.mecapro.api.service;

import com.mecapro.api.dto.RecursoDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RecursoService {
    
    Page<RecursoDTO> listarActivos(Pageable pageable);
    
    Page<RecursoDTO> listarEpps(Pageable pageable);
    
    Page<RecursoDTO> listarHerramientas(Pageable pageable);

    Page<RecursoDTO> listarHerramientasPorCategoria(String categoria, Pageable pageable);
    
    Page<RecursoDTO> listarStockBajo(Pageable pageable);
}
