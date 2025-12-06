// src/components/hotel-wizard/components/ModeBadge.tsx
import React from 'react';
import '../styles/HotelWizard.css';

interface ModeBadgeProps {
  mode: 'create' | 'edit';
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode }) => {
  const badgeClass = `mode-badge ${mode === 'create' ? 'create' : 'edit'}`;
  const label = mode === 'create' ? '📝 CRIANDO NOVO HOTEL' : '✏️ EDITANDO HOTEL';

  return (
    <div className="badge-container">
      <span className={badgeClass}>{label}</span>
    </div>
  );
};