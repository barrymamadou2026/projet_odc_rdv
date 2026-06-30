package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.RendezVous;
import com.odc.backend_medic.models.enumeration.StatutRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    List<RendezVous> findByPatient_IdPatient(Long idPatient);

    List<RendezVous> findByDisponibilite_Medecin_IdMedecin(Long idMedecin);

    List<RendezVous> findByDisponibilite_Medecin_IdMedecinAndStatut(Long idMedecin, StatutRendezVous statut);

    List<RendezVous> findByPatient_IdPatientAndStatut(Long idPatient, StatutRendezVous statut);

    List<RendezVous> findByDateHeureBetween(LocalDateTime debut, LocalDateTime fin);

    boolean existsByDisponibilite_Medecin_IdMedecinAndDateHeureAndStatutNot(
            Long idMedecin, LocalDateTime dateHeure, StatutRendezVous statutExclu);
}