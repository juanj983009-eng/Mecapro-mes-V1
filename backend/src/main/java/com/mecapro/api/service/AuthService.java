package com.mecapro.api.service;

import com.mecapro.api.dto.AuthResponse;
import com.mecapro.api.dto.LoginRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
}
