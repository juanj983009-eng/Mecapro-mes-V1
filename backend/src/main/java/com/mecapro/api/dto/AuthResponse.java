package com.mecapro.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String dni;
    private String nombreCompleto;
    private String puesto;
    private String area;
}
