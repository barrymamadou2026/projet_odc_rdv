import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, Clock, ChevronRight } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await patientApi.getMyAppointments();
        setAppointments(data as any[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardShell active="Dashboard">
      <DashboardTopbar title={`Bonjour, ${user?.email?.split('@')[0]}`} showSearch={true} />

      {/* Banner */}
      <div className="rounded-3xl bg-orange-600 text-white p-8 mb-6 shadow-lg shadow-orange-100">
        <h2 className="text-2xl font-bold">Bienvenue sur Medic_RDV</h2>
        <p className="mt-2 text-orange-100 max-w-md">Prenez rendez-vous avec les meilleurs praticiens en quelques clics.</p>
        <button onClick={() => navigate('/find-doctors')} className="mt-5 px-6 py-2.5 rounded-full bg-white text-orange-600 font-bold hover:bg-orange-50 transition-colors shadow-sm">Trouver un médecin</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Prochain RDV</p>
              <p className="font-bold text-lg">
                    {appointments.length > 0 && appointments[0].dateHeure ? new Date(appointments[0].dateHeure).toLocaleDateString() : 'Aucun rendez-vous'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Identifiant</p>
              <p className="font-bold text-lg text-gray-900 font-mono">ID-{user?.idUtilisateur || '...'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Statut Compte</p>
              <p className="font-bold text-lg text-green-600">Vérifié</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Mes derniers rendez-vous</h3>
          <button onClick={() => navigate('/appointments')} className="text-sm font-bold text-orange-600 hover:underline">Voir tout</button>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 italic">Vous n'avez pas encore de rendez-vous.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.idRdv} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center font-bold text-orange-600">
                    {apt.medecinNom ? apt.medecinNom[0] : (apt.prenomMedecin ? apt.prenomMedecin[0] : 'M')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Dr. {apt.medecinNom || (apt.prenomMedecin + ' ' + apt.nomMedecin) || 'Médecin'}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.dateHeure ? new Date(apt.dateHeure).toLocaleString() : 'Date non définie'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    apt.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {apt.statut}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default PatientDashboard;
