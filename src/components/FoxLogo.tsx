import React from 'react';

interface FoxLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  lightText?: boolean;
}

export default function FoxLogo({ size = 'md', showText = true, lightText = true }: FoxLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Fox Icon Badge */}
      <div 
        className={`${iconSizes[size]} bg-[#F05A22] flex items-center justify-center p-2 shadow-sm flex-shrink-0 transition-transform duration-200 hover:scale-105`}
        title="Fox Couture"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Stylized Fox Head */}
          <path 
            d="M3 4L8.5 14L12 8L15.5 14L21 4L19 16C18.5 19 15.5 21 12 21C8.5 21 5.5 19 5 16L3 4Z" 
            fill="currentColor" 
          />
          {/* White inner ears/eyes details */}
          <ellipse cx="9" cy="13" rx="1.2" ry="1.2" fill="#F05A22" />
          <ellipse cx="15" cy="13" rx="1.2" ry="1.2" fill="#F05A22" />
          <circle cx="12" cy="18" r="1.3" fill="#F05A22" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="leading-none">
          <div className={`${textSizes[size]} font-extrabold tracking-tight ${lightText ? 'text-white' : 'text-stone-900'} font-display`}>
            Fox
          </div>
          <div className={`${textSizes[size]} font-extrabold tracking-tight ${lightText ? 'text-white' : 'text-stone-900'} font-display`}>
            Couture
          </div>
        </div>
      )}
    </div>
  );
}
