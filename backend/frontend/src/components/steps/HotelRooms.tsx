// src/components/steps/HotelRooms.tsx
import React, { useState } from 'react';
import { HotelRoomsProps, RoomFormData } from '../hotel-wizard/types';
import { formatMetical } from '@/shared/utils/currency';

const roomTypes = [
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Família' },
  { value: 'executive', label: 'Executivo' },
  { value: 'presidential', label: 'Presidencial' },
];

const bedTypes = [
  { value: 'single', label: 'Cama de Solteiro' },
  { value: 'double', label: 'Cama de Casal' },
  { value: 'twin', label: 'Duas Camas de Solteiro' },
  { value: 'queen', label: 'Cama Queen Size' },
  { value: 'king', label: 'Cama King Size' },
];

const initialRoomData: RoomFormData = {
  name: '',
  type: '',
  pricePerNight: 0,
  maxOccupancy: 1,
  quantity: 1,
  description: '',
  amenities: [],
  images: [],
  size: '',
  bedType: '',
  hasBalcony: false,
  hasSeaView: false,
};

const HotelRooms: React.FC<HotelRoomsProps> = ({ 
  formData, 
  updateFormData,
  onNext,
  onBack,
  mode 
}) => {
  const [currentRoom, setCurrentRoom] = useState<RoomFormData>(initialRoomData);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const handleRoomChange = (field: keyof RoomFormData, value: any) => {
    setCurrentRoom(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRoom = () => {
    if (!currentRoom.type.trim() || currentRoom.pricePerNight <= 0) {
      alert('Por favor, preencha o tipo e preço do quarto');
      return;
    }

    const rooms = [...(formData.rooms || [])];
    
    if (isEditing !== null) {
      // Editar quarto existente
      rooms[isEditing] = { ...currentRoom };
      setIsEditing(null);
    } else {
      // Adicionar novo quarto
      rooms.push({ ...currentRoom, id: `temp-${Date.now()}` });
    }
    
    updateFormData({ rooms });
    setCurrentRoom(initialRoomData);
  };

  const handleEditRoom = (index: number) => {
    setCurrentRoom(formData.rooms[index]);
    setIsEditing(index);
  };

  const handleRemoveRoom = (index: number) => {
    const rooms = [...(formData.rooms || [])];
    rooms.splice(index, 1);
    updateFormData({ rooms });
  };

  const calculateTotalRooms = () => {
    return formData.rooms?.reduce((total, room) => total + room.quantity, 0) || 0;
  };

  const calculateAveragePrice = () => {
    if (!formData.rooms?.length) return 0;
    const total = formData.rooms.reduce((sum, room) => sum + room.pricePerNight, 0);
    return total / formData.rooms.length;
  };

  return (
    <div className="step-rooms">
      <h3>Tipos de Quartos</h3>
      
      {/* Formulário para adicionar/editar quarto */}
      <div className="room-form">
        <h4>{isEditing !== null ? 'Editar Quarto' : 'Adicionar Novo Quarto'}</h4>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="roomName">Nome do Quarto *</label>
            <input
              type="text"
              id="roomName"
              value={currentRoom.name}
              onChange={(e) => handleRoomChange('name', e.target.value)}
              placeholder="Ex: Quarto Standard com Vista Mar"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomType">Tipo *</label>
            <select
              id="roomType"
              value={currentRoom.type}
              onChange={(e) => handleRoomChange('type', e.target.value)}
              required
            >
              <option value="">Selecione o tipo</option>
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="roomPrice">Preço por Noite (MT) *</label>
            <input
              type="number"
              id="roomPrice"
              value={currentRoom.pricePerNight || ''}
              onChange={(e) => handleRoomChange('pricePerNight', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="100"
              step="10"
              required
            />
            <small className="hint">Mínimo: {formatMetical(100)}</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="roomQuantity">Quantidade *</label>
            <input
              type="number"
              id="roomQuantity"
              value={currentRoom.quantity}
              onChange={(e) => handleRoomChange('quantity', parseInt(e.target.value) || 1)}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomCapacity">Capacidade Máxima *</label>
            <input
              type="number"
              id="roomCapacity"
              value={currentRoom.maxOccupancy}
              onChange={(e) => handleRoomChange('maxOccupancy', parseInt(e.target.value) || 1)}
              min="1"
              max="10"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomSize">Tamanho (m²)</label>
            <input
              type="text"
              id="roomSize"
              value={currentRoom.size}
              onChange={(e) => handleRoomChange('size', e.target.value)}
              placeholder="Ex: 25"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bedType">Tipo de Cama</label>
            <select
              id="bedType"
              value={currentRoom.bedType}
              onChange={(e) => handleRoomChange('bedType', e.target.value)}
            >
              <option value="">Selecione o tipo de cama</option>
              {bedTypes.map(bed => (
                <option key={bed.value} value={bed.value}>
                  {bed.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={currentRoom.hasBalcony}
                onChange={(e) => handleRoomChange('hasBalcony', e.target.checked)}
              />
              Tem Varanda
            </label>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={currentRoom.hasSeaView}
                onChange={(e) => handleRoomChange('hasSeaView', e.target.checked)}
              />
              Vista para o Mar
            </label>
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="roomDescription">Descrição</label>
            <textarea
              id="roomDescription"
              value={currentRoom.description}
              onChange={(e) => handleRoomChange('description', e.target.value)}
              placeholder="Descreva o quarto, incluindo comodidades específicas..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="room-form-actions">
          <button
            type="button"
            onClick={handleAddRoom}
            className="nav-button nav-button-primary"
          >
            {isEditing !== null ? 'Atualizar Quarto' : 'Adicionar Quarto'}
          </button>
          
          {isEditing !== null && (
            <button
              type="button"
              onClick={() => {
                setCurrentRoom(initialRoomData);
                setIsEditing(null);
              }}
              className="nav-button nav-button-secondary"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </div>

      {/* Lista de quartos adicionados */}
      <div className="rooms-list">
        <h4>Quartos Adicionados ({formData.rooms?.length || 0})</h4>
        
        {formData.rooms && formData.rooms.length > 0 ? (
          <div className="rooms-container">
            {formData.rooms.map((room, index) => (
              <div key={room.id || index} className="room-card">
                <div className="room-header">
                  <div className="room-title">
                    <h5>{room.name || `Quarto ${room.type}`}</h5>
                    <span className="room-type">{room.type}</span>
                  </div>
                  <div className="room-price">
                    {formatMetical(room.pricePerNight)}/noite
                  </div>
                </div>
                
                <div className="room-details">
                  <div className="room-detail">
                    <strong>Quantidade:</strong> {room.quantity} quartos
                  </div>
                  <div className="room-detail">
                    <strong>Capacidade:</strong> {room.maxOccupancy} pessoas
                  </div>
                  {room.size && (
                    <div className="room-detail">
                      <strong>Tamanho:</strong> {room.size} m²
                    </div>
                  )}
                  {room.bedType && (
                    <div className="room-detail">
                      <strong>Cama:</strong> {bedTypes.find(b => b.value === room.bedType)?.label}
                    </div>
                  )}
                  {room.hasBalcony && (
                    <div className="room-detail">
                      <span className="feature-tag">🏖️ Varanda</span>
                    </div>
                  )}
                  {room.hasSeaView && (
                    <div className="room-detail">
                      <span className="feature-tag">🌊 Vista Mar</span>
                    </div>
                  )}
                </div>
                
                <div className="room-actions">
                  <button
                    type="button"
                    onClick={() => handleEditRoom(index)}
                    className="room-action-btn edit"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRoom(index)}
                    className="room-action-btn remove"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-rooms">Nenhum quarto adicionado ainda. Adicione pelo menos um tipo de quarto.</p>
        )}
      </div>

      {/* Resumo */}
      {formData.rooms && formData.rooms.length > 0 && (
        <div className="rooms-summary">
          <h4>Resumo</h4>
          <div className="summary-stats">
            <div className="stat-item">
              <strong>Tipos de Quarto:</strong> {formData.rooms.length}
            </div>
            <div className="stat-item">
              <strong>Total de Quartos:</strong> {calculateTotalRooms()}
            </div>
            <div className="stat-item">
              <strong>Preço Médio:</strong> {formatMetical(calculateAveragePrice())}
            </div>
            <div className="stat-item">
              <strong>Receita Diária Potencial:</strong>{' '}
              {formatMetical(formData.rooms.reduce((total, room) => 
                total + (room.pricePerNight * room.quantity), 0))}
            </div>
          </div>
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
          onClick={onNext}
          className="nav-button nav-button-primary"
          disabled={!formData.rooms || formData.rooms.length === 0}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default HotelRooms;