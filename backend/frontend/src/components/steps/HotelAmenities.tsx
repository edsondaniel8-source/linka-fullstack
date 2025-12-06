// src/components/steps/HotelAmenities.tsx
import React from 'react';
import { HotelAmenitiesProps } from '../hotel-wizard/types';

const amenitiesOptions = [
  { id: 'wifi', label: 'Wi-Fi Gratuito' },
  { id: 'pool', label: 'Piscina' },
  { id: 'spa', label: 'SPA' },
  { id: 'gym', label: 'Academia' },
  { id: 'parking', label: 'Estacionamento Gratuito' },
  { id: 'breakfast', label: 'Café da Manhã' },
  { id: 'restaurant', label: 'Restaurante' },
  { id: 'bar', label: 'Bar' },
  { id: 'room_service', label: 'Serviço de Quarto' },
  { id: 'concierge', label: 'Concierge' },
  { id: 'laundry', label: 'Lavanderia' },
  { id: 'air_conditioning', label: 'Ar Condicionado' },
  { id: 'tv', label: 'TV a Cabo' },
  { id: 'minibar', label: 'Frigobar' },
  { id: 'safe', label: 'Cofre' },
  { id: 'beach_access', label: 'Acesso à Praia' },
  { id: 'garden', label: 'Jardim' },
  { id: 'terrace', label: 'Terraço' },
  { id: 'airport_shuttle', label: 'Transfer Aeroporto' },
  { id: 'business_center', label: 'Centro de Negócios' },
];

const HotelAmenities: React.FC<HotelAmenitiesProps> = ({ 
  formData, 
  updateFormData,
  onNext,
  onBack,
  mode 
}) => {
  const handleAmenityChange = (amenityId: string) => {
    const currentAmenities = formData.amenities || [];
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter(id => id !== amenityId)
      : [...currentAmenities, amenityId];
    
    updateFormData({ amenities: newAmenities });
  };

  const isAmenitySelected = (amenityId: string) => {
    return formData.amenities?.includes(amenityId) || false;
  };

  return (
    <div className="step-amenities">
      <h3>Comodidades do Hotel</h3>
      <p className="step-description">
        Selecione as comodidades disponíveis no seu hotel. Isso ajudará os hóspedes a encontrarem o que procuram.
      </p>
      
      <div className="amenities-grid">
        {amenitiesOptions.map((amenity) => (
          <div key={amenity.id} className="amenity-item">
            <input
              type="checkbox"
              id={`amenity-${amenity.id}`}
              checked={isAmenitySelected(amenity.id)}
              onChange={() => handleAmenityChange(amenity.id)}
              className="amenity-checkbox"
            />
            <label htmlFor={`amenity-${amenity.id}`} className="amenity-label">
              {amenity.label}
            </label>
          </div>
        ))}
      </div>

      <div className="selected-amenities">
        <h4>Comodidades selecionadas ({formData.amenities?.length || 0})</h4>
        <div className="selected-tags">
          {formData.amenities?.map(amenityId => {
            const amenity = amenitiesOptions.find(a => a.id === amenityId);
            return amenity ? (
              <span key={amenityId} className="amenity-tag">
                {amenity.label}
              </span>
            ) : null;
          })}
          {(!formData.amenities || formData.amenities.length === 0) && (
            <p className="no-selection">Nenhuma comodidade selecionada ainda</p>
          )}
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="step-navigation">
        <button
          type="button"
          onClick={onBack}
          className="nav-button nav-button-secondary"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="nav-button nav-button-primary"
          disabled={!formData.amenities || formData.amenities.length === 0}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default HotelAmenities;