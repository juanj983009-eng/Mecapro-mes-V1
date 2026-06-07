package com.mecapro.api.controller;

import com.mecapro.api.dto.SolicitudDTO;
import com.mecapro.api.entity.Recurso;
import com.mecapro.api.entity.Solicitud.EstadoSolicitud;
import com.mecapro.api.service.SolicitudService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @PostMapping
    public ResponseEntity<SolicitudDTO> crear(@Valid @RequestBody SolicitudDTO dto, java.security.Principal principal) {
        dto.setDniOperario(principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crear(dto));
    }

    @PatchMapping("/{idSolicitud}/estado")
    public ResponseEntity<SolicitudDTO> actualizarEstado(
            @PathVariable Long idSolicitud,
            @RequestParam EstadoSolicitud nuevoEstado,
            @RequestParam(required = false) String dniAtiende) {
        return ResponseEntity.ok(solicitudService.actualizarEstado(idSolicitud, nuevoEstado, dniAtiende));
    }

    @GetMapping("/pendientes/epps")
    public ResponseEntity<List<SolicitudDTO>> pendientesEpps() {
        return ResponseEntity.ok(solicitudService.listarPendientesPorTipo(Recurso.TipoRecurso.EPP));
    }

    @GetMapping("/pendientes/herramientas")
    public ResponseEntity<List<SolicitudDTO>> pendientesHerramientas() {
        return ResponseEntity.ok(solicitudService.listarPendientesPorTipo(Recurso.TipoRecurso.HERRAMIENTA));
    }

    @GetMapping("/operario/{dni}")
    public ResponseEntity<List<SolicitudDTO>> historialOperario(@PathVariable String dni) {
        return ResponseEntity.ok(solicitudService.historialPorOperario(dni));
    }
}
