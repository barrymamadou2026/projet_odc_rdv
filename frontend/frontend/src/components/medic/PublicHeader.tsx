import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Accueil', to: '/' },
    { label: 'Rendez-vous', to: '/appointments' },
    { label: 'Médecins', to: '/find-doctors' },
    { label: 'Aide', to: '/help' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <button className="text-gray-500 hover:text-orange-500 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5" />
          </button>
          {user ? (
            <button 
              onClick={() => navigate(role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient')} 
              className="flex items-center gap-2 pl-3 border-l border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs border-2 border-white shadow-sm">
                {user?.email?.[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700">{user?.email?.split('@')[0]}</span>
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">
              Connexion
            </button>
          )}
        </div>
        <button className="md:hidden text-gray-700" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block py-2 text-gray-700 font-medium">
              {l.label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="block py-2 text-orange-500 font-semibold">Se connecter</Link>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;
