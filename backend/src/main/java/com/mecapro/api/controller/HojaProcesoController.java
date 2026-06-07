package com.mecapro.api.controller;

import com.mecapro.api.dto.HojaProcesoDTO;
import com.mecapro.api.entity.HojaProceso.EstadoHp;
import com.mecapro.api.service.HojaProcesoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hps")
public class HojaProcesoController {

    private final HojaProcesoService hpService;

    public HojaProcesoController(HojaProcesoService hpService) {
        this.hpService = hpService;
    }

    @GetMapping
    public ResponseEntity<List<HojaProcesoDTO>> listarTodas() {
        return ResponseEntity.ok(hpService.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<HojaProcesoDTO>> listarActivas() {
        return ResponseEntity.ok(hpService.listarActivas());
    }

    @GetMapping("/{idHp}")
    public ResponseEntity<HojaProcesoDTO> buscarPorId(@PathVariable String idHp) {
        return ResponseEntity.ok(hpService.buscarPorId(idHp));
    }

    @PostMapping
    public ResponseEntity<HojaProcesoDTO> crear(@Valid @RequestBody HojaProcesoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hpService.crear(dto));
    }

    @PatchMapping("/{idHp}/estado")
    public ResponseEntity<HojaProcesoDTO> actualizarEstado(
            @PathVariable String idHp,
            @RequestParam EstadoHp nuevoEstado) {
        return ResponseEntity.ok(hpService.actualizarEstado(idHp, nuevoEstado));
    }

    @PatchMapping("/{idHp}/produccion")
    public ResponseEntity<HojaProcesoDTO> registrarProduccion(
            @PathVariable String idHp,
            @RequestParam int cantidadBuenas,
            @RequestParam int cantidadMalas) {
        return ResponseEntity.ok(hpService.registrarProduccion(idHp, cantidadBuenas, cantidadMalas));
    }
}
