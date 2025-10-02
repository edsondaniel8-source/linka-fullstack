import React, { useState, useEffect } from 'react';
import { HotelFormData } from '../hotel-wizard/HotelCreationWizard';
import { formatMetical } from '@/shared/utils/currency';

interface ReviewAndSubmitProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  mode?: 'create' | 'edit'; // ✅ NOVO: Prop para modo de criação/edição
}

const ReviewAndSubmit: React.FC<ReviewAndSubmitProps> = ({
  formData,
  onBack,
  onSubmit,
  isSubmitting,
  mode = 'create' // ✅ NOVO: Valor padrão para modo criação
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

  // ✅ NOVO: Obter título baseado no modo
  const getTitle = (): string => {
    return mode === 'edit' ? 'Revisão e Atualização' : 'Revisão e Confirmação';
  };

  // ✅ NOVO: Obter descrição baseada no modo
  const getDescription = (): string => {
    return mode === 'edit' 
      ? 'Revise todas as informações antes de atualizar o hotel'
      : 'Revise todas as informações antes de criar o hotel';
  };

  // ✅ NOVO: Obter texto do botão de submit baseado no modo
  const getSubmitButtonText = (): string => {
    if (isSubmitting) {
      return mode === 'edit' ? 'Atualizando Hotel...' : 'Criando Hotel...';
    }
    return mode === 'edit' ? 'Confirmar e Atualizar Hotel' : 'Confirmar e Criar Hotel';
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
    reviewGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    reviewCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    reviewCardTitle: {
      margin: '0 0 1rem 0',
      color: '#333',
      fontSize: '1.125rem',
      fontWeight: '600',
      borderBottom: '2px solid #f0f0f0',
      paddingBottom: '0.5rem'
    },
    reviewContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    reviewItem: {
      margin: 0,
      fontSize: '0.875rem',
      lineHeight: '1.4'
    },
    reviewStrong: {
      color: '#333',
      fontWeight: '600'
    },
    chipsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    chip: {
      background: '#e3f2fd',
      color: '#1976d2',
      padding: '0.25rem 0.75rem',
      borderRadius: '16px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    roomReview: {
      padding: '1rem',
      background: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      marginBottom: '1rem'
    },
    roomReviewLast: {
      marginBottom: 0
    },
    roomTitle: {
      margin: '0 0 0.5rem 0',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#333'
    },
    roomDetail: {
      margin: '0.25rem 0',
      fontSize: '0.8rem',
      color: '#666'
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '2rem',
      gap: '1rem'
    },
    actionsMobile: {
      flexDirection: 'column'
    },
    button: {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      minWidth: '140px'
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    buttonPrimary: {
      background: '#1976d2',
      color: 'white'
    },
    buttonPrimaryHover: {
      backgroundColor: '#1565c0'
    },
    buttonSecondary: {
      background: '#f5f5f5',
      color: '#333',
      border: '1px solid #ddd'
    },
    buttonSecondaryHover: {
      backgroundColor: '#e0e0e0'
    },
    emptyText: {
      color: '#666',
      fontStyle: 'italic',
      fontSize: '0.875rem',
      margin: 0
    },
    summarySection: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    },
    summaryTitle: {
      margin: '0 0 0.5rem 0',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#333'
    },
    summaryText: {
      margin: 0,
      fontSize: '0.875rem',
      color: '#666'
    },
    // ✅ NOVO: Estilos para modo de edição
    editBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      background: '#fff3e0',
      color: '#ef6c00',
      border: '1px solid #ffe0b2',
      marginBottom: '1rem'
    },
    createBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      background: '#e8f5e8',
      color: '#2e7d32',
      border: '1px solid #c8e6c9',
      marginBottom: '1rem'
    }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) => {
    if (!isSubmitting) {
      e.currentTarget.style.backgroundColor = isPrimary 
        ? styles.buttonPrimaryHover.backgroundColor as string
        : styles.buttonSecondaryHover.backgroundColor as string;
    }
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) => {
    if (!isSubmitting) {
      e.currentTarget.style.backgroundColor = isPrimary 
        ? styles.buttonPrimary.backgroundColor as string
        : styles.buttonSecondary.backgroundColor as string;
    }
  };

  // ✅ NOVO: Renderizar badge do modo
  const renderModeBadge = () => {
    const badgeStyle = mode === 'edit' ? styles.editBadge : styles.createBadge;
    const badgeText = mode === 'edit' ? '✏️ MODO EDIÇÃO' : '📝 MODO CRIAÇÃO';

    return (
      <div style={{ textAlign: 'center' }}>
        <span style={badgeStyle}>
          {badgeText}
        </span>
      </div>
    );
  };

  // Calcular totais
  const totalRooms = formData.rooms.reduce((sum, room) => sum + room.quantity, 0);
  const roomTypesCount = formData.rooms.length;

  // ✅ NOVO: Calcular preço médio
  const calculateAveragePrice = (): string => {
    if (formData.rooms.length === 0) return formatMetical(0);
    
    const total = formData.rooms.reduce((sum, room) => sum + room.price, 0);
    const average = total / formData.rooms.length;
    return formatMetical(average);
  };

  // ✅ NOVO: Calcular preço mínimo e máximo
  const calculatePriceRange = (): { min: string; max: string } => {
    if (formData.rooms.length === 0) {
      return { min: formatMetical(0), max: formatMetical(0) };
    }
    
    const prices = formData.rooms.map(room => room.price);
    return {
      min: formatMetical(Math.min(...prices)),
      max: formatMetical(Math.max(...prices))
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{getTitle()}</h2>
      {renderModeBadge()}
      
      <p style={styles.description}>
        {getDescription()}
      </p>

      <div style={styles.reviewGrid}>
        {/* Informações Básicas */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Informações Básicas</h3>
          <div style={styles.reviewContent}>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Nome:</span> {formData.name || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Categoria:</span> {formData.category || 'Não informada'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Email:</span> {formData.email || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Telefone:</span> {formData.phone || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Descrição:</span> {formData.description || 'Não informada'}
            </p>
          </div>
        </div>

        {/* Localização */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Localização</h3>
          <div style={styles.reviewContent}>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Endereço:</span> {formData.address || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Cidade:</span> {formData.city || 'Não informada'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>Estado:</span> {formData.state || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>País:</span> {formData.country || 'Não informado'}
            </p>
            <p style={styles.reviewItem}>
              <span style={styles.reviewStrong}>CEP:</span> {formData.zipCode || 'Não informado'}
            </p>
          </div>
        </div>

        {/* Comodidades */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Comodidades</h3>
          <div style={styles.reviewContent}>
            {formData.amenities.length > 0 ? (
              <div style={styles.chipsContainer}>
                {formData.amenities.map((amenity, index) => (
                  <span key={index} style={styles.chip}>
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>Nenhuma comodidade selecionada</p>
            )}
          </div>
        </div>

        {/* Quartos */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Tipos de Quarto ({formData.rooms.length})</h3>
          <div style={styles.reviewContent}>
            {formData.rooms.length > 0 ? (
              formData.rooms.map((room, index) => (
                <div 
                  key={room.id} 
                  style={{
                    ...styles.roomReview,
                    ...(index === formData.rooms.length - 1 ? styles.roomReviewLast : {})
                  }}
                >
                  <p style={styles.roomTitle}>{room.type || 'Tipo não definido'}</p>
                  <p style={styles.roomDetail}>Preço: {formatMetical(room.price)}</p>
                  <p style={styles.roomDetail}>Capacidade: {room.capacity} pessoa(s)</p>
                  <p style={styles.roomDetail}>Quantidade: {room.quantity} quarto(s)</p>
                  {room.description && (
                    <p style={styles.roomDetail}>Descrição: {room.description}</p>
                  )}
                  {room.amenities && room.amenities.length > 0 && (
                    <p style={styles.roomDetail}>
                      Comodidades: {room.amenities.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>Nenhum quarto adicionado</p>
            )}
          </div>
        </div>

        {/* Imagens */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Imagens</h3>
          <div style={styles.reviewContent}>
            {formData.images.length > 0 ? (
              <p style={styles.reviewItem}>
                {formData.images.length} nova(s) imagem(ns) selecionada(s)
              </p>
            ) : (
              <p style={styles.emptyText}>
                {mode === 'edit' ? 'Nenhuma nova imagem adicionada' : 'Nenhuma imagem adicionada'}
              </p>
            )}
            {formData.existingImages && formData.existingImages.length > 0 && (
              <p style={styles.reviewItem}>
                <span style={styles.reviewStrong}>Imagens existentes:</span> {formData.existingImages.length}
              </p>
            )}
          </div>
        </div>

        {/* ✅ NOVO: Card de Resumo Financeiro */}
        <div style={styles.reviewCard}>
          <h3 style={styles.reviewCardTitle}>Resumo Financeiro</h3>
          <div style={styles.reviewContent}>
            {formData.rooms.length > 0 ? (
              <>
                <p style={styles.reviewItem}>
                  <span style={styles.reviewStrong}>Faixa de Preço:</span>{' '}
                  {calculatePriceRange().min} - {calculatePriceRange().max}
                </p>
                <p style={styles.reviewItem}>
                  <span style={styles.reviewStrong}>Preço Médio:</span>{' '}
                  {calculateAveragePrice()}
                </p>
                <p style={styles.reviewItem}>
                  <span style={styles.reviewStrong}>Tipos de Quarto:</span>{' '}
                  {roomTypesCount}
                </p>
                <p style={styles.reviewItem}>
                  <span style={styles.reviewStrong}>Total de Quartos:</span>{' '}
                  {totalRooms}
                </p>
              </>
            ) : (
              <p style={styles.emptyText}>Nenhum quarto para análise financeira</p>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div style={styles.summarySection}>
        <h4 style={styles.summaryTitle}>
          {mode === 'edit' ? 'Resumo das Alterações' : 'Resumo do Hotel'}
        </h4>
        <p style={styles.summaryText}>
          <strong>{roomTypesCount}</strong> tipo(s) de quarto • <strong>{totalRooms}</strong> quarto(s) no total • <strong>{formData.amenities.length}</strong> comodidade(s)
        </p>
        {mode === 'edit' && (
          <p style={{...styles.summaryText, marginTop: '0.5rem', color: '#ef6c00', fontWeight: '500'}}>
            ⚠️ Ao confirmar, as alterações serão salvas permanentemente.
          </p>
        )}
      </div>

      {/* Botões de ação */}
      <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
        <button 
          onClick={onBack} 
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...styles.buttonSecondary,
            ...(isSubmitting ? styles.buttonDisabled : {})
          }}
          onMouseEnter={(e) => handleButtonHover(e, false)}
          onMouseLeave={(e) => handleButtonLeave(e, false)}
        >
          Voltar
        </button>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(isSubmitting ? styles.buttonDisabled : {})
          }}
          onMouseEnter={(e) => handleButtonHover(e, true)}
          onMouseLeave={(e) => handleButtonLeave(e, true)}
        >
          {getSubmitButtonText()}
        </button>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;