package com.mecapro.api.controller;

import com.mecapro.api.dto.RecursoDTO;
import com.mecapro.api.service.RecursoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<Page<RecursoDTO>> listarActivos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombreEspecifico").ascending());
        return ResponseEntity.ok(recursoService.listarActivos(pageable));
    }

    @GetMapping("/epps")
    public ResponseEntity<Page<RecursoDTO>> listarEpps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombreEspecifico").ascending());
        return ResponseEntity.ok(recursoService.listarEpps(pageable));
    }

    @GetMapping("/herramientas")
    public ResponseEntity<Page<RecursoDTO>> listarHerramientas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String categoria) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombreEspecifico").ascending());
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(recursoService.listarHerramientasPorCategoria(categoria, pageable));
        }
        return ResponseEntity.ok(recursoService.listarHerramientas(pageable));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<Page<RecursoDTO>> listarStockBajo(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombreEspecifico").ascending());
        return ResponseEntity.ok(recursoService.listarStockBajo(pageable));
    }
}