// src/components/steps/HotelLocation.tsx
import React, { useState, useEffect } from 'react';
import { HotelLocationProps } from '../hotel-wizard/types';
import LocationAutocomplete from '@/shared/components/LocationAutocomplete';
import { LocationSuggestion } from '../../services/locationsService';

const HotelLocation: React.FC<HotelLocationProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack
}) => {
  const [locationError, setLocationError] = useState('');
  const [localAddress, setLocalAddress] = useState(formData.address || '');

  // ✅ Sincronizar com formData.address
  useEffect(() => {
    setLocalAddress(formData.address || '');
  }, [formData.address]);

  // ✅ CORREÇÃO COMPLETA: Preencher todos os campos necessários
  const handleLocationSelect = (location: LocationSuggestion) => {
    console.log('📍 Localização selecionada no HotelLocation:', location);
    
    // ✅ CORREÇÃO: Preencher todos os campos corretamente
    updateFormData({
      address: `${location.name}, ${location.district}, ${location.province}`,
      locality: location.name,        // ✅ EXISTE NO BANCO
      province: location.province,    // ✅ EXISTE NO BANCO
      country: 'Moçambique',          // ✅ EXISTE NO BANCO
      city: location.name,           // Usar localidade como cidade
      state: location.province,      // Usar província como estado
      lat: location.lat,
      lng: location.lng,
      location: { lat: location.lat, lng: location.lng } // ✅ Objeto location completo
    });

    setLocalAddress(`${location.name}, ${location.district}, ${location.province}`);
    setLocationError('');
  };

  const handleAddressChange = (value: string) => {
    setLocalAddress(value);
    updateFormData({ address: value });
    
    // Se usuário apagar manualmente, limpar outros campos
    if (!value.trim()) {
      updateFormData({
        address: '',
        locality: '',
        province: '',
        city: '',
        state: '',
        country: '',
        lat: undefined,
        lng: undefined,
        location: undefined
      });
    }
  };

  const handleManualFieldChange = (field: keyof typeof formData, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleNext = () => {
    // Validação corrigida - apenas campos importantes
    if (!formData.address?.trim()) {
      setLocationError('Endereço é obrigatório');
      return;
    }

    if (!formData.lat || !formData.lng) {
      setLocationError('Selecione uma localização válida da lista de sugestões');
      return;
    }

    // ✅ CORREÇÃO: Validar apenas campos essenciais
    if (!formData.locality || !formData.province) {
      setLocationError('Localização incompleta. Selecione uma opção da lista.');
      return;
    }

    setLocationError('');
    onNext();
  };

  return (
    <div className="step-location">
      <h3>Localização do Hotel</h3>
      
      <div className="form-group">
        <label htmlFor="location-autocomplete">
          Localização Completa *
          <span className="field-hint"> (Comece a digitar e selecione uma opção da lista)</span>
        </label>
        
        <LocationAutocomplete
          id="location-autocomplete"
          placeholder="Digite o nome da cidade, vila ou localidade..."
          value={localAddress}
          onChange={handleAddressChange}
          onLocationSelect={handleLocationSelect}
          data-testid="location-autocomplete"
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="locality">Localidade *</label>
          <input
            id="locality"
            type="text"
            value={formData.locality || ''}
            onChange={(e) => handleManualFieldChange('locality', e.target.value)}
            placeholder="Cidade ou localidade"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="province">Província *</label>
          <input
            id="province"
            type="text"
            value={formData.province || ''}
            onChange={(e) => handleManualFieldChange('province', e.target.value)}
            placeholder="Província"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="country">País *</label>
          <input
            id="country"
            type="text"
            value={formData.country || ''}
            onChange={(e) => handleManualFieldChange('country', e.target.value)}
            placeholder="País"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="zipCode">Código Postal</label>
          <input
            id="zipCode"
            type="text"
            value={formData.zipCode || ''}
            onChange={(e) => handleManualFieldChange('zipCode', e.target.value)}
            placeholder="Código Postal"
          />
        </div>
      </div>

      {/* Preview da localização */}
      {formData.lat && formData.lng && (
        <div className="location-coordinates">
          <div className="location-preview">
            <div className="preview-title">
              ✅ Localização confirmada
            </div>
            <div className="preview-details">
              <strong>{formData.locality}</strong>
              {formData.province && `, ${formData.province}`}
              {formData.country && `, ${formData.country}`}
            </div>
            <div className="coordinates">
              <small>Coordenadas: {formData.lat?.toFixed(6)}, {formData.lng?.toFixed(6)}</small>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {locationError && (
        <div className="alert alert-error">
          ❌ {locationError}
        </div>
      )}

      {/* Informações de debug (apenas desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <small>
            Debug: {formData.lat ? `Coordenadas OK (${formData.lat}, ${formData.lng})` : 'Aguardando coordenadas...'}
            {formData.locality && ` | Localidade: ${formData.locality}`}
            {formData.province && ` | Província: ${formData.province}`}
            {formData.location && ` | Location obj: ${JSON.stringify(formData.location)}`}
          </small>
        </div>
      )}

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
          onClick={handleNext}
          className="nav-button nav-button-primary"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default HotelLocation;