import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  light?: boolean;
  to?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ light = false, to = '/', className = "" }) => {
  return (
    <Link to={to} className={`flex items-center gap-2 select-none ${className}`}>
      {/* Emplacement pour le logo image */}
      <img 
        src="/images/logo.png" 
        alt="Medic_RDV Logo" 
        className="w-10 h-10 object-contain"
        onError={(e) => {
          // Fallback si l'image n'existe pas encore
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const sibling = target.nextElementSibling as HTMLElement;
          if (sibling) sibling.style.display = 'flex';
        }}
      />
      
      {/* Fallback visuel (votre ancien logo en icône) */}
      <div className="w-10 h-10 rounded-xl bg-orange-500 hidden items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>
      </div>

      <span className={`text-2xl font-black tracking-tighter ${light ? 'text-white' : 'text-gray-900'}`}>
        Medic<span className="text-orange-500">_RDV</span>
      </span>
    </Link>
  );
};

export default Logo;
