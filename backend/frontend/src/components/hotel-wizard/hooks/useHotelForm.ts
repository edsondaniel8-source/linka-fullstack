// src/components/hotel-wizard/hooks/useHotelForm.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { accommodationService } from '@/shared/lib/accommodationService';
import { validateStep, validateRooms, validateAllSteps } from '../utils/validators';
import { separateImages, prepareImagesForUpload } from '../utils/imageUtils';

// ✅ IMPORTAR TIPOS DO SISTEMA
import type {
  Hotel,
  RoomType,
  HotelCreateRequest,
  HotelUpdateRequest
} from '@/types';

// ✅ IMPORTAR TIPOS DO WIZARD
import type {
  HotelFormData,
  RoomFormData
} from '../types';

interface UseHotelFormProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<HotelFormData>;
  hotelId?: string;
  autoSave?: boolean;
}

// ✅ HELPER: Converter string para número seguro
function safeParseFloat(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null) return undefined;
  
  if (typeof value === 'number') return value;
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

// ✅ HELPER: Converter string para número com fallback
function parseFloatWithFallback(value: string | number | undefined, fallback: number): number {
  const parsed = safeParseFloat(value);
  return parsed !== undefined ? parsed : fallback;
}

// ✅ FUNÇÃO PARA ADAPTAR HOTEL DO SISTEMA PARA FORMULÁRIO DO WIZARD
function adaptSystemHotelToWizardForm(hotel: Hotel): HotelFormData {
  // Extrair coordenadas do hotel
  let lat: number | undefined;
  let lng: number | undefined;
  let locationObj: { lat: number; lng: number; address?: string } | undefined;

  // Tentar extrair do campo location (string "lat,lng")
  if (typeof hotel.location === 'string' && hotel.location) {
    const [latStr, lngStr] = hotel.location.split(',');
    const parsedLat = safeParseFloat(latStr);
    const parsedLng = safeParseFloat(lngStr);
    
    if (parsedLat !== undefined && parsedLng !== undefined) {
      lat = parsedLat;
      lng = parsedLng;
      locationObj = { lat: parsedLat, lng: parsedLng, address: hotel.address };
    }
  }
  
  // Se não, tentar dos campos lat/lng individuais
  if (lat === undefined && hotel.lat !== undefined) {
    lat = parseFloatWithFallback(hotel.lat, 0);
  }
  
  if (lng === undefined && hotel.lng !== undefined) {
    lng = parseFloatWithFallback(hotel.lng, 0);
  }
  
  // Se temos lat e lng mas não locationObj, criar objeto
  if (lat !== undefined && lng !== undefined && !locationObj) {
    locationObj = { lat, lng, address: hotel.address };
  }

  // Adaptar room types do sistema para o formulário do wizard
  const rooms: RoomFormData[] = (hotel.available_room_types || []).map((roomType: RoomType, index: number) => ({
    id: roomType.id || roomType.room_type_id || `room-${Date.now()}-${index}`,
    name: roomType.name || roomType.room_type_name || `Quarto ${index + 1}`,
    description: roomType.description || '',
    type: roomType.name || 'standard',
    quantity: roomType.total_units || 1,
    maxOccupancy: roomType.max_occupancy || 2,
    baseOccupancy: roomType.base_occupancy || 1,
    basePrice: roomType.base_price || 0,
    pricePerNight: roomType.price_per_night || roomType.base_price || 0,
    size: roomType.size ? parseFloatWithFallback(roomType.size, 0) : undefined, // ✅ Converter string para number
    bedType: roomType.bed_type,
    bedTypes: roomType.bed_types || [],
    bathroomType: roomType.bathroom_type,
    amenities: roomType.amenities || [],
    images: roomType.images || [],
    existingImages: roomType.images || [],
    totalUnits: roomType.total_units || 0,
    availableUnits: roomType.available_units || 0,
    extraAdultPrice: roomType.extra_adult_price,
    extraChildPrice: roomType.extra_child_price,
    childrenPolicy: roomType.children_policy,
    isActive: roomType.is_active !== false
  }));

  return {
    id: hotel.id || hotel.hotel_id,
    hotel_id: hotel.hotel_id || hotel.id,
    name: hotel.name || hotel.hotel_name || '',
    description: hotel.description || '',
    category: 'hotel',
    email: hotel.contact_email || '',
    phone: hotel.contact_phone || '',
    address: hotel.address || '',
    city: hotel.locality || '',
    state: '', // Campo não existe no sistema
    locality: hotel.locality || '',
    province: hotel.province || '',
    country: hotel.country || 'Moçambique',
    zipCode: '', // Campo não existe no sistema
    lat,
    lng,
    location: locationObj,
    amenities: hotel.amenities || [],
    rooms,
    images: [],
    existingImages: hotel.images || [],
    checkInTime: hotel.check_in_time || '14:00',
    checkOutTime: hotel.check_out_time || '12:00',
    policies: hotel.policies ? (typeof hotel.policies === 'string' ? [hotel.policies] : []) : [],
    isActive: hotel.is_active !== false
  };
}

// ✅ FUNÇÃO PARA ADAPTAR FORMULÁRIO DO WIZARD PARA REQUISIÇÃO DO SISTEMA
function adaptWizardFormToSystemCreate(formData: HotelFormData): HotelCreateRequest {
  // Usar lat/lng do objeto location ou dos campos diretos
  const lat = formData.location?.lat ?? formData.lat;
  const lng = formData.location?.lng ?? formData.lng;

  return {
    name: formData.name,
    description: formData.description || '',
    address: formData.address,
    locality: formData.locality,
    province: formData.province,
    lat,
    lng,
    images: formData.existingImages,
    amenities: formData.amenities,
    contactEmail: formData.email,
    contactPhone: formData.phone || '',
    hostId: undefined,
    policies: formData.policies?.join('\n'),
    checkInTime: formData.checkInTime,
    checkOutTime: formData.checkOutTime,
    country: formData.country
  };
}

export const useHotelForm = ({ 
  mode = 'create', 
  initialData, 
  hotelId,
  autoSave = false
}: UseHotelFormProps) => {
  // ✅ ESTADO INICIAL CONSISTENTE
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    category: 'hotel',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    locality: '',
    province: '',
    country: 'Moçambique',
    zipCode: '',
    lat: undefined,
    lng: undefined,
    location: undefined,
    amenities: [],
    rooms: [],
    images: [],
    existingImages: [],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    policies: [],
    isActive: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDoneRef = useRef(false);

  // ✅ CARREGAR RASCUNHO
  const loadDraft = useCallback(() => {
    if (mode === 'edit') return false;
    
    try {
      const draftKey = `hotel_wizard_draft_${mode}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        console.log('📝 Carregando rascunho salvo:', parsedDraft);
        
        // Processar rooms para garantir tipos corretos
        const processedRooms: RoomFormData[] = (parsedDraft.rooms || []).map((room: any) => ({
          id: room.id || `room-${Date.now()}-${Math.random()}`,
          name: room.name || '',
          description: room.description || '',
          type: room.type || 'standard',
          quantity: typeof room.quantity === 'number' ? room.quantity : 1,
          maxOccupancy: typeof room.maxOccupancy === 'number' ? room.maxOccupancy : 2,
          baseOccupancy: typeof room.baseOccupancy === 'number' ? room.baseOccupancy : 1,
          basePrice: typeof room.basePrice === 'number' ? room.basePrice : 0,
          pricePerNight: typeof room.pricePerNight === 'number' ? room.pricePerNight : room.basePrice || 0,
          size: typeof room.size === 'number' ? room.size : undefined,
          bedType: room.bedType,
          bedTypes: room.bedTypes || [],
          bathroomType: room.bathroomType,
          amenities: room.amenities || [],
          images: room.images || [],
          existingImages: room.existingImages || [],
          totalUnits: typeof room.totalUnits === 'number' ? room.totalUnits : 0,
          availableUnits: typeof room.availableUnits === 'number' ? room.availableUnits : 0,
          extraAdultPrice: typeof room.extraAdultPrice === 'number' ? room.extraAdultPrice : undefined,
          extraChildPrice: typeof room.extraChildPrice === 'number' ? room.extraChildPrice : undefined,
          childrenPolicy: room.childrenPolicy,
          isActive: room.isActive !== false
        }));

        setFormData(prev => ({
          ...prev,
          ...parsedDraft,
          // ✅ Garantir tipos corretos para campos obrigatórios
          category: parsedDraft.category || 'hotel',
          state: parsedDraft.state || '',
          zipCode: parsedDraft.zipCode || '',
          country: parsedDraft.country || 'Moçambique',
          checkInTime: parsedDraft.checkInTime || '14:00',
          checkOutTime: parsedDraft.checkOutTime || '12:00',
          existingImages: parsedDraft.existingImages || [],
          images: parsedDraft.images || [],
          amenities: parsedDraft.amenities || [],
          rooms: processedRooms,
          policies: parsedDraft.policies || [],
          // ✅ Converter lat/lng para number se necessário
          lat: typeof parsedDraft.lat === 'string' ? parseFloat(parsedDraft.lat) : parsedDraft.lat,
          lng: typeof parsedDraft.lng === 'string' ? parseFloat(parsedDraft.lng) : parsedDraft.lng,
          // ✅ Garantir que location é objeto com lat/lng numbers
          location: parsedDraft.location 
            ? {
                lat: typeof parsedDraft.location.lat === 'string' 
                  ? parseFloat(parsedDraft.location.lat) 
                  : parsedDraft.location.lat || 0,
                lng: typeof parsedDraft.location.lng === 'string' 
                  ? parseFloat(parsedDraft.location.lng) 
                  : parsedDraft.location.lng || 0,
                address: parsedDraft.location.address
              }
            : undefined
        }));
        
        if (parsedDraft.completedSteps) {
          setCompletedSteps(parsedDraft.completedSteps);
        }
        
        return true;
      }
    } catch (err) {
      console.error('❌ Erro ao carregar rascunho:', err);
    }
    
    return false;
  }, [mode]);

  // ✅ SALVAR RASCUNHO
  const saveDraft = useCallback(() => {
    if (mode === 'edit' || !isDirty) return;
    
    try {
      const draftKey = `hotel_wizard_draft_${mode}`;
      const draftData = {
        ...formData,
        images: formData.images.map(img => {
          if (img instanceof File) {
            return {
              name: img.name,
              size: img.size,
              type: img.type,
              lastModified: img.lastModified,
              _isFile: true
            };
          }
          return img;
        }),
        completedSteps,
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      console.log('💾 Rascunho salvo:', draftKey);
    } catch (err) {
      console.error('❌ Erro ao salvar rascunho:', err);
    }
  }, [formData, isDirty, mode, completedSteps]);

  // ✅ LIMPAR RASCUNHO
  const clearDraft = useCallback(() => {
    const draftKey = `hotel_wizard_draft_${mode}`;
    localStorage.removeItem(draftKey);
    console.log('🗑️ Rascunho limpo:', draftKey);
  }, [mode]);

  // ✅ EFEITO PARA AUTO-SAVE
  useEffect(() => {
    if (!autoSave || !isDirty || mode === 'edit') return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, isDirty, autoSave, mode, saveDraft]);

  // ✅ CARREGAR DADOS DO HOTEL DO BACKEND
  const loadHotelData = useCallback(async (forceReload = false) => {
    if (mode !== 'edit' || !hotelId) return;

    try {
      setIsLoading(true);
      console.log('📋 Carregando dados do hotel:', hotelId);
      
      // Se não for forceReload e já tiver dados iniciais, use-os
      if (!forceReload && initialData && Object.keys(initialData).length > 0) {
        const processedData: HotelFormData = {
          ...initialData,
          name: initialData.name || '',
          description: initialData.description || '',
          category: initialData.category || 'hotel',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          city: initialData.city || '',
          state: initialData.state || '',
          locality: initialData.locality || '',
          province: initialData.province || '',
          country: initialData.country || 'Moçambique',
          zipCode: initialData.zipCode || '',
          lat: typeof initialData.lat === 'number' ? initialData.lat : undefined,
          lng: typeof initialData.lng === 'number' ? initialData.lng : undefined,
          location: initialData.location,
          amenities: initialData.amenities || [],
          rooms: (initialData.rooms || []).map(room => ({
            ...room,
            size: typeof room.size === 'number' ? room.size : undefined
          })),
          images: initialData.images || [],
          existingImages: initialData.existingImages || [],
          checkInTime: initialData.checkInTime || '14:00',
          checkOutTime: initialData.checkOutTime || '12:00',
          policies: initialData.policies || [],
          isActive: initialData.isActive !== false
        } as HotelFormData;

        setFormData(processedData);
        console.log('✅ Dados carregados de initialData');
        return processedData;
      }

      // ✅ USAR accommodationService
      const response = await accommodationService.getHotelById(hotelId);
      
      if (response.success && response.data) {
        // Adaptar hotel do sistema para formulário do wizard
        const adaptedData = adaptSystemHotelToWizardForm(response.data);
        setFormData(adaptedData);
        console.log('✅ Dados carregados do backend:', adaptedData.name);
        return adaptedData;
      } else {
        throw new Error(response.error || 'Erro ao carregar hotel');
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados do hotel:', err);
      setError('Erro ao carregar dados do hotel. Tente novamente.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [mode, hotelId, initialData]);

  // ✅ EFEITO PARA CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    
    if (mode === 'edit' && hotelId) {
      loadHotelData();
    } else if (initialData && Object.keys(initialData).length > 0) {
      // Carregar dados iniciais com tipos corretos
      const processedData: HotelFormData = {
        ...initialData,
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || 'hotel',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        locality: initialData.locality || '',
        province: initialData.province || '',
        country: initialData.country || 'Moçambique',
        zipCode: initialData.zipCode || '',
        lat: typeof initialData.lat === 'number' ? initialData.lat : undefined,
        lng: typeof initialData.lng === 'number' ? initialData.lng : undefined,
        location: initialData.location,
        amenities: initialData.amenities || [],
        rooms: (initialData.rooms || []).map(room => ({
          ...room,
          size: typeof room.size === 'number' ? room.size : undefined
        })),
        images: initialData.images || [],
        existingImages: initialData.existingImages || [],
        checkInTime: initialData.checkInTime || '14:00',
        checkOutTime: initialData.checkOutTime || '12:00',
        policies: initialData.policies || [],
        isActive: initialData.isActive !== false
      } as HotelFormData;

      setFormData(processedData);
    } else if (mode === 'create') {
      loadDraft();
    }
    
    initialLoadDoneRef.current = true;
  }, [mode, hotelId, initialData, loadHotelData, loadDraft]);

  // ✅ ATUALIZAR DADOS DO FORMULÁRIO
  const updateFormData = useCallback((newData: Partial<HotelFormData>) => {
    setFormData(prev => {
      // Processar rooms para garantir tipos corretos
      const processedRooms = newData.rooms 
        ? newData.rooms.map(room => ({
            ...room,
            size: typeof room.size === 'number' ? room.size : undefined
          }))
        : prev.rooms;

      const updated = { 
        ...prev, 
        ...newData,
        // ✅ Garantir tipos corretos
        category: newData.category !== undefined ? newData.category : prev.category,
        state: newData.state !== undefined ? newData.state : prev.state,
        zipCode: newData.zipCode !== undefined ? newData.zipCode : prev.zipCode,
        lat: newData.lat !== undefined ? newData.lat : prev.lat,
        lng: newData.lng !== undefined ? newData.lng : prev.lng,
        location: newData.location !== undefined ? newData.location : prev.location,
        images: newData.images ?? prev.images ?? [],
        existingImages: newData.existingImages ?? prev.existingImages ?? [],
        amenities: newData.amenities ?? prev.amenities ?? [],
        rooms: processedRooms,
        policies: newData.policies ?? prev.policies ?? []
      };
      
      return updated;
    });
    
    setIsDirty(true);
  }, []);

  // ✅ MARCAR ETAPA COMO COMPLETA
  const markStepAsCompleted = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepIndex)) {
        return [...prev, stepIndex];
      }
      return prev;
    });
  }, []);

  // ✅ REMOVER ETAPA DAS COMPLETADAS
  const unmarkStepAsCompleted = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => prev.filter(step => step !== stepIndex));
  }, []);

  // ✅ VALIDAR PASSO ATUAL
  const validateCurrentStep = useCallback((step: number, markIfValid = true): boolean => {
    const validationError = validateStep(step, formData);
    if (validationError) {
      setError(validationError);
      
      if (completedSteps.includes(step)) {
        unmarkStepAsCompleted(step);
      }
      
      return false;
    }
    
    setError('');
    
    if (markIfValid) {
      markStepAsCompleted(step);
    }
    
    return true;
  }, [formData, completedSteps, markStepAsCompleted, unmarkStepAsCompleted]);

  // ✅ VALIDAR TODOS OS PASSOS
  const validateAllStepsHook = useCallback((): boolean => {
    const validation = validateAllSteps(formData);
    return validation.isValid;
  }, [formData]);

  // ✅ PREPARAR DADOS PARA ENVIO AO SISTEMA
  const prepareHotelDataForSystem = (): HotelCreateRequest => {
    return adaptWizardFormToSystemCreate(formData);
  };

  // ✅ SUBMETER FORMULÁRIO
  const submitForm = useCallback(async (onSuccess?: (hotelId: string) => void) => {
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      console.log(`🏨 Iniciando ${mode} do hotel...`);

      // Validar todos os passos
      const allValid = validateAllStepsHook();
      if (!allValid) {
        throw new Error('Por favor, complete todas as etapas obrigatórias antes de submeter.');
      }

      // Validar preços dos quartos
      const roomsValidationError = validateRooms(formData.rooms);
      if (roomsValidationError) {
        throw new Error(roomsValidationError);
      }

      // Preparar dados para envio
      const hotelData = prepareHotelDataForSystem();
      const { fileImages, stringImages } = separateImages(formData);
      
      console.log('📤 Dados preparados para o sistema:', {
        hotel: hotelData.name,
        rooms: formData.rooms.length,
        fileImages: fileImages.length,
        existingImages: stringImages.length
      });

      let result;
      
      if (mode === 'edit' && hotelId) {
        console.log('✏️ Editando hotel existente:', hotelId);
        
        const updateData: Partial<HotelCreateRequest> = {
          ...hotelData,
          isActive: formData.isActive
        };
        
        if (fileImages.length > 0) {
          const formDataToSend = prepareImagesForUpload(formData);
          result = await accommodationService.updateHotel(hotelId, formDataToSend);
        } else {
          result = await accommodationService.updateHotel(hotelId, updateData);
        }
        
        setSuccess('Hotel atualizado com sucesso!');
      } else {
        console.log('📤 Criando novo hotel...');
        
        if (fileImages.length > 0) {
          const formDataToSend = prepareImagesForUpload(formData);
          result = await accommodationService.createHotel(formDataToSend);
        } else {
          result = await accommodationService.createHotel(hotelData);
        }
        
        setSuccess('Hotel criado com sucesso!');
        clearDraft();
      }
      
      console.log(`✅ Hotel ${mode} com sucesso:`, result);

      // Chamar callback de sucesso
      setTimeout(() => {
        const newHotelId = result.hotel?.id || result.hotelId || hotelId || '';
        onSuccess?.(newHotelId);
      }, 1500);
      
      return result;
    } catch (err: any) {
      console.error(`❌ Erro ao ${mode} hotel:`, err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          `Erro desconhecido ao ${mode} hotel. Tente novamente.`;
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, hotelId, formData, validateAllStepsHook, clearDraft]);

  return {
    // Estado
    formData,
    isSubmitting,
    isLoading,
    error,
    success,
    isDirty,
    completedSteps,
    
    // Ações
    updateFormData,
    validateCurrentStep,
    validateAllSteps: validateAllStepsHook,
    submitForm,
    loadHotelData,
    
    // Funções de rascunho
    saveDraft,
    loadDraft,
    clearDraft,
    
    // Gerenciamento de etapas
    markStepAsCompleted,
    unmarkStepAsCompleted,
    
    // ✅ FUNÇÕES DE ADAPTAÇÃO
    adaptSystemHotelToWizardForm,
    adaptWizardFormToSystemCreate,
    
    // Reset
    reset: () => {
      setFormData({
        name: '',
        description: '',
        category: 'hotel',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        locality: '',
        province: '',
        country: 'Moçambique',
        zipCode: '',
        lat: undefined,
        lng: undefined,
        location: undefined,
        amenities: [],
        rooms: [],
        images: [],
        existingImages: [],
        checkInTime: '14:00',
        checkOutTime: '12:00',
        policies: [],
        isActive: true
      });
      setIsDirty(false);
      setCompletedSteps([]);
      setError('');
      setSuccess('');
    }
  };
};