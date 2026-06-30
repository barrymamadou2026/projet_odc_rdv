import React, { useState, useEffect } from 'react';
import { FileText, Stethoscope, ShieldCheck, Loader2 } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const MedicalRecords: React.FC = () => {
  const { role, user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = role === 'PATIENT'
          ? await patientApi.getMyConsultations()
          : await medecinApi.getMyConsultations();
        setConsultations(data as any[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [role]);

  const displayName = user?.prenom && user?.nom
    ? `${user.prenom} ${user.nom}`
    : user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <DashboardShell active={role === 'MEDECIN' ? 'Consultations' : 'Dossier Médical'}>
      <DashboardTopbar title={role === 'MEDECIN' ? 'Dossiers des Consultations' : 'Mon Dossier Médical'} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-black">
                {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Dossier certifié MedConnect ODC
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Historique des Consultations</h3>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-orange-500" /></div>
            ) : consultations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-2xl">
                Aucune consultation enregistrée.
              </div>
            ) : (
              <div className="space-y-3">
                {consultations.map((c, i) => (
                  <div key={c.idConsultation || i} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{c.diagnostic || 'Consultation générale'}</p>
                      {c.notesMedicales && <p className="text-sm text-gray-500 mt-0.5 truncate">{c.notesMedicales}</p>}
                      {c.ordonnance && (
                        <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          <FileText className="w-3 h-3" /> Ordonnance disponible
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {role === 'PATIENT' ? `Dr. ${c.prenomMedecin || ''} ${c.nomMedecin || c.medecinNom || ''}` : `${c.prenomPatient || ''} ${c.nomPatient || c.patientNom || ''}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-700">{c.dateConsultation ? new Date(c.dateConsultation).toLocaleDateString('fr-FR') : '–'}</p>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Terminé</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20">
                <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </div>
              <div>
                <p className="font-bold text-sm">MedConnect ODC</p>
                <p className="text-xs text-orange-200">Dossier sécurisé</p>
              </div>
            </div>
            <h4 className="font-bold mb-4 flex items-center gap-2 text-sm"><FileText className="w-4 h-4" /> Informations Vitales</h4>
            <div className="space-y-3 text-sm">
              {[['Groupe Sanguin', 'A+'], ['Allergies', 'Aucune connue'], ['Taille / Poids', '175 cm / 70 kg']].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between border-b border-orange-400/50 pb-2">
                  <span className="text-orange-100">{lbl}</span>
                  <span className="font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Documents</h4>
            <div className="text-center py-5 text-gray-400 text-sm italic">Aucun document importé.</div>
            <p className="text-xs text-gray-400 text-center">Fonctionnalité disponible prochainement.</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default MedicalRecords;
