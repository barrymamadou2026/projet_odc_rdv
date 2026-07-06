import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first: '', last: '', email: '', phone: '', password: '', confirm: '' });
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) { setErr("Les mots de passe ne correspondent pas."); return; }
    if (form.password.length < 6) { setErr("Le mot de passe doit contenir au moins 6 caractères."); return; }
    setLoading(true);
    try {
      const res = await signUp(form.email, form.password, `${form.first} ${form.last}`, form.phone, 'PATIENT');
      if (res.error) { setErr(res.error); setLoading(false); return; }
      toast.success("Compte créé ! Un email de confirmation vous a été envoyé — pensez à vérifier votre adresse pour vos prochaines connexions.");
      navigate('/patient');
    } catch {
      setErr("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
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
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 p-8 sm:p-10 border border-gray-100">
            <div className="flex justify-center mb-5">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-orange-500">
                  <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <span className="text-xs font-black text-orange-600">ODC-GUINÉE</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-center text-gray-900">Créer un compte</h1>
            <p className="text-center text-gray-500 text-sm mt-1 mb-7">Inscription gratuite en tant que Patient</p>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form.first} onChange={set('first')} required placeholder="Mamadou" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom *</label>
                  <input value={form.last} onChange={set('last')} required placeholder="Barry" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={form.email} onChange={set('email')} required placeholder="email@exemple.com" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.phone} onChange={set('phone')} required placeholder="+224 620 000 000" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')} required placeholder="••••••••" className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Confirmer le mot de passe *</label>
                <input type="password" value={form.confirm} onChange={set('confirm')} required placeholder="••••••••" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                />
                <span className="text-xs text-gray-500 leading-snug">
                  J'accepte de recevoir par email les actualités et offres de MedConnect ODC (facultatif — vous recevrez toujours les emails liés à votre compte et vos rendez-vous, indépendamment de ce choix).
                </span>
              </label>

              {err && <p className="text-sm text-red-600 bg-red-50 rounded-xl py-2 text-center">{err}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Déjà inscrit ? <Link to="/login" className="font-bold text-orange-500 hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
