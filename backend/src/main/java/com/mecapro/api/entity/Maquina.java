package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "maquinas")
@Data
@NoArgsConstructor
public class Maquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_maquina")
    private Integer idMaquina;

    @Column(name = "nombre_especifico", nullable = false, unique = true, length = 100)
    private String nombreEspecifico;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // 'MAQUINA_CNC' or 'MAQUINA_CONVENCIONAL'

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
}
