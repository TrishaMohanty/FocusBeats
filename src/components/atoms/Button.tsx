import React from 'react';
import { STYLES } from '../../lib/styles';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'none';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  className = '', 
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return STYLES.BUTTON_PRIMARY;
      case 'secondary': return STYLES.BUTTON_SECONDARY;
      case 'ghost': return STYLES.BUTTON_GHOST;
      case 'none': return '';
      default: return STYLES.BUTTON_PRIMARY;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'px-3 py-1.5 text-sm';
      case 'md': return 'px-4 py-2 text-base';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      className={`${STYLES.BUTTON_BASE} ${getVariantStyles()} ${getSizeStyles()} ${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  );
};
