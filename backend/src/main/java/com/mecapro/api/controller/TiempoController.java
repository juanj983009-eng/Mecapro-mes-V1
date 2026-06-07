package com.mecapro.api.controller;

import com.mecapro.api.dto.IniciarActividadRequest;
import com.mecapro.api.dto.RegistroTiempoResponse;
import com.mecapro.api.service.TiempoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tiempos")
public class TiempoController {

    private final TiempoService tiempoService;

    public TiempoController(TiempoService tiempoService) {
        this.tiempoService = tiempoService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<RegistroTiempoResponse> iniciar(
            @Valid @RequestBody IniciarActividadRequest request,
            Principal principal) {
        String dniLogueado = principal.getName();
        return ResponseEntity.ok(tiempoService.iniciarActividad(request, dniLogueado));
    }

    @PostMapping("/terminar")
    public ResponseEntity<RegistroTiempoResponse> terminar(
            java.security.Principal principal,
            @RequestParam(required = false) String justificacion) {
        return ResponseEntity.ok(tiempoService.terminarActividad(principal.getName(), justificacion));
    }

    @GetMapping("/historial/operario/{dni}")
    public ResponseEntity<List<RegistroTiempoResponse>> historialOperario(@PathVariable String dni) {
        return ResponseEntity.ok(tiempoService.historialPorOperario(dni));
    }

    @GetMapping("/historial/hp/{idHp}")
    public ResponseEntity<List<RegistroTiempoResponse>> historialHp(@PathVariable String idHp) {
        return ResponseEntity.ok(tiempoService.historialPorHp(idHp));
    }
}