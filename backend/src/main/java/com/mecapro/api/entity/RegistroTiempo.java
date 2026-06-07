package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;

import java.time.ZonedDateTime;

@Entity
@Table(name = "registro_tiempos")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RegistroTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    @EqualsAndHashCode.Include
    private Long idRegistro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_operario", nullable = false)
    private Usuario operario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hp")
    private HojaProceso hojaProceso;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_actividad", nullable = false, length = 30)
    private TipoActividad tipoActividad;

    @Column(name = "hora_inicio", nullable = false)
    private ZonedDateTime horaInicio = ZonedDateTime.now();

    @Column(name = "hora_fin")
    private ZonedDateTime horaFin;

    // duracion_minutos es columna calculada en BD (GENERATED ALWAYS AS STORED), solo lectura
    @Column(name = "duracion_minutos", insertable = false, updatable = false)
    private Integer duracionMinutos;

    @Column(name = "justificacion_exceso", columnDefinition = "TEXT")
    private String justificacionExceso;

    @Column(name = "requiere_justificacion", nullable = false)
    private Boolean requiereJustificacion = false;

    // Constructor vacío requerido por JPA
    public RegistroTiempo() {
    }

    // Constructor para inicialización limpia en servicios
    public RegistroTiempo(Usuario operario, HojaProceso hojaProceso, TipoActividad tipoActividad) {
        this.operario = operario;
        this.hojaProceso = hojaProceso;
        this.tipoActividad = tipoActividad;
        this.horaInicio = ZonedDateTime.now();
        this.requiereJustificacion = false;
    }

    public enum TipoActividad {
        PRODUCCION, REFRIGERIO, APOYO, PARADA_TECNICA
    }
}