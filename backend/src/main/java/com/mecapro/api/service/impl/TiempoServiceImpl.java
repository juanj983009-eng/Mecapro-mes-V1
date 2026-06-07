package com.mecapro.api.service.impl;

import com.mecapro.api.dto.IniciarActividadRequest;
import com.mecapro.api.dto.RegistroTiempoResponse;
import com.mecapro.api.entity.HojaProceso;
import com.mecapro.api.entity.RegistroTiempo;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.exception.ResourceNotFoundException;
import com.mecapro.api.repository.HojaProcesoRepository;
import com.mecapro.api.repository.TiempoRepository;
import com.mecapro.api.repository.UsuarioRepository;
import com.mecapro.api.service.TiempoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@Transactional
public class TiempoServiceImpl implements TiempoService {

    private static final int LIMITE_MINUTOS_REFRIGERIO = 30;

    private final TiempoRepository tiempoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HojaProcesoRepository hpRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public TiempoServiceImpl(TiempoRepository tiempoRepository,
                             UsuarioRepository usuarioRepository,
                             HojaProcesoRepository hpRepository) {
        this.tiempoRepository = tiempoRepository;
        this.usuarioRepository = usuarioRepository;
        this.hpRepository = hpRepository;
    }

    @Override
    public RegistroTiempoResponse iniciarActividad(IniciarActividadRequest request, String dniOperario) {
        Usuario operario = usuarioRepository.findById(dniOperario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", dniOperario));

        // Verificar que no haya una actividad activa sin cerrar
        tiempoRepository.findFirstByOperario_DniAndHoraFinIsNullOrderByHoraInicioDesc(dniOperario)
                .ifPresent(activa -> {
                    throw new BusinessRuleException(
                            "El operario ya tiene una actividad activa (" +
                            activa.getTipoActividad() + "). Finalícela antes de iniciar otra.");
                });

        RegistroTiempo nuevo = new RegistroTiempo();
        nuevo.setOperario(operario);
        nuevo.setTipoActividad(request.getTipoActividad());
        nuevo.setHoraInicio(ZonedDateTime.now());

        if (request.getIdHp() != null && !request.getIdHp().isBlank()) {
            HojaProceso hp = hpRepository.findById(request.getIdHp())
                    .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", request.getIdHp()));
            nuevo.setHojaProceso(hp);
        }

        RegistroTiempo guardado = tiempoRepository.save(nuevo);
        entityManager.flush();
        entityManager.refresh(guardado);
        return RegistroTiempoResponse.from(guardado);
    }

    @Override
    public RegistroTiempoResponse terminarActividad(String dniOperario, String justificacion) {
        RegistroTiempo registro = tiempoRepository
                .findFirstByOperario_DniAndHoraFinIsNullOrderByHoraInicioDesc(dniOperario)
                .orElseThrow(() -> new BusinessRuleException(
                        "No existe actividad activa para el operario con DNI: " + dniOperario));

        registro.setHoraFin(ZonedDateTime.now());

        long minutos = Duration.between(registro.getHoraInicio(), registro.getHoraFin()).toMinutes();

        // Regla de negocio: refrigerio con exceso de tiempo requiere justificación
        if (registro.getTipoActividad() == RegistroTiempo.TipoActividad.REFRIGERIO
                && minutos > LIMITE_MINUTOS_REFRIGERIO) {
            if (justificacion == null || justificacion.isBlank()) {
                throw new BusinessRuleException(
                        String.format("Exceso de %d minutos en refrigerio (límite: %d min). " +
                                      "Se requiere justificación para reportar a RRHH.",
                                      minutos, LIMITE_MINUTOS_REFRIGERIO));
            }
            registro.setJustificacionExceso(justificacion);
            registro.setRequiereJustificacion(true);
        }

        RegistroTiempo guardado = tiempoRepository.save(registro);
        entityManager.flush();
        entityManager.refresh(guardado);
        return RegistroTiempoResponse.from(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroTiempoResponse> historialPorOperario(String dniOperario) {
        if (!usuarioRepository.existsById(dniOperario)) {
            throw new ResourceNotFoundException("Usuario", dniOperario);
        }
        return tiempoRepository.findByOperario_DniOrderByHoraInicioDesc(dniOperario)
                .stream().map(RegistroTiempoResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistroTiempoResponse> historialPorHp(String idHp) {
        return tiempoRepository.findByHojaProceso_IdHpOrderByHoraInicioDesc(idHp)
                .stream().map(RegistroTiempoResponse::from).toList();
    }
}
