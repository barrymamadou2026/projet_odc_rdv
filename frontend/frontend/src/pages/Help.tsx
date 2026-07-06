import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';
import { HelpCircle, Mail, Phone, BookOpen } from 'lucide-react';

const FAQS = [
  { q: "Comment prendre un rendez-vous ?", a: "Connectez-vous, accédez à 'Trouver un médecin', choisissez un praticien, sélectionnez un créneau disponible et confirmez votre réservation." },
  { q: "Comment les médecins sont-ils créés ?", a: "Les comptes médecins sont exclusivement créés par l'administrateur système, avec affectation d'une spécialité." },
  { q: "Comment annuler un rendez-vous ?", a: "Dans votre tableau de bord, accédez à 'Mes rendez-vous' et cliquez sur l'icône d'annulation à côté du rendez-vous souhaité." },
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. MedConnect utilise JWT stateless, BCrypt pour les mots de passe et Spring Security 6. Toutes les communications se font via HTTPS." },
  { q: "Comment réinitialiser mon mot de passe ?", a: "Sur la page de connexion, cliquez sur 'Oublié ?' et saisissez votre email. Vous recevrez un lien de réinitialisation." },
];

const Help: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <PublicHeader />
    <div className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Centre d'Aide</h1>
        <p className="text-gray-500 mt-2">Tout ce que vous devez savoir sur MedConnect ODC</p>
      </div>

      <div className="space-y-4 mb-12">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-500 rounded-3xl p-8 text-white text-center">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/20 mx-auto mb-4">
          <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
        </div>
        <h2 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h2>
        <p className="text-orange-100 mb-6">L'équipe ODC-Guinée est disponible pour vous accompagner.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="mailto:mb624064783@gmail.com" className="flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
            <Mail className="w-4 h-4" /> Email
          </a>
          <a href="tel:+224624064783" className="flex items-center gap-2 bg-white/20 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors">
            <Phone className="w-4 h-4" /> Appeler
          </a>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Help;
