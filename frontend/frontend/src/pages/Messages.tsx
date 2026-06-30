import React from 'react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { MessageSquare, Info } from 'lucide-react';

const Messages: React.FC = () => (
  <DashboardShell active="Messages">
    <DashboardTopbar title="Messages" />
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 px-8">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center mb-5">
        <MessageSquare className="w-10 h-10 text-orange-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Messagerie</h2>
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-xl px-4 py-2">
        <Info className="w-4 h-4 shrink-0" />
        <p>La messagerie interne sera disponible dans la prochaine version de MedConnect ODC.</p>
      </div>
    </div>
  </DashboardShell>
);

export default Messages;
