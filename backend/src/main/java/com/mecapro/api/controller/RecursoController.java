package com.mecapro.api.controller;

import com.mecapro.api.dto.RecursoDTO;
import com.mecapro.api.service.RecursoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller unificado para el Catálogo de Recursos (EPPs y Herramientas).
 */
@RestController
@RequestMapping("/api/recursos")
public class RecursoController {

    private final RecursoService recursoService;

    public RecursoController(RecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @GetMapping
    public ResponseEntity<List<RecursoDTO>> listarActivos() {
        return ResponseEntity.ok(recursoService.listarActivos());
    }

    @GetMapping("/epps")
    public ResponseEntity<List<RecursoDTO>> listarEpps() {
        return ResponseEntity.ok(recursoService.listarEpps());
    }

    @GetMapping("/herramientas")
    public ResponseEntity<List<RecursoDTO>> listarHerramientas() {
        return ResponseEntity.ok(recursoService.listarHerramientas());
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<List<RecursoDTO>> listarStockBajo() {
        return ResponseEntity.ok(recursoService.listarStockBajo());
    }
}