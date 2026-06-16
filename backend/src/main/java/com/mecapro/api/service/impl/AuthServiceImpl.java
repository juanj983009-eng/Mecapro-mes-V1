package com.mecapro.api.service.impl;

import com.mecapro.api.config.JwtTokenProvider;
import com.mecapro.api.dto.AuthResponse;
import com.mecapro.api.dto.LoginRequest;
import com.mecapro.api.entity.Usuario;
import com.mecapro.api.exception.BusinessRuleException;
import com.mecapro.api.service.AuthService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserDetailsService userDetailsService,
                           JwtTokenProvider jwtTokenProvider,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        Usuario usuario;
        try {
            usuario = (Usuario) userDetailsService.loadUserByUsername(request.getDni());
        } catch (UsernameNotFoundException ex) {
            throw new BusinessRuleException("DNI no registrado en el sistema.");
        }

        if (!usuario.getActivo()) {
            throw new BusinessRuleException("El usuario está inactivo. Contacte a administración.");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new BusinessRuleException("Contraseña incorrecta.");
        }

        String token = jwtTokenProvider.generarToken(usuario.getDni(), usuario.getPuesto());
        String nombreArea = usuario.getArea() != null ? usuario.getArea().getNombreArea() : "Sin Área";

        return new AuthResponse(
                token,
                usuario.getDni(),
                usuario.getNombreCompleto(),
                usuario.getPuesto(),
                nombreArea
        );
    }
}
