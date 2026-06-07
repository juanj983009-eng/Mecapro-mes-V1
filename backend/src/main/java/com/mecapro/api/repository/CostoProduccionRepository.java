package com.mecapro.api.repository;

import com.mecapro.api.entity.CostoProduccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CostoProduccionRepository extends JpaRepository<CostoProduccion, Long> {

    List<CostoProduccion> findByHojaProceso_IdHpOrderByFechaRegistroDesc(String idHp);

    /**
     * Suma total de costos de una HP, agrupados por concepto.
     */
    @Query("SELECT c.concepto, SUM(c.monto) FROM CostoProduccion c " +
           "WHERE c.hojaProceso.idHp = :idHp GROUP BY c.concepto")
    List<Object[]> sumByConceptoForHp(@Param("idHp") String idHp);

    /**
     * Costo total de una HP.
     */
    @Query("SELECT COALESCE(SUM(c.monto), 0) FROM CostoProduccion c WHERE c.hojaProceso.idHp = :idHp")
    BigDecimal costoTotalHp(@Param("idHp") String idHp);
}
