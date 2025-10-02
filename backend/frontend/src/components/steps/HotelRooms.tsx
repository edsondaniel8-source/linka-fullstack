import React, { useState, useEffect } from 'react';
import { HotelFormData, RoomType } from '../hotel-wizard/HotelCreationWizard';

// ✅ NOVO: Importar componentes de preço
import { PriceInput } from '@/shared/components/PriceInput';
import { formatMetical } from '@/shared/utils/currency';

interface HotelRoomsProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const HotelRooms: React.FC<HotelRoomsProps> = ({
  formData,
  updateFormData
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamanho da tela para responsividade
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const addRoom = () => {
    const newRoom: RoomType = {
      id: Date.now().toString(),
      type: '',
      description: '',
      price: 0,
      capacity: 1,
      quantity: 1,
      amenities: []
    };
    
    updateFormData({ rooms: [...formData.rooms, newRoom] });
  };

  const updateRoom = (roomId: string, field: keyof RoomType, value: any) => {
    const updatedRooms = formData.rooms.map(room =>
      room.id === roomId ? { ...room, [field]: value } : room
    );
    
    updateFormData({ rooms: updatedRooms });
  };

  const removeRoom = (roomId: string) => {
    const updatedRooms = formData.rooms.filter(room => room.id !== roomId);
    updateFormData({ rooms: updatedRooms });
  };

  // ✅ NOVO: Calcular estatísticas de preços
  const getPriceStats = () => {
    if (formData.rooms.length === 0) return null;
    
    const prices = formData.rooms.map(room => room.price).filter(price => price > 0);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return { min, max, avg };
  };

  // Estilos
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      marginBottom: '2rem'
    },
    title: {
      marginBottom: '0.5rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#333'
    },
    description: {
      color: '#666',
      marginBottom: '2rem',
      lineHeight: '1.5'
    },
    addButton: {
      background: '#1976d2',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      marginBottom: '2rem',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background-color 0.3s'
    },
    addButtonHover: {
      backgroundColor: '#1565c0'
    },
    roomsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      marginBottom: '1rem'
    },
    roomCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: 'white'
    },
    roomHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #eee'
    },
    roomTitle: {
      margin: 0,
      fontSize: '1.25rem',
      color: '#333'
    },
    removeButton: {
      background: '#f44336',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.3s'
    },
    removeButtonHover: {
      backgroundColor: '#d32f2f'
    },
    roomForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    formRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '1rem'
    },
    formField: {
      display: 'flex',
      flexDirection: 'column'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: '#333'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    },
    inputFocus: {
      borderColor: '#1976d2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
      padding: '2rem',
      border: '1px dashed #ddd',
      borderRadius: '8px',
      backgroundColor: '#fafafa'
    },
    roomsCounter: {
      textAlign: 'center',
      color: '#666',
      marginBottom: '1rem',
      fontSize: '0.875rem'
    },
    // ✅ NOVO: Estilos para estatísticas de preço
    priceStats: {
      background: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.5rem'
    },
    priceStatsTitle: {
      margin: '0 0 0.5rem 0',
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#0369a1'
    },
    priceStatsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '1rem'
    },
    priceStatItem: {
      textAlign: 'center'
    },
    priceStatLabel: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '0.25rem'
    },
    priceStatValue: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#059669'
    },
    // ✅ NOVO: Estilo para dica de preço
    priceHint: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      fontStyle: 'italic'
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = styles.inputFocus.borderColor as string;
    e.target.style.outline = styles.inputFocus.outline as string;
    e.target.style.boxShadow = styles.inputFocus.boxShadow as string;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#ddd';
    e.target.style.boxShadow = 'none';
  };

  const handleAddButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = styles.addButtonHover.backgroundColor as string;
  };

  const handleAddButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = styles.addButton.backgroundColor as string;
  };

  const handleRemoveButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = styles.removeButtonHover.backgroundColor as string;
  };

  const handleRemoveButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = styles.removeButton.backgroundColor as string;
  };

  const priceStats = getPriceStats();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tipos de Quarto</h2>
      
      <p style={styles.description}>
        Adicione os diferentes tipos de quarto disponíveis no seu hotel. 
        Todos os preços devem ser em <strong>Metical (MT)</strong>.
      </p>

      {/* ✅ NOVO: Estatísticas de preços */}
      {priceStats && (
        <div style={styles.priceStats}>
          <h4 style={styles.priceStatsTitle}>Resumo de Preços</h4>
          <div style={styles.priceStatsGrid}>
            <div style={styles.priceStatItem}>
              <div style={styles.priceStatLabel}>Preço Mínimo</div>
              <div style={styles.priceStatValue}>{formatMetical(priceStats.min)}</div>
            </div>
            <div style={styles.priceStatItem}>
              <div style={styles.priceStatLabel}>Preço Médio</div>
              <div style={styles.priceStatValue}>{formatMetical(priceStats.avg)}</div>
            </div>
            <div style={styles.priceStatItem}>
              <div style={styles.priceStatLabel}>Preço Máximo</div>
              <div style={styles.priceStatValue}>{formatMetical(priceStats.max)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Contador de quartos */}
      {formData.rooms.length > 0 && (
        <div style={styles.roomsCounter}>
          {formData.rooms.length} tipo(s) de quarto adicionado(s)
        </div>
      )}

      <button 
        onClick={addRoom}
        style={styles.addButton}
        onMouseEnter={handleAddButtonHover}
        onMouseLeave={handleAddButtonLeave}
      >
        + Adicionar Tipo de Quarto
      </button>

      {formData.rooms.length > 0 ? (
        <div style={styles.roomsList}>
          {formData.rooms.map((room, index) => (
            <div key={room.id} style={styles.roomCard}>
              <div style={styles.roomHeader}>
                <h3 style={styles.roomTitle}>
                  Quarto {index + 1} 
                  {room.type && ` - ${room.type}`}
                  {room.price > 0 && (
                    <span style={{ fontSize: '0.875rem', color: '#059669', marginLeft: '0.5rem' }}>
                      ({formatMetical(room.price)})
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => removeRoom(room.id)}
                  style={styles.removeButton}
                  onMouseEnter={handleRemoveButtonHover}
                  onMouseLeave={handleRemoveButtonLeave}
                >
                  Remover
                </button>
              </div>
              
              <div style={styles.roomForm}>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Tipo de Quarto *</label>
                    <input
                      type="text"
                      value={room.type}
                      onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Ex: Standard Duplo, Luxo, Suite Presidencial"
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  {/* ✅ CORREÇÃO: PriceInput em vez de input number */}
                  <div style={styles.formField}>
                    <label style={styles.label}>Preço por Noite (MT) *</label>
                    <PriceInput
                      value={room.price}
                      onChange={(price) => updateRoom(room.id, 'price', price)}
                      placeholder="1500,00"
                      label=""
                    />
                    <div style={styles.priceHint}>
                      Digite o valor em Metical (ex: 1500,00)
                    </div>
                  </div>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.label}>Capacidade (pessoas) *</label>
                    <input
                      type="number"
                      value={room.capacity}
                      onChange={(e) => updateRoom(room.id, 'capacity', Number(e.target.value))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      min="1"
                      max="10"
                      style={styles.input}
                      required
                    />
                  </div>
                  
                  <div style={styles.formField}>
                    <label style={styles.label}>Quantidade de Quartos *</label>
                    <input
                      type="number"
                      value={room.quantity}
                      onChange={(e) => updateRoom(room.id, 'quantity', Number(e.target.value))}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      min="1"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
                
                <div style={{ ...styles.formField, ...styles.fullWidth }}>
                  <label style={styles.label}>Descrição</label>
                  <textarea
                    value={room.description}
                    onChange={(e) => updateRoom(room.id, 'description', e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Descreva as características do quarto, mobília, vista, comodidades incluídas, etc..."
                    rows={3}
                    style={styles.textarea}
                  />
                </div>

                {/* ✅ NOVO: Preview do preço formatado */}
                {room.price > 0 && (
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '4px', 
                    padding: '0.75rem',
                    marginTop: '0.5rem'
                  }}>
                    <strong>Preço exibido aos clientes:</strong>{' '}
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>
                      {formatMetical(room.price)} por noite
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>Nenhum quarto adicionado ainda.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Clique no botão acima para adicionar o primeiro tipo de quarto.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotelRooms;