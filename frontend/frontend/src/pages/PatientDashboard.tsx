import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, FileText, ChevronRight, Loader2, Stethoscope } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const STATUT_STYLES: Record<string, string> = {
  ATTENTE:  'bg-orange-100 text-orange-700',
  CONFIRME: 'bg-green-100 text-green-700',
  ANNULE:   'bg-red-100 text-red-700',
};

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientApi.getMyAppointments()
      .then(d => setAppointments(d as any[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayName = user?.email?.split('@')[0] || 'Patient';
  const upcoming = appointments.filter(a => a.statut !== 'ANNULE');
  const next = upcoming[0];

  return (
    <DashboardShell active="Dashboard">
      <DashboardTopbar title={`Bonjour, ${displayName} 👋`} showSearch />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Calendar,    label: 'RDV à venir',    value: upcoming.filter(a => a.statut !== 'ANNULE').length, color: 'bg-blue-50',   ic: 'text-blue-500' },
          { icon: Clock,       label: 'En attente',     value: upcoming.filter(a => a.statut === 'ATTENTE').length, color: 'bg-orange-50', ic: 'text-orange-500' },
          { icon: Stethoscope, label: 'Confirmés',      value: upcoming.filter(a => a.statut === 'CONFIRME').length,color: 'bg-green-50',  ic: 'text-green-500' },
          { icon: FileText,    label: 'Total',          value: appointments.length,                                 color: 'bg-purple-50', ic: 'text-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.ic}`} />
            </div>
            <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Prochain RDV */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Mes Rendez-vous</h3>
              <button onClick={() => navigate('/appointments')} className="text-sm font-bold text-orange-500 hover:underline flex items-center gap-1">
                Voir tout <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucun rendez-vous pour le moment</p>
                <button onClick={() => navigate('/find-doctors')} className="mt-4 px-5 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 text-sm">
                  Prendre un rendez-vous
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 5).map(apt => {
                  const d = apt.dateHeure ? new Date(apt.dateHeure) : null;
                  return (
                    <div key={apt.idRdv || apt.id} onClick={() => navigate(`/appointments/${apt.idRdv || apt.id}`)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-all">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">Dr. {apt.prenomMedecin || ''} {apt.nomMedecin || apt.medecinNom || ''}</p>
                        <p className="text-xs text-gray-400">{d ? d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '–'}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${STATUT_STYLES[apt.statut] || 'bg-gray-100 text-gray-500'}`}>{apt.statut}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-200">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-black text-lg mb-1">Trouver un Médecin</h4>
            <p className="text-orange-100 text-sm mb-5">Prenez rendez-vous avec un spécialiste près de chez vous.</p>
            <button onClick={() => navigate('/find-doctors')} className="w-full py-2.5 bg-white text-orange-600 font-black rounded-xl hover:bg-orange-50 transition-colors text-sm">
              Rechercher
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 text-sm">Actions Rapides</h4>
            <div className="space-y-2">
              <button onClick={() => navigate('/find-doctors')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 transition-colors text-sm">
                <Calendar className="w-4 h-4 shrink-0" /> Nouveau Rendez-vous
              </button>
              <button onClick={() => navigate('/records')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm border border-gray-100">
                <FileText className="w-4 h-4 shrink-0" /> Mon Dossier Médical
              </button>
              <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 font-semibold hover:bg-gray-100 transition-colors text-sm border border-gray-100">
                <Clock className="w-4 h-4 shrink-0" /> Mon Profil
              </button>
            </div>
          </div>

          {/* Carte ID */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Identifiant Patient</p>
            <p className="font-black text-gray-900 font-mono text-lg">#{user?.idUtilisateur || '——'}</p>
            <p className="text-xs text-gray-400 mt-1">MedConnect ODC · Guinée</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default PatientDashboard;
