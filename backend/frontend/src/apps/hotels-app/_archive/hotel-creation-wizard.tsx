// pages/hotel-creation-wizard.tsx
import React from 'react';
import HotelCreationWizard from '@/components/hotel-wizard/HotelCreationWizard';
import { useLocation } from 'wouter';

const HotelCreationWizardPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleSuccess = (hotelId: string) => {
    // Redirecionar para a página de sucesso ou listagem
    setLocation(`/hotels?created=${hotelId}`);
  };

  const handleCancel = () => {
    // Voltar para a página anterior
    setLocation('/hotels');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <HotelCreationWizard
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default HotelCreationWizardPage;