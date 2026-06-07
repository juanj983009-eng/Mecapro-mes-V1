package com.mecapro.api.controller;

import com.mecapro.api.config.JwtTokenProvider;
import com.mecapro.api.dto.AuthResponse;
import com.mecapro.api.dto.LoginRequest;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UsuarioRepository usuarioRepository, 
                          JwtTokenProvider jwtTokenProvider, 
                          BCryptPasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getDni())
                .orElseThrow(() -> new BusinessRuleException("DNI no registrado en el sistema."));

        if (!usuario.getActivo()) {
            throw new BusinessRuleException("El usuario está inactivo. Contacte a administración.");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new BusinessRuleException("Contraseña incorrecta.");
        }

        String token = jwtTokenProvider.generarToken(usuario.getDni(), usuario.getPuesto());
        String nombreArea = usuario.getArea() != null ? usuario.getArea().getNombreArea() : "Sin Área";

        AuthResponse response = new AuthResponse(
                token,
                usuario.getDni(),
                usuario.getNombreCompleto(),
                usuario.getPuesto(),
                nombreArea
        );

        return ResponseEntity.ok(response);
    }
}
