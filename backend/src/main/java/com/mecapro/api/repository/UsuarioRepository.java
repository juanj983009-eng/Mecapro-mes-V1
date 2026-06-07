package com.mecapro.api.repository;

import com.mecapro.api.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    List<Usuario> findByActivoTrue();

    List<Usuario> findByArea_IdArea(Integer idArea);
}
