import React from 'react';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, FileText, Settings, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props { active: string; children: React.ReactNode; }

const DashboardShell: React.FC<Props> = ({ active, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const mobileNav = role === 'PATIENT'
    ? [
        { label: 'Accueil',   icon: LayoutDashboard, to: '/patient' },
        { label: 'Médecins',  icon: Search,           to: '/find-doctors' },
        { label: 'RDV',       icon: Calendar,         to: '/appointments' },
        { label: 'Dossier',   icon: FileText,         to: '/records' },
        { label: 'Paramètres',icon: Settings,         to: '/settings' },
      ]
    : role === 'MEDECIN'
    ? [
        { label: 'Accueil',  icon: LayoutDashboard, to: '/doctor' },
        { label: 'Agenda',   icon: Calendar,         to: '/appointments' },
        { label: 'Consults', icon: FileText,         to: '/records' },
        { label: 'Paramètres',icon: Settings,        to: '/settings' },
      ]
    : [
        { label: 'Admin',    icon: LayoutDashboard, to: '/admin' },
        { label: 'Paramètres',icon: Settings,       to: '/settings' },
      ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} />
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 pb-24 lg:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex">
        {mobileNav.map(item => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={() => navigate(item.to)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-bold transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardShell;
