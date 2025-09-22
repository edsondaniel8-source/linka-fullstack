import { apiRequest } from '../../shared/lib/queryClient';

export interface CreateRideRequest {
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleColor?: string;
  vehicleSeats: number;
  fromAddress: string;
  fromCity: string;
  fromProvince: string;
  fromLatitude?: number;
  fromLongitude?: number;
  toAddress: string;
  toCity: string;
  toProvince: string;
  toLatitude?: number;
  toLongitude?: number;
  departureDateTime: string;
  pricePerSeat: number;
  maxPassengers: number;
  route?: string[];
  allowPickupEnRoute?: boolean;
  allowNegotiation?: boolean;
  isRoundTrip?: boolean;
  returnDateTime?: string;
  description?: string;
}

export interface DriverRide {
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

export interface DriverStats {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  totalRevenue: number;
  averageRating: number;
}

// API Client para motoristas gerirem viagens
export const driverRidesApi = {
  // Criar nova viagem
  create: async (rideData: CreateRideRequest): Promise<{ success: boolean; message: string; ride: DriverRide }> => {
    console.log('🚗 [DRIVER API] Criando viagem:', rideData);
    
    const response = await apiRequest('POST', '/api/driver/rides/create', rideData);
    return response.json();
  },

  // Listar minhas viagens
  getMyRides: async (driverId: string): Promise<{ success: boolean; rides: DriverRide[] }> => {
    console.log('🔍 [DRIVER API] Buscando minhas viagens:', driverId);
    
    const response = await apiRequest('GET', `/api/driver/rides/my-rides/${driverId}`);
    return response.json();
  },

  // Atualizar viagem
  update: async (rideId: string, updateData: Partial<CreateRideRequest>): Promise<{ success: boolean; message: string; ride: DriverRide }> => {
    console.log('✏️ [DRIVER API] Atualizando viagem:', rideId, updateData);
    
    const response = await apiRequest('PATCH', `/api/driver/rides/${rideId}`, updateData);
    return response.json();
  },

  // Cancelar viagem
  cancel: async (rideId: string): Promise<{ success: boolean; message: string; ride: DriverRide }> => {
    console.log('🚫 [DRIVER API] Cancelando viagem:', rideId);
    
    const response = await apiRequest('PATCH', `/api/driver/rides/${rideId}/cancel`);
    return response.json();
  },

  // Obter estatísticas
  getStats: async (driverId: string): Promise<{ success: boolean; stats: DriverStats }> => {
    console.log('📊 [DRIVER API] Buscando estatísticas:', driverId);
    
    const response = await apiRequest('GET', `/api/driver/rides/stats/${driverId}`);
    return response.json();
  }
};

export default driverRidesApi;