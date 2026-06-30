import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { notificationApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Bell, Mail, CheckCircle, MessageSquare, Send, Loader2 } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      toast.error("Erreur lors du chargement des notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markNotificationAsRead(id);
      toast.success("Notification marquée comme lue.");
      fetchNotifications();
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      toast.error("Erreur lors du marquage comme lue.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();
      toast.success("Toutes les notifications ont été marquées comme lues.");
      fetchNotifications();
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
      toast.error("Erreur lors du marquage de toutes les notifications comme lues.");
    }
  };
  return (
    <DashboardShell active="Messages">
      <DashboardTopbar title="Notifications" />
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Mes Notifications</h3>
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" /> Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            Aucune notification pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-center justify-between p-4 rounded-2xl border border-gray-50 transition-colors ${notif.estLu ? 'bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.estLu ? 'bg-gray-200 text-gray-600' : 'bg-blue-200 text-blue-600'}`}>
                    {notif.type === 'ALERTE' ? <AlertCircle className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`font-medium ${notif.estLu ? 'text-gray-700' : 'text-gray-900'}`}>{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.dateEnvoi).toLocaleString()}</p>
                  </div>
                </div>
                {!notif.estLu && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:underline"
                  >
                    Marquer comme lu
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default Messages;
