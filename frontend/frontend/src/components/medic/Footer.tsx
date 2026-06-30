import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-500">
              <img src="/odc-logo.png" alt="ODC" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <div>
              <p className="font-black text-white">MedConnect <span className="text-orange-400">ODC</span></p>
              <p className="text-xs text-orange-400 uppercase tracking-widest">Guinée</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Plateforme de prise de rendez-vous médicaux sécurisée, développée dans le cadre du Projet de Fin de Formation ODC-Guinée.
          </p>
        </div>
        {/* Links */}
        <div>
          <h5 className="text-white font-bold mb-3">Navigation</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-orange-400 transition-colors">Accueil</Link></li>
            <li><Link to="/login" className="hover:text-orange-400 transition-colors">Connexion</Link></li>
            <li><Link to="/signup" className="hover:text-orange-400 transition-colors">Inscription</Link></li>
            <li><Link to="/help" className="hover:text-orange-400 transition-colors">Aide</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold mb-3">Légal</h5>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal" className="hover:text-orange-400 transition-colors">Mentions Légales</Link></li>
            <li><Link to="/privacy" className="hover:text-orange-400 transition-colors">Confidentialité</Link></li>
            <li><Link to="/terms" className="hover:text-orange-400 transition-colors">CGU</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <p>© 2026 MedConnect ODC-Guinée. Tous droits réservés.</p>
        <p className="text-orange-500 font-semibold">Projet de Fin de Formation – ODC Guinée</p>
      </div>
    </div>
  </footer>
);

export default Footer;
