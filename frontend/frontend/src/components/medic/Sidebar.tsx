import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Settings, LogOut, User, Search, UserCheck } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar: React.FC<{ active?: string }> = ({ active = 'Dashboard' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavItems = () => {
    if (role === 'PATIENT') return [
      { label: 'Dashboard',         icon: LayoutDashboard, to: '/patient' },
      { label: 'Trouver un Médecin',icon: Search,           to: '/find-doctors' },
      { label: 'Rendez-vous',       icon: Calendar,         to: '/appointments' },
      { label: 'Dossier Médical',   icon: FileText,         to: '/records' },
      { label: 'Messages',          icon: MessageSquare,    to: '/messages' },
      { label: 'Paramètres',        icon: Settings,         to: '/settings' },
    ];
    if (role === 'MEDECIN') return [
      { label: 'Dashboard',         icon: LayoutDashboard, to: '/doctor' },
      { label: 'Mon Agenda',        icon: Calendar,         to: '/appointments' },
      { label: 'Consultations',     icon: FileText,         to: '/records' },
      { label: 'Messages',          icon: MessageSquare,    to: '/messages' },
      { label: 'Paramètres',        icon: Settings,         to: '/settings' },
    ];
    // ADMIN
    return [
      { label: 'Dashboard',         icon: LayoutDashboard, to: '/admin' },
      { label: 'Utilisateurs',      icon: UserCheck,        to: '/admin?tab=users' },
      { label: 'Paramètres',        icon: Settings,         to: '/settings' },
    ];
  };

  const NAV = getNavItems();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-gray-100">
        <Logo size="sm" to={role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient'} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          // Si "active" est fourni, il fait autorité (permet de distinguer deux
          // liens qui pointent vers la même route, ex: Dashboard/Utilisateurs
          // admin qui sont deux onglets d'une seule page /admin). Sinon on
          // retombe sur la comparaison d'URL classique.
          const isActive = active ? active === item.label : location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
            {user?.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.email?.split('@')[0] || 'Utilisateur'}</p>
            <p className="text-xs text-gray-400 capitalize">{role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
