import React from 'react';
import { STYLES } from '../../lib/styles';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className={`${STYLES.GLASS_CARD} ${STYLES.CARD_HOVER} flex flex-col items-start gap-4`}>
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className={STYLES.H3}>{title}</h3>
      <p className="text-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  );
};
