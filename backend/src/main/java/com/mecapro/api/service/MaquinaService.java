package com.mecapro.api.service;

import com.mecapro.api.dto.MaquinaDTO;
import java.util.List;

public interface MaquinaService {
    List<MaquinaDTO> listarTodasActivas();
}
