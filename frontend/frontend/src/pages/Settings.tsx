import React, { useState, useEffect } from 'react';
import DashboardShell from '@/components/medic/DashboardShell';
import DashboardTopbar from '@/components/medic/DashboardTopbar';
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Bell, Shield, Globe, Camera, Loader2, KeyRound } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, role } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [antecedentsMedicaux, setAntecedentsMedicaux] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await userApi.getUserProfile();
        setUserProfile(profile);
        setNom(profile.nom);
        setPrenom(profile.prenom);
        setEmail(profile.email);
        setTelephone(profile.telephone || '');
        setAdresse(profile.adresse || '');
        setAntecedentsMedicaux(profile.antecedentsMedicaux || '');
        setProfileImageUrl(profile.profileImageUrl || null);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.error('Erreur lors du chargement du profil.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileUpdateLoading(true);
    try {
      const updatedProfile = await userApi.updateProfile({
        nom,
        prenom,
        email,
        telephone,
        adresse,
        antecedentsMedicaux,
      });
      setUserProfile(updatedProfile);
      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await userApi.changePassword({ oldPassword, newPassword });
      toast.success(response);
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      toast.error(error.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error('Veuillez sélectionner une image à télécharger.');
      return;
    }
    setImageUploadLoading(true);
    try {
      const imageUrl = await userApi.uploadProfileImage(selectedImage);
      setProfileImageUrl(imageUrl);
      toast.success('Image de profil téléchargée avec succès !');
      setIsImageUploadModalOpen(false);
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast.error(error.message || 'Erreur lors du téléchargement de l\'image.');
    } finally {
      setImageUploadLoading(false);
    }
  };
  return (
    <DashboardShell active="Paramètres">
      <DashboardTopbar title="Paramètres" />
      <div className="max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /> Profil Personnel</h3>
          <p className="text-sm text-gray-500 mt-1">Gérez vos informations de compte et votre visibilité.</p>
        </div>
        <div className="p-6 space-y-6">
          {profileLoading ? (
            <div className="text-center py-10 text-gray-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Chargement du profil...
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                </div>
                {role === 'PATIENT' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="antecedentsMedicaux">Antécédents Médicaux</Label>
                    <Textarea id="antecedentsMedicaux" value={antecedentsMedicaux} onChange={(e) => setAntecedentsMedicaux(e.target.value)} />
                  </div>
                )}
              </div>
              <Button type="submit" disabled={profileUpdateLoading}>
                {profileUpdateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </form>
          )}

          <div className="p-6 border-t border-gray-50">
            <h3 className="text-lg font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-purple-500" /> Image de Profil</h3>
            <p className="text-sm text-gray-500 mt-1">Mettez à jour votre photo de profil.</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <Dialog open={isImageUploadModalOpen} onOpenChange={setIsImageUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Télécharger une image
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Télécharger une image de profil</DialogTitle>
                    <DialogDescription>
                      Sélectionnez une image à télécharger pour votre profil.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input id="picture" type="file" onChange={handleImageFileChange} accept="image/*" />
                  </div>
                  <Button onClick={handleImageUpload} disabled={imageUploadLoading || !selectedImage}>
                    {imageUploadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Télécharger
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50">
          <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-blue-500" /> Sécurité</h3>
          <p className="text-sm text-gray-500 mt-1">Changez votre mot de passe et sécurisez votre accès.</p>
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4 flex items-center gap-2">
                <KeyRound className="w-4 h-4" /> Changer le mot de passe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Changer le mot de passe</DialogTitle>
                <DialogDescription>
                  Entrez votre ancien mot de passe et votre nouveau mot de passe.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                  <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                  <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Changer le mot de passe
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Settings;
