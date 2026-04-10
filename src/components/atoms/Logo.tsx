import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeMap[size]} aspect-square bg-primary rounded-lg flex items-center justify-center`}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white w-2/3 h-2/3"
        >
          <path d="M12 2v20M2 12h20M7 7l10 10M7 17L17 7" />
        </svg>
      </div>
      <span className={`font-bold tracking-tight text-text ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
        FocusBeats
      </span>
    </div>
  );
};
