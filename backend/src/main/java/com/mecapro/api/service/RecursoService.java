package com.mecapro.api.service;

import com.mecapro.api.dto.RecursoDTO;
import java.util.List;

public interface RecursoService {
    
    List<RecursoDTO> listarActivos();
    
    List<RecursoDTO> listarEpps();
    
    List<RecursoDTO> listarHerramientas();
    
    List<RecursoDTO> listarStockBajo();
}
