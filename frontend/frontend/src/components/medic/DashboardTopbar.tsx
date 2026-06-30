import React, { useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { notificationApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Props {
  title: string;
  showSearch?: boolean;
  rightLabel?: string;
}

const DashboardTopbar: React.FC<Props> = ({ title, showSearch = false, rightLabel }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationApi.getNotifications();
        setNotifs(data);
        setUnreadCount(data.filter((n: any) => !n.estLu).length);
      } catch (_) {}
    };
    load();
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, estLu: true })));
    } catch (_) {}
  };

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
        {rightLabel && <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mt-0.5">{rightLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-500">
            <Search className="w-4 h-4" />
            <input placeholder="Rechercher..." className="bg-transparent outline-none w-40" />
          </div>
        )}
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-orange-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="font-bold text-gray-900">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAll} className="text-xs text-orange-500 font-semibold hover:underline">
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-6">Aucune notification</p>
                ) : (
                  notifs.map((n: any) => (
                    <div key={n.id} className={`px-4 py-3 ${!n.estLu ? 'bg-orange-50' : ''}`}>
                      <p className="text-sm text-gray-700">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(n.dateEnvoi).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ODC badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
          <div className="w-5 h-5 rounded overflow-hidden">
            <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          <span className="text-xs font-bold text-orange-600">ODC</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopbar;
