package com.mecapro.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "El DNI es obligatorio")
    private String dni;
    
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}
