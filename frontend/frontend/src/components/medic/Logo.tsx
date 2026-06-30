import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  light?: boolean;
  to?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Logo MedConnect ODC
 * Affiche les deux logos (MedicRdv + ODC) côte à côte,
 * chacun avec son nom en dessous.
 */
const Logo: React.FC<LogoProps> = ({ light = false, to = '/', className = '', size = 'md' }) => {
  const imgSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-xs' : 'text-[9px]';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <Link to={to} className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Logo MedicRdv */}
      <div className="flex flex-col items-center gap-0.5">
        <div className={`${imgSize} rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white flex items-center justify-center`}>
          <img
            src="/images/logo.png"
            alt="MedicRdv"
            className="w-full h-full object-contain"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.style.display = 'none';
              const fb = t.nextElementSibling as HTMLElement;
              if (fb) fb.style.display = 'flex';
            }}
          />
          {/* Fallback si image manquante */}
          <div className="w-full h-full hidden items-center justify-center bg-blue-500 rounded-xl">
            <span className="text-white font-black text-sm">M</span>
          </div>
        </div>
        <span className={`${textSize} font-bold ${light ? 'text-gray-200' : 'text-gray-500'} tracking-tight whitespace-nowrap`}>
          MedicRdv
        </span>
      </div>

      {/* Séparateur */}
      <div className={`h-8 w-px ${light ? 'bg-white/30' : 'bg-gray-200'}`} />

      {/* Logo ODC */}
      <div className="flex flex-col items-center gap-0.5">
        <div className={`${imgSize} rounded-xl overflow-hidden border border-orange-100 shadow-sm bg-orange-500 flex items-center justify-center`}>
          <img
            src="/images/odc-logo.png"
            alt="ODC"
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.style.display = 'none';
              const fb = t.nextElementSibling as HTMLElement;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div className="w-full h-full hidden items-center justify-center bg-orange-500 rounded-xl">
            <span className="text-white font-black text-sm">O</span>
          </div>
        </div>
        <span className={`${textSize} font-bold ${light ? 'text-orange-200' : 'text-orange-500'} tracking-tight whitespace-nowrap`}>
          ODC Guinée
        </span>
      </div>

      {/* Nom principal */}
      <div className="flex flex-col leading-none">
        <span className={`${titleSize} font-black tracking-tight ${light ? 'text-white' : 'text-gray-900'}`}>
          Med<span className="text-orange-500">Connect</span>
        </span>
        <span className={`${textSize} font-semibold ${light ? 'text-orange-200' : 'text-gray-400'} tracking-widest uppercase`}>
          Plateforme médicale
        </span>
      </div>
    </Link>
  );
};

export default Logo;
