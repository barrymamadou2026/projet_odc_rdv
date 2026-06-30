import React, { useState, useEffect } from 'react';
import { FileText, Stethoscope, Clock, User, ShieldCheck } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const MedicalRecords: React.FC = () => {
  const { role, user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        // Pour l'instant, on récupère les consultations via l'API dédiée
        const data = role === 'PATIENT' 
          ? await patientApi.getMyConsultations() 
          : await medecinApi.getMyConsultations();
        setConsultations(data as any[]);
      } catch (error) {
        console.error("Erreur consultations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, [role]);

  return (
    <DashboardShell active="Dossier Médical">
      <DashboardTopbar title="Dossier Médical" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 text-3xl font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.email?.split('@')[0]}</h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Dossier certifié Medic_RDV
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Historique des Consultations</h3>
            {loading ? (
              <div className="py-10 text-center text-gray-400">Chargement...</div>
            ) : consultations.length === 0 ? (
              <div className="py-10 text-center text-gray-400 italic bg-gray-50 rounded-2xl">
                Aucune consultation enregistrée.
              </div>
            ) : (
              <div className="space-y-4">
                {consultations.map((c, index) => (
                  <div key={c.idConsultation || index} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{c.diagnostic || 'Consultation générale'}</p>
                      <p className="text-sm text-gray-500">Par {role === 'PATIENT' ? `Dr. ${c.medecinNom}` : c.patientNom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">{new Date(c.dateConsultation).toLocaleDateString()}</p>
                      <span className="text-[10px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">Terminé</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-100">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Informations Vitales
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-orange-500 pb-2">
                <span className="text-orange-100">Groupe Sanguin</span>
                <span className="font-bold">A+</span>
              </div>
              <div className="flex justify-between border-b border-orange-500 pb-2">
                <span className="text-orange-100">Allergies</span>
                <span className="font-bold">Aucune</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-100">Taille / Poids</span>
                <span className="font-bold">175cm / 70kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4">Documents Récents</h4>
            <div className="text-center py-6 text-gray-400 text-sm italic">
              Aucun document importé.
            </div>
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-orange-500 hover:text-orange-500 transition-all">
              + Ajouter un document
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default MedicalRecords;
