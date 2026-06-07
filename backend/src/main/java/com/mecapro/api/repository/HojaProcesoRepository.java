package com.mecapro.api.repository;

import com.mecapro.api.entity.HojaProceso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HojaProcesoRepository extends JpaRepository<HojaProceso, String> {

    List<HojaProceso> findByEstado(HojaProceso.EstadoHp estado);

    List<HojaProceso> findByResponsable_Dni(String dniResponsable);

    @Query("SELECT h FROM HojaProceso h WHERE h.estado IN ('PENDIENTE', 'EN_PROCESO') ORDER BY h.creadoEn ASC")
    List<HojaProceso> findActivas();
}
