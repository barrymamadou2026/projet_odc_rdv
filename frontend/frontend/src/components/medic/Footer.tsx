import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Mail } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await fetch('https://famous.ai/api/crm/6a3fca94fc844166732572a7/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: phone || undefined,
          sms_opt_in: smsOptIn,
          source: 'footer-signup',
          tags: ['newsletter'],
        }),
      });
      setStatus('done');
      setEmail('');
      setPhone('');
    } catch {
      setStatus('error');
    }
  };

  const cols = [
    { title: 'Plateforme', links: [
      { label: 'Comment ça marche', to: '/help' },
      { label: 'Nos Spécialistes', to: '/find-doctors' },
      { label: 'Téléconsultation', to: '/help' },
      { label: 'Tarification', to: '/help' }
    ]},
    { title: 'Support', links: [
      { label: "Centre d'aide", to: '/help' },
      { label: 'Confidentialité', to: '/privacy' },
      { label: "Conditions d'utilisation", to: '/terms' },
      { label: 'Mentions Légales', to: '/legal' }
    ]},
  ];

  return (
    <footer className="bg-[#1f1f1f] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-gray-500 max-w-xs">
            La plateforme de référence pour la gestion de votre santé au quotidien. Intégré à l'écosystème Orange Digital Center.
          </p>
          <div className="flex gap-3 mt-5">
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Share2 className="w-4 h-4" /></button>
            <button className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Mail className="w-4 h-4" /></button>
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-4">{col.title}</h4>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}><Link to={l.to} className="hover:text-orange-400 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-white font-semibold mb-4">Newsletter</h4>
          <p className="text-sm mb-4">Recevez nos conseils santé chaque semaine.</p>
          <form onSubmit={subscribe} className="space-y-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="votre@email.com" className="w-full px-3 py-2 rounded bg-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Téléphone (optionnel)" className="w-full px-3 py-2 rounded bg-white/10 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
            <label className="flex items-start gap-2 text-xs text-gray-500">
              <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5" />
              <span>Recevez nos SMS. Msg & data rates may apply. Reply STOP to unsubscribe.</span>
            </label>
            <button type="submit" disabled={status === 'loading'} className="w-full py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors">
              {status === 'loading' ? '...' : status === 'done' ? 'Inscrit !' : "S'abonner"}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© 2024 Medic_RDV. Tous droits réservés.</span>
          <div className="flex gap-6">
            <span>Design par ODC System</span>
            <span>Propulsé par Orange</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
