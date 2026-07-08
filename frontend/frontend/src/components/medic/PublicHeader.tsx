import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logos côte à côte */}
        <Link to="/" className="flex items-center gap-3 select-none">
          {/* MedicRdv */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center">
              <img src="/images/logo.png" alt="MedicRdv" className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <span className="text-[8px] font-bold text-gray-500 leading-none">MedicRdv</span>
          </div>
          <div className="h-7 w-px bg-gray-200" />
          {/* ODC */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-orange-500 shadow-sm flex items-center justify-center">
              <img src="/images/odc-logo.png" alt="ODC" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <span className="text-[8px] font-bold text-orange-500 leading-none">ODC Guinée</span>
          </div>
          {/* Nom */}
          <div className="flex flex-col leading-none ml-1">
            <span className="text-base font-black tracking-tight text-gray-900">Med<span className="text-orange-500">Connect</span></span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Plateforme médicale</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
          <Link to="/help" className="hover:text-orange-500 transition-colors">Aide</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors">Connexion</button>
          <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-sm">Inscription</button>
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/help" className="block text-sm font-medium" onClick={() => setMenuOpen(false)}>Aide</Link>
          <div className="pt-2 flex flex-col gap-2">
            <button onClick={() => { navigate('/login'); setMenuOpen(false); }} className="w-full text-sm font-semibold border border-gray-200 py-2 rounded-xl">Connexion</button>
            <button onClick={() => { navigate('/signup'); setMenuOpen(false); }} className="w-full py-2 rounded-xl bg-orange-500 text-white text-sm font-bold">Inscription</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
