package com.mecapro.api.controller;

import com.mecapro.api.dto.CostoProduccionDTO;
import com.mecapro.api.service.CostoProduccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/costos")
public class CostoController {

    private final CostoProduccionService costoService;

    public CostoController(CostoProduccionService costoService) {
        this.costoService = costoService;
    }

    @PostMapping
    public ResponseEntity<CostoProduccionDTO> registrar(@Valid @RequestBody CostoProduccionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(costoService.registrar(dto));
    }

    @GetMapping("/hp/{idHp}")
    public ResponseEntity<List<CostoProduccionDTO>> listarPorHp(@PathVariable String idHp) {
        return ResponseEntity.ok(costoService.listarPorHp(idHp));
    }

    @GetMapping("/hp/{idHp}/resumen")
    public ResponseEntity<Map<String, BigDecimal>> resumenPorConcepto(@PathVariable String idHp) {
        return ResponseEntity.ok(costoService.resumenPorConcepto(idHp));
    }

    @GetMapping("/hp/{idHp}/total")
    public ResponseEntity<Map<String, BigDecimal>> costoTotal(@PathVariable String idHp) {
        return ResponseEntity.ok(Map.of("costoTotal", costoService.costoTotal(idHp)));
    }
}
