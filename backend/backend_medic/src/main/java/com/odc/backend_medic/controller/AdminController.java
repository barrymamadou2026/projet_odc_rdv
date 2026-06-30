package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.CreateMedecinRequest;
import com.odc.backend_medic.dto.RendezVousResponse;
import com.odc.backend_medic.dto.UserResponse;
import com.odc.backend_medic.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<UserResponse> listerUtilisateurs() {
        return adminService.getAllUsers();
    }

    @PostMapping("/medecins")
    public ResponseEntity<UserResponse> creerMedecin(@Valid @RequestBody CreateMedecinRequest request) {
        return adminService.createMedecin(request)
                .map(medecin -> ResponseEntity.status(HttpStatus.CREATED).body(medecin))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @PatchMapping("/users/{id}/desactiver")
    public ResponseEntity<UserResponse> desactiver(@PathVariable("id") Long idUtilisateur) {
        return adminService.changeUserActivity(idUtilisateur, false)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/users/{id}/activer")
    public ResponseEntity<UserResponse> activer(@PathVariable("id") Long idUtilisateur) {
        return adminService.changeUserActivity(idUtilisateur, true)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rendez-vous")
    public List<RendezVousResponse> tousLesRendezVous() {
        return adminService.getAllRendezVous();
    }

    @GetMapping("/specialites")
    public ResponseEntity<List<com.odc.backend_medic.models.Specialite>> getAllSpecialites() {
        return ResponseEntity.ok(adminService.getAllSpecialites());
    }
}