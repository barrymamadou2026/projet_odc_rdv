import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Video, Activity, ArrowRight, ShieldCheck,
  Stethoscope, BellRing, Phone, Search, MapPin, FileText,
} from 'lucide-react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';
// Suppression des imports de données de test
// import { SERVICES, IMAGES } from '@/data/medicData';

const IMAGES = {
  heroRoom: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
  doctorMale1: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
  doctorFemale1: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200',
  doctorMale2: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
  robotSurgery: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=1000',
  doctorFemale2: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200',
};

const SERVICES = [
  {
    title: 'Dossier Digital',
    description: "Accédez à votre historique médical complet, vos ordonnances et résultats d'examens en un seul endroit sécurisé.",
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'Spécialistes',
    description: 'Consultez des experts reconnus dans plus de 30 spécialités médicales, du cardiologue au pédiatre.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    title: 'Rappels Intelligents',
    description: "Ne manquez plus jamais un rendez-vous ou une prise de médicament grâce à notre système d'alertes personnalisées.",
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'Urgences 24/7',
    description: "Un service d'assistance disponible à tout moment pour vous orienter vers les structures d'urgence les plus proches.",
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
];

const ServiceIcon: React.FC<{ i: number }> = ({ i }) => {
  const icons = [FileText, Stethoscope, BellRing, Phone];
  const Icon = icons[i];
  return <Icon className="w-5 h-5" />;
};

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [spec, setSpec] = useState('');
  const [city, setCity] = useState('');

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/find-doctors');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Disponible 24/7 pour vos soins
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900">
            La santé simplifiée,<br />
            <span className="text-blue-600">au bout de vos doigts.</span>
          </h1>
          <p className="mt-5 text-gray-500 max-w-md">
            Medic_RDV vous connecte aux meilleurs spécialistes en quelques clics. Gérez vos rendez-vous, accédez à votre dossier médical et consultez en ligne en toute sécurité.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => navigate('/appointments')} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20 transition-colors">Prendre rendez-vous</button>
            <button onClick={() => navigate('/find-doctors')} className="px-6 py-3 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold transition-colors">Voir nos spécialistes</button>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[IMAGES.doctorMale1, IMAGES.doctorFemale1, IMAGES.doctorMale2].map((s) => (
                <img key={s} src={s} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              ))}
              <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white">+5k</span>
            </div>
            <span className="text-sm text-gray-500">Rejoignez plus de 5000+ patients satisfaits</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden relative">
              <img src={IMAGES.heroRoom} alt="Salle médicale" className="w-full h-56 object-cover" />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Certifié ODC</p>
                  <p className="text-[10px] text-gray-500">Qualité de soin garantie</p>
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
            <div className="rounded-2xl bg-blue-600 text-white p-4">
              <Calendar className="w-5 h-5 mb-3" />
              <p className="text-2xl font-extrabold">15min</p>
              <p className="text-xs text-blue-100">Attente moyenne</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <Video className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Téléconsultation Immédiate</p>
              <button onClick={() => navigate('/patient')} className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">Essayer <ArrowRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Nos services médicaux d'excellence</h2>
              <p className="mt-2 text-gray-500 max-w-xl">Une plateforme complète conçue pour répondre à tous vos besoins de santé, de la prévention aux soins spécialisés.</p>
            </div>
            <button onClick={() => navigate('/find-doctors')} className="text-orange-600 font-semibold flex items-center gap-1">Voir tous les services <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow bg-white">
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}><ServiceIcon i={i} /></div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIND DOCTOR */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Trouvez le bon médecin pour vous</h2>
              <form onSubmit={search} className="mt-6 space-y-3">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="Spécialité ou nom du médecin..." className="bg-transparent text-sm outline-none flex-1" />
                </div>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Votre ville ou quartier..." className="bg-transparent text-sm outline-none flex-1" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Rechercher maintenant</button>
              </form>
              <div className="mt-8 flex gap-10">
                <div><p className="text-2xl font-extrabold text-blue-600">4.9/5</p><p className="text-xs text-gray-400 uppercase tracking-wide">Note moyenne</p></div>
                <div><p className="text-2xl font-extrabold text-orange-600">12k+</p><p className="text-xs text-gray-400 uppercase tracking-wide">Consultations</p></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={IMAGES.doctorMale1} className="rounded-2xl h-48 w-full object-cover" />
              <img src={IMAGES.heroRoom} className="rounded-2xl h-32 w-full object-cover self-start" />
              <img src={IMAGES.robotSurgery} className="rounded-2xl h-32 w-full object-cover self-end" />
              <img src={IMAGES.doctorFemale2} className="rounded-2xl h-48 w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AppLayout;
