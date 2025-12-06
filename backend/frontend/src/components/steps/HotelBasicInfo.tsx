// src/components/steps/HotelBasicInfo.tsx
import React from 'react';
import { HotelBasicInfoProps } from '../hotel-wizard/types';

const HotelBasicInfo: React.FC<HotelBasicInfoProps> = ({ 
  formData, 
  updateFormData,
  onNext,
  onBack,
  mode 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="step-basic-info">
      <h3>Informações Básicas do Hotel</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Nome do Hotel *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Hotel Paradise"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoria *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Selecione uma categoria</option>
            <option value="budget">Econômico</option>
            <option value="standard">Standard</option>
            <option value="luxury">Luxo</option>
            <option value="boutique">Boutique</option>
            <option value="resort">Resort</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descrição</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o seu hotel..."
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemplo@hotel.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+258 XX XXX XXX"
          />
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
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default HotelBasicInfo;