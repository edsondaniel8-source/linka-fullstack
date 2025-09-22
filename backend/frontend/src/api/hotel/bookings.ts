import { apiRequest } from '../../shared/lib/queryClient';

export interface HotelBooking {
  id: string;
  serviceType: 'accommodation';
  serviceId: string;
  serviceName: string;
  clientId: string;
  providerId: string;
  providerName: string;
  providerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  nights: number;
  specialRequests?: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelStats {
  totalBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStayLength: number;
}

// API Client para gestores de hotel gerirem reservas
export const hotelBookingsApi = {
  // Listar reservas dos meus alojamentos
  getMyBookings: async (hostId: string, status?: string): Promise<{ success: boolean; bookings: HotelBooking[] }> => {
    console.log('🔍 [HOTEL API] Buscando minhas reservas:', hostId, status);
    
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);

    const response = await apiRequest('GET', `/api/hotel/bookings/my-bookings/${hostId}?${queryParams}`);
    return response.json();
  },

  // Confirmar reserva
  confirm: async (bookingId: string): Promise<{ success: boolean; message: string; booking: HotelBooking }> => {
    console.log('✅ [HOTEL API] Confirmando reserva:', bookingId);
    
    const response = await apiRequest('PATCH', `/api/hotel/bookings/${bookingId}/confirm`);
    return response.json();
  },

  // Rejeitar reserva
  reject: async (bookingId: string, reason?: string): Promise<{ success: boolean; message: string; booking: HotelBooking }> => {
    console.log('❌ [HOTEL API] Rejeitando reserva:', bookingId, reason);
    
    const response = await apiRequest('PATCH', `/api/hotel/bookings/${bookingId}/reject`, { reason });
    return response.json();
  },

  // Fazer check-in
  checkIn: async (bookingId: string): Promise<{ success: boolean; message: string; booking: HotelBooking }> => {
    console.log('🏨 [HOTEL API] Fazendo check-in:', bookingId);
    
    const response = await apiRequest('PATCH', `/api/hotel/bookings/${bookingId}/checkin`);
    return response.json();
  },

  // Fazer check-out
  checkOut: async (bookingId: string): Promise<{ success: boolean; message: string; booking: HotelBooking }> => {
    console.log('🏨 [HOTEL API] Fazendo check-out:', bookingId);
    
    const response = await apiRequest('PATCH', `/api/hotel/bookings/${bookingId}/checkout`);
    return response.json();
  },

  // Obter estatísticas
  getStats: async (hostId: string): Promise<{ success: boolean; stats: HotelStats }> => {
    console.log('📊 [HOTEL API] Buscando estatísticas:', hostId);
    
    const response = await apiRequest('GET', `/api/hotel/bookings/stats/${hostId}`);
    return response.json();
  }
};

export default hotelBookingsApi;