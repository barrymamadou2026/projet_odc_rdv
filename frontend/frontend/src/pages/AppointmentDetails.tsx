import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Calendar, Clock, User, Stethoscope, FileText, XCircle, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUT_STYLE: Record<string, string> = {
  ATTENTE: 'bg-orange-100 text-orange-700',
  CONFIRME: 'bg-green-100 text-green-700',
  ANNULE: 'bg-red-100 text-red-700',
};

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');
  const [notes, setNotes] = useState('');
  const [ordonnance, setOrdonnance] = useState('');
  const [consultLoading, setConsultLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        // On récupère la liste et on filtre par id
        const api = role === 'MEDECIN' ? medecinApi : patientApi;
        const all = await api.getMyAppointments();
        const found = (all as any[]).find(a => a.idRdv === Number(id));
        if (!found) { toast.error('Rendez-vous introuvable.'); navigate(-1); return; }
        setAppointment(found);

        // Chercher la consultation associée
        const consults = role === 'MEDECIN'
          ? await medecinApi.getMyConsultations()
          : await patientApi.getMyConsultations();
        const c = (consults as any[]).find(c => c.idRdv === Number(id));
        setConsultation(c || null);
      } catch {
        toast.error('Erreur lors du chargement.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, role, navigate]);

  const handleConfirm = async () => {
    if (!appointment) return;
    try {
      await medecinApi.confirmAppointment(appointment.idRdv);
      toast.success('Rendez-vous confirmé !');
      setAppointment((p: any) => ({ ...p, statut: 'CONFIRME' }));
    } catch (e: any) { toast.error(e.message || 'Erreur confirmation'); }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    try {
      if (role === 'MEDECIN') await medecinApi.cancelAppointment(appointment.idRdv);
      else await patientApi.cancelAppointment(appointment.idRdv);
      toast.success('Rendez-vous annulé.');
      setAppointment((p: any) => ({ ...p, statut: 'ANNULE' }));
    } catch (e: any) { toast.error(e.message || 'Erreur annulation'); }
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnostic.trim()) { toast.error('Le diagnostic est requis'); return; }
    setConsultLoading(true);
    try {
      const c = await medecinApi.redigerConsultation(appointment.idRdv, { diagnostic, notesMedicales: notes, ordonnance });
      setConsultation(c);
      toast.success('Consultation enregistrée !');
      setIsConsultOpen(false);
    } catch (e: any) { toast.error(e.message || 'Erreur enregistrement'); }
    finally { setConsultLoading(false); }
  };

  if (loading) return (
    <DashboardShell active="Rendez-vous">
      <DashboardTopbar title="Détails du Rendez-vous" />
      <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
    </DashboardShell>
  );

  if (!appointment) return null;

  const dateHeure = appointment.dateHeure ? new Date(appointment.dateHeure) : null;

  return (
    <DashboardShell active="Rendez-vous">
      <DashboardTopbar title="Détails du Rendez-vous" />

      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Infos principales */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rendez-vous #{appointment.idRdv}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider ${STATUT_STYLE[appointment.statut] || 'bg-gray-100 text-gray-600'}`}>
                {appointment.statut}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-orange-500" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</p>
                  <p className="font-bold">{dateHeure ? dateHeure.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '–'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Clock className="w-5 h-5 text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Heure</p>
                  <p className="font-bold">{dateHeure ? dateHeure.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  {role === 'PATIENT' ? <Stethoscope className="w-5 h-5 text-purple-500" /> : <User className="w-5 h-5 text-purple-500" />}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{role === 'PATIENT' ? 'Médecin' : 'Patient'}</p>
                  <p className="font-bold">
                    {role === 'PATIENT'
                      ? `Dr. ${appointment.prenomMedecin || ''} ${appointment.nomMedecin || appointment.medecinNom || ''}`
                      : `${appointment.prenomPatient || ''} ${appointment.nomPatient || appointment.patientNom || ''}`}
                  </p>
                </div>
              </div>
              {appointment.motif && (
                <div className="flex items-start gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400" /></div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Motif</p>
                    <p className="font-medium">{appointment.motif}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {appointment.statut !== 'ANNULE' && (
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                {role === 'MEDECIN' && appointment.statut === 'ATTENTE' && (
                  <button onClick={handleConfirm} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Confirmer
                  </button>
                )}
                {role === 'MEDECIN' && appointment.statut === 'CONFIRME' && !consultation && (
                  <button onClick={() => setIsConsultOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    <Stethoscope className="w-4 h-4" /> Rédiger consultation
                  </button>
                )}
                <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">
                  <XCircle className="w-4 h-4" /> Annuler le RDV
                </button>
              </div>
            )}
          </div>

          {/* Consultation existante */}
          {consultation && (
            <div className="bg-white rounded-3xl border border-green-100 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-500" /> Compte-rendu de consultation
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Diagnostic</p>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">{consultation.diagnostic}</p>
                </div>
                {consultation.notesMedicales && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Notes médicales</p>
                    <p className="text-gray-700 bg-gray-50 rounded-xl p-4">{consultation.notesMedicales}</p>
                  </div>
                )}
                {consultation.ordonnance && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ordonnance</p>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-gray-700 whitespace-pre-line">{consultation.ordonnance}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar ODC */}
        <div className="space-y-5">
          <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-lg shadow-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/20">
                <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </div>
              <div>
                <p className="font-bold text-sm">MedConnect ODC</p>
                <p className="text-xs text-orange-200">RDV sécurisé</p>
              </div>
            </div>
            <p className="text-sm text-orange-100">Ce rendez-vous est géré de façon sécurisée par la plateforme MedConnect ODC-Guinée.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-3 text-sm">Informations RDV</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Durée</span>
                <span className="font-semibold">{appointment.duree || 30} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consultation</span>
                <span className={`font-semibold ${consultation ? 'text-green-600' : 'text-gray-400'}`}>{consultation ? 'Rédigée' : 'En attente'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal consultation */}
      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Rédiger la consultation</DialogTitle>
            <DialogDescription>Ces informations seront visibles dans le dossier médical du patient.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConsult} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Diagnostic *</label>
              <textarea required value={diagnostic} onChange={e => setDiagnostic(e.target.value)} rows={3} placeholder="Diagnostic principal..." className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Notes médicales</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Observations..." className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Ordonnance</label>
              <textarea value={ordonnance} onChange={e => setOrdonnance(e.target.value)} rows={2} placeholder="Médicaments prescrits..." className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setIsConsultOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={consultLoading} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center gap-2">
                {consultLoading && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default AppointmentDetails;
