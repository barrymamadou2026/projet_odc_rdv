import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermissionState, isPushConfigured } from '@/lib/firebase';

/**
 * Petite bannière qui propose d'activer les notifications push (rendez-vous,
 * confirmations, rappels). Le clic sur le bouton est un vrai geste utilisateur
 * (requis par les navigateurs pour Notification.requestPermission()), donc les
 * notifications marchent de façon fiable contrairement à une demande automatique.
 * Ne s'affiche que si Firebase est configuré, si la permission n'a jamais été
 * décidée ('default'), et si l'utilisateur ne l'a pas fermée pendant cette session.
 */
const NotificationPermissionBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPushConfigured()) return;
    if (sessionStorage.getItem('odc_push_banner_dismissed') === '1') return;
    if (getNotificationPermissionState() === 'default') {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestNotificationPermission();
    setLoading(false);
    setVisible(false);
    if (!granted) {
      sessionStorage.setItem('odc_push_banner_dismissed', '1');
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('odc_push_banner_dismissed', '1');
    setVisible(false);
  };

  return (
    <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl px-4 py-3 mb-4">
      <Bell className="w-5 h-5 shrink-0" />
      <p className="text-sm flex-1">
        Active les notifications pour être prévenu(e) instantanément de tes rendez-vous.
      </p>
      <button
        onClick={handleEnable}
        disabled={loading}
        className="text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-60"
      >
        {loading ? '...' : 'Activer'}
      </button>
      <button onClick={handleDismiss} aria-label="Fermer" className="text-orange-400 hover:text-orange-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationPermissionBanner;
