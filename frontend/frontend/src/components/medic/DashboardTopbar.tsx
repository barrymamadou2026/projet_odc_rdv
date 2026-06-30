import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  showSearch?: boolean;
  rightLabel?: string;
}

const DashboardTopbar: React.FC<Props> = ({ title, showSearch = true, rightLabel }) => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-4 mb-8 flex-wrap">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600">{title}</h1>
      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input placeholder="Rechercher..." className="bg-transparent text-sm outline-none flex-1" />
          </div>
        )}
        
        <button 
          onClick={() => navigate('/messages')}
          className="relative text-gray-500 hover:text-orange-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{role}</p>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm hover:scale-105 transition-transform"
          >
            {user?.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
