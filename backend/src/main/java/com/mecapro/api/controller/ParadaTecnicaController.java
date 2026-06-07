package com.mecapro.api.controller;

import com.mecapro.api.dto.ParadaTecnicaDTO;
import com.mecapro.api.service.ParadaTecnicaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paradas")
public class ParadaTecnicaController {

    private final ParadaTecnicaService paradaService;

    public ParadaTecnicaController(ParadaTecnicaService paradaService) {
        this.paradaService = paradaService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<ParadaTecnicaDTO> iniciar(@Valid @RequestBody ParadaTecnicaDTO dto, java.security.Principal principal) {
        dto.setDniOperario(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(paradaService.iniciarParada(dto));
    }

    @PostMapping("/{idParada}/finalizar")
    public ResponseEntity<ParadaTecnicaDTO> finalizar(
            @PathVariable Long idParada,
            @RequestParam(required = false) String descripcionAdicional) {
        return ResponseEntity.ok(paradaService.finalizarParada(idParada, descripcionAdicional));
    }

    @GetMapping("/hp/{idHp}")
    public ResponseEntity<List<ParadaTecnicaDTO>> listarPorHp(@PathVariable String idHp) {
        return ResponseEntity.ok(paradaService.listarPorHp(idHp));
    }

    @GetMapping("/operario/{dni}")
    public ResponseEntity<List<ParadaTecnicaDTO>> listarPorOperario(@PathVariable String dni) {
        return ResponseEntity.ok(paradaService.listarPorOperario(dni));
    }

    /**
     * Reporte para RRHH: paradas en un rango de fechas.
     * Ejemplo: GET /api/paradas/reporte-rrhh?desde=2026-05-01T00:00:00Z&hasta=2026-05-31T23:59:59Z
     */
    @GetMapping("/reporte-rrhh")
    public ResponseEntity<List<ParadaTecnicaDTO>> reporteRrhh(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime hasta) {
        return ResponseEntity.ok(paradaService.generarReporteRrhh(desde, hasta));
    }

    @PostMapping("/marcar-reportadas")
    public ResponseEntity<Map<String, Integer>> marcarReportadas(@RequestBody List<Long> ids) {
        int marcadas = paradaService.marcarComoReportadas(ids);
        return ResponseEntity.ok(Map.of("paradasMarcadas", marcadas));
    }
}
