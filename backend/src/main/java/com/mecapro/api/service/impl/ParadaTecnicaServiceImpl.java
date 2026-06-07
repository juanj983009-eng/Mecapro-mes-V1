package com.mecapro.api.service.impl;

import com.mecapro.api.dto.ParadaTecnicaDTO;
import com.mecapro.api.entity.HojaProceso;
import com.mecapro.api.entity.ParadaTecnica;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.exception.ResourceNotFoundException;
import com.mecapro.api.repository.HojaProcesoRepository;
import com.mecapro.api.repository.ParadaTecnicaRepository;
import com.mecapro.api.repository.UsuarioRepository;
import com.mecapro.api.service.ParadaTecnicaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ParadaTecnicaServiceImpl implements ParadaTecnicaService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ParadaTecnicaRepository paradaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HojaProcesoRepository hpRepository;

    public ParadaTecnicaServiceImpl(ParadaTecnicaRepository paradaRepository,
                                    UsuarioRepository usuarioRepository,
                                    HojaProcesoRepository hpRepository) {
        this.paradaRepository = paradaRepository;
        this.usuarioRepository = usuarioRepository;
        this.hpRepository = hpRepository;
    }

    @Override
    public ParadaTecnicaDTO iniciarParada(ParadaTecnicaDTO dto) {
        Usuario operario = usuarioRepository.findById(dto.getDniOperario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", dto.getDniOperario()));

        // Un operario no puede tener dos paradas activas simultáneas
        paradaRepository.findFirstByOperario_DniAndHoraFinIsNull(dto.getDniOperario())
                .ifPresent(p -> {
                    throw new BusinessRuleException(
                            "Ya existe una parada técnica activa. Finalícela antes de iniciar otra.");
                });

        ParadaTecnica parada = new ParadaTecnica();
        parada.setOperario(operario);
        parada.setMaquina(dto.getMaquina());
        parada.setCausa(dto.getCausa());
        parada.setDescripcion(dto.getDescripcion());
        parada.setHoraInicio(ZonedDateTime.now());

        if (dto.getIdHp() != null) {
            HojaProceso hp = hpRepository.findById(dto.getIdHp())
                    .orElseThrow(() -> new ResourceNotFoundException("HojaProceso", dto.getIdHp()));
            parada.setHojaProceso(hp);
        }

        return ParadaTecnicaDTO.from(paradaRepository.save(parada));
    }

    @Override
    public ParadaTecnicaDTO finalizarParada(Long idParada, String descripcionAdicional) {
        ParadaTecnica parada = paradaRepository.findById(idParada)
                .orElseThrow(() -> new ResourceNotFoundException("ParadaTecnica", idParada));

        if (parada.getHoraFin() != null) {
            throw new BusinessRuleException("Esta parada técnica ya fue finalizada.");
        }

        parada.setHoraFin(ZonedDateTime.now());

        // Actualizar descripción si se agrega info adicional al cerrar
        if (descripcionAdicional != null && !descripcionAdicional.isBlank()) {
            String descActual = parada.getDescripcion() != null ? parada.getDescripcion() + " | " : "";
            parada.setDescripcion(descActual + descripcionAdicional);
        }

        // LÓGICA CLAVE: Generar justificación automática para RRHH
        parada.setJustificacionRrhh(generarJustificacionRrhh(parada));

        return ParadaTecnicaDTO.from(paradaRepository.save(parada));
    }

    /**
     * Genera un texto formal de justificación para el área de RRHH
     * con base en la causa y duración de la parada.
     */
    private String generarJustificacionRrhh(ParadaTecnica parada) {
        String operarioNombre = parada.getOperario().getNombreCompleto();
        String inicio = parada.getHoraInicio().format(FMT);
        String fin = parada.getHoraFin().format(FMT);
        String idHp = parada.getHojaProceso() != null ? parada.getHojaProceso().getIdHp() : "N/A";
        String causaDescripcion = switch (parada.getCausa()) {
            case FALLA_MECANICA    -> "falla mecánica en la máquina";
            case FALLA_ELECTRICA   -> "falla eléctrica en el equipo";
            case FALTA_MATERIAL    -> "falta de material para continuar la producción";
            case CAMBIO_HERRAMIENTA -> "cambio de herramental requerido por desgaste";
            case PROGRAMACION      -> "ajuste o corrección de programa CNC";
            case OTRO              -> "causa operativa diversa";
        };

        return String.format(
                "PARADA TÉCNICA — Operario: %s | Máquina: %s | HP: %s%n" +
                "Causa: %s (%s).%n" +
                "Inicio: %s | Fin: %s%n" +
                "%s" +
                "Este tiempo muerto queda registrado en el sistema Meca-PRO para su control y descargo.",
                operarioNombre, parada.getMaquina(), idHp,
                parada.getCausa().name(), causaDescripcion,
                inicio, fin,
                parada.getDescripcion() != null ? "Detalle: " + parada.getDescripcion() + "\n" : ""
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParadaTecnicaDTO> listarPorHp(String idHp) {
        return paradaRepository.findByHojaProceso_IdHpOrderByHoraInicioDesc(idHp)
                .stream().map(ParadaTecnicaDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParadaTecnicaDTO> listarPorOperario(String dni) {
        if (!usuarioRepository.existsById(dni)) {
            throw new ResourceNotFoundException("Usuario", dni);
        }
        return paradaRepository.findByOperario_DniOrderByHoraInicioDesc(dni)
                .stream().map(ParadaTecnicaDTO::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParadaTecnicaDTO> generarReporteRrhh(ZonedDateTime desde, ZonedDateTime hasta) {
        return paradaRepository.findEnRango(desde, hasta)
                .stream().map(ParadaTecnicaDTO::from).toList();
    }

    @Override
    public int marcarComoReportadas(List<Long> ids) {
        List<ParadaTecnica> paradas = paradaRepository.findAllById(ids);
        paradas.forEach(p -> p.setReportadaRrhh(true));
        paradaRepository.saveAll(paradas);
        return paradas.size();
    }
}
