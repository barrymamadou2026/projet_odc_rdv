import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    if (newPwd.length < 6) { toast.error("Minimum 6 caractères requis."); return; }
    if (!token) { toast.error("Token de réinitialisation manquant."); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: newPwd });
      toast.success("Mot de passe réinitialisé ! Vous pouvez vous connecter.");
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      <header className="flex items-center px-6 h-16 bg-white/80 backdrop-blur border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-orange-500">
            <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <div>
            <span className="font-black text-gray-900">Med<span className="text-orange-500">Connect</span></span>
            <span className="block text-[9px] font-bold text-orange-400 uppercase tracking-widest -mt-0.5">ODC Guinée</span>
          </div>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-orange-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-center text-gray-900">Réinitialiser le mot de passe</h1>
          <p className="text-center text-gray-500 text-sm mt-2 mb-7">Choisissez un nouveau mot de passe sécurisé.</p>

          {!token ? (
            <div className="text-center py-6">
              <p className="text-red-500 font-semibold">Lien invalide ou expiré.</p>
              <Link to="/login" className="mt-4 inline-block text-orange-500 font-bold hover:underline">Retour à la connexion</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} required value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirmer</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Réinitialisation...' : 'Confirmer'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-orange-500 font-bold hover:underline">Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
