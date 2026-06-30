import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CalendarPlus, HelpCircle, ChevronRight, Plus } from 'lucide-react';
import Logo from '@/components/medic/Logo';
import { IMAGES } from '@/data/medicData';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 border-b border-gray-100 bg-white flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link to="/patient" className="hover:text-orange-500">Dashboard</Link>
            <Link to="/appointments" className="hover:text-orange-500">Appointments</Link>
            <Link to="/records" className="hover:text-orange-500">Medical Records</Link>
          </nav>
          <img src={IMAGES.doctorFemale1} className="w-9 h-9 rounded-full object-cover" />
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 grid lg:grid-cols-2 gap-10 items-center">
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <img src={IMAGES.robot404} className="w-full max-w-sm mx-auto rounded-2xl" />
          <p className="mt-6 text-5xl font-extrabold text-orange-500">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Page introuvable</h1>
          <p className="text-gray-500 mt-3">Désolé, la page que vous recherchez semble avoir été déplacée ou n'existe plus. Vérifiez l'URL ou retournez à l'accueil.</p>
        </div>

        <div className="space-y-4">
          <Link to="/patient" className="bg-white rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center"><LayoutDashboard className="w-6 h-6 text-orange-500" /></div>
            <div className="flex-1"><p className="text-lg font-bold text-gray-900">Dashboard</p><p className="text-sm text-gray-500">Retournez à votre tableau de bord médical.</p></div>
            <ChevronRight className="w-5 h-5 text-orange-500" />
          </Link>
          <Link to="/appointments" className="bg-blue-600 rounded-2xl p-5 flex items-center gap-4 text-white hover:bg-blue-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><CalendarPlus className="w-6 h-6" /></div>
            <div className="flex-1"><p className="text-lg font-bold">Prendre RDV</p><p className="text-sm text-blue-100">Planifiez une nouvelle consultation rapidement.</p></div>
            <Plus className="w-5 h-5" />
          </Link>
          <div className="bg-gray-100 rounded-2xl p-5">
            <p className="flex items-center gap-2 font-semibold text-gray-800"><HelpCircle className="w-5 h-5" /> Besoin d'aide ?</p>
            <p className="text-sm text-gray-600 mt-2">Contactez notre support technique ou consultez la FAQ pour toute assistance médicale urgente.</p>
            <Link to="/login" className="inline-block mt-3 font-semibold text-orange-600">Support Medic_RDV</Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
          <span><span className="font-bold text-orange-500">Medic_RDV</span> © 2024 Orange Digital Center Healthcare</span>
          <div className="flex gap-6"><span>Politique de confidentialité</span><span>Mentions légales</span></div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
