// src/components/hotel-wizard/components/LoadingOverlay.tsx
import React from 'react';
import '../styles/HotelWizard.css';

interface LoadingOverlayProps {
  message: string;
  show: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message, show }) => {
  if (!show) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-message">{message}</div>
    </div>
  );
};