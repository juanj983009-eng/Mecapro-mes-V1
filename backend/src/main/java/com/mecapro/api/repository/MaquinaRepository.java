package com.mecapro.api.repository;

import com.mecapro.api.entity.Maquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaquinaRepository extends JpaRepository<Maquina, Integer> {
    List<Maquina> findByActivoTrue();
}
