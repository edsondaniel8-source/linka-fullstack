// src/components/hotel-wizard/components/PriceSummary.tsx
import React from 'react';
import { HotelFormData } from '../types';
import { calculateAveragePrice, calculatePriceRange } from '../utils/priceUtils';
import './HotelWizard.css';

interface PriceSummaryProps {
  rooms: HotelFormData['rooms'];
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ rooms }) => {
  if (rooms.length === 0) return null;

  const priceRange = calculatePriceRange(rooms);
  const averagePrice = calculateAveragePrice(rooms);

  return (
    <div className="price-summary">
      <h4 className="price-summary-title">Resumo de Preços</h4>
      <div className="price-summary-grid">
        <div className="price-summary-item">
          <strong>Faixa de Preço:</strong>
          <div className="price-display">
            {priceRange.min} - {priceRange.max}
          </div>
        </div>
        <div className="price-summary-item">
          <strong>Preço Médio:</strong>
          <div className="price-display">
            {averagePrice}
          </div>
        </div>
        <div className="price-summary-item">
          <strong>Tipos de Quarto:</strong>
          <div>{rooms.length} tipos</div>
        </div>
      </div>
    </div>
  );
};