import React from 'react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';

const Privacy: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Politique de Confidentialité</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 prose prose-orange max-w-none">
          <p className="text-gray-600 mb-8 italic">Dernière mise à jour : 29 juin 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Collecte des données</h2>
            <p className="text-gray-600">Nous collectons les données nécessaires à la gestion de vos rendez-vous médicaux et à la constitution de votre dossier médical numérique.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Utilisation des données</h2>
            <p className="text-gray-600">Vos données sont utilisées exclusivement pour vous fournir les services de Medic_RDV et ne sont jamais partagées avec des tiers à des fins commerciales.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Sécurité</h2>
            <p className="text-gray-600">Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données de santé, conformément aux réglementations en vigueur.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Vos droits</h2>
            <p className="text-gray-600">Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
