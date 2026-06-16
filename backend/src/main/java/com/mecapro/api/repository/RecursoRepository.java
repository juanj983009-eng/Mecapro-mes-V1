package com.mecapro.api.repository;

import com.mecapro.api.entity.Recurso;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RecursoRepository extends JpaRepository<Recurso, Integer> {

    @Query("SELECT r FROM Recurso r WHERE r.tipoRecurso = :tipoRecurso AND r.categoria NOT IN ('MAQUINA_CONVENCIONAL', 'MAQUINA_CNC') AND r.activo = true")
    Page<Recurso> findByTipoRecursoAndActivoTrue(@Param("tipoRecurso") Recurso.TipoRecurso tipoRecurso, Pageable pageable);

    @Query("SELECT r FROM Recurso r WHERE r.categoria NOT IN ('MAQUINA_CONVENCIONAL', 'MAQUINA_CNC') AND r.activo = true")
    Page<Recurso> findByActivoTrue(Pageable pageable);

    @Query("SELECT r FROM Recurso r WHERE r.tipoRecurso = :tipoRecurso AND r.categoria = :categoria AND r.categoria NOT IN ('MAQUINA_CONVENCIONAL', 'MAQUINA_CNC') AND r.activo = true")
    Page<Recurso> findByTipoRecursoAndCategoriaAndActivoTrue(@Param("tipoRecurso") Recurso.TipoRecurso tipoRecurso, @Param("categoria") String categoria, Pageable pageable);

    /**
     * Recursos con stock por debajo del mínimo configurado.
     */
    @Query("SELECT r FROM Recurso r WHERE r.stockActual <= r.stockMinimo AND r.categoria NOT IN ('MAQUINA_CONVENCIONAL', 'MAQUINA_CNC') AND r.activo = true")
    Page<Recurso> findRecursosBajoStockMinimo(Pageable pageable);
}