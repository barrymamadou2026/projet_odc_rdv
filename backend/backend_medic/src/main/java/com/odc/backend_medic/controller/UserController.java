package com.odc.backend_medic.controller;

import com.odc.backend_medic.dto.ChangePasswordRequest;
import com.odc.backend_medic.dto.UserProfileUpdateRequest;
import com.odc.backend_medic.dto.UserResponse;
import com.odc.backend_medic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getUserProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfileResponse(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @Valid @RequestBody UserProfileUpdateRequest request) {
        try {
            UserResponse updatedUser = userService.updateProfile(authentication.getName(), request);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(authentication.getName(), request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Mot de passe modifié avec succès.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/profile-image")
    public ResponseEntity<String> uploadProfileImage(Authentication authentication, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = userService.uploadProfileImage(authentication.getName(), file);
            return ResponseEntity.ok(imageUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors du téléchargement de l'image: " + e.getMessage());
        }
    }

    @GetMapping("/profile-image")
    public ResponseEntity<String> getProfileImage(Authentication authentication) {
        return userService.getProfileImageUrl(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
