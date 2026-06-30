import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de réinitialisation manquant.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de réinitialisation invalide ou manquant.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      toast.success('Votre mot de passe a été réinitialisé avec succès.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation du mot de passe.');
      toast.error(err.message || 'Erreur lors de la réinitialisation du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">Réinitialiser le mot de passe</h1>
        <p className="text-center text-gray-500 mt-2">Entrez votre nouveau mot de passe.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Lock className="w-4 h-4" /> Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Lock className="w-4 h-4" /> Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold text-lg transition-colors">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Réinitialiser le mot de passe
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
