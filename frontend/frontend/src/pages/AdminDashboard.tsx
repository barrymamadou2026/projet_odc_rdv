import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, AlertTriangle, Plus, Shield, ShieldOff, Trash2, X } from 'lucide-react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

interface UserData {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  estActif: boolean;
}

interface AppointmentData {
  idRendezVous: number;
  patientNom: string;
  medecinNom: string;
  dateHeure: string;
  statut: string;
}

interface Specialite {
  idSpecialite: number;
  nom: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    activeUsers: 0,
    pendingAppointments: 0
  });

  // Formulaire médecin
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    idSpecialite: '',
    telephone: '',
    adresse: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, apptsData, specsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAllAppointments(),
        adminApi.getSpecialites()
      ]);
      
      setUsers(usersData as UserData[]);
      setAppointments(apptsData as AppointmentData[]);
      setSpecialites(specsData as Specialite[]);
      
      setStats({
        totalUsers: (usersData as UserData[]).length,
        totalAppointments: (apptsData as AppointmentData[]).length,
        activeUsers: (usersData as UserData[]).filter(u => u.estActif).length,
        pendingAppointments: (apptsData as AppointmentData[]).filter(a => a.statut === 'EN_ATTENTE').length
      });
    } catch (error) {
      toast.error("Erreur lors de la récupération des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUserStatus = async (user: UserData) => {
    try {
      if (user.estActif) {
        await adminApi.deactivateUser(user.idUtilisateur);
        toast.success(`Utilisateur désactivé`);
      } else {
        await adminApi.activateUser(user.idUtilisateur);
        toast.success(`Utilisateur activé`);
      }
      fetchData();
    } catch (error) {
      toast.error("Erreur de modification");
    }
  };

  const handleCreateMedecin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createDoctor({
        ...form,
        idSpecialite: parseInt(form.idSpecialite)
      });
      toast.success("Médecin créé avec succès");
      setShowModal(false);
      setForm({ nom: '', prenom: '', email: '', password: '', idSpecialite: '', telephone: '', adresse: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    }
  };

  const STATS_CARDS = [
    { icon: Users, label: 'Utilisateurs', value: stats.totalUsers.toString(), color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: CalendarCheck, label: 'Rendez-vous', value: stats.totalAppointments.toString(), color: 'bg-green-50', iconColor: 'text-green-500' },
    { icon: Shield, label: 'Actifs', value: stats.activeUsers.toString(), color: 'bg-purple-50', iconColor: 'text-purple-500' },
    { icon: AlertTriangle, label: 'En Attente', value: stats.pendingAppointments.toString(), color: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  return (
    <DashboardShell active="Dashboard">
      <DashboardTopbar title="Tableau de Bord Admin" showSearch={false} rightLabel="Admin Console" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS_CARDS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-4`}>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Utilisateurs</h3>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold flex items-center gap-2 hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter Médecin
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-gray-400 uppercase border-b">
              <tr>
                <th className="py-3">Nom</th>
                <th className="py-3">Rôle</th>
                <th className="py-3">Statut</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.idUtilisateur} className="border-b hover:bg-gray-50">
                  <td className="py-4">
                    <p className="font-semibold">{u.prenom} {u.nom}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td><span className="text-xs font-bold px-2 py-1 rounded bg-gray-100">{u.role}</span></td>
                  <td>
                    <span className={`text-xs font-bold flex items-center gap-1 ${u.estActif ? 'text-green-600' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${u.estActif ? 'bg-green-500' : 'bg-red-500'}`} />
                      {u.estActif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => toggleUserStatus(u)} className="p-2 text-gray-400 hover:text-orange-500">
                      {u.estActif ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout Médecin */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6">Ajouter un Médecin</h2>
            <form onSubmit={handleCreateMedecin} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Prénom" required className="w-full p-3 rounded-xl border" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} />
                <input placeholder="Nom" required className="w-full p-3 rounded-xl border" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} />
              </div>
              <input type="email" placeholder="Email" required className="w-full p-3 rounded-xl border" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <input type="password" placeholder="Mot de passe" required className="w-full p-3 rounded-xl border" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              <select required className="w-full p-3 rounded-xl border" value={form.idSpecialite} onChange={e => setForm({...form, idSpecialite: e.target.value})}>
                <option value="">Sélectionner une spécialité</option>
                {specialites.map(s => <option key={s.idSpecialite} value={s.idSpecialite}>{s.nom}</option>)}
              </select>
              <input placeholder="Téléphone" className="w-full p-3 rounded-xl border" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
              <input placeholder="Adresse" className="w-full p-3 rounded-xl border" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} />
              <button type="submit" className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600">Créer le compte</button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default AdminDashboard;
