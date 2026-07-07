import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Activity, ArrowRight, ShieldCheck,
  Stethoscope, BellRing, Phone, FileText,
} from 'lucide-react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';
import { publicApi, PublicStats } from '@/lib/api';

const SERVICES = [
  { title: 'Dossier Digital', description: "Accédez à votre historique médical complet, ordonnances et résultats en un endroit sécurisé.", icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Spécialistes', description: 'Consultez des experts dans plus de 30 spécialités médicales, du cardiologue au pédiatre.', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: 'Rappels Intelligents', description: "Ne manquez plus jamais un rendez-vous grâce à notre système d'alertes personnalisées.", icon: BellRing, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Urgences 24/7', description: "Un service d'assistance disponible à tout moment pour vous orienter vers les urgences les plus proches.", icon: Phone, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PublicStats>({ totalPatients: 0, totalMedecins: 0, totalConsultations: 0, totalSpecialites: 0 });

  useEffect(() => {
    publicApi.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <PublicHeader />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-5">
            <div className="w-5 h-5 rounded overflow-hidden">
              <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <span className="text-xs font-bold text-orange-600">ODC-Guinée · Projet de Fin de Formation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">
            La santé simplifiée,<br />
            <span className="text-orange-500">au bout de vos doigts.</span>
          </h1>
          <p className="mt-5 text-gray-500 max-w-md leading-relaxed">
            MedConnect vous connecte aux meilleurs spécialistes en quelques clics. Gérez vos rendez-vous, accédez à votre dossier médical et suivez votre santé en toute sécurité.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => navigate('/signup')} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2">
              Commencer maintenant <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:border-orange-400 font-semibold transition-colors">
              Se connecter
            </button>
          </div>
          {/* Stats — chiffres réels de la plateforme (GET /api/public/stats) */}
          <div className="mt-10 flex items-center gap-6 flex-wrap">
            {[
              [stats.totalPatients, 'Patients'],
              [stats.totalMedecins, 'Médecins'],
              [stats.totalSpecialites, 'Spécialités'],
            ].map(([val, lbl]) => (
              <div key={lbl as string}>
                <p className="text-2xl font-extrabold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden relative h-52">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600"
                alt="Salle médicale"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <div className="w-6 h-6 rounded overflow-hidden">
                  <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Certifié ODC</p>
                  <p className="text-[10px] text-gray-500">Qualité garantie</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-orange-500 text-white p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Bilan Santé</p>
                <p className="text-sm text-orange-100">Réservez votre check-up annuel</p>
              </div>
              <Activity className="w-7 h-7" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gray-900 text-white p-5">
              <Calendar className="w-5 h-5 mb-3 text-orange-400" />
              <p className="text-2xl font-extrabold">15<span className="text-base text-gray-400">min</span></p>
              <p className="text-xs text-gray-400">Délai de prise en charge</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-green-500 mb-3" />
              <p className="text-sm font-bold text-gray-800">Données sécurisées</p>
              <p className="text-xs text-gray-500 mt-1">Chiffrement JWT + Spring Security</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Nos services médicaux</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Une plateforme complète pour tous vos besoins de santé.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow bg-white group">
                <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="doctors" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-3xl p-10 text-white text-center shadow-xl shadow-orange-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 shadow-md">
                <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold mb-3">Prêt à prendre soin de vous ?</h2>
            <p className="text-orange-100 max-w-md mx-auto mb-8">Rejoignez MedConnect ODC et accédez aux meilleurs praticiens en toute simplicité.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={() => navigate('/signup')} className="px-8 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
                Créer mon compte
              </button>
              <button onClick={() => navigate('/login')} className="px-8 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 border border-white/30 transition-colors">
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AppLayout;
