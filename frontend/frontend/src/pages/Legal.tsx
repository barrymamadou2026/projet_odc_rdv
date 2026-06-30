import React from 'react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';

const Legal: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Mentions Légales</h1>
        
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 prose prose-orange max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Éditeur du site</h2>
            <p className="text-gray-600">Le site Medic_RDV est édité par Orange Digital Center, dont le siège social est situé au [Adresse du siège], France.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
            <p className="text-gray-600">Le site est hébergé par [Nom de l'hébergeur], situé au [Adresse de l'hébergeur].</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
            <p className="text-gray-600">L'ensemble du contenu de ce site (textes, images, logos, etc.) est protégé par le droit d'auteur. Toute reproduction est interdite sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact</h2>
            <p className="text-gray-600">Pour toute question, vous pouvez nous contacter à l'adresse suivante : support@medicrdv.com.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Legal;
