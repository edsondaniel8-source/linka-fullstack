import { apiRequest } from '../../shared/lib/queryClient';

export interface Vehicle {
  id: string;
  type: string;
  info: string;
  status: string;
}

export interface VehicleStats {
  totalVehicles: number;
  totalRides: number;
  activeRides: number;
  vehicleTypes: string[];
  mostUsedVehicle: string;
}

// API Client para motoristas gerirem veículos
export const driverVehiclesApi = {
  // Listar meus veículos
  getMyVehicles: async (driverId: string): Promise<{ success: boolean; vehicles: Vehicle[]; message: string }> => {
    console.log('🚗 [DRIVER API] Buscando meus veículos:', driverId);
    
    const response = await apiRequest('GET', `/api/driver/vehicles/my-vehicles/${driverId}`);
    return response.json();
  },

  // Obter estatísticas de veículos
  getStats: async (driverId: string): Promise<{ success: boolean; stats: VehicleStats }> => {
    console.log('📊 [DRIVER API] Buscando estatísticas de veículos:', driverId);
    
    const response = await apiRequest('GET', `/api/driver/vehicles/stats/${driverId}`);
    return response.json();
  }
};

export default driverVehiclesApi;