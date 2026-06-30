import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Globe, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInGoogle, adminSignIn } = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      let res;
      if (isAdmin) {
        // Connexion admin utilisant adminSignIn du contexte
        res = await adminSignIn(email, pwd, secretKey);
      } else {
        // Connexion patient/médecin
        res = await signIn(email, pwd);
      }

      setLoading(false);
      if (res.error) { 
        setErr(res.error); 
        return; 
      }
      
      // Redirection basée sur le rôle retourné
      navigate(res.role === 'ADMIN' ? '/admin' : res.role === 'MEDECIN' ? '/doctor' : '/patient');
    } catch (error: unknown) {
      setLoading(false);
      setErr("Une erreur inattendue est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 h-20">
        <span className="text-2xl font-extrabold text-orange-500">Medic_RDV</span>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Besoin d'aide ?</span>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><Globe className="w-4 h-4 text-gray-600" /></button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          <h1 className="text-3xl font-extrabold text-center text-gray-900">Bon retour</h1>
          <p className="text-center text-gray-500 mt-2">Accédez à votre espace professionnel Medic_RDV</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Mail className="w-4 h-4" /> Adresse e-mail ou Identifiant</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" required placeholder="nom@exemple.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Lock className="w-4 h-4" /> Mot de passe</label>
	                <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
	                  <DialogTrigger asChild>
	                    <button type="button" className="text-sm text-blue-600 font-medium hover:underline">Oublié ?</button>
	                  </DialogTrigger>
	                  <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6">
	                    <DialogHeader>
	                      <DialogTitle className="text-xl font-bold text-gray-900">Mot de passe oublié ?</DialogTitle>
	                      <DialogDescription>
	                        Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
	                      </DialogDescription>
	                    </DialogHeader>
	                    <form onSubmit={async (e) => {
	                      e.preventDefault();
	                      setForgotPasswordLoading(true);
	                      try {
	                        const { authApi } = await import('@/lib/api');
	                        await authApi.forgotPassword({ email: forgotPasswordEmail });
	                        toast.success("Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.");
	                        setIsForgotPasswordModalOpen(false);
	                        setForgotPasswordEmail('');
	                      } catch (error: any) {
	                        toast.error(error.message || "Erreur lors de l'envoi du lien de réinitialisation.");
	                      } finally {
	                        setForgotPasswordLoading(false);
	                      }
	                    }} className="grid gap-4 py-4">
	                      <div className="grid gap-2">
	                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Adresse e-mail</label>
	                        <Input
	                          id="email"
	                          type="email"
	                          placeholder="nom@exemple.com"
	                          value={forgotPasswordEmail}
	                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
	                          required
	                        />
	                      </div>
	                      <Button type="submit" disabled={forgotPasswordLoading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold">
	                        {forgotPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
	                        Envoyer le lien de réinitialisation
	                      </Button>
	                    </form>
	                  </DialogContent>
	                </Dialog>
              </div>
              <div className="relative">
                <input value={pwd} onChange={(e) => setPwd(e.target.value)} type={show ? 'text' : 'password'} required placeholder="••••••••" className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isAdmin && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"><Lock className="w-4 h-4" /> Clé secrète admin</label>
                <input value={secretKey} onChange={(e) => setSecretKey(e.target.value)} type="password" required placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="w-4 h-4" /> Connexion administrateur
            </label>

            {err && <p className="text-sm text-red-600 text-center">{err}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold text-lg transition-colors">
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>



          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">OU</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={() => signInGoogle()} className="w-full py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="text-lg font-bold text-blue-500">G</span> Connexion avec Google Workspace
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Nouveau sur Medic_RDV ? <Link to="/signup" className="font-bold text-orange-600">Créer un compte praticien</Link>
          </p>
        </div>
      </div>

      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 px-6 sm:px-10 py-6 text-xs text-gray-400">
        <span>© 2024 Medic_RDV. Tous droits réservés.</span>
        <div className="flex gap-6">
          <Link to="/legal" className="hover:text-orange-500 transition-colors">Mentions Légales</Link>
          <Link to="/privacy" className="hover:text-orange-500 transition-colors">Politique de Confidentialité</Link>
          <Link to="/terms" className="hover:text-orange-500 transition-colors">Conditions Générales</Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;
