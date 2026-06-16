package com.mecapro.api.service.impl;

import com.mecapro.api.dto.MaquinaDTO;
import com.mecapro.api.repository.MaquinaRepository;
import com.mecapro.api.service.MaquinaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MaquinaServiceImpl implements MaquinaService {

    private final MaquinaRepository maquinaRepository;

    public MaquinaServiceImpl(MaquinaRepository maquinaRepository) {
        this.maquinaRepository = maquinaRepository;
    }

    @Override
    public List<MaquinaDTO> listarTodasActivas() {
        return maquinaRepository.findByActivoTrue().stream()
                .map(MaquinaDTO::from)
                .collect(Collectors.toList());
    }
}
