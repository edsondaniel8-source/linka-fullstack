// src/components/steps/ReviewAndSubmit.tsx
import React from 'react';
import { ReviewAndSubmitProps } from '../hotel-wizard/types';
import { formatMetical } from '@/shared/utils/currency';

const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  formData,
  updateFormData,
  onSubmit,
  isSubmitting,
  mode
}) => {
  // Função para calcular estatísticas
  const calculateStatistics = () => {
    const rooms = formData.rooms || [];
    
    if (rooms.length === 0) {
      return {
        averagePrice: formatMetical(0),
        priceRange: { min: formatMetical(0), max: formatMetical(0) },
        dailyRevenue: formatMetical(0),
        monthlyRevenue: formatMetical(0),
        totalRooms: 0,
        roomTypes: 0
      };
    }

    // Preço médio
    const totalPrice = rooms.reduce((sum, room) => sum + (room.pricePerNight || 0), 0);
    const averagePrice = totalPrice / rooms.length;

    // Faixa de preço
    const prices = rooms.map(room => room.pricePerNight).filter(price => price > 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Receita diária
    const dailyRevenue = rooms.reduce((sum, room) => {
      return sum + (room.pricePerNight * room.quantity);
    }, 0);

    // Receita mensal estimada (70% de ocupação)
    const monthlyRevenue = dailyRevenue * 0.7 * 30;

    // Total de quartos
    const totalRooms = rooms.reduce((sum, room) => sum + room.quantity, 0);

    return {
      averagePrice: formatMetical(Math.round(averagePrice)),
      priceRange: { min: formatMetical(minPrice), max: formatMetical(maxPrice) },
      dailyRevenue: formatMetical(Math.round(dailyRevenue)),
      monthlyRevenue: formatMetical(Math.round(monthlyRevenue)),
      totalRooms,
      roomTypes: rooms.length
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="review-container">
      <h3>Revisão Final</h3>
      
      {/* Informações Básicas */}
      <div className="review-summary">
        <h4>Informações Básicas</h4>
        <div className="review-grid">
          <div className="review-item">
            <span className="review-label">Nome do Hotel:</span>
            <span className="review-value">{formData.name || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Categoria:</span>
            <span className="review-value">{formData.category || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Email:</span>
            <span className="review-value">{formData.email || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Telefone:</span>
            <span className="review-value">{formData.phone || 'Não informado'}</span>
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="review-summary">
        <h4>Localização</h4>
        <div className="review-grid">
          <div className="review-item">
            <span className="review-label">Endereço:</span>
            <span className="review-value">{formData.address || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Cidade:</span>
            <span className="review-value">{formData.city || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Localidade:</span>
            <span className="review-value">{formData.locality || 'Não informado'}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Província:</span>
            <span className="review-value">{formData.province || 'Não informado'}</span>
          </div>
          {formData.lat && formData.lng && (
            <div className="review-item">
              <span className="review-label">Coordenadas:</span>
              <span className="review-value">
                {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comodidades */}
      <div className="review-summary">
        <h4>Comodidades</h4>
        <div className="amenities-list">
          {formData.amenities && formData.amenities.length > 0 ? (
            <div className="amenities-tags">
              {formData.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                </span>
              ))}
            </div>
          ) : (
            <p className="no-data">Nenhuma comodidade selecionada</p>
          )}
        </div>
      </div>

      {/* Quartos */}
      <div className="review-summary">
        <h4>Quartos</h4>
        {formData.rooms && formData.rooms.length > 0 ? (
          <>
            <div className="rooms-stats">
              <div className="stat-item">
                <strong>Tipos de Quarto:</strong> {stats.roomTypes}
              </div>
              <div className="stat-item">
                <strong>Total de Quartos:</strong> {stats.totalRooms}
              </div>
              <div className="stat-item">
                <strong>Preço Médio:</strong> {stats.averagePrice}
              </div>
              <div className="stat-item">
                <strong>Faixa de Preço:</strong> {stats.priceRange.min} - {stats.priceRange.max}
              </div>
            </div>
            <div className="rooms-list">
              {formData.rooms.map((room, index) => (
                <div key={index} className="room-item">
                  <div className="room-header">
                    <h5>{room.type}</h5>
                    <span className="room-price">{formatMetical(room.pricePerNight)}/noite</span>
                  </div>
                  <div className="room-details">
                    <span>Quantidade: {room.quantity}</span>
                    <span>•</span>
                    <span>Capacidade: {room.maxOccupancy} pessoas</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="no-data">Nenhum quarto adicionado</p>
        )}
      </div>

      {/* Imagens */}
      <div className="review-summary">
        <h4>Imagens</h4>
        <div className="images-summary">
          <div className="images-count">
            <strong>Total de Imagens:</strong> {
              (formData.images?.length || 0) + (formData.existingImages?.length || 0)
            }
          </div>
          <div className="images-breakdown">
            <span>Novas: {formData.images?.length || 0}</span>
            <span>•</span>
            <span>Existentes: {formData.existingImages?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Análise Financeira */}
      <div className="review-summary price-statistics">
        <h4>Análise Financeira</h4>
        <div className="statistics-grid">
          <div className="statistic-item">
            <div className="statistic-value">{stats.dailyRevenue}</div>
            <div className="statistic-label">Receita Diária</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">{stats.monthlyRevenue}</div>
            <div className="statistic-label">Receita Mensal*</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">{stats.averagePrice}</div>
            <div className="statistic-label">Preço Médio</div>
          </div>
          <div className="statistic-item">
            <div className="statistic-value">
              {stats.priceRange.min} - {stats.priceRange.max}
            </div>
            <div className="statistic-label">Faixa de Preço</div>
          </div>
        </div>
        <div className="statistics-note">
          *Estimativa baseada em 70% de ocupação média
        </div>
      </div>

      {/* Confirmação e Ações */}
      <div className="review-notes">
        <div className="alert alert-info">
          <strong>⚠️ Antes de finalizar, verifique:</strong>
          <ul>
            <li>Todas as informações estão corretas</li>
            <li>Os preços dos quartos estão atualizados</li>
            <li>As imagens estão de boa qualidade</li>
            <li>A localização está precisa</li>
          </ul>
        </div>

        <div className="review-actions">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="review-submit-button"
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner mini"></span>
                {mode === 'edit' ? 'Atualizando...' : 'Criando...'}
              </>
            ) : (
              <>
                <span>🏨</span>
                {mode === 'edit' ? 'ATUALIZAR HOTEL' : 'CRIAR HOTEL'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;