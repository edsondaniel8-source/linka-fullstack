// Serviço de Acomodações usando as novas APIs organizadas
import { clientBookingsApi } from "../../api/client/bookings";
import { ApiClient } from "../../lib/apiClient"; // Manter fallback temporário

export interface AccommodationData {
  name: string;
  type: string;
  location: string;
  price: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  availableRooms: number;
}

export interface Accommodation extends AccommodationData {
  id: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AccommodationSearchParams {
  location?: string;
  type?: string;
  maxPrice?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export const accommodationService = {
  // Buscar acomodações
  searchAccommodations: async (searchParams: AccommodationSearchParams): Promise<Accommodation[]> => {
    console.log('🏨 AccommodationService: Buscando acomodações', searchParams);
    
    const apiParams = {
      location: searchParams.location,
      type: searchParams.type,
      maxPrice: searchParams.maxPrice
    };
    
    const result = await ApiClient.searchAccommodations(apiParams);
    
    return result.accommodations.map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      location: acc.location,
      price: parseFloat(acc.price),
      rating: acc.rating || 4.0,
      description: acc.description || '',
      amenities: acc.amenities || [],
      images: acc.images || [],
      availableRooms: acc.availableRooms || 1,
      createdAt: acc.createdAt || new Date().toISOString(),
      updatedAt: acc.updatedAt || new Date().toISOString()
    }));
  },

  // Obter todas as acomodações
  getAllAccommodations: async (): Promise<Accommodation[]> => {
    return await accommodationService.searchAccommodations({});
  },

  // Obter detalhes de uma acomodação específica
  getAccommodationDetails: async (accommodationId: string): Promise<Accommodation> => {
    console.log('📋 AccommodationService: Obtendo detalhes da acomodação', accommodationId);
    
    // Por enquanto, buscar todas e filtrar
    const accommodations = await accommodationService.getAllAccommodations();
    const accommodation = accommodations.find(acc => acc.id === accommodationId);
    
    if (!accommodation) {
      throw new Error(`Acomodação ${accommodationId} não encontrada`);
    }
    
    return accommodation;
  },

  // Criar reserva de acomodação
  createBooking: async (bookingData: {
    accommodationId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    guestDetails: any;
  }) => {
    console.log('📋 AccommodationService: Criando reserva', bookingData);
    
    try {
      // Usar nova API organizada
      const result = await clientBookingsApi.create({
        serviceType: 'accommodation',
        serviceId: bookingData.accommodationId,
        clientId: bookingData.guestDetails?.clientId || 'temp-client',
        contactPhone: bookingData.guestDetails?.phone || '',
        contactEmail: bookingData.guestDetails?.email || '',
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        guests: bookingData.guests,
        specialRequests: bookingData.guestDetails?.requests || ''
      });
      
      return result;
    } catch (error) {
      console.log('🔄 Fallback to ApiClient');
      // Fallback para API antiga se nova falhar
      const result = await ApiClient.createBooking({
        type: 'accommodation',
        itemId: bookingData.accommodationId,
        totalPrice: bookingData.totalPrice.toString(),
        details: {
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          guestDetails: bookingData.guestDetails
        }
      });
      
      return result;
    }
  }
};

export default accommodationService;