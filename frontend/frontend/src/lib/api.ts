/**
 * Service API client – Med-Connect ODC
 * Communique exclusivement avec le backend Spring Boot via JWT.
 * Supabase supprimé – persistance assurée par MySQL via JPA.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}
function setToken(token: string): void {
  localStorage.setItem('authToken', token);
}
function removeToken(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;
    try { const err = await response.json(); message = err.message || err.error || message; } catch (_) {}
    throw new Error(message);
  }
  const ct = response.headers.get('content-type') || '';
  if (ct.includes('application/json')) return response.json() as Promise<T>;
  return response.text() as unknown as T;
}

export interface AuthResponse { token: string; role: string; email: string; }
export interface LoginRequest { email: string; password: string; }
export interface AdminLoginRequest { email: string; password: string; secretKey: string; }
export interface RegisterRequest { nom: string; prenom: string; email: string; password: string; telephone: string; adresse?: string; antecedentsMedicaux?: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; newPassword: string; }
export interface NotificationResponse { id: number; message: string; dateEnvoi: string; estLu: boolean; type: string; }
export interface UserProfileUpdateRequest { nom: string; prenom: string; email: string; telephone: string; adresse?: string; antecedentsMedicaux?: string; }
export interface ChangePasswordRequest { oldPassword: string; newPassword: string; }

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    if (res.token) setToken(res.token);
    return res;
  },
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res.token) setToken(res.token);
    return res;
  },
  adminLogin: async (data: AdminLoginRequest): Promise<AuthResponse> => {
    const res = await request<AuthResponse>('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) });
    if (res.token) setToken(res.token);
    return res;
  },
  forgotPassword: (data: ForgotPasswordRequest) => request<string>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: ResetPasswordRequest) => request<string>('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  logout: (): void => removeToken(),
  getToken,
  isAuthenticated: (): boolean => getToken() !== null,
};

export const patientApi = {
  getAllDoctors: () => request<any[]>('/patient/medecins'),
  getDisponibilites: () => request<any[]>('/patient/disponibilites'),
  getDoctorDisponibilites: async (idMedecin: number): Promise<any[]> => {
    const all = await patientApi.getDisponibilites();
    return all.filter((d: any) => d.idMedecin === idMedecin);
  },
  bookAppointment: (data: { idDispo: number; motif: string }) =>
    request<any>('/patient/rendez-vous', { method: 'POST', body: JSON.stringify(data) }),
  getMyAppointments: () => request<any[]>('/patient/rendez-vous'),
  cancelAppointment: (id: number) => request<any>(`/patient/rendez-vous/${id}/annuler`, { method: 'PATCH' }),
  getMedicalHistory: () => request<any[]>('/patient/historique'),
  getMyConsultations: () => request<any[]>('/patient/consultations'),
};

export const medecinApi = {
  createDisponibilite: (data: { dateDebut: string; dateFin: string; duree: number }) =>
    request<any>('/medecin/disponibilites', { method: 'POST', body: JSON.stringify(data) }),
  getDisponibilites: () => request<any[]>('/medecin/disponibilites'),
  getMyAppointments: () => request<any[]>('/medecin/rendez-vous'),
  confirmAppointment: (id: number) => request<any>(`/medecin/rendez-vous/${id}/confirmer`, { method: 'PATCH' }),
  cancelAppointment: (id: number) => request<any>(`/medecin/rendez-vous/${id}/annuler`, { method: 'PATCH' }),
  redigerConsultation: (appointmentId: number, data: { diagnostic: string; notesMedicales?: string; ordonnance?: string }) =>
    request<any>(`/medecin/rendez-vous/${appointmentId}/consultation`, { method: 'POST', body: JSON.stringify(data) }),
  getMyConsultations: () => request<any[]>('/medecin/consultations'),
};

export const adminApi = {
  getUsers: () => request<any[]>('/admin/users'),
  createDoctor: (data: any) => request<any>('/admin/medecins', { method: 'POST', body: JSON.stringify(data) }),
  activateUser: (id: number) => request<any>(`/admin/users/${id}/activer`, { method: 'PATCH' }),
  deactivateUser: (id: number) => request<any>(`/admin/users/${id}/desactiver`, { method: 'PATCH' }),
  getAllAppointments: () => request<any[]>('/admin/rendez-vous'),
  getSpecialites: () => request<any[]>('/admin/specialites'),
};

export const notificationApi = {
  getNotifications: () => request<NotificationResponse[]>('/notifications'),
  markAsRead: (id: number) => request<NotificationResponse>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => request<void>('/notifications/read-all', { method: 'PATCH' }),
};

export const userApi = {
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: UserProfileUpdateRequest) => request<any>('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: ChangePasswordRequest) => request<string>('/users/change-password', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadProfileImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    return request<string>('/users/profile-image', { method: 'POST', body: formData });
  },
};

export default { authApi, patientApi, medecinApi, adminApi, notificationApi, userApi };
