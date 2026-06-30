package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByRendezVous_IdRdv(Long idRdv);

    List<Consultation> findByRendezVous_Patient_IdPatient(Long idPatient);

    List<Consultation> findByRendezVous_Disponibilite_Medecin_IdMedecin(Long idMedecin);
}