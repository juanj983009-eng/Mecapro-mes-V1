package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "catalogo_recursos",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tipo_recurso", "categoria", "nombre_especifico"}))
@Data
@NoArgsConstructor
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_recurso")
    private Integer idRecurso;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_recurso", nullable = false, length = 20)
    private TipoRecurso tipoRecurso;

    @Column(name = "categoria", nullable = false, length = 50)
    private String categoria;

    @Column(name = "nombre_especifico", nullable = false, length = 100)
    private String nombreEspecifico;

    @Column(name = "unidad_medida", nullable = false, length = 20)
    private String unidadMedida = "UNIDAD";

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    public enum TipoRecurso {
        EPP, HERRAMIENTA
    }

    /**
     * Verifica si el recurso tiene stock bajo.
     */
    public boolean isStockBajo() {
        return stockActual <= stockMinimo;
    }
}