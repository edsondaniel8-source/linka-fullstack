// src/components/hotel-wizard/components/PriceStatistics.tsx
import React from 'react';
import { RoomFormData } from '../types';
import { getPriceStatistics } from '../utils/priceUtils';
import '../styles/HotelWizard.css';

interface PriceStatisticsProps {
  rooms: RoomFormData[];
}

export const PriceStatistics: React.FC<PriceStatisticsProps> = ({ rooms }) => {
  if (rooms.length === 0) return null;

  const stats = getPriceStatistics(rooms);

  return (
    <div className="price-statistics">
      <h4>Análise Financeira</h4>
      <div className="statistics-grid">
        <div className="statistic-item">
          <div className="statistic-value">{stats.average}</div>
          <div className="statistic-label">Preço Médio</div>
        </div>
        
        <div className="statistic-item">
          <div className="statistic-value">{stats.range.min} - {stats.range.max}</div>
          <div className="statistic-label">Faixa de Preço</div>
        </div>
        
        <div className="statistic-item">
          <div className="statistic-value">{stats.totalRooms} quartos</div>
          <div className="statistic-label">{stats.roomTypes} tipos</div>
        </div>
        
        <div className="statistic-item">
          <div className="statistic-value">{stats.dailyRevenue}</div>
          <div className="statistic-label">Receita Diária</div>
        </div>
        
        <div className="statistic-item">
          <div className="statistic-value">{stats.monthlyRevenue}</div>
          <div className="statistic-label">Receita Mensal*</div>
        </div>
      </div>
      <div className="statistics-note" style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
        *Estimativa baseada em 70% de ocupação média
      </div>
    </div>
  );
};