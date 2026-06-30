import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Calendar, Clock, User, Stethoscope, FileText, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');
  const [notesMedicales, setNotesMedicales] = useState('');
  const [ordonnance, setOrdonnance] = useState('');
  const [consultationLoading, setConsultationLoading] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const api = role === 'PATIENT' ? patientApi : medecinApi;
        const allAppointments = await api.getMyAppointments();
        const foundAppointment = allAppointments.find((apt: any) => apt.idRdv === Number(id));
        if (foundAppointment) {
          setAppointment(foundAppointment);
          // Fetch consultation if it exists for this appointment
          if (role === 'PATIENT' && foundAppointment.idRdv) {
            const patientConsultations = await patientApi.getConsultations();
            const foundConsultation = patientConsultations.find((cons: any) => cons.idRdv === foundAppointment.idRdv);
            setConsultation(foundConsultation);
          } else if (role === 'MEDECIN' && foundAppointment.idRdv) {
            const medecinConsultations = await medecinApi.getConsultations();
            const foundConsultation = medecinConsultations.find((cons: any) => cons.idRdv === foundAppointment.idRdv);
            setConsultation(foundConsultation);
          }
        } else {
          toast.error('Rendez-vous introuvable.');
          navigate(-1);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des détails du rendez-vous:', error);
        toast.error('Erreur lors du chargement des détails du rendez-vous.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id, role, navigate]);

  const handleConfirm = async () => {
    if (!appointment || !appointment.idRdv) return;
    try {
      await medecinApi.confirmAppointment(appointment.idRdv);
      toast.success('Rendez-vous confirmé');
      setAppointment((prev: any) => ({ ...prev, statut: 'CONFIRME' }));
    } catch (error) {
      console.error('Confirmation error:', error);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleCancel = async () => {
    if (!appointment || !appointment.idRdv) return;
    try {
      if (role === 'MEDECIN') {
        await medecinApi.cancelAppointment(appointment.idRdv);
      } else {
        await patientApi.cancelAppointment(appointment.idRdv);
      }
      toast.success('Rendez-vous annulé');
      setAppointment((prev: any) => ({ ...prev, statut: 'ANNULE' }));
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleRedigerConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment || !appointment.idRdv) return;
    setConsultationLoading(true);
    try {
      const response = await medecinApi.redigerConsultation(appointment.idRdv, { diagnostic, notesMedicales, ordonnance });
      setConsultation(response);
      toast.success('Consultation rédigée avec succès !');
      setIsConsultationModalOpen(false);
      setDiagnostic('');
      setNotesMedicales('');
      setOrdonnance('');
    } catch (error) {
      console.error('Erreur lors de la rédaction de la consultation:', error);
      toast.error('Erreur lors de la rédaction de la consultation.');
    } finally {
      setConsultationLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell active="Rendez-vous">
        <DashboardTopbar title="Détails du Rendez-vous" />
        <div className="text-center py-10 text-gray-400">Chargement des détails du rendez-vous...</div>
      </DashboardShell>
    );
  }

  if (!appointment) {
    return (
      <DashboardShell active="Rendez-vous">
        <DashboardTopbar title="Détails du Rendez-vous" />
        <div className="text-center py-10 text-red-500">Rendez-vous introuvable.</div>
      </DashboardShell>
    );
  }

  const isMedecin = role === 'MEDECIN';
  const isPatient = role === 'PATIENT';

  return (
    <DashboardShell active="Rendez-vous">
      <DashboardTopbar title="Détails du Rendez-vous" />

      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour aux rendez-vous
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Informations sur le Rendez-vous</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-500 text-sm">Date et Heure</p>
            <p className="font-bold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-orange-500" /> {new Date(appointment.dateHeure).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Durée</p>
            <p className="font-bold text-lg flex items-center gap-2"><Clock className="w-5 h-5 text-orange-500" /> {appointment.duree} minutes</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Statut</p>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              appointment.statut === 'CONFIRME' ? 'bg-green-100 text-green-700' :
              appointment.statut === 'ANNULE' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {appointment.statut}
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Motif</p>
            <p className="font-bold text-lg">{appointment.motif || 'Non spécifié'}</p>
          </div>
        </div>

        {isPatient && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm">Médecin</p>
            <p className="font-bold text-lg flex items-center gap-2"><Stethoscope className="w-5 h-5 text-blue-500" /> Dr. {appointment.medecinNom || (appointment.prenomMedecin + ' ' + appointment.nomMedecin)}</p>
          </div>
        )}

        {isMedecin && (
          <div className="mb-6">
            <p className="text-gray-500 text-sm">Patient</p>
            <p className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5 text-green-500" /> {appointment.patientNom || (appointment.prenomPatient + ' ' + appointment.nomPatient)}</p>
          </div>
        )}

        <div className="flex gap-4 mt-6">
          {isMedecin && appointment.statut === 'ATTENTE' && (
            <button onClick={handleConfirm} className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-colors">
              <CheckCircle className="w-4 h-4" /> Confirmer
            </button>
          )}
          {(appointment.statut === 'ATTENTE' || appointment.statut === 'CONFIRME') && (
            <button onClick={handleCancel} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-red-600 transition-colors">
              <XCircle className="w-4 h-4" /> Annuler
            </button>
          )}
          {isMedecin && appointment.statut === 'CONFIRME' && !consultation && (
            <button onClick={() => setIsConsultationModalOpen(true)} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
              <FileText className="w-4 h-4" /> Rédiger Consultation
            </button>
          )}
        </div>
      </div>

      {consultation && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Détails de la Consultation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Date de Consultation</p>
              <p className="font-bold text-lg">{new Date(consultation.dateConsultation).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Diagnostic</p>
              <p className="font-bold text-lg">{consultation.diagnostic}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 text-sm">Notes Médicales</p>
              <p className="font-bold text-lg whitespace-pre-wrap">{consultation.notesMedicales}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 text-sm">Ordonnance</p>
              <p className="font-bold text-lg whitespace-pre-wrap">{consultation.ordonnance || 'Aucune ordonnance'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      <Dialog open={isConsultationModalOpen} onOpenChange={setIsConsultationModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Rédiger une Consultation</DialogTitle>
            <DialogDescription>
              Remplissez les détails de la consultation pour ce rendez-vous.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRedigerConsultation} className="space-y-4 mt-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diagnostic</label>
              <textarea
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                rows={3}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes Médicales</label>
              <textarea
                value={notesMedicales}
                onChange={(e) => setNotesMedicales(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                rows={5}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ordonnance</label>
              <textarea
                value={ordonnance}
                onChange={(e) => setOrdonnance(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                rows={5}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConsultationModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                disabled={consultationLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:bg-gray-300"
                disabled={consultationLoading}
              >
                {consultationLoading ? "Envoi..." : "Rédiger"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AppointmentDetails;
