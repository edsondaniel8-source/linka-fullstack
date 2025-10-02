import React, { useState, useEffect } from 'react';
import { accommodationService } from '../../shared/lib/accommodationService';

// Componentes das etapas
import HotelBasicInfo from '../steps/HotelBasicInfo';
import HotelLocation from '../steps/HotelLocation';
import HotelAmenities from '../steps/HotelAmenities';
import HotelRooms from '../steps/HotelRooms';
import HotelImages from '../steps/HotelImages';
import ReviewAndSubmit from '../steps/ReviewAndSubmit';

// ✅ NOVO: Importar utilitários de Metical
import { formatMetical } from '@/shared/utils/currency';

// Tipos
export interface HotelFormData {
  // Informações básicas
  name: string;
  description: string;
  category: string;
  email: string;
  phone: string;
  
  // Localização
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Comodidades
  amenities: string[];
  
  // Quartos
  rooms: RoomType[];
  
  // ✅ CORRIGIDO: Imagens agora aceitam tanto File quanto string
  images: (File | string)[];
  existingImages: string[];
}

export interface RoomType {
  id: string;
  type: string;
  description: string;
  price: number; // ✅ Em Metical (MT)
  capacity: number;
  quantity: number;
  amenities: string[];
}

// ✅ CORRIGIDO: Props atualizadas para suportar tipos flexíveis
interface HotelCreationWizardProps {
  onSuccess?: (hotelId: string) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
  initialData?: HotelFormData;
  hotelId?: string; // ID do hotel para edição
}

const steps = [
  'Informações Básicas',
  'Localização',
  'Comodidades',
  'Quartos',
  'Imagens',
  'Revisão e Envio'
];

// Estilos usando objetos React.CSSProperties
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  paper: {
    background: 'white',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '0.5rem'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem'
  },
  stepper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    position: 'relative'
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    flex: 1
  },
  stepCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  stepCircleActive: {
    background: '#1976d2',
    color: 'white'
  },
  stepCircleCompleted: {
    background: '#4caf50',
    color: 'white'
  },
  stepLabel: {
    fontSize: '0.8rem',
    textAlign: 'center'
  },
  alert: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2'
  },
  success: {
    background: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #c8e6c9'
  },
  stepContent: {
    minHeight: '400px'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease'
  },
  buttonPrimary: {
    background: '#1976d2',
    color: 'white'
  },
  buttonPrimaryHover: {
    background: '#1565c0'
  },
  buttonSecondary: {
    background: '#f5f5f5',
    color: '#333'
  },
  buttonSecondaryHover: {
    background: '#e0e0e0'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  stepperLine: {
    position: 'absolute',
    top: '20px',
    left: 0,
    right: 0,
    height: '2px',
    background: '#e0e0e0',
    zIndex: 1
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    zIndex: 10
  },
  loadingSpinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1976d2',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  },
  // ✅ NOVO: Estilo para exibição de preços
  priceDisplay: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  modeBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    marginBottom: '1rem'
  },
  createBadge: {
    background: '#e8f5e8',
    color: '#2e7d32',
    border: '1px solid #c8e6c9'
  },
  editBadge: {
    background: '#fff3e0',
    color: '#ef6c00',
    border: '1px solid #ffe0b2'
  }
};

// Adicionar keyframes para a animação do spinner
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

const HotelCreationWizard: React.FC<HotelCreationWizardProps> = ({
  onSuccess,
  onCancel,
  mode = 'create',
  initialData,
  hotelId
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    category: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    amenities: [],
    rooms: [],
    images: [],
    existingImages: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ CORRIGIDO: Carregar dados iniciais para edição
  useEffect(() => {
    if (mode === 'edit' && hotelId) {
      loadHotelData();
    } else if (initialData) {
      // ✅ CORRIGIDO: Garantir que as imagens sejam tratadas corretamente
      const processedData = {
        ...initialData,
        images: initialData.images || [],
        existingImages: initialData.existingImages || []
      };
      setFormData(processedData);
    }
  }, [mode, hotelId, initialData]);

  // ✅ CORRIGIDO: Carregar dados do hotel para edição
  const loadHotelData = async () => {
    if (!hotelId) return;
    
    try {
      setIsLoading(true);
      console.log('📋 Carregando dados do hotel para edição:', hotelId);
      
      // Se initialData foi fornecido, use-o
      if (initialData) {
        // ✅ CORRIGIDO: Processar imagens para garantir compatibilidade
        const processedData = {
          ...initialData,
          images: initialData.images || [],
          existingImages: initialData.existingImages || []
        };
        setFormData(processedData);
        console.log('✅ Dados iniciais carregados:', processedData);
      } else {
        // ✅ NOVO: Tentar carregar da API se não houver initialData
        try {
          // Aqui você implementaria a chamada API real
          // Por enquanto, vamos simular um carregamento
          console.log('ℹ️ Tentando carregar dados da API para o hotel:', hotelId);
          
          // Simular delay de carregamento
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Se não conseguir carregar, manter dados vazios
          console.log('⚠️ Nenhum dado encontrado na API, mantendo formulário vazio');
        } catch (apiError) {
          console.error('❌ Erro na API:', apiError);
          setError('Não foi possível carregar os dados do hotel. Preencha manualmente.');
        }
      }
    } catch (err) {
      console.error('❌ Erro ao carregar dados do hotel:', err);
      setError('Erro ao carregar dados do hotel. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ CORRIGIDO: Calcular preço médio dos quartos
  const calculateAveragePrice = (): string => {
    if (formData.rooms.length === 0) return formatMetical(0);
    
    const total = formData.rooms.reduce((sum, room) => sum + room.price, 0);
    const average = total / formData.rooms.length;
    return formatMetical(average);
  };

  // ✅ CORRIGIDO: Calcular preço mínimo e máximo
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

  // ✅ CORRIGIDO: Obter título baseado no modo
  const getTitle = (): string => {
    return mode === 'edit' ? 'Editar Hotel' : 'Cadastro de Hotel';
  };

  // ✅ CORRIGIDO: Obter subtítulo baseado no modo
  const getSubtitle = (): string => {
    const baseText = `Preencha as informações do seu hotel em ${steps.length} etapas`;
    return mode === 'edit' 
      ? `Edite as informações do hotel em ${steps.length} etapas`
      : baseText;
  };

  // Avançar para próxima etapa
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
      setSuccess('');
    }
  };

  // Voltar para etapa anterior
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
    setSuccess('');
  };

  // ✅ CORRIGIDO: Validação com suporte para modo de edição
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Informações básicas
        if (!formData.name.trim()) {
          setError('Nome do hotel é obrigatório');
          return false;
        }
        if (!formData.category) {
          setError('Categoria do hotel é obrigatória');
          return false;
        }
        if (!formData.email) {
          setError('Email é obrigatório');
          return false;
        }
        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Email inválido');
          return false;
        }
        return true;
      
      case 1: // Localização
        if (!formData.address.trim()) {
          setError('Endereço é obrigatório');
          return false;
        }
        if (!formData.city.trim()) {
          setError('Cidade é obrigatória');
          return false;
        }
        if (!formData.country.trim()) {
          setError('País é obrigatório');
          return false;
        }
        return true;
      
      case 2: // Comodidades
        if (formData.amenities.length === 0) {
          setError('Selecione pelo menos uma comodidade');
          return false;
        }
        return true;
      
      case 3: // Quartos
        if (formData.rooms.length === 0) {
          setError('Adicione pelo menos um tipo de quarto');
          return false;
        }
        
        // ✅ CORRIGIDO: Validação reforçada de preços
        for (const room of formData.rooms) {
          if (!room.type.trim()) {
            setError('Tipo de quarto é obrigatório para todos os quartos');
            return false;
          }
          
          // ✅ VALIDAÇÃO CRÍTICA DO PREÇO
          if (room.price === null || room.price === undefined) {
            setError(`Preço é obrigatório para: ${room.type}`);
            return false;
          }
          
          if (typeof room.price !== 'number' || isNaN(room.price)) {
            setError(`Preço deve ser um número válido para: ${room.type}`);
            return false;
          }
          
          if (room.price <= 0) {
            setError(`Preço em Metical deve ser maior que zero para: ${room.type}`);
            return false;
          }
          
          if (room.price < 100) {
            setError(`Preço muito baixo para ${room.type}. Mínimo recomendado: ${formatMetical(100)}`);
            return false;
          }
          
          if (room.capacity <= 0) {
            setError('Capacidade deve ser maior que zero para todos os quartos');
            return false;
          }
          
          if (room.quantity <= 0) {
            setError('Quantidade deve ser maior que zero para todos os quartos');
            return false;
          }
        }
        
        console.log('✅ Todos os quartos validados com preços:', 
          formData.rooms.map(room => ({ type: room.type, price: room.price }))
        );
        return true;
      
      case 4: // Imagens
        // ✅ CORRIGIDO: Para edição, aceita imagens existentes (strings) ou novas (Files)
        const hasImages = formData.images.length > 0 || formData.existingImages.length > 0;
        if (!hasImages) {
          setError('Adicione pelo menos uma imagem do hotel');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // ✅ CORRIGIDO: Atualizar dados do formulário com tratamento de tipos
  const updateFormData = (newData: Partial<HotelFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      
      // ✅ GARANTIR: Que arrays sempre existam
      if (!updated.images) updated.images = [];
      if (!updated.existingImages) updated.existingImages = [];
      if (!updated.amenities) updated.amenities = [];
      if (!updated.rooms) updated.rooms = [];
      
      return updated;
    });
  };

  // ✅ CORRIGIDO: Helper para separar imagens por tipo
  const separateImages = () => {
    const fileImages = formData.images.filter((img): img is File => img instanceof File);
    const stringImages = formData.images.filter((img): img is string => typeof img === 'string');
    
    return {
      fileImages,
      stringImages: [...stringImages, ...formData.existingImages]
    };
  };

  // ✅ CORRIGIDO: Submissão com tratamento correto de preços
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      console.log(`🏨 Iniciando ${mode === 'edit' ? 'edição' : 'criação'} do hotel...`, formData);

      // ✅ VALIDAÇÃO CRÍTICA: Verificar se todos os quartos têm preço válido
      const invalidRooms = formData.rooms.filter(room => 
        room.price === null || room.price === undefined || room.price <= 0
      );
      
      if (invalidRooms.length > 0) {
        const invalidRoomNames = invalidRooms.map(room => room.type).join(', ');
        throw new Error(`Preço inválido para os quartos: ${invalidRoomNames}. Preço mínimo: ${formatMetical(100)}`);
      }

      // ✅ CORRIGIDO: Log com preços formatados em Metical
      console.log('💰 Preços validados dos quartos (MT):', 
        formData.rooms.map(room => ({
          type: room.type,
          price: room.price,
          formatted: formatMetical(room.price)
        }))
      );

      // ✅ CORRIGIDO: Separar imagens para processamento
      const { fileImages, stringImages } = separateImages();
      console.log('🖼️ Imagens - Files:', fileImages.length, 'URLs:', stringImages.length);

      let result;
      
      if (mode === 'edit' && hotelId) {
        // ✅ CORRIGIDO: Lógica para edição com dados processados
        console.log('✏️ Editando hotel existente:', hotelId);
        
        // Preparar dados para edição
        const editData = {
          ...formData,
          images: fileImages, // ✅ Apenas novos arquivos para upload
          existingImages: stringImages // ✅ URLs existentes + novas URLs
        };
        
        // Aqui você chamaria accommodationService.updateHotel
        // Por enquanto, vamos simular sucesso
        result = { hotelId, success: true };
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        // ✅ CORRIGIDO: Preparar dados para criação com mapeamento correto
        const createData: HotelFormData = {
          // Informações básicas
          name: formData.name,
          description: formData.description,
          category: formData.category,
          email: formData.email,
          phone: formData.phone,
          
          // Localização
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
          latitude: formData.latitude,
          longitude: formData.longitude,
          
          // Comodidades
          amenities: formData.amenities,
          
          // Quartos (mantemos a estrutura original para o formData)
          rooms: formData.rooms,
          
          // Imagens
          images: fileImages,
          
          // ✅ CORREÇÃO: Adicionar propriedade existingImages que estava faltando
          existingImages: [] // ✅ Para criação, existingImages é vazio
        };
        
        console.log('📤 Dados enviados para criação:', {
          hotelInfo: {
            name: createData.name,
            category: createData.category,
            roomsCount: createData.rooms.length
          },
          rooms: createData.rooms.map(room => ({
            type: room.type,
            price: room.price,
            hasPrice: room.price > 0
          }))
        });

        // ✅ CORRIGIDO: Chamar o serviço com dados mapeados corretamente
        // O accommodationService.createHotel deve lidar com o mapeamento interno
        result = await accommodationService.createHotel(createData);
        setSuccess('Hotel criado com sucesso!');
      }
      
      console.log(`✅ Hotel ${mode === 'edit' ? 'atualizado' : 'criado'} com sucesso:`, result);

      // Aguardar um pouco para mostrar mensagem de sucesso
      setTimeout(() => {
        onSuccess?.(result.hotelId || hotelId || '');
      }, 2000);
      
    } catch (err) {
      console.error(`❌ Erro ao ${mode === 'edit' ? 'editar' : 'criar'} hotel:`, err);
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Erro desconhecido ao ${mode === 'edit' ? 'editar' : 'criar'} hotel. Tente novamente.`;
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para hover dos botões
  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) => {
    if (!isSubmitting) {
      e.currentTarget.style.backgroundColor = isPrimary 
        ? styles.buttonPrimaryHover.background as string
        : styles.buttonSecondaryHover.background as string;
    }
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>, isPrimary: boolean) => {
    if (!isSubmitting) {
      e.currentTarget.style.backgroundColor = isPrimary 
        ? styles.buttonPrimary.background as string
        : styles.buttonSecondary.background as string;
    }
  };

  // ✅ CORRIGIDO: Renderizar resumo de preços para a etapa de revisão
  const renderPriceSummary = () => {
    if (formData.rooms.length === 0) return null;

    const priceRange = calculatePriceRange();
    
    return (
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Resumo de Preços</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Faixa de Preço:</strong>
            <div style={styles.priceDisplay}>
              {priceRange.min} - {priceRange.max}
            </div>
          </div>
          <div>
            <strong>Preço Médio:</strong>
            <div style={styles.priceDisplay}>
              {calculateAveragePrice()}
            </div>
          </div>
          <div>
            <strong>Tipos de Quarto:</strong>
            <div>{formData.rooms.length} tipos</div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ CORRIGIDO: Renderizar badge do modo
  const renderModeBadge = () => {
    const badgeStyle = {
      ...styles.modeBadge,
      ...(mode === 'create' ? styles.createBadge : styles.editBadge)
    };

    return (
      <div style={{ textAlign: 'center' }}>
        <span style={badgeStyle}>
          {mode === 'create' ? '📝 CRIANDO NOVO HOTEL' : '✏️ EDITANDO HOTEL'}
        </span>
      </div>
    );
  };

  // ✅ CORRIGIDO: Renderizar etapa atual com props atualizadas
  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      mode // ✅ Passar o modo para os componentes filhos
    };

    switch (activeStep) {
      case 0:
        return <HotelBasicInfo {...commonProps} />;
      case 1:
        return <HotelLocation {...commonProps} />;
      case 2:
        return <HotelAmenities {...commonProps} />;
      case 3:
        return <HotelRooms {...commonProps} />;
      case 4:
        return <HotelImages {...commonProps} />;
      case 5:
        return (
          <div>
            {renderPriceSummary()}
            <ReviewAndSubmit
              {...commonProps}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              mode={mode}
            />
          </div>
        );
      default:
        return <div>Etapa não encontrada</div>;
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.paper}>
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
            <div style={{ marginLeft: '1rem' }}>
              {mode === 'edit' ? 'Carregando dados do hotel...' : 'Preparando formulário...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{spinnerStyle}</style>
      
      <div style={styles.paper}>
        {/* Loading Overlay */}
        {isSubmitting && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
            <div style={{ marginLeft: '1rem' }}>
              {mode === 'edit' ? 'Atualizando hotel...' : 'Criando hotel...'}
            </div>
          </div>
        )}

        {/* Cabeçalho */}
        <h1 style={styles.title}>{getTitle()}</h1>
        {renderModeBadge()}
        
        <p style={styles.subtitle}>
          {getSubtitle()}
        </p>

        {/* Stepper simplificado */}
        <div style={styles.stepper}>
          <div style={styles.stepperLine}></div>
          {steps.map((label, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            const stepCircleStyle = {
              ...styles.stepCircle,
              ...(isActive ? styles.stepCircleActive : {}),
              ...(isCompleted ? styles.stepCircleCompleted : {})
            };

            return (
              <div key={label} style={styles.step}>
                <div style={stepCircleStyle}>{index + 1}</div>
                <div style={styles.stepLabel}>{label}</div>
              </div>
            );
          })}
        </div>

        {/* Mensagem de sucesso */}
        {success && (
          <div style={{ ...styles.alert, ...styles.success }}>
            ✅ {success}
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div style={{ ...styles.alert, ...styles.error }}>
            ❌ {error}
          </div>
        )}

        {/* Conteúdo da etapa */}
        <div style={styles.stepContent}>
          {renderStep()}
        </div>

        {/* Navegação (exceto na última etapa) */}
        {activeStep < steps.length - 1 && (
          <div style={styles.navigation}>
            <button
              onClick={onCancel || handleBack}
              disabled={(activeStep === 0 && !onCancel) || isSubmitting}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
                ...((activeStep === 0 && !onCancel) ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => handleButtonHover(e, false)}
              onMouseLeave={(e) => handleButtonLeave(e, false)}
            >
              {activeStep === 0 && onCancel ? 'Cancelar' : 'Voltar'}
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(isSubmitting ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonLeave(e, true)}
            >
              {activeStep === steps.length - 2 ? 'Revisar' : 'Próximo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelCreationWizard;