import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Banknote, SlidersHorizontal, Calendar as CalendarIcon, FileText } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi } from '@/lib/api';
import { toast } from 'sonner';

// Imports pour la boîte de dialogue Shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FindDoctors: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la gestion du rendez-vous
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [disposLoading, setDisposLoading] = useState(false);
  const [disponibilites, setDisponibilites] = useState<any[]>([]);
  
  // Champs du formulaire de réservation
  const [motif, setMotif] = useState('');
  const [idDispo, setIdDispo] = useState<number | string>(''); // Id de la disponibilité choisie

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await patientApi.getAllDoctors();
        setDoctors(data as any[]);
      } catch (error) {
        toast.error("Erreur lors du chargement des médecins");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleOpenBooking = async (doctor: any) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setDisposLoading(true);
    try {
      const allDispos: any = await patientApi.getDisponibilites();
      // On filtre les dispos libres pour ce médecin
      const doctorDispos = allDispos.filter((d: any) => d.medecinNom === doctor.nom || d.medecinNom === `${doctor.prenom} ${doctor.nom}`);
      setDisponibilites(doctorDispos);
    } catch (error) {
      toast.error("Erreur lors du chargement des créneaux");
    } finally {
      setDisposLoading(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motif.trim()) {
      toast.error("Veuillez saisir un motif de consultation");
      return;
    }

    setBookingLoading(true);
    try {
      // NOTE : Votre backend attend un objet avec idDispo et motif
      // Pour l'instant, on passe une valeur factice 1 si aucun système de créneau n'est sélectionné, 
      // ou remplacez par le vrai ID du créneau disponible.
      await patientApi.bookAppointment({
        idDispo: Number(idDispo) || 1, 
        motif: motif
      });

      toast.success("Rendez-vous réservé avec succès !");
      setIsModalOpen(false);
      
      // Une fois le RDV créé, on redirige l'utilisateur vers la page Appointments
      navigate('/appointments');
    } catch (error) {
      toast.error("Le créneau sélectionné n'est plus disponible ou erreur serveur.");
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const nom = d.nom || '';
    const prenom = d.prenom || '';
    const specialite = d.specialiteNom || '';
    return (nom + prenom + specialite).toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <DashboardShell active="Recherche">
      <DashboardTopbar title="Trouver un Praticien" />

      {/* Barre de recherche */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recherchez votre médecin</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom, spécialité..." 
              className="bg-transparent outline-none w-full" 
            />
          </div>
          <button className="px-8 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors">
            Rechercher
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{filteredDoctors.length} Praticiens trouvés</h3>
        <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-500">
          <SlidersHorizontal className="w-4 h-4" /> Filtres
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement des praticiens...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((d) => (
            <div key={d.idMedecin} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                  {d.nom ? d.nom[0] : 'Dr'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Dr. {d.prenom} {d.nom}</h4>
                  <p className="text-orange-600 text-sm font-semibold">{d.specialiteNom}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-500">4.9 (120 avis)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{d.adresse || 'Adresse non renseignée'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  <span>Consultation à partir de 25€</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Profil
                </button>
                {/* BRANCHEMENT DU CLIC ICI */}
                <button 
                  onClick={() => handleOpenBooking(d)}
                  className="py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Prendre RDV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOÎTE DE DIALOGUE (MODAL) DU FORMULAIRE DE CRÉATION DE RDV */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Prendre Rendez-vous</DialogTitle>
            <DialogDescription>
              {selectedDoctor && `Formulaire de consultation avec le Dr. ${selectedDoctor.prenom} ${selectedDoctor.nom}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookAppointment} className="space-y-4 mt-4">
            
            {/* Sélection du créneau */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-orange-500" /> Choisir un créneau disponible
              </label>
              {disposLoading ? (
                <div className="text-sm text-gray-400 py-2">Chargement des créneaux...</div>
              ) : disponibilites.length === 0 ? (
                <div className="text-sm text-red-500 py-2 font-semibold">Aucun créneau libre pour ce médecin.</div>
              ) : (
                <select 
                  value={idDispo}
                  onChange={(e) => setIdDispo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm appearance-none"
                  required
                >
                  <option value="">Sélectionnez un horaire</option>
                  {disponibilites.map(d => (
                    <option key={d.idDispo} value={d.idDispo}>
                      {new Date(d.dateDebut).toLocaleString()} ({d.duree} min)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Textarea pour le Motif */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3 h-3 text-orange-500" /> Motif de la consultation
              </label>
              <textarea
                rows={3}
                placeholder="Décrivez brièvement la raison de votre visite (ex: Contrôle annuel, Fièvre...)"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm resize-none"
                required
              />
            </div>

            {/* Actions du formulaire */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                disabled={bookingLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-orange-500 text-white font-bold text-sm rounded-xl hover:bg-orange-600 transition-colors shadow-sm disabled:bg-gray-300"
                disabled={bookingLoading}
              >
                {bookingLoading ? "Validation..." : "Confirmer le RDV"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </DashboardShell>
  );
};

export default FindDoctors;