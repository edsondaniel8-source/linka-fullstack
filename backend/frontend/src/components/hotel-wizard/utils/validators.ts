// src/components/hotel-wizard/utils/validators.ts
import { HotelFormData, RoomFormData } from '../types';
import { formatMetical } from '@/shared/utils/currency';

// 🆕 Validações específicas para quartos
export const validateRooms = (rooms: RoomFormData[]): string | null => {
  if (!rooms || rooms.length === 0) {
    return 'Adicione pelo menos um tipo de quarto';
  }
  
  for (const room of rooms) {
    if (!room.type?.trim()) {
      return 'Tipo de quarto é obrigatório para todos os quartos';
    }
    
    if (room.pricePerNight === null || room.pricePerNight === undefined) {
      return `Preço é obrigatório para: ${room.type}`;
    }
    
    if (typeof room.pricePerNight !== 'number' || isNaN(room.pricePerNight)) {
      return `Preço deve ser um número válido para: ${room.type}`;
    }
    
    if (room.pricePerNight <= 0) {
      return `Preço em Metical deve ser maior que zero para: ${room.type}`;
    }
    
    if (room.pricePerNight < 100) {
      return `Preço muito baixo para ${room.type}. Mínimo recomendado: ${formatMetical(100)}`;
    }
    
    if (room.maxOccupancy <= 0) {
      return `Capacidade deve ser maior que zero para: ${room.type}`;
    }
    
    if (room.quantity <= 0) {
      return `Quantidade deve ser maior que zero para: ${room.type}`;
    }
  }
  
  return null;
};

// 🆕 Validação de email internacional
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email é obrigatório';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email inválido. Use o formato: exemplo@dominio.com';
  }
  
  return null;
};

// 🆕 Validação de telefone (Moçambique)
export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Telefone é opcional
  
  const phoneRegex = /^(\+258|258)?\s?8[2-7]\s?\d{3}\s?\d{3}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Número de telefone inválido. Use formato moçambicano: +258 8X XXX XXX';
  }
  
  return null;
};

// 🆕 Validação de localização
export const validateLocation = (formData: HotelFormData): string | null => {
  if (!formData.address?.trim()) {
    return 'Endereço é obrigatório';
  }
  
  if (!formData.locality?.trim()) {
    return 'Localidade é obrigatória';
  }
  
  if (!formData.province?.trim()) {
    return 'Província é obrigatória';
  }
  
  if (!formData.country?.trim()) {
    return 'País é obrigatório';
  }
  
  if (formData.lat === undefined || formData.lng === undefined) {
    return 'Selecione uma localização válida da lista de sugestões';
  }
  
  return null;
};

// 🆕 Validação de imagens
export const validateImages = (formData: HotelFormData): string | null => {
  const hasImages = (formData.images?.length || 0) + (formData.existingImages?.length || 0) > 0;
  
  if (!hasImages) {
    return 'Adicione pelo menos uma imagem do hotel';
  }
  
  // Verificar se há muitas imagens
  const totalImages = (formData.images?.length || 0) + (formData.existingImages?.length || 0);
  if (totalImages > 20) {
    return 'Máximo de 20 imagens permitidas';
  }
  
  return null;
};

// Função principal de validação por etapa
export const validateStep = (step: number, formData: HotelFormData): string | null => {
  switch (step) {
    case 0: // Informações básicas
      if (!formData.name?.trim()) {
        return 'Nome do hotel é obrigatório';
      }
      
      if (!formData.category) {
        return 'Categoria do hotel é obrigatória';
      }
      
      const emailError = validateEmail(formData.email);
      if (emailError) return emailError;
      
      const phoneError = validatePhone(formData.phone);
      if (phoneError) return phoneError;
      
      return null;
    
    case 1: // Localização
      return validateLocation(formData);
    
    case 2: // Comodidades
      if (!formData.amenities || formData.amenities.length === 0) {
        return 'Selecione pelo menos uma comodidade';
      }
      return null;
    
    case 3: // Quartos
      return validateRooms(formData.rooms);
    
    case 4: // Imagens
      return validateImages(formData);
    
    default:
      return null;
  }
};

// 🆕 Validar todo o formulário
export const validateAllSteps = (formData: HotelFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validar todas as etapas
  for (let step = 0; step < 5; step++) {
    const error = validateStep(step, formData);
    if (error) {
      errors.push(`Etapa ${step + 1}: ${error}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ⚠️ REMOVA AS LINHAS ABAIXO - NÃO SÃO NECESSÁRIAS:
// export { validateStep, validateAllSteps, validateRooms, validateEmail, validatePhone, validateLocation, validateImages };