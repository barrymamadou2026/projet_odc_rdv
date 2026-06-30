import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ first: '', last: '', email: '', pwd: '', telephone: '', accept: false });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!form.accept) { setErr('Veuillez accepter les conditions.'); return; }
    if (!form.telephone) { setErr('Le numéro de téléphone est obligatoire.'); return; }
    
    setLoading(true);
    const name = `${form.first} ${form.last}`.trim();
    const res = await signUp(form.email, form.pwd, name, form.telephone, 'PATIENT');
    setLoading(false);
    
    if (res.error) { setErr(res.error); return; }
    navigate('/patient');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-6 sm:px-10 h-20">
        <span className="text-2xl font-extrabold text-orange-500 flex items-center gap-2">Medic_RDV</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Déjà inscrit ?</span>
          <Link to="/login" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Se connecter</Link>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2 gap-10 max-w-7xl mx-auto w-full px-6 sm:px-10 py-8 items-center">
        {/* Left */}
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">Espace Patient</span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">Prenez soin de votre santé, simplement.</h1>
          <p className="mt-5 text-gray-500 max-w-md">La plateforme moderne qui vous connecte aux meilleurs professionnels de santé. Prenez rendez-vous en quelques clics.</p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <ShieldCheck className="w-6 h-6 text-orange-500 mb-3" />
              <p className="font-bold text-gray-900">Sécurité Maximale</p>
              <p className="text-sm text-gray-500">Vos données de santé sont protégées.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Zap className="w-6 h-6 text-blue-600 mb-3" />
              <p className="font-bold text-gray-900">Rapidité</p>
              <p className="text-sm text-gray-500">Confirmation immédiate de vos RDV.</p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-gray-900">Créer un compte</h2>
          <p className="text-gray-500 mt-2">Inscrivez-vous pour accéder à votre espace santé.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Prénom</label>
                <input value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} placeholder="Ex: Lucas" required className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <input value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} placeholder="Ex: Martin" required className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Adresse E-mail</label>
              <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500">
                <Mail className="w-4 h-4 text-gray-400" />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required placeholder="nom@exemple.com" className="flex-1 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Numéro de téléphone</label>
              <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500">
                <Phone className="w-4 h-4 text-gray-400" />
                <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} type="tel" required placeholder="06 XX XX XX XX" className="flex-1 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
              <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-orange-500">
                <Lock className="w-4 h-4 text-gray-400" />
                <input value={form.pwd} onChange={(e) => setForm({ ...form, pwd: e.target.value })} type={show ? 'text' : 'password'} required placeholder="••••••••" className="flex-1 outline-none" />
                <button type="button" onClick={() => setShow(!show)} className="text-gray-400">{show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} className="mt-1" />
              <span>J'accepte les <span className="text-orange-600 font-semibold">Conditions Générales</span>.</span>
            </label>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? 'Inscription...' : <>S'inscrire <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>

      <footer className="px-10 py-6 text-xs text-gray-400 text-center">
        <span>© 2024 Medic_RDV. Tous droits réservés.</span>
      </footer>
    </div>
  );
};

export default Signup;
