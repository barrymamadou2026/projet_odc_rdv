import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { initPushNotifications } from '@/lib/firebase';

type Role = 'PATIENT' | 'MEDECIN' | 'ADMIN';

interface AuthCtx {
  user: any | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: Role }>;
  signUp: (email: string, password: string, fullName: string, telephone: string, role: Role) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  adminSignIn: (email: string, password: string, secretKey: string) => Promise<{ error?: string; role?: Role }>;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    const storedEmail = localStorage.getItem('userEmail');
    if (token && storedRole && storedEmail) {
      setUser({ email: storedEmail });
      setRole(storedRole as Role);
      initPushNotifications();
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('userRole', res.role);
      localStorage.setItem('userEmail', res.email);
      setUser({ email: res.email });
      setRole(res.role as Role);
      initPushNotifications();
      return { role: res.role as Role };
    } catch (err: any) {
      return { error: err.message || 'Identifiants incorrects' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, telephone: string, _role: Role) => {
    try {
      const parts = fullName.trim().split(' ');
      const prenom = parts[0];
      const nom = parts.slice(1).join(' ') || prenom;
      // Le compte n'est pas connecté automatiquement : un email de vérification
      // doit être confirmé avant la première connexion (aucun token n'est
      // renvoyé par le backend à l'inscription).
      await authApi.register({ nom, prenom, email, password, telephone });
      return {};
    } catch (err: any) {
      return { error: err.message || "Erreur lors de l'inscription" };
    }
  };

  const adminSignIn = async (email: string, password: string, secretKey: string) => {
    try {
      const res = await authApi.adminLogin({ email, password, secretKey });
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('userRole', res.role);
      localStorage.setItem('userEmail', res.email);
      setUser({ email: res.email });
      setRole(res.role as Role);
      return { role: res.role as Role };
    } catch (err: any) {
      return { error: err.message || 'Clé secrète ou identifiants incorrects' };
    }
  };

  const signOut = async () => {
    authApi.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  };

  return (
    <Ctx.Provider value={{ user, role, loading, signIn, signUp, signOut, adminSignIn }}>
      {children}
    </Ctx.Provider>
  );
};

export const RequireRole: React.FC<{ role?: Role; children: React.ReactNode }> = ({ role: need, children }) => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) { navigate('/login', { replace: true }); return; }
      if (need && role !== need) {
        const dest = role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient';
        navigate(dest, { replace: true });
      }
    }
  }, [loading, user, role, need, navigate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-orange-500 shadow-lg">
        <img src="/images/odc-logo.png" alt="ODC" className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
      </div>
      <p className="text-gray-400 text-sm font-semibold animate-pulse">Chargement...</p>
      <p className="text-xs text-gray-300">MedConnect ODC · Guinée</p>
    </div>
  );

  if (!user || (need && role !== need)) return null;
  return <>{children}</>;
};
