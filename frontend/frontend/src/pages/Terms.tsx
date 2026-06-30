import React from 'react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';

const Terms: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Conditions Générales d'Utilisation</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 prose prose-orange max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
            <p className="text-gray-600">Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services du site Medic_RDV.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Accès au service</h2>
            <p className="text-gray-600">Le service est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Certains services sont réservés aux utilisateurs inscrits.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Responsabilité</h2>
            <p className="text-gray-600">Medic_RDV met tout en œuvre pour assurer la disponibilité du service, mais ne peut être tenu responsable des interruptions indépendantes de sa volonté.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Évolution des CGU</h2>
            <p className="text-gray-600">Medic_RDV se réserve le droit de modifier les présentes CGU à tout moment.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
