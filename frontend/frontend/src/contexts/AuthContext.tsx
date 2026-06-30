import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/lib/api';

type Role = 'PATIENT' | 'MEDECIN' | 'ADMIN';

interface AuthCtx {
  user: any | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: Role }>;
  signUp: (email: string, password: string, fullName: string, telephone: string, role: Role) => Promise<{ error?: string }>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, password: string, secretKey: string) => Promise<{ error?: string; role?: Role }>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialiser l'utilisateur depuis le localStorage au chargement
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    const storedEmail = localStorage.getItem('userEmail');

    if (token && storedRole && storedEmail) {
      setUser({ email: storedEmail });
      setRole(storedRole as Role);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Stocker les informations d'authentification
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userEmail', response.email);

      setUser({ email: response.email });
      setRole(response.role as Role);

      return { role: response.role as Role };
    } catch (error: any) {
      return { error: error.message || 'Erreur de connexion' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, telephone: string, role: Role) => {
    try {
      // Diviser le nom complet en prénom et nom
      const nameParts = fullName.trim().split(' ');
      const prenom = nameParts[0];
      const nom = nameParts.slice(1).join(' ') || prenom;

      // Convertir le rôle du format frontend au format backend
      const backendRole = role === 'PATIENT' ? 'PATIENT' : role === 'MEDECIN' ? 'MEDECIN' : 'ADMIN';

      const response = await authApi.register({
        nom,
        prenom,
        email,
        password,
        telephone,
        adresse: '',
        antecedentsMedicaux: '',
      });

      // Stocker les informations d'authentification
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userEmail', response.email);

      setUser({ email: response.email });
      setRole(response.role as Role);

      return {};
    } catch (error: any) {
      return { error: error.message || 'Erreur lors de l\'inscription' };
    }
  };

  const adminSignIn = async (email: string, password: string, secretKey: string) => {
    try {
      const response = await authApi.adminLogin({ email, password, secretKey });

      // Stocker les informations d'authentification
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userEmail', response.email);

      setUser({ email: response.email });
      setRole(response.role as Role);

      return { role: response.role as Role };
    } catch (error: any) {
      return { error: error.message || 'Erreur de connexion admin' };
    }
  };

  const signInGoogle = async () => {
    // Google OAuth n'est pas implémenté côté backend pour le moment
    // Cette fonction peut être laissée vide ou afficher un message
    console.log('Google OAuth non disponible pour le moment');
  };

  const signOut = async () => {
    authApi.logout();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setUser(null);
    setRole(null);
  };

  return (
    <Ctx.Provider value={{ user, role, loading, signIn, signUp, signInGoogle, signOut, adminSignIn }}>
      {children}
    </Ctx.Provider>
  );
};

export const RequireRole: React.FC<{ role?: Role; children: React.ReactNode }> = ({ role: need, children }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>;
  if (!user) { window.location.href = '/login'; return null; }
  if (need && role !== need) {
    const dest = role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient';
    window.location.href = dest; return null;
  }
  return <>{children}</>;
};
