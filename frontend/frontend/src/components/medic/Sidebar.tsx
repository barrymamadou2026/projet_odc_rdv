import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, MessageSquare, Settings, LogOut, User } from 'lucide-react';
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

  // Adapter la navigation selon le rôle
  const getNavItems = () => {
    const common = [
      { label: 'Dashboard', icon: LayoutDashboard, to: role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient' },
      { label: 'Messages', icon: MessageSquare, to: '/messages' },
      { label: 'Paramètres', icon: Settings, to: '/settings' },
    ];

    if (role === 'PATIENT') {
      return [
        common[0],
        { label: 'Rendez-vous', icon: Calendar, to: '/appointments' },
        { label: 'Dossier Médical', icon: FileText, to: '/records' },
        common[1],
        common[2],
      ];
    }

    if (role === 'MEDECIN') {
      return [
        common[0],
        { label: 'Mon Agenda', icon: Calendar, to: '/appointments' },
        { label: 'Consultations', icon: FileText, to: '/records' },
        common[1],
        common[2],
      ];
    }

    return common;
  };

  const NAV = getNavItems();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      <div className="px-6 py-6">
        <Logo to={role === 'ADMIN' ? '/admin' : role === 'MEDECIN' ? '/doctor' : '/patient'} />
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {NAV.map((item) => {
          const isActive = active === item.label || location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2">
        {/* User Profile Info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            {user?.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.email?.split('@')[0] || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 truncate capitalize">{role?.toLowerCase()}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
