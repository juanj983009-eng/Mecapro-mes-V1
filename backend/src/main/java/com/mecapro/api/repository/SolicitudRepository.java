package com.mecapro.api.repository;

import com.mecapro.api.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByEstadoSolicitudOrderByFechaSolicitudAsc(Solicitud.EstadoSolicitud estado);

    List<Solicitud> findByOperario_DniOrderByFechaSolicitudDesc(String dni);

    List<Solicitud> findByRecurso_TipoRecursoAndEstadoSolicitudOrderByFechaSolicitudAsc(
            com.mecapro.api.entity.Recurso.TipoRecurso tipo,
            Solicitud.EstadoSolicitud estado);
}
