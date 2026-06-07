package com.mecapro.api.repository;

import com.mecapro.api.entity.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecursoRepository extends JpaRepository<Recurso, Integer> {

    List<Recurso> findByTipoRecursoAndActivoTrue(Recurso.TipoRecurso tipoRecurso);

    List<Recurso> findByActivoTrue();

    /**
     * Recursos con stock por debajo del mínimo configurado.
     */
    @Query("SELECT r FROM Recurso r WHERE r.stockActual <= r.stockMinimo AND r.activo = true")
    List<Recurso> findRecursosBajoStockMinimo();
}