import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, Clock, ChevronRight, UserPlus, CalendarPlus } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await medecinApi.getMyAppointments();
        setAppointments(data as any[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calcul du nombre de patients uniques
  const uniquePatientsCount = new Set(appointments.map(apt => apt.patientNom || (apt.prenomPatient + ' ' + apt.nomPatient))).size;

  const stats = [
    { icon: Users, label: 'Patients', value: uniquePatientsCount.toString(), color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: CalendarCheck, label: 'Total RDV', value: appointments.length.toString(), color: 'bg-green-50', iconColor: 'text-green-500' },
  ];

  return (
    <DashboardShell active="Dashboard">
      <DashboardTopbar title={`Dr. ${user?.email?.split('@')[0]}`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center ${s.iconColor}`}>
              <s.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Prochains Rendez-vous</h3>
            <button onClick={() => navigate('/appointments')} className="text-sm font-bold text-orange-600 hover:underline">Voir tout</button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400">Chargement...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">Aucun rendez-vous prévu.</div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt, index) => (
                <div key={apt.idRdv || index} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Correction ici : Utilisation d'un repli sûr au cas où patientNom est indéfini ou null */}
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">
                      {apt.patientNom ? apt.patientNom[0] : (apt.prenomPatient ? apt.prenomPatient[0] : 'P')}
                    </div>
                    <div>
                      {/* Correction ici : Évite l'affichage d'un champ vide si le nom n'est pas présent */}
                      <p className="font-bold text-gray-900">{apt.patientNom || (apt.prenomPatient + ' ' + apt.nomPatient) || 'Patient Anonyme'}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(apt.dateHeure).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => navigate('/appointments')} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors">
                <CalendarPlus className="w-6 h-6" />
                <span>Gérer mon Agenda</span>
              </button>
              <button onClick={() => navigate('/records')} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors border border-gray-100">
                <UserPlus className="w-6 h-6" />
                <span>Consulter Dossiers</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default DoctorDashboard;