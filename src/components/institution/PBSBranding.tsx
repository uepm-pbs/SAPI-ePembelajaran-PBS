import React from 'react';
import clsx from 'clsx';

// URL logo SAPIe — gambar disimpan dalam folder public/
const SAPIE_LOGO_URL = './sapie-logo.png';

interface PBSLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  className?: string;
}

export const PBSLogo: React.FC<PBSLogoProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  className = '',
}) => {
  const logoSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={clsx('flex items-center gap-3 select-none', className)}>
      {/* Logo SAPIe */}
      <img
        src={SAPIE_LOGO_URL}
        alt="Logo SAPIe"
        className={clsx('object-contain shrink-0', logoSizes[size])}
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />

      {/* Typography */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={clsx(
              'font-extrabold tracking-tight',
              textSizes[size],
              variant === 'dark' ? 'text-white' : 'text-navy-900'
            )}
          >
            SAPIe
          </span>
          <span className="text-[10px] px-1.5 py-0.5 font-semibold uppercase tracking-wider rounded bg-amber-500/20 text-amber-600 border border-amber-500/30">
            PBS
          </span>
        </div>
        {showSubtitle && (
          <div
            className={clsx(
              'text-[11px] font-semibold tracking-wider uppercase',
              variant === 'dark' ? 'text-navy-200' : 'text-navy-700'
            )}
          >
            Politeknik Banting Selangor
          </div>
        )}
      </div>
    </div>
  );
};
