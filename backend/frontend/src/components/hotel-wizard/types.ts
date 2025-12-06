// @/components/hotel-wizard/types.ts

// Tipo de quarto usado no wizard (frontend)
export interface RoomFormData {
  id?: string; // existe após salvar no backend
  name: string;
  type: string; // ex: "standard", "suite"
  pricePerNight: number; // frontend usa pricePerNight
  maxOccupancy: number;   // frontend usa maxOccupancy
  quantity: number;
  description: string;
  amenities: string[];
  images: (string | File)[];
  size?: number;
  bedType?: string;
  hasBalcony?: boolean;
  hasSeaView?: boolean;
}

// Tipo usado pelo serviço/backend (o que o Wizard envia)
export interface HotelRoomType {
  id: string; // obrigatório no backend
  name: string;
  type: string;
  price: number;     // corresponde a pricePerNight
  capacity: number;  // corresponde a maxOccupancy
  quantity: number;
  description: string;
  amenities: string[];
  images: (string | File)[];
  size?: number;
  bedType?: string;
  hasBalcony?: boolean;
  hasSeaView?: boolean;
}

// Função de mapeamento de frontend → backend
export const mapRoomToBackend = (room: RoomFormData): HotelRoomType => ({
  id: room.id || '', // obrigatório no backend
  name: room.name,
  type: room.type,
  price: room.pricePerNight,
  capacity: room.maxOccupancy,
  quantity: room.quantity,
  description: room.description,
  amenities: room.amenities,
  images: room.images,
  size: room.size,
  bedType: room.bedType,
  hasBalcony: room.hasBalcony,
  hasSeaView: room.hasSeaView
});

// Tipo principal do hotel usado no wizard
export interface HotelFormData {
  hotelId?: string; // opcional, usado para edição
  name: string;
  description: string;
  category: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  location?: { lat: number; lng: number };
  
  // ✅ PROPRIEDADES CORRIGIDAS (APENAS CAMPOS QUE EXISTEM NO BANCO):
  locality: string;      // Nome da localidade (ex: "Tofo", "Inhambane") - EXISTE NO BANCO
  province: string;      // Província (ex: "Inhambane", "Maputo") - EXISTE NO BANCO
  // ❌ district REMOVIDO - NÃO EXISTE NO BANCO

  amenities: string[];
  rooms: RoomFormData[];

  images: (string | File)[];
  existingImages?: string[];

  checkInTime: string;
  checkOutTime: string;
  policies?: string[];

  isActive: boolean;
}

// Props para o wizard
export interface HotelCreationWizardProps {
  open: boolean;
  onCancel?: () => void;
  onSuccess?: (hotelId: string) => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<HotelFormData>;
  hotelId?: string;
  autoSave?: boolean;
}

// Props do ReviewAndSubmit - COM onNext e onBack OPCIONAIS
export interface ReviewAndSubmitProps {
  formData: HotelFormData;
  updateFormData: (newData: Partial<HotelFormData>) => void;
  onNext?: () => void;  // ✅ OPCIONAL na etapa de revisão
  onBack?: () => void;  // ✅ OPCIONAL na etapa de revisão
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}

// Props para componentes de etapa COM onNext e onBack OBRIGATÓRIOS
export interface HotelBasicInfoProps {
  formData: HotelFormData;
  updateFormData: (newData: Partial<HotelFormData>) => void;
  onNext: () => void;  // ✅ OBRIGATÓRIO para etapas regulares
  onBack: () => void;  // ✅ OBRIGATÓRIO para etapas regulares
  mode?: 'create' | 'edit';
}

// Alias para os outros componentes com props consistentes
export interface HotelLocationProps extends HotelBasicInfoProps {}
export interface HotelAmenitiesProps extends HotelBasicInfoProps {}
export interface HotelRoomsProps extends HotelBasicInfoProps {}
export interface HotelImagesProps extends HotelBasicInfoProps {}

// Interface para sugestões de localização
export interface LocationSuggestion {
  id: string;
  name: string;
  province: string;
  district: string;
  lat: number;
  lng: number;
  type: string;
}

// ✅ FUNÇÃO ATUALIZADA: criar dados iniciais do formulário (SEM district)
export const createInitialFormData = (): HotelFormData => ({
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
  lat: undefined,
  lng: undefined,
  location: undefined,
  // ✅ PROPRIEDADES INICIALIZADAS (APENAS CAMPOS EXISTENTES):
  locality: '',
  province: '',
  // ❌ district REMOVIDO - NÃO EXISTE NO BANCO
  amenities: [],
  rooms: [],
  images: [],
  existingImages: [],
  checkInTime: '',
  checkOutTime: '',
  policies: [],
  isActive: true
});

// Função para validar dados do formulário antes do envio (SEM district)
export const validateHotelFormData = (formData: HotelFormData): string[] => {
  const errors: string[] = [];

  if (!formData.name.trim()) errors.push('Nome do hotel é obrigatório');
  if (!formData.category) errors.push('Categoria do hotel é obrigatória');
  if (!formData.email) errors.push('Email é obrigatório');
  if (!formData.address.trim()) errors.push('Endereço é obrigatório');
  if (!formData.city.trim()) errors.push('Cidade é obrigatória');
  if (!formData.country.trim()) errors.push('País é obrigatório');
  
  // ✅ VALIDAÇÕES CORRIGIDAS (APENAS CAMPOS EXISTENTES):
  if (!formData.locality.trim()) errors.push('Localidade é obrigatória');
  if (!formData.province.trim()) errors.push('Província é obrigatória');
  // ❌ VALIDAÇÃO DE district REMOVIDA - NÃO EXISTE NO BANCO
  
  if (formData.lat === undefined || formData.lng === undefined) {
    errors.push('Coordenadas de localização são obrigatórias');
  }
  if (formData.amenities.length === 0) errors.push('Selecione pelo menos uma comodidade');
  if (formData.rooms.length === 0) errors.push('Adicione pelo menos um tipo de quarto');
  if (formData.images.length === 0 && (formData.existingImages?.length || 0) === 0) {
    errors.push('Adicione pelo menos uma imagem do hotel');
  }

  // Validar quartos individualmente
  formData.rooms.forEach((room, index) => {
    if (!room.type.trim()) errors.push(`Tipo do quarto ${index + 1} é obrigatório`);
    if (room.pricePerNight <= 0) errors.push(`Preço do quarto ${index + 1} deve ser maior que zero`);
    if (room.maxOccupancy <= 0) errors.push(`Capacidade do quarto ${index + 1} deve ser maior que zero`);
    if (room.quantity <= 0) errors.push(`Quantidade do quarto ${index + 1} deve ser maior que zero`);
  });

  return errors;
};

// Função para preparar dados para envio ao backend
export const prepareHotelForBackend = (formData: HotelFormData) => {
  const { existingImages, images, rooms, ...rest } = formData;
  
  // Separar imagens em files e URLs
  const fileImages = images.filter((img): img is File => img instanceof File);
  const stringImages = [
    ...images.filter((img): img is string => typeof img === 'string'),
    ...(existingImages || [])
  ];

  // Mapear quartos para o formato do backend
  const backendRooms = rooms.map(mapRoomToBackend);

  return {
    ...rest,
    images: fileImages,
    existingImages: stringImages,
    rooms: backendRooms,
    // Garantir que lat/lng estejam presentes
    lat: formData.lat || formData.location?.lat,
    lng: formData.lng || formData.location?.lng
  };
};

// 🆕 Tipo para o retorno do hook useHotelForm
export interface UseHotelFormReturn {
  formData: HotelFormData;
  updateFormData: (newData: Partial<HotelFormData>) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string;
  success: string;
  isDirty: boolean;
  completedSteps: number[];
  validateCurrentStep: (step: number, markIfValid?: boolean) => boolean;
  validateAllSteps: () => boolean;
  submitForm: (onSuccess?: (hotelId: string) => void) => Promise<any>;
  loadHotelData: (forceReload?: boolean) => Promise<HotelFormData | undefined>;
  saveDraft: () => void;
  loadDraft: () => boolean;
  clearDraft: () => void;
  markStepAsCompleted: (stepIndex: number) => void;
  unmarkStepAsCompleted: (stepIndex: number) => void;
  reset: () => void;
}

// 🆕 Tipo para o retorno do hook useStepNavigation
export interface UseStepNavigationReturn {
  activeStep: number;
  visitedSteps: number[];
  handleNext: () => void;
  handleBack: () => void;
  goToStep: (step: number, shouldValidate?: boolean) => boolean;
  jumpToStep: (step: number, validateCurrent?: boolean) => boolean;
  reset: () => void;
  isStepVisited: (step: number) => boolean;
  canGoToStep: (step: number) => boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoBack: boolean;
  totalSteps: number;
}

// 🆕 Helper type para facilitar a tipagem do switch case
export type HotelWizardComponentProps = 
  | HotelBasicInfoProps 
  | HotelLocationProps 
  | HotelAmenitiesProps 
  | HotelRoomsProps 
  | HotelImagesProps 
  | ReviewAndSubmitProps;