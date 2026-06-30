package com.odc.backend_medic.repository;

import com.odc.backend_medic.models.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {
    Optional<Specialite> findByNom(String nom);
}