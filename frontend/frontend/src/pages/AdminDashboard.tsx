import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, AlertTriangle, Plus, Shield, ShieldOff, X, Loader2, LayoutGrid, List, Stethoscope, Bell, FileText } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserData { idUtilisateur: number; nom: string; prenom: string; email: string; role: string; estActif: boolean; }
interface AppointmentData { idRendezVous: number; patientNom: string; medecinNom: string; dateHeure: string; statut: string; }
interface Specialite { idSpecialite: number; nom: string; }
interface ConsultationData { idConsultation: number; dateConsultation: string; diagnostic: string; notesMedicales?: string; ordonnance?: string; nomMedecin?: string; prenomMedecin?: string; nomPatient?: string; prenomPatient?: string; }
interface NotificationData { id: number; message: string; dateEnvoi: string; estLu: boolean; type: string; }

const STATUT_STYLES: Record<string, string> = {
  ATTENTE: 'bg-orange-100 text-orange-700',
  EN_ATTENTE: 'bg-orange-100 text-orange-700',
  CONFIRME: 'bg-green-100 text-green-700',
  ANNULE: 'bg-red-100 text-red-700',
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'appointments' | 'consultations' | 'notifications'>('users');
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', password: '', idSpecialite: '', telephone: '', adresse: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Promise.allSettled : si un seul endpoint échoue (ex: table manquante,
    // erreur ponctuelle), les autres continuent de s'afficher au lieu de
    // tout vider silencieusement (c'était le bug précédent avec Promise.all).
    const results = await Promise.allSettled([
      adminApi.getUsers(),
      adminApi.getAllAppointments(),
      adminApi.getSpecialites(),
      adminApi.getAllConsultations(),
      adminApi.getAllNotifications(),
    ]);
    const [u, a, s, c, n] = results;
    if (u.status === 'fulfilled') setUsers(u.value as UserData[]);
    if (a.status === 'fulfilled') setAppointments(a.value as AppointmentData[]);
    if (s.status === 'fulfilled') setSpecialites(s.value as Specialite[]);
    if (c.status === 'fulfilled') setConsultations(c.value as ConsultationData[]);
    if (n.status === 'fulfilled') setNotifications(n.value as NotificationData[]);

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.error('Échecs de chargement admin:', failed);
      toast.error(`${failed.length} section(s) n'ont pas pu être chargées`);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleUserStatus = async (u: UserData) => {
    try {
      if (u.estActif) await adminApi.deactivateUser(u.idUtilisateur);
      else await adminApi.activateUser(u.idUtilisateur);
      toast.success(`Utilisateur ${u.estActif ? 'désactivé' : 'activé'}`);
      setUsers(prev => prev.map(x => x.idUtilisateur === u.idUtilisateur ? { ...x, estActif: !u.estActif } : x));
    } catch (e: any) { toast.error(e.message || "Erreur"); }
  };

  const handleCreateMedecin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idSpecialite) { toast.error("Sélectionnez une spécialité"); return; }
    setCreating(true);
    try {
      await adminApi.createDoctor({ ...form, idSpecialite: Number(form.idSpecialite) });
      toast.success("Médecin créé avec succès !");
      setShowModal(false);
      setForm({ nom: '', prenom: '', email: '', password: '', idSpecialite: '', telephone: '', adresse: '' });
      fetchData();
    } catch (e: any) { toast.error(e.message || "Erreur lors de la création"); }
    finally { setCreating(false); }
  };

  const stats = [
    { icon: Users,         label: 'Utilisateurs',  value: users.length,                                                             color: 'bg-blue-50',   iconColor: 'text-blue-500' },
    { icon: CalendarCheck, label: 'Rendez-vous',    value: appointments.length,                                                      color: 'bg-green-50',  iconColor: 'text-green-500' },
    { icon: Shield,        label: 'Actifs',         value: users.filter(u => u.estActif).length,                                     color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { icon: AlertTriangle, label: 'En Attente',     value: appointments.filter(a => ['ATTENTE','EN_ATTENTE'].includes(a.statut)).length, color: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  const TABS = [
    { key: 'users' as const,         label: 'Utilisateurs',   icon: LayoutGrid },
    { key: 'appointments' as const,  label: 'Rendez-vous',    icon: List },
    { key: 'consultations' as const, label: 'Consultations',  icon: Stethoscope },
    { key: 'notifications' as const, label: 'Notifications',  icon: Bell },
  ];

  return (
    <DashboardShell active="Dashboard">
      <DashboardTopbar title="Tableau de Bord Admin" rightLabel="Admin Console" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-xs text-gray-400 font-semibold">{s.label}</p>
            <p className="text-2xl font-black text-gray-900">{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs — Supervision totale : Utilisateurs / RDV / Consultations / Notifications */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'users' && (
            <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Ajouter Médecin
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-orange-400" /></div>
        ) : activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3 pr-4">Utilisateur</th>
                  <th className="py-3 pr-4">Rôle</th>
                  <th className="py-3 pr-4">Statut</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-400">Aucun utilisateur</td></tr>
                ) : users.map(u => (
                  <tr key={u.idUtilisateur} className="hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="pr-4"><span className={`text-xs font-bold px-2 py-1 rounded-lg ${u.role === 'MEDECIN' ? 'bg-blue-100 text-blue-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                    <td className="pr-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${u.estActif ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.estActif ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.estActif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button onClick={() => toggleUserStatus(u)} title={u.estActif ? 'Désactiver' : 'Activer'} className={`p-2 rounded-lg transition-colors ${u.estActif ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        {u.estActif ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="py-3 pr-4">Patient</th>
                  <th className="py-3 pr-4">Médecin</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-400">Aucun rendez-vous</td></tr>
                ) : appointments.map(a => (
                  <tr key={a.idRendezVous} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{a.patientNom}</td>
                    <td className="pr-4 text-gray-600">Dr. {a.medecinNom}</td>
                    <td className="pr-4 text-gray-500 text-xs">{a.dateHeure ? new Date(a.dateHeure).toLocaleString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '–'}</td>
                    <td><span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${STATUT_STYLES[a.statut] || 'bg-gray-100 text-gray-500'}`}>{a.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'consultations' ? (
          consultations.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Aucune consultation enregistrée sur la plateforme
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map(c => (
                <div key={c.idConsultation} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{c.diagnostic || 'Consultation générale'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Dr. {c.prenomMedecin} {c.nomMedecin} → Patient {c.prenomPatient} {c.nomPatient}
                    </p>
                    {c.ordonnance && (
                      <div className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        <FileText className="w-3 h-3" /> Ordonnance délivrée
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 shrink-0">{c.dateConsultation ? new Date(c.dateConsultation).toLocaleDateString('fr-FR') : '–'}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          notifications.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Aucune notification envoyée
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className={`flex items-center gap-3 p-3 rounded-xl border ${n.estLu ? 'border-gray-100 bg-white' : 'border-orange-100 bg-orange-50/50'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${n.estLu ? 'bg-gray-300' : 'bg-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400">{n.type} · {n.dateEnvoi ? new Date(n.dateEnvoi).toLocaleString('fr-FR') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal Ajout Médecin */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black mb-6 text-gray-900">Nouveau Médecin</h2>
            <form onSubmit={handleCreateMedecin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Prénom *</label>
                  <input placeholder="Prénom" required className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nom *</label>
                  <input placeholder="Nom" required className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Email *</label>
                <input type="email" placeholder="email@exemple.com" required className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Mot de passe *</label>
                <input type="password" placeholder="••••••••" required className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Spécialité *</label>
                <select required className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.idSpecialite} onChange={e => setForm({ ...form, idSpecialite: e.target.value })}>
                  <option value="">— Sélectionner —</option>
                  {specialites.map(s => <option key={s.idSpecialite} value={s.idSpecialite}>{s.nom}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Téléphone</label>
                  <input placeholder="+224..." className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Adresse</label>
                  <input placeholder="Adresse" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-orange-400 text-sm" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={creating} className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-black hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />} Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;
