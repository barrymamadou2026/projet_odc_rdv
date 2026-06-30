import React, { useState, useEffect, useCallback } from 'react';
// 1. Importation de useNavigate pour permettre la redirection
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Clock, User, AlertCircle, CalendarPlus, CheckCircle, XCircle } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Imports pour la boîte de dialogue Shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Appointments: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la création d'une disponibilité (Médecin)
  const [isDispoModalOpen, setIsDispoModalOpen] = useState(false);
  const [dispoLoading, setDispoLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
        const [dateFin, setDateFin] = useState('');
        const [duree, setDuree] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = role === 'PATIENT' 
        ? await patientApi.getMyAppointments() 
        : await medecinApi.getMyAppointments();
      setAppointments(data as any[]);
    } catch (error) {
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, [role]);

  const handleConfirm = async (id: number) => {
    if (!id) return;
    try {
      await medecinApi.confirmAppointment(id);
      toast.success("Rendez-vous confirmé");
      fetchData();
    } catch (error) {
      console.error("Confirmation error:", error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  const handleCancel = async (id: number) => {
    if (!id) return;
    try {
      if (role === 'MEDECIN') {
        await medecinApi.cancelAppointment(id);
      } else {
        await patientApi.cancelAppointment(id);
      }
      toast.success("Rendez-vous annulé");
      fetchData();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fonction de création de créneau pour le médecin
  const handleCreateDisponibilite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !dateFin) {
      toast.error("Veuillez remplir toutes les dates");
      return;
    }

    setDispoLoading(true);
    try {
      await medecinApi.createDisponibilite({
        dateDebut: new Date(dateDebut).toISOString(),
        dateFin: new Date(dateFin).toISOString(),
        duree: duree
      });

      toast.success("Créneau ajouté à votre agenda avec succès !");
      setIsDispoModalOpen(false);
      
      // Réinitialisation du formulaire
      setDateDebut('');
      setDateFin('');
      
      // Optionnel : rafraîchir les données si nécessaire
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la création de la disponibilité.");
    } finally {
      setDispoLoading(false);
    }
  };

  return (
    <DashboardShell active="Rendez-vous">
      <DashboardTopbar title={role === 'PATIENT' ? "Mes Rendez-vous" : "Mon Agenda"} />

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500">
          {role === 'PATIENT' 
            ? "Gérez vos consultations passées et à venir." 
            : "Consultez vos rendez-vous et ouvrez des créneaux de disponibilité."}
        </p>
        
        {/* BOUTON DU PATIENT */}
        {role === 'PATIENT' && (
          <button 
            onClick={() => navigate('/find-doctors')}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouveau RDV
          </button>
        )}

        {/* NOUVEAU : BOUTON DU MÉDECIN */}
        {role === 'MEDECIN' && (
          <button 
            onClick={() => setIsDispoModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <CalendarPlus className="w-4 h-4" /> Ajouter une disponibilité
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Chargement...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 italic">Aucun rendez-vous trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">{role === 'PATIENT' ? 'Médecin' : 'Patient'}</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((apt, index) => (
                  <tr key={apt.idRdv} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {new Date(apt.dateHeure).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 pl-6">
                        <Clock className="w-3 h-3" />
                        {new Date(apt.dateHeure).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                          {role === 'PATIENT' ? (apt.medecinNom ? apt.medecinNom[0] : (apt.prenomMedecin ? apt.prenomMedecin[0] : 'M')) : (apt.patientNom ? apt.patientNom[0] : (apt.prenomPatient ? apt.prenomPatient[0] : 'P'))}
                        </div>
                        <span className="font-medium text-gray-700">
                          {role === 'PATIENT' ? `Dr. ${apt.medecinNom || (apt.prenomMedecin + ' ' + apt.nomMedecin) || ''}` : (apt.patientNom || (apt.prenomPatient + ' ' + apt.nomPatient) || '')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                        apt.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' : 
                        apt.statut === 'ANNULE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {apt.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {role === 'MEDECIN' && apt.statut === 'ATTENTE' && (
	                          <button 
	                            onClick={() => handleConfirm(apt.idRdv)}
	                            className="p-1 text-green-600 hover:bg-green-50 rounded"
	                            title="Confirmer"
	                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {(apt.statut === 'ATTENTE' || apt.statut === 'CONFIRME') && (
	                          <button 
	                            onClick={() => handleCancel(apt.idRdv)}
	                            className="p-1 text-red-600 hover:bg-red-50 rounded"
	                            title="Annuler"
	                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => navigate(`/appointments/${apt.idRdv}`)} className="text-sm font-bold text-orange-600 hover:text-orange-700">Détails</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORMULAIRE EN POPUP POUR LE MÉDECIN */}
      <Dialog open={isDispoModalOpen} onOpenChange={setIsDispoModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Ouvrir un Créneau</DialogTitle>
            <DialogDescription>
              Définissez une plage horaire durant laquelle les patients pourront vous réserver un rendez-vous.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDisponibilite} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Heure de début</label>
              <input
                type="datetime-local"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Heure de fin</label>
              <input
                type="datetime-local"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Durée de consultation (minutes)</label>
              <select
                value={duree}
                onChange={(e) => setDuree(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm appearance-none"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDispoModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                disabled={dispoLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-300"
                disabled={dispoLoading}
              >
                {dispoLoading ? "Création..." : "Rendre disponible"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default Appointments;