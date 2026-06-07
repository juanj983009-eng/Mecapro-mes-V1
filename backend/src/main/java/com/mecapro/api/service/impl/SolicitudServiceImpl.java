package com.mecapro.api.service.impl;

import com.mecapro.api.dto.SolicitudDTO;
import com.mecapro.api.entity.Recurso;
import com.mecapro.api.entity.Solicitud;
import com.mecapro.api.entity.Solicitud.EstadoSolicitud;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.exception.ResourceNotFoundException;
import com.mecapro.api.repository.RecursoRepository;
import com.mecapro.api.repository.SolicitudRepository;
import com.mecapro.api.repository.UsuarioRepository;
import com.mecapro.api.service.SolicitudService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@Transactional
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final RecursoRepository recursoRepository;

    public SolicitudServiceImpl(SolicitudRepository solicitudRepository,
                                UsuarioRepository usuarioRepository,
                                RecursoRepository recursoRepository) {
        this.solicitudRepository = solicitudRepository;
        this.usuarioRepository = usuarioRepository;
        this.recursoRepository = recursoRepository;
    }

    @Override
    public SolicitudDTO crear(SolicitudDTO dto) {
        Usuario operario = usuarioRepository.findById(dto.getDniOperario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", dto.getDniOperario()));

        Recurso recurso = recursoRepository.findById(dto.getIdRecurso())
                .orElseThrow(() -> new ResourceNotFoundException("Recurso", dto.getIdRecurso()));

        if (!recurso.getActivo()) {
            throw new BusinessRuleException("El recurso solicitado no está activo en el catálogo.");
        }

        if (recurso.getStockActual() < dto.getCantidad()) {
            throw new BusinessRuleException(
                    String.format("Stock insuficiente para '%s'. Disponible: %d, Solicitado: %d",
                            recurso.getNombreEspecifico(), recurso.getStockActual(), dto.getCantidad()));
        }

        Solicitud solicitud = new Solicitud();
        solicitud.setOperario(operario);
        solicitud.setRecurso(recurso);
        solicitud.setCantidad(dto.getCantidad());
        solicitud.setObservaciones(dto.getObservaciones());

        return SolicitudDTO.from(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudDTO actualizarEstado(Long idSolicitud, EstadoSolicitud nuevoEstado, String dniAtiende) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud", idSolicitud));

        // Validar transiciones de estado
        validarTransicion(solicitud.getEstadoSolicitud(), nuevoEstado);

        solicitud.setEstadoSolicitud(nuevoEstado);

        // Al marcar como ENTREGADO, decrementar stock y registrar fecha
        if (nuevoEstado == EstadoSolicitud.ENTREGADO) {
            Recurso recurso = solicitud.getRecurso();
            if (recurso.getStockActual() < solicitud.getCantidad()) {
                throw new BusinessRuleException("No hay stock suficiente para completar la entrega.");
            }
            recurso.setStockActual(recurso.getStockActual() - solicitud.getCantidad());

            solicitud.setFechaEntrega(ZonedDateTime.now());

            if (dniAtiende != null) {
                Usuario atiende = usuarioRepository.findById(dniAtiende)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario", dniAtiende));
                solicitud.setAtendidoPor(atiende);
            }
        }

        return SolicitudDTO.from(solicitud);
    }

    private void validarTransicion(EstadoSolicitud actual, EstadoSolicitud nuevo) {
        boolean valida = switch (actual) {
            case PENDIENTE   -> nuevo == EstadoSolicitud.PREPARANDO || nuevo == EstadoSolicitud.CANCELADO;
            case PREPARANDO  -> nuevo == EstadoSolicitud.LISTO || nuevo == EstadoSolicitud.CANCELADO;
            case LISTO       -> nuevo == EstadoSolicitud.ENTREGADO;
            case ENTREGADO, CANCELADO -> false;
        };
        if (!valida) {
            throw new BusinessRuleException(
                    String.format("Transición de estado inválida: %s → %s", actual, nuevo));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDTO> listarPendientesPorTipo(Recurso.TipoRecurso tipo) {
        return solicitudRepository.findByRecurso_TipoRecursoAndEstadoSolicitudOrderByFechaSolicitudAsc(
                        tipo, EstadoSolicitud.PENDIENTE)
                .stream().map(SolicitudDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudDTO> historialPorOperario(String dniOperario) {
        if (!usuarioRepository.existsById(dniOperario)) {
            throw new ResourceNotFoundException("Usuario", dniOperario);
        }
        return solicitudRepository.findByOperario_DniOrderByFechaSolicitudDesc(dniOperario)
                .stream().map(SolicitudDTO::from).toList();
    }
}
