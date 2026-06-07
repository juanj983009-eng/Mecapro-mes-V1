package com.mecapro.api.repository;

import com.mecapro.api.entity.ParadaTecnica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParadaTecnicaRepository extends JpaRepository<ParadaTecnica, Long> {

    /**
     * Parada activa (sin hora_fin) de un operario.
     */
    Optional<ParadaTecnica> findFirstByOperario_DniAndHoraFinIsNull(String dni);

    /**
     * Historial de paradas de un operario ordenadas por inicio descendente.
     */
    List<ParadaTecnica> findByOperario_DniOrderByHoraInicioDesc(String dni);

    /**
     * Paradas pendientes de reportar a RRHH.
     */
    List<ParadaTecnica> findByReportadaRrhhFalseAndHoraFinIsNotNull();

    /**
     * Paradas de una HP específica.
     */
    List<ParadaTecnica> findByHojaProceso_IdHpOrderByHoraInicioDesc(String idHp);

    /**
     * Reporte de paradas en rango de fechas (para RRHH).
     */
    @Query("SELECT p FROM ParadaTecnica p WHERE p.horaInicio BETWEEN :desde AND :hasta ORDER BY p.horaInicio")
    List<ParadaTecnica> findEnRango(@Param("desde") ZonedDateTime desde, @Param("hasta") ZonedDateTime hasta);
}
