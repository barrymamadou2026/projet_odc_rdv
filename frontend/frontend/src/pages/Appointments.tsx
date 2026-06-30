import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Clock, AlertCircle, CalendarPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi, medecinApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUT_STYLES: Record<string, string> = {
  ATTENTE: 'bg-orange-100 text-orange-700',
  CONFIRME: 'bg-green-100 text-green-700',
  ANNULE: 'bg-red-100 text-red-700',
};

const Appointments: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  // Disponibilité (médecin)
  const [isDispoOpen, setIsDispoOpen] = useState(false);
  const [dispoLoading, setDispoLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [duree, setDuree] = useState(30);

  // Consultation (médecin)
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [consultRdvId, setConsultRdvId] = useState<number | null>(null);
  const [consultLoading, setConsultLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState('');
  const [notes, setNotes] = useState('');
  const [ordonnance, setOrdonnance] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = role === 'PATIENT'
        ? await patientApi.getMyAppointments()
        : await medecinApi.getMyAppointments();
      setAppointments(data as any[]);
    } catch {
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConfirm = async (id: number) => {
    setActionId(id);
    try {
      await medecinApi.confirmAppointment(id);
      toast.success("Rendez-vous confirmé !");
      fetchData();
    } catch (e: any) { toast.error(e.message || "Erreur confirmation"); }
    finally { setActionId(null); }
  };

  const handleCancel = async (id: number) => {
    setActionId(id);
    try {
      if (role === 'MEDECIN') await medecinApi.cancelAppointment(id);
      else await patientApi.cancelAppointment(id);
      toast.success("Rendez-vous annulé.");
      fetchData();
    } catch (e: any) { toast.error(e.message || "Erreur annulation"); }
    finally { setActionId(null); }
  };

  const handleCreateDispo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !dateFin) { toast.error("Veuillez remplir toutes les dates"); return; }
    if (new Date(dateFin) <= new Date(dateDebut)) { toast.error("La date de fin doit être après la date de début"); return; }
    setDispoLoading(true);
    try {
      await medecinApi.createDisponibilite({
        dateDebut: new Date(dateDebut).toISOString(),
        dateFin: new Date(dateFin).toISOString(),
        duree,
      });
      toast.success("Créneau(x) créé(s) avec succès !");
      setIsDispoOpen(false);
      setDateDebut(''); setDateFin(''); setDuree(30);
    } catch (e: any) { toast.error(e.message || "Erreur création créneau"); }
    finally { setDispoLoading(false); }
  };

  const handleOpenConsult = (idRdv: number) => {
    setConsultRdvId(idRdv);
    setDiagnostic(''); setNotes(''); setOrdonnance('');
    setIsConsultOpen(true);
  };

  const handleSubmitConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultRdvId || !diagnostic.trim()) { toast.error("Le diagnostic est requis"); return; }
    setConsultLoading(true);
    try {
      await medecinApi.redigerConsultation(consultRdvId, { diagnostic, notesMedicales: notes, ordonnance });
      toast.success("Consultation enregistrée !");
      setIsConsultOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.message || "Erreur enregistrement consultation"); }
    finally { setConsultLoading(false); }
  };

  return (
    <DashboardShell active={role === 'MEDECIN' ? 'Mon Agenda' : 'Rendez-vous'}>
      <DashboardTopbar title={role === 'MEDECIN' ? 'Mon Agenda' : 'Mes Rendez-vous'} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-gray-500 text-sm">
          {role === 'PATIENT' ? "Vos consultations passées et à venir." : "Gérez vos rendez-vous et vos créneaux."}
        </p>
        <div className="flex gap-2">
          {role === 'PATIENT' && (
            <button onClick={() => navigate('/find-doctors')} className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors">
              <Plus className="w-4 h-4" /> Nouveau RDV
            </button>
          )}
          {role === 'MEDECIN' && (
            <button onClick={() => setIsDispoOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <CalendarPlus className="w-4 h-4" /> Ajouter un créneau
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-orange-500" /></div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 italic">Aucun rendez-vous trouvé.</p>
            {role === 'PATIENT' && (
              <button onClick={() => navigate('/find-doctors')} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Trouver un médecin
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-4">Date & Heure</th>
                  <th className="px-6 py-4">{role === 'PATIENT' ? 'Médecin' : 'Patient'}</th>
                  <th className="px-6 py-4">Motif</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((apt) => (
                  <tr key={apt.idRdv} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <Calendar className="w-4 h-4 text-orange-500" />
                        {apt.dateHeure ? new Date(apt.dateHeure).toLocaleDateString('fr-FR') : '–'}
                      </div>
                      <div className="text-xs text-gray-400 pl-6 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apt.dateHeure ? new Date(apt.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">
                          {role === 'PATIENT'
                            ? (apt.prenomMedecin || apt.medecinNom || 'M')[0]
                            : (apt.prenomPatient || apt.patientNom || 'P')[0]}
                        </div>
                        <span className="font-medium text-gray-700 text-sm">
                          {role === 'PATIENT'
                            ? `Dr. ${apt.prenomMedecin || ''} ${apt.nomMedecin || apt.medecinNom || ''}`
                            : `${apt.prenomPatient || ''} ${apt.nomPatient || apt.patientNom || ''}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[180px] truncate">{apt.motif || '–'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider ${STATUT_STYLES[apt.statut] || 'bg-gray-100 text-gray-600'}`}>
                        {apt.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {role === 'MEDECIN' && apt.statut === 'ATTENTE' && (
                          <button onClick={() => handleConfirm(apt.idRdv)} disabled={actionId === apt.idRdv} title="Confirmer" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {role === 'MEDECIN' && apt.statut === 'CONFIRME' && (
                          <button onClick={() => handleOpenConsult(apt.idRdv)} title="Rédiger consultation" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold">
                            Consulter
                          </button>
                        )}
                        {(apt.statut === 'ATTENTE' || apt.statut === 'CONFIRME') && (
                          <button onClick={() => handleCancel(apt.idRdv)} disabled={actionId === apt.idRdv} title="Annuler" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => navigate(`/appointments/${apt.idRdv}`)} className="text-xs font-bold text-orange-600 hover:text-orange-700 px-2">
                          Détails
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal créneau médecin */}
      <Dialog open={isDispoOpen} onOpenChange={setIsDispoOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Ouvrir un créneau</DialogTitle>
            <DialogDescription>Les patients pourront réserver dans cette plage horaire.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateDispo} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Date & heure de début *</label>
              <input type="datetime-local" required value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Date & heure de fin *</label>
              <input type="datetime-local" required value={dateFin} onChange={e => setDateFin(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Durée par créneau (minutes)</label>
              <select value={duree} onChange={e => setDuree(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400">
                {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setIsDispoOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={dispoLoading} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2">
                {dispoLoading && <Loader2 className="w-4 h-4 animate-spin" />} Créer
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal consultation médecin */}
      <Dialog open={isConsultOpen} onOpenChange={setIsConsultOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Rédiger une consultation</DialogTitle>
            <DialogDescription>Ces informations seront visibles dans le dossier médical du patient.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitConsult} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Diagnostic *</label>
              <textarea required value={diagnostic} onChange={e => setDiagnostic(e.target.value)} rows={3} placeholder="Diagnostic principal..." className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Notes médicales</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Observations, notes..." className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
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

export default Appointments;
