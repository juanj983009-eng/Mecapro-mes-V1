package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Entity
@Table(name = "solicitudes")
@Data
@NoArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_operario", nullable = false)
    private Usuario operario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_recurso", nullable = false)
    private Recurso recurso;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_solicitud", nullable = false, length = 20)
    private EstadoSolicitud estadoSolicitud = EstadoSolicitud.PENDIENTE;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_solicitud", nullable = false, updatable = false)
    private ZonedDateTime fechaSolicitud = ZonedDateTime.now();

    @Column(name = "fecha_entrega")
    private ZonedDateTime fechaEntrega;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dni_atendido_por")
    private Usuario atendidoPor;

    public enum EstadoSolicitud {
        PENDIENTE, PREPARANDO, LISTO, ENTREGADO, CANCELADO
    }
}
