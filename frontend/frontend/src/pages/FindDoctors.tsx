import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, AlertCircle, Loader2, Star, MapPin, Navigation, List, Map as MapIcon } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { patientApi } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';

const AVATAR_COLORS = ['bg-orange-500','bg-blue-600','bg-green-600','bg-purple-600','bg-pink-600'];

// Charge Leaflet (OpenStreetMap) une seule fois via CDN — pas besoin de clé API,
// idéal pour un patient étranger ou de passage qui veut juste voir les hôpitaux
// les plus proches sur une carte.
function useLeaflet() {
  const [ready, setReady] = useState<boolean>(!!(window as any).L);
  useEffect(() => {
    if ((window as any).L) { setReady(true); return; }
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const scriptId = 'leaflet-js';
    if (document.getElementById(scriptId)) {
      const check = setInterval(() => { if ((window as any).L) { setReady(true); clearInterval(check); } }, 100);
      return () => clearInterval(check);
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);
  return ready;
}

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

  // --- Recherche "à proximité" (patients étrangers / de passage) ---
  const [view, setView] = useState<'liste' | 'carte'>('liste');
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletReady = useLeaflet();

  useEffect(() => {
    patientApi.getAllDoctors()
      .then(data => setDoctors(data as any[]))
      .catch(() => toast.error("Erreur lors du chargement des médecins"))
      .finally(() => setLoading(false));
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        try {
          const nearby = await patientApi.getNearbyDoctors(latitude, longitude, 50);
          if ((nearby as any[]).length === 0) {
            toast.info("Aucun médecin géolocalisé trouvé dans un rayon de 50 km pour l'instant.");
          } else {
            toast.success(`${(nearby as any[]).length} structure(s) trouvée(s) près de vous`);
          }
          setDoctors(nearby as any[]);
          setView('carte');
        } catch {
          toast.error("Erreur lors de la recherche à proximité");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Impossible d'obtenir votre position. Vérifiez les autorisations de localisation.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Construit/actualise la carte Leaflet quand on est en vue "carte"
  useEffect(() => {
    if (view !== 'carte' || !leafletReady || !mapRef.current) return;
    const L = (window as any).L;

    const withCoords = filteredDoctorsRef.current.filter((d: any) => d.latitude && d.longitude);
    const center = userPos || (withCoords[0] ? { lat: withCoords[0].latitude, lng: withCoords[0].longitude } : { lat: 9.6412, lng: -13.5784 }); // Conakry par défaut

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], userPos ? 12 : 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng], userPos ? 12 : 7);
    }

    // Nettoie les anciens marqueurs avant d'en remettre
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
    });

    if (userPos) {
      const meIcon = L.divIcon({ className: '', html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #3b82f6"></div>' });
      L.marker([userPos.lat, userPos.lng], { icon: meIcon }).addTo(mapInstanceRef.current).bindPopup('Vous êtes ici');
    }

    withCoords.forEach((doc: any) => {
      const marker = L.marker([doc.latitude, doc.longitude]).addTo(mapInstanceRef.current);
      const distanceLabel = doc.distanceKm != null ? `<br/>${doc.distanceKm} km` : '';
      marker.bindPopup(`<b>Dr. ${doc.prenom} ${doc.nom}</b><br/>${doc.specialiteNom || doc.specialite || 'Généraliste'}${distanceLabel}`);
    });
  }, [view, leafletReady, doctors, userPos]);

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
    return !q || (d.nom + ' ' + d.prenom + ' ' + (d.specialiteNom || d.specialite || '')).toLowerCase().includes(q);
  });
  // Ref à jour pour être lue dans l'effet Leaflet sans le redéclencher sur chaque frappe de recherche
  const filteredDoctorsRef = useRef(filtered);
  filteredDoctorsRef.current = filtered;

  return (
    <DashboardShell active="Trouver un Médecin">
      <DashboardTopbar title="Trouver un Médecin" />

      {/* Barre de recherche + à proximité */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-orange-400 text-sm shadow-sm"
          />
        </div>
        <button
          onClick={handleUseMyLocation}
          disabled={locating}
          title="Utile si vous êtes de passage ou étranger et ne connaissez pas les structures locales"
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors disabled:opacity-60 shrink-0"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {locating ? 'Localisation...' : 'Hôpitaux près de moi'}
        </button>
      </div>

      {/* Toggle Liste / Carte */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => setView('liste')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${view === 'liste' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          <List className="w-3.5 h-3.5" /> Liste
        </button>
        <button onClick={() => setView('carte')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${view === 'carte' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          <MapIcon className="w-3.5 h-3.5" /> Carte
        </button>
        {userPos && (
          <span className="text-xs text-gray-400 ml-1">Trié par distance depuis votre position</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold">Aucun médecin trouvé</p>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="mt-3 text-orange-500 text-sm font-bold hover:underline">Effacer la recherche</button>}
        </div>
      ) : view === 'carte' ? (
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div ref={mapRef} style={{ height: '420px', width: '100%' }} />
          {!leafletReady && (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-orange-400" /></div>
          )}
          <div className="p-4 bg-white grid sm:grid-cols-2 gap-3">
            {filtered.filter(d => d.latitude && d.longitude).map(doc => (
              <div key={doc.idMedecin} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">Dr. {doc.prenom} {doc.nom}</p>
                  <p className="text-xs text-orange-500 truncate">{doc.specialiteNom || doc.specialite || 'Généraliste'}</p>
                  {doc.distanceKm != null && <p className="text-xs text-gray-400">{doc.distanceKm} km</p>}
                </div>
                <button onClick={() => handleOpenBooking(doc)} disabled={role !== 'PATIENT'}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400">
                  RDV
                </button>
              </div>
            ))}
            {filtered.filter(d => d.latitude && d.longitude).length === 0 && (
              <p className="text-sm text-gray-400 col-span-2 text-center py-4">Aucune structure géolocalisée à afficher pour l'instant.</p>
            )}
          </div>
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
                    <p className="text-sm text-orange-500 font-semibold truncate">{doc.specialiteNom || doc.specialite || 'Généraliste'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_,j) => <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                      <span className="text-xs text-gray-400 ml-1">5.0</span>
                      {doc.distanceKm != null && <span className="text-xs text-blue-500 font-bold ml-2">· {doc.distanceKm} km</span>}
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
              Dr. {selectedDoctor?.prenom} {selectedDoctor?.nom} · {selectedDoctor?.specialiteNom || selectedDoctor?.specialite || 'Généraliste'}
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
