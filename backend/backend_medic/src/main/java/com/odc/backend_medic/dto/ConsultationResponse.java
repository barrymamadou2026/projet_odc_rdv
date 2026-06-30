package com.odc.backend_medic.dto;

import com.odc.backend_medic.models.Consultation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationResponse {

    private Long idConsultation;
    private LocalDateTime dateConsultation;
    private String diagnostic;
    private String notesMedicales;
    private Long idRdv;

    public static ConsultationResponse fromEntity(Consultation c) {
        return ConsultationResponse.builder()
                .idConsultation(c.getIdConsultation())
                .dateConsultation(c.getDateConsultation())
                .diagnostic(c.getDiagnostic())
                .notesMedicales(c.getNotesMedicales())
                .idRdv(c.getRendezVous().getIdRdv())
                .build();
    }
}
