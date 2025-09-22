import { apiRequest } from '../../shared/lib/queryClient';

export interface CreateAccommodationRequest {
  hostId: string;
  hostName: string;
  hostPhone: string;
  name: string;
  type: 'hotel' | 'apartment' | 'villa' | 'lodge' | 'guesthouse';
  description: string;
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
  photos?: string[];
  policies?: string;
}

export interface Accommodation {
  id: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  province: string;
  latitude?: number;
  longitude?: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
  photos?: string[];
  policies?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityRequest {
  accommodationId: string;
  checkInDate: string;
  checkOutDate: string;
}

// API Client para gestores de hotel gerirem disponibilidade
export const hotelAvailabilityApi = {
  // Criar novo alojamento
  create: async (accommodationData: CreateAccommodationRequest): Promise<{ success: boolean; message: string; accommodation: Accommodation }> => {
    console.log('🏨 [HOTEL API] Criando alojamento:', accommodationData);
    
    const response = await apiRequest('POST', '/api/hotel/availability/create', accommodationData);
    return response.json();
  },

  // Listar minhas propriedades
  getMyProperties: async (hostId: string): Promise<{ success: boolean; properties: Accommodation[] }> => {
    console.log('🔍 [HOTEL API] Buscando minhas propriedades:', hostId);
    
    const response = await apiRequest('GET', `/api/hotel/availability/my-properties/${hostId}`);
    return response.json();
  },

  // Verificar disponibilidade
  checkAvailability: async (availabilityData: AvailabilityRequest): Promise<{ success: boolean; available: boolean; conflicts: number; message: string }> => {
    console.log('🔍 [HOTEL API] Verificando disponibilidade:', availabilityData);
    
    const response = await apiRequest('POST', '/api/hotel/availability/check-availability', availabilityData);
    return response.json();
  },

  // Atualizar alojamento
  update: async (accommodationId: string, updateData: Partial<CreateAccommodationRequest>): Promise<{ success: boolean; message: string; accommodation: Accommodation }> => {
    console.log('✏️ [HOTEL API] Atualizando alojamento:', accommodationId, updateData);
    
    const response = await apiRequest('PATCH', `/api/hotel/availability/${accommodationId}`, updateData);
    return response.json();
  },

  // Desativar alojamento
  deactivate: async (accommodationId: string): Promise<{ success: boolean; message: string; accommodation: Accommodation }> => {
    console.log('🚫 [HOTEL API] Desativando alojamento:', accommodationId);
    
    const response = await apiRequest('PATCH', `/api/hotel/availability/${accommodationId}/deactivate`);
    return response.json();
  }
};

export default hotelAvailabilityApi;