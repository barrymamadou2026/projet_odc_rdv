import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, AlertCircle, Loader2, Star, MapPin } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';

const AVATAR_COLORS = ['bg-orange-500','bg-blue-600','bg-green-600','bg-purple-600','bg-pink-600'];

const FindDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disposLoading, setDisposLoading] = useState(false);
  const [disponibilites, setDisponibilites] = useState<any[]>([]);
  const [motif, setMotif] = useState('');
  const [idDispo, setIdDispo] = useState<string>('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    patientApi.getAllDoctors()
      .then(data => setDoctors(data as any[]))
      .catch(() => toast.error("Erreur lors du chargement des médecins"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenBooking = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setMotif('');
    setIdDispo('');
    setDisposLoading(true);
    try {
      // Utiliser l'endpoint dédié par médecin
      const dispos = await patientApi.getDoctorDisponibilites(doctor.idMedecin);
      // Filtrer uniquement les créneaux libres
      const libres = (dispos as any[]).filter(d => d.estLibre !== false);
      setDisponibilites(libres);
    } catch {
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setDisposLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDispo) { toast.error("Sélectionnez un créneau"); return; }
    if (!motif.trim()) { toast.error("Veuillez saisir un motif"); return; }
    setBookingLoading(true);
    try {
      await patientApi.bookAppointment({ idDispo: Number(idDispo), motif });
      toast.success("Rendez-vous pris avec succès !");
      setIsModalOpen(false);
      navigate('/appointments');
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la réservation");
    } finally {
      setBookingLoading(false);
    }
  };

  const filtered = doctors.filter(d => {
    const q = searchTerm.toLowerCase();
    return !q || (d.nom + ' ' + d.prenom + ' ' + (d.specialiteNom || '')).toLowerCase().includes(q);
  });

  return (
    <DashboardShell active="Trouver un Médecin">
      <DashboardTopbar title="Trouver un Médecin" />

      {/* Barre de recherche */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, spécialité..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-400 text-sm shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">Aucun médecin trouvé</p>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-3 text-orange-500 text-sm font-bold hover:underline">Effacer la recherche</button>}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 font-semibold mb-4">{filtered.length} médecin{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc, i) => (
              <div key={doc.idMedecin} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-orange-200 transition-all flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-xl shrink-0`}>
                    {doc.prenom?.[0]}{doc.nom?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-gray-900 truncate">Dr. {doc.prenom} {doc.nom}</p>
                    <p className="text-sm text-orange-500 font-semibold truncate">{doc.specialiteNom || 'Généraliste'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_,j) => <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                      <span className="text-xs text-gray-400 ml-1">5.0</span>
                    </div>
                  </div>
                </div>
                {doc.adresse && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                    <MapPin className="w-3 h-3 shrink-0" />{doc.adresse}
                  </div>
                )}
                {doc.telephone && (
                  <p className="text-xs text-gray-400 mb-4">📞 {doc.telephone}</p>
                )}
                <button
                  onClick={() => handleOpenBooking(doc)}
                  disabled={role !== 'PATIENT'}
                  className="mt-auto w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 text-sm disabled:bg-gray-200 disabled:text-gray-400"
                >
                  <Calendar className="w-4 h-4" />
                  {role === 'PATIENT' ? 'Prendre RDV' : 'Consultation réservée aux patients'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal RDV */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Réserver un RDV</DialogTitle>
            <DialogDescription className="text-orange-500 font-semibold">
              Dr. {selectedDoctor?.prenom} {selectedDoctor?.nom} · {selectedDoctor?.specialiteNom || 'Généraliste'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4 mt-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Créneau disponible *</label>
              {disposLoading ? (
                <div className="flex items-center gap-2 py-4 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des créneaux...</div>
              ) : disponibilites.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-orange-500 bg-orange-50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> Aucun créneau disponible pour ce médecin
                </div>
              ) : (
                <select required value={idDispo} onChange={e => setIdDispo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">— Sélectionner un créneau —</option>
                  {disponibilites.map(d => {
                    const start = d.dateDebut ? new Date(d.dateDebut) : null;
                    return (
                      <option key={d.idDispo} value={d.idDispo}>
                        {start ? start.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : `Créneau #${d.idDispo}`}
                        {d.duree ? ` (${d.duree} min)` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Motif de la consultation *</label>
              <textarea required value={motif} onChange={e => setMotif(e.target.value)} rows={3}
                placeholder="Décrivez brièvement la raison de votre consultation..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 text-sm">Annuler</button>
              <button type="submit" disabled={bookingLoading || disponibilites.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-black hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 text-sm">
                {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />} Confirmer
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default FindDoctors;
