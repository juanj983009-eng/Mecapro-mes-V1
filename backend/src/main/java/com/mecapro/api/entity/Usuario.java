package com.mecapro.api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Usuario {

    @Id
    @Column(name = "dni", length = 15)
    @EqualsAndHashCode.Include
    private String dni;

    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_area")
    private Area area;

    @Column(name = "puesto", length = 50)
    private String puesto;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;
}
