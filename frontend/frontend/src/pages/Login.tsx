import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, adminSignIn } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [fpOpen, setFpOpen] = useState(false);
  const [fpEmail, setFpEmail] = useState('');
  const [fpLoading, setFpLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        res = await adminSignIn(email, pwd, secretKey);
      } else {
        res = await signIn(email, pwd);
      }
      setLoading(false);
      if (res.error) { setErr(res.error); return; }
      navigate(res.role === 'ADMIN' ? '/admin' : res.role === 'MEDECIN' ? '/doctor' : '/patient');
    } catch {
      setLoading(false);
      setErr("Une erreur inattendue est survenue.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    try {
      
      await authApi.forgotPassword({ email: fpEmail });
      toast.success("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
      setFpOpen(false);
      setFpEmail('');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi.");
    } finally {
      setFpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 h-16 bg-white/80 backdrop-blur border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-orange-500">
            <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <div>
            <span className="font-black text-gray-900">Med<span className="text-orange-500">Connect</span></span>
            <span className="block text-[9px] font-bold text-orange-400 uppercase tracking-widest -mt-0.5">ODC Guinée</span>
          </div>
        </Link>
        <Link to="/help" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">Aide</Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 p-8 sm:p-10 border border-gray-100">
            {/* ODC Badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-500">
                  <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <div>
                  <p className="text-xs font-black text-orange-600">ODC-GUINÉE</p>
                  <p className="text-[10px] text-orange-400">Projet de Fin de Formation</p>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-center text-gray-900">Bienvenue</h1>
            <p className="text-center text-gray-500 text-sm mt-1 mb-8">Accédez à votre espace MedConnect</p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5"><Mail className="w-4 h-4 text-orange-400" /> Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="nom@exemple.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Lock className="w-4 h-4 text-orange-400" /> Mot de passe</label>
                  <Dialog open={fpOpen} onOpenChange={setFpOpen}>
                    <DialogTrigger asChild>
                      <button type="button" className="text-xs text-orange-500 font-semibold hover:underline">Oublié ?</button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Mot de passe oublié</DialogTitle>
                        <DialogDescription>Entrez votre email pour recevoir un lien de réinitialisation.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
                        <Input type="email" placeholder="nom@exemple.com" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required />
                        <Button type="submit" disabled={fpLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
                          {fpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Envoyer le lien
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <input value={pwd} onChange={e => setPwd(e.target.value)} type={show ? 'text' : 'password'} required placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Clé secrète administrateur</label>
                  <input value={secretKey} onChange={e => setSecretKey(e.target.value)} type="password" required placeholder="Clé secrète..."
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-orange-50 outline-none focus:ring-2 focus:ring-orange-400 transition" />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                Connexion administrateur
              </label>

              {err && <p className="text-sm text-red-600 text-center bg-red-50 rounded-xl py-2">{err}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Pas encore de compte ? <Link to="/signup" className="font-bold text-orange-500 hover:underline">S'inscrire</Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">Projet de Fin de Formation – ODC Guinée 2026</p>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        <div className="flex justify-center gap-4">
          <Link to="/legal" className="hover:text-orange-500">Mentions légales</Link>
          <Link to="/privacy" className="hover:text-orange-500">Confidentialité</Link>
          <Link to="/terms" className="hover:text-orange-500">CGU</Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
