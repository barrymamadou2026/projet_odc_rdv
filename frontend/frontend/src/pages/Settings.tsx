import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Camera, Loader2, KeyRound, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [antecedents, setAntecedents] = useState('');
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [imgOpen, setImgOpen] = useState(false);
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    userApi.getProfile()
      .then(p => {
        setProfile(p);
        setNom(p.nom || '');
        setPrenom(p.prenom || '');
        setEmail(p.email || '');
        setTelephone(p.telephone || '');
        setAdresse(p.adresse || '');
        setAntecedents(p.antecedentsMedicaux || '');
        setProfileImg(p.profileImageUrl || null);
      })
      .catch(() => toast.error('Erreur lors du chargement du profil.'))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const updated = await userApi.updateProfile({ nom, prenom, email, telephone, adresse, antecedentsMedicaux: antecedents });
      setProfile(updated);
      toast.success('Profil mis à jour !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur mise à jour.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error("Les mots de passe ne correspondent pas."); return; }
    if (newPwd.length < 6) { toast.error("Minimum 6 caractères requis."); return; }
    setPwdLoading(true);
    try {
      await userApi.changePassword({ oldPassword: oldPwd, newPassword: newPwd });
      toast.success('Mot de passe modifié avec succès !');
      setPwdOpen(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      toast.error(err.message || 'Erreur changement de mot de passe.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleImgUpload = async () => {
    if (!selectedImg) { toast.error('Sélectionnez une image.'); return; }
    setImgLoading(true);
    try {
      const url = await userApi.uploadProfileImage(selectedImg);
      setProfileImg(url);
      toast.success('Photo de profil mise à jour !');
      setImgOpen(false);
      setSelectedImg(null);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du téléchargement.');
    } finally {
      setImgLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <DashboardShell active="Paramètres">
        <DashboardTopbar title="Paramètres" />
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell active="Paramètres">
      <DashboardTopbar title="Paramètres du Compte" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar profil */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              {profileImg ? (
                <img src={profileImg} alt="Profil" className="w-24 h-24 rounded-2xl object-cover border-4 border-orange-100" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 text-3xl font-black border-4 border-orange-50">
                  {prenom?.[0]}{nom?.[0]}
                </div>
              )}
              <button onClick={() => setImgOpen(true)} className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="font-bold text-gray-900">{prenom} {nom}</p>
            <p className="text-sm text-gray-500">{email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase">{role}</span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-3">Sécurité</h4>
            <button onClick={() => setPwdOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 font-semibold text-sm transition-colors border border-gray-100">
              <KeyRound className="w-4 h-4 text-orange-500" /> Changer le mot de passe
            </button>
          </div>

          <div className="bg-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20">
                <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
              </div>
              <div>
                <p className="font-bold text-sm">ODC-Guinée</p>
                <p className="text-xs text-orange-200">Projet de Fin de Formation</p>
              </div>
            </div>
            <p className="text-xs text-orange-100">MedConnect – Plateforme de gestion médicale sécurisée.</p>
          </div>
        </div>

        {/* Formulaire principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h3>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prenom" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prénom</Label>
                  <Input id="prenom" value={prenom} onChange={e => setPrenom(e.target.value)} className="mt-1 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="nom" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</Label>
                  <Input id="nom" value={nom} onChange={e => setNom(e.target.value)} className="mt-1 rounded-xl" />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="tel" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</Label>
                <Input id="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="adresse" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Adresse</Label>
                <Input id="adresse" value={adresse} onChange={e => setAdresse(e.target.value)} className="mt-1 rounded-xl" />
              </div>
              {role === 'PATIENT' && (
                <div>
                  <Label htmlFor="ant" className="text-xs font-bold text-gray-500 uppercase tracking-wider">Antécédents médicaux</Label>
                  <Textarea id="ant" value={antecedents} onChange={e => setAntecedents(e.target.value)} rows={3} className="mt-1 rounded-xl resize-none" />
                </div>
              )}
              <button type="submit" disabled={updateLoading} className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:bg-gray-300 transition-colors shadow-sm">
                {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {updateLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Changer le mot de passe</DialogTitle>
            <DialogDescription>Saisissez votre mot de passe actuel puis le nouveau.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePwd} className="space-y-4 mt-3">
            <div><Label>Mot de passe actuel</Label><Input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required className="mt-1 rounded-xl" /></div>
            <div><Label>Nouveau mot de passe</Label><Input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required className="mt-1 rounded-xl" /></div>
            <div><Label>Confirmer le nouveau mot de passe</Label><Input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required className="mt-1 rounded-xl" /></div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setPwdOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={pwdLoading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
                {pwdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal photo de profil */}
      <Dialog open={imgOpen} onOpenChange={setImgOpen}>
        <DialogContent className="sm:max-w-sm bg-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Photo de profil</DialogTitle>
            <DialogDescription>Téléchargez une nouvelle photo (.jpg, .png, .webp)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-3">
            <input type="file" accept="image/*" onChange={e => setSelectedImg(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
            {selectedImg && <p className="text-sm text-gray-500">Fichier sélectionné : {selectedImg.name}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setImgOpen(false)}>Annuler</Button>
              <Button onClick={handleImgUpload} disabled={imgLoading || !selectedImg} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
                {imgLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Télécharger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
};

export default Settings;
