import React from 'react';
import PublicHeader from '@/components/medic/PublicHeader';
import Footer from '@/components/medic/Footer';
import { HelpCircle, Book, MessageSquare, Phone } from 'lucide-react';

const Help: React.FC = () => {
  const categories = [
    { icon: HelpCircle, title: 'Questions Fréquentes', desc: 'Trouvez des réponses rapides aux questions les plus courantes.' },
    { icon: Book, title: 'Guides Utilisateur', desc: 'Apprenez à utiliser toutes les fonctionnalités de la plateforme.' },
    { icon: MessageSquare, title: 'Support Chat', desc: 'Discutez en direct avec l\'un de nos conseillers.' },
    { icon: Phone, title: 'Contact Téléphonique', desc: 'Appelez-nous pour une assistance personnalisée.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <PublicHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Comment pouvons-nous vous aider ?</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Notre équipe est là pour vous accompagner dans la gestion de votre santé et de vos rendez-vous.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6">
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Vous ne trouvez pas ce que vous cherchez ?</h2>
            <p className="text-blue-100">Notre équipe de support est disponible 24h/24 et 7j/7 pour répondre à vos questions.</p>
          </div>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors whitespace-nowrap">
            Contacter le support
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
