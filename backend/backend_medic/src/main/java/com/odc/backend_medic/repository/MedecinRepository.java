package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Medecin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {
    Optional<Medecin> findByUser_Email(String email);
    Optional<Medecin> findByUser_IdUtilisateur(Long idUtilisateur);
}