package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "paradas_tecnicas")
@Data
@NoArgsConstructor
public class ParadaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_parada")
    private Long idParada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hp")
    private HojaProceso hojaProceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_operario", nullable = false)
    private Usuario operario;

    @Column(name = "maquina", nullable = false, length = 50)
    private String maquina;

    @Enumerated(EnumType.STRING)
    @Column(name = "causa", nullable = false, length = 50)
    private CausaParada causa;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "hora_inicio", nullable = false)
    private ZonedDateTime horaInicio = ZonedDateTime.now();

    @Column(name = "hora_fin")
    private ZonedDateTime horaFin;

    // Columna calculada en BD, solo lectura
    @Column(name = "duracion_minutos", insertable = false, updatable = false)
    private Integer duracionMinutos;

    @Column(name = "justificacion_rrhh", columnDefinition = "TEXT")
    private String justificacionRrhh;

    @Column(name = "reportada_rrhh", nullable = false)
    private Boolean reportadaRrhh = false;

    public enum CausaParada {
        FALLA_MECANICA, FALLA_ELECTRICA, FALTA_MATERIAL,
        CAMBIO_HERRAMIENTA, PROGRAMACION, OTRO
    }
}
