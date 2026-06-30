-- ============================================================
-- SCRIPT DE CREATION DE LA BASE DE DONNEES MEDICALE
-- ============================================================

CREATE DATABASE IF NOT EXISTS odc_medical_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE odc_medical_db;

-- ============================================================
-- TABLES DE REFERENCE
-- ============================================================

CREATE TABLE specialites (
    id_specialite BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    INDEX idx_specialite_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE roles (
    id_role BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom ENUM('PATIENT', 'MEDECIN', 'ADMIN') NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES UTILISATEURS (GENERIQUE)
-- ============================================================
CREATE TABLE utilisateurs (
    id_utilisateur BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    id_role BIGINT NOT NULL,
    est_actif BOOLEAN DEFAULT TRUE,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_role) REFERENCES roles(id_role),
    INDEX idx_utilisateur_email (email),
    INDEX idx_utilisateur_role (id_role)
) ENGINE=InnoDB;

-- ============================================================
-- TABLES SPECIFIQUES PAR ROLE (HERITAGE 1:1)
-- ============================================================

CREATE TABLE medecins (
    id_medecin BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL UNIQUE,
    id_specialite BIGINT,
    telephone VARCHAR(20),
    adresse TEXT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_specialite) REFERENCES specialites(id_specialite),
    INDEX idx_medecin_specialite (id_specialite)
) ENGINE=InnoDB;

CREATE TABLE patients (
    id_patient BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    antecedents_medicaux TEXT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES DISPONIBILITES
-- ============================================================
CREATE TABLE disponibilites (
    id_dispo BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_medecin BIGINT NOT NULL,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    duree INT NOT NULL COMMENT 'Durée en minutes',
    est_libre BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_medecin) REFERENCES medecins(id_medecin) ON DELETE CASCADE,
    CONSTRAINT chk_dates CHECK (date_fin > date_debut),
    INDEX idx_dispo_medecin (id_medecin),
    INDEX idx_dispo_date_debut (date_debut)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES RENDEZ-VOUS
-- ============================================================
CREATE TABLE rendez_vous (
    id_rdv BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_patient BIGINT NOT NULL,
    id_dispo BIGINT NOT NULL,
    date_heure DATETIME NOT NULL,
    duree INT NOT NULL COMMENT 'Durée en minutes',
    statut ENUM('ATTENTE', 'CONFIRME', 'ANNULE', 'TERMINE') DEFAULT 'ATTENTE',
    motif TEXT,
    FOREIGN KEY (id_patient) REFERENCES patients(id_patient) ON DELETE CASCADE,
    FOREIGN KEY (id_dispo) REFERENCES disponibilites(id_dispo) ON DELETE CASCADE,
    INDEX idx_rdv_patient (id_patient),
    INDEX idx_rdv_dispo (id_dispo),
    INDEX idx_rdv_date_heure (date_heure),
    CONSTRAINT chk_rdv_duree CHECK (duree > 0)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES CONSULTATIONS (CORRIGÉE : NOT NULL + RESTRICT)
-- ============================================================
CREATE TABLE consultations (
    id_consultation BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_rdv BIGINT NOT NULL UNIQUE,
    date_consultation DATETIME NOT NULL,
    diagnostic TEXT,
    notes_medicales TEXT,
    ordonnance TEXT,
    FOREIGN KEY (id_rdv) REFERENCES rendez_vous(id_rdv) ON DELETE RESTRICT,
    INDEX idx_consultation_rdv (id_rdv)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id_notification BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    est_lu BOOLEAN DEFAULT FALSE,
    type ENUM('INFO', 'ALERTE', 'RAPPEL') DEFAULT 'INFO',
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_notification_utilisateur (id_utilisateur),
    INDEX idx_notification_date (date_envoi)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE DES LOGS (AUDIT)
-- ============================================================
CREATE TABLE logs (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur BIGINT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    date_action DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL,
    INDEX idx_log_utilisateur (id_utilisateur),
    INDEX idx_log_action (action),
    INDEX idx_log_date (date_action)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB;

-- Mise à jour de la table utilisateurs pour l'image de profil
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255) DEFAULT NULL;