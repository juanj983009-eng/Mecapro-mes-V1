package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "costos_produccion")
@Data
@NoArgsConstructor
public class CostoProduccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_costo")
    private Long idCosto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hp", nullable = false)
    private HojaProceso hojaProceso;

    @Enumerated(EnumType.STRING)
    @Column(name = "concepto", nullable = false, length = 50)
    private ConceptoCosto concepto;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "monto", nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Column(name = "moneda", nullable = false, length = 5)
    private String moneda = "PEN";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private ZonedDateTime fechaRegistro = ZonedDateTime.now();

    public enum ConceptoCosto {
        MANO_OBRA, MATERIAL, HERRAMENTAL, OVERHEAD, OTRO
    }
}
