import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../atoms/Logo';
import { Button } from '../atoms/Button';
import { STYLES } from '../../lib/styles';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-surface/80 backdrop-blur-md border-b border-border shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className={`${STYLES.CONTAINER} px-6 flex items-center justify-between`}>
        <Link to="/">
          <Logo size="md" />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className={STYLES.NAV_LINK}>Features</a>
          <a href="#how-it-works" className={STYLES.NAV_LINK}>How it Works</a>
          <a href="#pricing" className={STYLES.NAV_LINK}>Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
