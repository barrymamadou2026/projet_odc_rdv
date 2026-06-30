/**
 * Service API client pour communiquer avec le backend Spring Boot.
 * Centralise tous les appels HTTP et gère les tokens JWT.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

interface AuthResponse {
  token: string;
  role: string;
  email: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AdminLoginRequest {
  email: string;
  password: string;
  secretKey: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface NotificationResponse {
  id: number;
  message: string;
  dateEnvoi: string;
  estLu: boolean;
  type: string;
}

interface UserProfileUpdateRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  antecedentsMedicaux?: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  adresse?: string;
  antecedentsMedicaux?: string;
}

/**
 * Récupère le token JWT du localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Stocke le token JWT dans le localStorage
 */
function setToken(token: string): void {
  localStorage.setItem('authToken', token);
}

/**
 * Supprime le token JWT du localStorage
 */
function removeToken(): void {
  localStorage.removeItem('authToken');
}

/**
 * Effectue une requête HTTP avec gestion automatique du token
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API d'authentification
 */
export const authApi = {
  forgotPassword: async (data: ForgotPasswordRequest): Promise<string> => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<string> => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  /**
   * Inscription d'un patient
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  /**
   * Connexion patient/médecin
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  /**
   * Connexion admin
   */
  adminLogin: async (credentials: AdminLoginRequest): Promise<AuthResponse> => {
    const response = await request<AuthResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      setToken(response.token);
    }
    return response;
  },

  /**
   * Déconnexion (supprime le token local)
   */
  logout: (): void => {
    removeToken();
  },

  /**
   * Récupère le token actuel
   */
  getToken,

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated: (): boolean => {
    return getToken() !== null;
  },
};

/**
 * API Patient
 */
export const patientApi = {
  /**
   * Récupère la liste de tous les médecins pour la page FindDoctors
   */
  getAllDoctors: async () => {
    return request('/patient/medecins', { method: 'GET' });
  },

  /**
   * Récupère les créneaux libres d'un médecin spécifique
   */
  getDoctorDisponibilites: async (idMedecin: number) => {
    // Le backend n'a pas d'endpoint spécifique pour les disponibilités d'un médecin via /patient/medecins/{id}/disponibilites
    // On récupère toutes les disponibilités et on filtre côté frontend
    const allDispos = await request('/patient/disponibilites', { method: 'GET' });
    return allDispos.filter((dispo: any) => dispo.idMedecin === idMedecin);
  },

  /**
   * Récupère toutes les disponibilités globales
   */
  getDisponibilites: async () => {
    return request('/patient/disponibilites', { method: 'GET' });
  },

  /**
   * Prend un rendez-vous
   */
  bookAppointment: async (data: any) => {
    return request('/patient/rendez-vous', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupère les rendez-vous du patient
   */
  getMyAppointments: async () => {
    return request('/patient/rendez-vous', { method: 'GET' });
  },
  
  getMyConsultations: async () => {
    return request('/patient/consultations', { method: 'GET' });
  },

  /**
   * Annule un rendez-vous
   */
  cancelAppointment: async (id: number) => {
    return request(`/patient/rendez-vous/${id}/annuler`, { method: 'PATCH' });
  },

  /**
   * Récupère l'historique médical
   */
  getMedicalHistory: async () => {
    return request('/patient/historique', { method: 'GET' });
  },
};

/**
 * API Médecin
 */
export const medecinApi = {
  /**
   * Crée une disponibilité
   */
  createDisponibilite: async (data: any) => {
    return request('/medecin/disponibilites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupère les disponibilités du médecin
   */
  getDisponibilites: async () => {
    return request('/medecin/disponibilites', { method: 'GET' });
  },

  /**
   * Récupère les rendez-vous du médecin
   */
  getMyAppointments: async () => {
    return request('/medecin/rendez-vous', { method: 'GET' });
  },
  
  /**
   * AJUSTEMENT : Dans MedecinController, vos actions sur l'historique passent par les rendez-vous
   */
  getMyConsultations: async () => {
    return request('/patient/consultations', { method: 'GET' });
  },

  /**
   * Confirme un rendez-vous
   */
  confirmAppointment: async (id: number) => {
    return request(`/medecin/rendez-vous/${id}/confirmer`, { method: 'PATCH' });
  },

  /**
   * Annule un rendez-vous
   */
  cancelAppointment: async (id: number) => {
    return request(`/medecin/rendez-vous/${id}/annuler`, { method: 'PATCH' });
  },

  /**
   * Crée une consultation
   */
  redigerConsultation: async (appointmentId: number, data: any) => {
    return request(`/medecin/rendez-vous/${appointmentId}/consultation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * API Admin
 */
export const notificationApi = {
  getNotifications: async (): Promise<NotificationResponse[]> => {
    return request('/notifications', { method: 'GET' });
  },

  markNotificationAsRead: async (id: number): Promise<NotificationResponse> => {
    return request(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    return request('/notifications/read-all', { method: 'PATCH' });
  },
};

export const userApi = {
  getUserProfile: async (): Promise<any> => {
    return request('/users/profile', { method: 'GET' });
  },

  updateProfile: async (data: UserProfileUpdateRequest): Promise<any> => {
    return request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  changePassword: async (data: ChangePasswordRequest): Promise<string> => {
    return request('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/users/profile-image', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' }, // Important for file uploads
    });
  },

  getProfileImage: async (): Promise<string> => {
    return request('/users/profile-image', { method: 'GET' });
  },
};

export const adminApi = {
  /**
   * Récupère la liste des utilisateurs
   */
  getUsers: async () => {
    return request('/admin/users', { method: 'GET' });
  },

  /**
   * Crée un médecin
   */
  createDoctor: async (data: any) => {
    return request('/admin/medecins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Active un utilisateur
   */
  activateUser: async (id: number) => {
    return request(`/admin/users/${id}/activer`, { method: 'PATCH' });
  },

  /**
   * Désactive un utilisateur
   */
  deactivateUser: async (id: number) => {
    return request(`/admin/users/${id}/desactiver`, { method: 'PATCH' });
  },

  /**
   * Récupère tous les rendez-vous
   */
  getAllAppointments: async () => {
    return request('/admin/rendez-vous', { method: 'GET' });
  },
  
  getSpecialites: async () => {
    return request('/admin/specialites', { method: 'GET' });
  },
};

export default {
  authApi,
  patientApi,
  medecinApi,
  adminApi,
  notificationApi,
  userApi,
};