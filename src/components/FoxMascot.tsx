import React from 'react';

interface FoxMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function FoxMascot({ className = '', size = 'md' }: FoxMascotProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const finalClass = `${sizeClasses[size]} ${className}`;

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={finalClass} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer Ears */}
      <polygon points="50,45 15,15 35,55" fill="#E85D04" /> {/* Left Ear Outer */}
      <polygon points="50,45 85,15 65,55" fill="#E85D04" /> {/* Right Ear Outer */}

      {/* Inner Ears */}
      <polygon points="50,45 25,25 35,55" fill="#FF7A1A" /> {/* Left Ear Inner */}
      <polygon points="50,45 75,25 65,55" fill="#FF7A1A" /> {/* Right Ear Inner */}
      
      {/* Forehead */}
      <polygon points="50,15 35,55 50,45" fill="#FF7A1A" />
      <polygon points="50,15 65,55 50,45" fill="#E85D04" />
      
      {/* Cheeks */}
      <polygon points="50,45 35,55 20,68 50,75" fill="#E85D04" />
      <polygon points="50,45 65,55 80,68 50,75" fill="#FF7A1A" />

      {/* Cheek Highlights / White underbelly fur */}
      <polygon points="20,68 35,55 35,68" fill="#F8F9FA" />
      <polygon points="80,68 65,55 65,68" fill="#F8F9FA" />

      {/* Snout Base */}
      <polygon points="50,45 35,68 50,85" fill="#FF7A1A" />
      <polygon points="50,45 65,68 50,85" fill="#E85D04" />

      {/* White Snout Tips */}
      <polygon points="50,85 40,70 50,68" fill="#F8F9FA" />
      <polygon points="50,85 60,70 50,68" fill="#F8F9FA" />

      {/* Black Nose */}
      <polygon points="50,85 45,78 55,78" fill="#1A1A1A" />

      {/* Eyes (Minimalist geometric lines) */}
      <polygon points="38,58 44,58 41,61" fill="#1A1A1A" />
      <polygon points="62,58 56,58 59,61" fill="#1A1A1A" />

      {/* Subtle Tailor touch (Scissors background or measuring tape look) */}
      <path d="M42,88 L50,91 L58,88 L50,95 Z" fill="#E85D04" />
    </svg>
  );
}
