package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "hojas_proceso")
@Data
@NoArgsConstructor
public class HojaProceso {

    @Id
    @Column(name = "id_hp", length = 20)
    private String idHp;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "pieza", length = 100)
    private String pieza;

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "cantidad_total", nullable = false)
    private Integer cantidadTotal = 1;

    @Column(name = "cantidad_buenas", nullable = false)
    private Integer cantidadBuenas = 0;

    @Column(name = "cantidad_malas", nullable = false)
    private Integer cantidadMalas = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    private EstadoHp estado = EstadoHp.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_responsable")
    private Usuario responsable;

    @Column(name = "fecha_inicio")
    private ZonedDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private ZonedDateTime fechaFin;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private ZonedDateTime creadoEn = ZonedDateTime.now();

    public enum EstadoHp {
        PENDIENTE, EN_PROCESO, TERMINADA, CANCELADA
    }
}
