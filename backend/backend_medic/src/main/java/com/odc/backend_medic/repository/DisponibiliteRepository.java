package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Disponibilite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    List<Disponibilite> findByMedecin_IdMedecin(Long idMedecin);

    List<Disponibilite> findByMedecin_IdMedecinAndEstLibreTrue(Long idMedecin);

    List<Disponibilite> findByEstLibreTrueAndDateDebutAfterOrderByDateDebutAsc(LocalDateTime apres);

    Optional<Disponibilite> findFirstByMedecin_IdMedecinAndEstLibreTrueAndDateDebutLessThanEqualAndDateFinGreaterThan(
            Long idMedecin, LocalDateTime debut, LocalDateTime fin);
}