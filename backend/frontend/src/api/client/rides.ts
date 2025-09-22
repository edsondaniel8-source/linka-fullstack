import { apiRequest } from '../../shared/lib/queryClient';

export interface RideSearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface Ride {
  id: string;
  driverId: string;
  fromAddress: string;
  toAddress: string;
  departureDate: string;
  departureTime: string;
  maxPassengers: number;
  availableSeats: number;
  pricePerSeat: string;
  vehicleType: string;
  vehicleInfo?: string;
  description?: string;
  status: string;
  allowNegotiation: boolean;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RideSearchResponse {
  success: boolean;
  rides: Ride[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// API Client para clientes buscarem viagens
export const clientRidesApi = {
  // Buscar viagens disponíveis
  search: async (params: RideSearchParams): Promise<RideSearchResponse> => {
    console.log('🔍 [CLIENT API] Buscando viagens:', params);
    
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.date) queryParams.append('date', params.date);
    if (params.passengers) queryParams.append('passengers', params.passengers.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiRequest('GET', `/api/client/rides/search?${queryParams}`);
    return response.json();
  },

  // Obter detalhes de uma viagem específica
  getDetails: async (rideId: string): Promise<{ success: boolean; ride: Ride }> => {
    console.log('🔍 [CLIENT API] Buscando detalhes da viagem:', rideId);
    
    const response = await apiRequest('GET', `/api/client/rides/${rideId}`);
    return response.json();
  }
};

export default clientRidesApi;