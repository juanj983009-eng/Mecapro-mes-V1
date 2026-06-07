package com.mecapro.api.repository;

import com.mecapro.api.entity.RegistroTiempo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TiempoRepository extends JpaRepository<RegistroTiempo, Long> {

    /**
     * Busca la actividad activa (sin hora_fin) más reciente de un operario.
     * Optimizado para cargar de un solo viaje el operario y hoja de proceso.
     */
    @Query("SELECT r FROM RegistroTiempo r JOIN FETCH r.operario LEFT JOIN FETCH r.hojaProceso " +
           "WHERE r.operario.dni = :dni AND r.horaFin IS NULL ORDER BY r.horaInicio DESC")
    Optional<RegistroTiempo> findFirstByOperario_DniAndHoraFinIsNullOrderByHoraInicioDesc(@Param("dni") String dni);

    /**
     * Historial de actividades de un operario en una HP específica.
     */
    @Query("SELECT r FROM RegistroTiempo r JOIN FETCH r.operario LEFT JOIN FETCH r.hojaProceso " +
           "WHERE r.operario.dni = :dni AND r.hojaProceso.idHp = :idHp ORDER BY r.horaInicio DESC")
    List<RegistroTiempo> findByOperario_DniAndHojaProceso_IdHpOrderByHoraInicioDesc(@Param("dni") String dni, @Param("idHp") String idHp);

    /**
     * Todas las actividades de un operario, ordenadas por inicio descendente con JOIN FETCH.
     */
    @Query("SELECT r FROM RegistroTiempo r JOIN FETCH r.operario LEFT JOIN FETCH r.hojaProceso " +
           "WHERE r.operario.dni = :dni ORDER BY r.horaInicio DESC")
    List<RegistroTiempo> findByOperario_DniOrderByHoraInicioDesc(@Param("dni") String dni);

    /**
     * Historial de todos los registros de una HP específica con JOIN FETCH.
     */
    @Query("SELECT r FROM RegistroTiempo r JOIN FETCH r.operario LEFT JOIN FETCH r.hojaProceso " +
           "WHERE r.hojaProceso.idHp = :idHp ORDER BY r.horaInicio DESC")
    List<RegistroTiempo> findByHojaProceso_IdHpOrderByHoraInicioDesc(@Param("idHp") String idHp);

    /**
     * Consolidado global de la planta (todos los registros de tiempo con relaciones resueltas).
     */
    @Query("SELECT r FROM RegistroTiempo r JOIN FETCH r.operario LEFT JOIN FETCH r.hojaProceso ORDER BY r.horaInicio DESC")
    List<RegistroTiempo> findAllWithRelations();
}