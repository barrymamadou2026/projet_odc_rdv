package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser_Email(String email);
    Optional<Patient> findByUser_IdUtilisateur(Long idUtilisateur);
}