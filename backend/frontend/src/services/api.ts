// src/services/apiService.ts
import { auth } from '@/shared/lib/firebaseConfig';
import { Booking, RideBookingRequest } from '@/shared/types/booking';
import { formatDateOnly, formatTimeOnly, formatLongDate, formatWeekday, formatDateTime } from '../utils/dateFormatter';

// ====================== IMPORTAÇÕES DOS TIPOS UNIFICADOS ======================
// ✅ Importamos todos os tipos que vamos usar
import {
  // Hotel Types
  Hotel,
  RoomType,
  HotelCreateRequest,
  HotelUpdateRequest,
  RoomTypeCreateRequest,
  RoomTypeUpdateRequest,
  BulkAvailabilityUpdate,
  HotelOperationResponse,
  HotelListResponse,
  RoomTypeListResponse,
  HotelStatistics,
  HotelPerformance,
  
  // Search Types
  SearchParams,
  SearchResponse,
  HotelSearchResponse,
  
  // Availability Types
  AvailabilityCheck,
  NightlyPrice,
  AvailabilityResponse,
  
  // Booking Types
  HotelBookingRequest,
  HotelBookingResponse,
  HotelBookingData,
  MyHotelBookingsResponse,
  BookingStatus,
  PaymentStatus,
  
  // Chat Types
  ChatMessage,
  ChatThread,
  SendMessageRequest,
  SendMessageResponse,
  
  // Notification Types
  Notification,
  NotificationsResponse,
  
  // Upload Types
  UploadResponse,
  
  // API Response Types
  ApiResponse,
  HotelByIdResponse,
  RoomTypesResponse,
} from '../types/index';

// ====================== TIPOS RIDE (usa os do arquivo de tipos agora) ======================
// ✅ CORRIGIDO: Usar 'export type' para re-exportar tipos
export type { Ride as LocalRide } from '../types/index';
export type { RideSearchParams as LocalRideSearchParams } from '../types/index';
export type { MatchStats as LocalMatchStats } from '../types/index';
export type { RideSearchResponse as LocalRideSearchResponse } from '../types/index';

// ====================== FUNÇÕES UTILITÁRIAS RIDES ======================

export function normalizeRide(apiRide: any): any {
  const normalized = {
    ride_id: apiRide.ride_id || apiRide.id || '',
    driver_id: apiRide.driver_id || apiRide.driverId || '',
    driver_name: apiRide.driver_name || apiRide.driverName || 'Motorista',
    driver_rating: Number(apiRide.driver_rating ?? apiRide.driverRating ?? 4.5),
    vehicle_make: apiRide.vehicle_make || apiRide.vehicleMake || '',
    vehicle_model: apiRide.vehicle_model || apiRide.vehicleModel || '',
    vehicle_type: apiRide.vehicle_type || apiRide.vehicleType || 'economy',
    vehicle_plate: apiRide.vehicle_plate || apiRide.vehiclePlate || '',
    vehicle_color: apiRide.vehicle_color || apiRide.vehicleColor || '',
    max_passengers: Number(apiRide.max_passengers ?? apiRide.maxPassengers ?? 4),
    from_city: apiRide.from_city || apiRide.fromCity || '',
    to_city: apiRide.to_city || apiRide.toCity || '',
    from_lat: Number(apiRide.from_lat ?? apiRide.fromLat ?? 0),
    from_lng: Number(apiRide.from_lng ?? apiRide.fromLng ?? 0),
    to_lat: Number(apiRide.to_lat ?? apiRide.toLat ?? 0),
    to_lng: Number(apiRide.to_lng ?? apiRide.toLng ?? 0),
    departuredate: apiRide.departuredate || apiRide.departureDate || new Date().toISOString(),
    availableseats: Number(apiRide.availableseats ?? apiRide.availableSeats ?? 0),
    priceperseat: Number(apiRide.priceperseat ?? apiRide.pricePerSeat ?? 0),
    distance_from_city_km: Number(apiRide.distance_from_city_km ?? apiRide.distanceFromCityKm ?? 0),
    distance_to_city_km: Number(apiRide.distance_to_city_km ?? apiRide.distanceToCityKm ?? 0),
    
    match_type: apiRide.match_type || 'traditional',
    direction_score: Number(apiRide.direction_score ?? 0),
    
    from_province: apiRide.from_province || apiRide.fromProvince,
    to_province: apiRide.to_province || apiRide.toProvince,
    
    // Aliases para compatibilidade
    id: apiRide.ride_id || apiRide.id || '',
    driverId: apiRide.driver_id || apiRide.driverId || '',
    driverName: apiRide.driver_name || apiRide.driverName || 'Motorista',
    driverRating: Number(apiRide.driver_rating ?? apiRide.driverRating ?? 4.5),
    fromLocation: apiRide.from_city || apiRide.fromCity || '',
    toLocation: apiRide.to_city || apiRide.toCity || '',
    fromAddress: apiRide.from_city || apiRide.fromCity || '',
    toAddress: apiRide.to_city || apiRide.toCity || '',
    fromCity: apiRide.from_city || apiRide.fromCity || '',
    toCity: apiRide.to_city || apiRide.toCity || '',
    fromProvince: apiRide.from_province || apiRide.fromProvince,
    toProvince: apiRide.to_province || apiRide.toProvince,
    departureDate: apiRide.departuredate || apiRide.departureDate || new Date().toISOString(),
    departureTime: apiRide.departureTime || '08:00',
    price: Number(apiRide.priceperseat ?? apiRide.pricePerSeat ?? 0),
    pricePerSeat: Number(apiRide.priceperseat ?? apiRide.pricePerSeat ?? 0),
    availableSeats: Number(apiRide.availableseats ?? apiRide.availableSeats ?? 0),
    maxPassengers: Number(apiRide.max_passengers ?? apiRide.maxPassengers ?? 4),
    currentPassengers: apiRide.currentPassengers || 0,
    vehicle: apiRide.vehicle_type || apiRide.vehicleType || 'Veículo',
    vehicleType: apiRide.vehicle_type || apiRide.vehicleType || 'economy',
    vehicleMake: apiRide.vehicle_make || apiRide.vehicleMake || '',
    vehicleModel: apiRide.vehicle_model || apiRide.vehicleModel || '',
    vehiclePlate: apiRide.vehicle_plate || apiRide.vehiclePlate || '',
    vehicleColor: apiRide.vehicle_color || apiRide.vehicleColor || '',
    status: apiRide.status || 'available',
    type: apiRide.type || apiRide.vehicle_type || 'economy',
    
    vehicleInfo: {
      make: apiRide.vehicle_make || apiRide.vehicleMake || '',
      model: apiRide.vehicle_model || apiRide.vehicleModel || '',
      type: apiRide.vehicle_type || apiRide.vehicleType || 'economy',
      typeDisplay: 'Económico',
      typeIcon: '🚗',
      plate: apiRide.vehicle_plate || apiRide.vehiclePlate || '',
      color: apiRide.vehicle_color || apiRide.vehicleColor || '',
      maxPassengers: Number(apiRide.max_passengers ?? apiRide.maxPassengers ?? 4)
    },
    
    route_compatibility: Number(apiRide.direction_score ?? apiRide.route_compatibility ?? 0),
    distanceFromCityKm: Number(apiRide.distance_from_city_km ?? apiRide.distanceFromCityKm ?? 0),
    distanceToCityKm: Number(apiRide.distance_to_city_km ?? apiRide.distanceToCityKm ?? 0),
    
    departureDateFormatted: formatDateOnly(apiRide.departuredate || apiRide.departureDate),
    departureTimeFormatted: formatTimeOnly(apiRide.departuredate || apiRide.departureDate),
    departureDateTimeFormatted: formatDateTime(apiRide.departuredate || apiRide.departureDate),
    departureLongDate: formatLongDate(apiRide.departuredate || apiRide.departureDate),
    departureWeekday: formatWeekday(apiRide.departuredate || apiRide.departureDate)
  };
  
  return normalized;
}

export function normalizeRides(backendRides: any[]): any[] {
  return (backendRides || []).map(normalizeRide);
}

export function createDefaultMatchStats(): any {
  return {
    exact_match: 0,
    same_segment: 0,
    same_direction: 0,
    potential: 0,
    traditional: 0,
    smart_matches: 0,
    drivers_with_ratings: 0,
    average_driver_rating: 0,
    vehicle_types: {},
    match_types: {},
    total_smart_matches: 0,
    average_direction_score: 0,
    total: 0
  };
}

// ====================== API SERVICE PRINCIPAL ======================

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = await auth.currentUser?.getIdToken() || localStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.debug('Error fetching auth token:', error);
    }
    return headers;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = { method, headers, credentials: 'include' };
    if (data && method !== 'GET') config.body = JSON.stringify(data);
    
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText || 'Request failed'}`);
    }
    return await response.json() as T;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
    }
    return this.request<T>('GET', url);
  }

  async post<T>(url: string, body?: any): Promise<T> {
    return this.request<T>('POST', url, body);
  }

  async put<T>(url: string, body?: any): Promise<T> {
    return this.request<T>('PUT', url, body);
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>('DELETE', url);
  }

  private async rpcRequest<T>(
    functionName: string,
    parameters: Record<string, any> = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseURL}/api/rpc`;
    
    const payload = {
      function: functionName,
      parameters: parameters
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status}: ${errorText || 'RPC request failed'}`);
    }
    
    return await response.json() as T;
  }

  // ====================== RIDES API ======================
  
  async searchRides(params: any): Promise<any> {
    try {
      const rpcParams = {
        search_from: params.from || '',
        search_to: params.to || '',
        radius_km: params.radiusKm || params.maxDistance || 100,
        max_results: 50
      };
      
      const rpcResponse = await this.rpcRequest<any[]>('get_rides_smart_final', rpcParams);
      const ridesData = Array.isArray(rpcResponse) ? rpcResponse : [];
      
      const matchStats = {
        total: ridesData.length,
        match_types: ridesData.reduce((acc, ride) => {
          const matchType = ride.match_type || 'traditional';
          acc[matchType] = (acc[matchType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        total_smart_matches: ridesData.filter(ride => ride.match_type && ride.match_type !== 'traditional').length,
        average_direction_score: ridesData.length > 0 ? 
          ridesData.reduce((sum, ride) => sum + (ride.direction_score || 0), 0) / ridesData.length : 0,
        average_driver_rating: ridesData.length > 0 ?
          ridesData.reduce((sum, ride) => sum + (ride.driver_rating || 0), 0) / ridesData.length : 0
      };
      
      return {
        success: true,
        rides: normalizeRides(ridesData),
        matchStats: matchStats,
        searchParams: {
          from: params.from || '',
          to: params.to || '',
          date: params.date,
          passengers: params.passengers,
          smartSearch: true,
          radiusKm: rpcParams.radius_km,
          searchMethod: 'get_rides_smart_final',
          functionUsed: 'get_rides_smart_final',
          appliedFilters: params
        },
        total: ridesData.length,
        smart_search: true
      };
      
    } catch (error) {
      try {
        const searchParams = new URLSearchParams();
        if (params.from) searchParams.append('from', params.from);
        if (params.to) searchParams.append('to', params.to);
        if (params.date) searchParams.append('date', params.date);
        if (params.passengers) searchParams.append('passengers', params.passengers.toString());

        const response = await this.request<any>('GET', `/api/rides/search?${searchParams.toString()}`);
        const rides = response.results || response.data?.rides || response.rides || [];
        
        return {
          success: true,
          rides: normalizeRides(rides),
          matchStats: response.matchStats || response.data?.stats || createDefaultMatchStats(),
          searchParams: {
            from: params.from || '',
            to: params.to || '',
            date: params.date,
            passengers: params.passengers,
            smartSearch: false,
            appliedFilters: params
          },
          total: response.total || rides.length || 0,
          smart_search: response.smart_search || false
        };
      } catch (fallbackError) {
        throw error;
      }
    }
  }

  async searchSmartRides(params: {
    from: string;
    to: string;
    date?: string;
    passengers?: number;
    radiusKm?: number;
  }): Promise<any> {
    return this.searchRides({
      from: params.from,
      to: params.to,
      date: params.date,
      passengers: params.passengers,
      radiusKm: params.radiusKm,
      smartSearch: true
    });
  }

  async createRide(rideData: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    pricePerSeat: number;
    availableSeats: number;
    vehicleType?: string;
    additionalInfo?: string;
    fromProvince?: string;
    toProvince?: string;
  }): Promise<any> {
    return this.request('POST', '/api/rides', rideData);
  }

  async getRideDetails(rideId: string): Promise<{ success: boolean; data: { ride: any } }> {
    const response = await this.request<any>('GET', `/api/rides/${rideId}`);
    if (response.success) {
      return {
        success: true,
        data: {
          ride: normalizeRide(response.data?.ride || response.ride || response)
        }
      };
    }
    return response;
  }

  // ====================== HOTELS API (SIMPLIFICADA) ======================
  
  async searchHotels(params: SearchParams): Promise<HotelSearchResponse> {
    try {
      return await this.get<HotelSearchResponse>('/api/v2/hotels/search', params);
    } catch (error) {
      return {
        success: false,
        data: [],
        hotels: [],
        count: 0
      };
    }
  }

  async getHotelById(hotelId: string): Promise<HotelByIdResponse> {
    try {
      return await this.get<HotelByIdResponse>(`/api/v2/hotels/${hotelId}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar hotel'
      };
    }
  }

  async checkAvailability(params: {
    hotelId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    units?: number;
    promoCode?: string;
  }): Promise<AvailabilityResponse> {
    try {
      return await this.get<AvailabilityResponse>('/api/v2/hotels/availability', params);
    } catch (error) {
      return {
        success: false,
        error: 'Erro na verificação de disponibilidade'
      };
    }
  }

  async createHotelBooking(bookingData: HotelBookingRequest): Promise<HotelBookingResponse> {
    try {
      return await this.post<HotelBookingResponse>('/api/v2/hotels/bookings', bookingData);
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar reserva'
      };
    }
  }

  // ====================== GESTÃO DE HOTÉIS ======================

  async createHotel(data: HotelCreateRequest): Promise<HotelOperationResponse> {
    try {
      return await this.post<HotelOperationResponse>('/api/v2/hotels', data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar hotel'
      };
    }
  }

  async updateHotel(hotelId: string, data: HotelUpdateRequest): Promise<HotelOperationResponse> {
    try {
      return await this.put<HotelOperationResponse>(`/api/v2/hotels/${hotelId}`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar hotel'
      };
    }
  }

  async deleteHotel(hotelId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await this.delete<ApiResponse<{ message: string }>>(`/api/v2/hotels/${hotelId}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao desativar hotel'
      };
    }
  }

  async getAllHotels(params?: { 
    limit?: number; 
    offset?: number;
    active?: boolean;
  }): Promise<HotelListResponse> {
    try {
      return await this.get<HotelListResponse>('/api/v2/hotels', params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao listar hotéis'
      };
    }
  }

  async getHotelStatsDetailed(hotelId: string): Promise<ApiResponse<HotelStatistics>> {
    try {
      return await this.get<ApiResponse<HotelStatistics>>(`/api/v2/hotels/${hotelId}/stats`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas'
      };
    }
  }

  async checkQuickAvailability(params: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    units?: number;
  }): Promise<{ 
    success: boolean; 
    available?: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await this.get<AvailabilityResponse>('/api/v2/hotels/availability/quick', params);
      return {
        success: response.success || false,
        available: response.data?.available,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro na verificação de disponibilidade'
      };
    }
  }

  async getBookingsByEmail(email: string, status?: BookingStatus): Promise<MyHotelBookingsResponse> {
    try {
      return await this.get<MyHotelBookingsResponse>('/api/v2/hotels/my-bookings', { email, status });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter reservas'
      };
    }
  }

  async getBookingDetails(bookingId: string): Promise<ApiResponse<HotelBookingData>> {
    try {
      return await this.get<ApiResponse<HotelBookingData>>(`/api/v2/hotels/bookings/${bookingId}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes da reserva'
      };
    }
  }

  async cancelBooking(bookingId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await this.post<ApiResponse<{ message: string }>>(`/api/v2/hotels/bookings/${bookingId}/cancel`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar reserva'
      };
    }
  }

  // ====================== GESTÃO DE QUARTOS ======================

  async createRoomType(hotelId: string, data: RoomTypeCreateRequest): Promise<HotelOperationResponse> {
    try {
      return await this.post<HotelOperationResponse>(`/api/v2/hotels/${hotelId}/room-types`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar tipo de quarto'
      };
    }
  }

  async updateRoomType(hotelId: string, roomTypeId: string, data: RoomTypeUpdateRequest): Promise<HotelOperationResponse> {
    try {
      return await this.put<HotelOperationResponse>(`/api/v2/hotels/${hotelId}/room-types/${roomTypeId}`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar tipo de quarto'
      };
    }
  }

  async getRoomTypesByHotel(hotelId: string, params?: {
    available?: boolean;
    checkIn?: string;
    checkOut?: string;
  }): Promise<RoomTypeListResponse> {
    try {
      return await this.get<RoomTypeListResponse>(`/api/v2/hotels/${hotelId}/room-types`, params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao listar tipos de quarto'
      };
    }
  }

  async bulkUpdateAvailability(hotelId: string, data: BulkAvailabilityUpdate): Promise<ApiResponse<{ updated: number; message: string }>> {
    try {
      return await this.post<ApiResponse<{ updated: number; message: string }>>(`/api/v2/hotels/${hotelId}/availability/bulk`, data);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar disponibilidade'
      };
    }
  }

  async getHotelPerformance(hotelId: string, params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }): Promise<ApiResponse<HotelPerformance>> {
    try {
      return await this.get<ApiResponse<HotelPerformance>>(`/api/v2/hotels/${hotelId}/performance`, params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter performance'
      };
    }
  }

  // ====================== OUTROS MÉTODOS ======================
  
  getRideById(rideId: string): Promise<{ success: boolean; data: { ride: any } }> {
    return this.getRideDetails(rideId);
  }

  createRideBooking(data: any) {
    return this.post('/api/rides/book', data);
  }

  getDriverRides(params?: any) {
    return this.get('/api/rides/driver', params);
  }

  login(data: { email: string; password: string }) {
    return this.post('/api/auth/login', data);
  }

  register(data: any) {
    return this.post('/api/auth/register', data);
  }

  logout() {
    return this.post('/api/auth/logout');
  }

  refreshToken() {
    return this.post('/api/auth/refresh-token');
  }

  getProfile() {
    return this.get('/api/auth/me');
  }

  updateProfile(data: any) {
    return this.post('/api/auth/update', data);
  }

  uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(`${this.baseURL}/api/upload`, {
      method: "POST",
      credentials: "include",
      body: formData
    }).then(r => r.json());
  }

  getNotifications(): Promise<NotificationsResponse> {
    return this.get<NotificationsResponse>('/api/notifications');
  }

  markNotificationAsRead(notificationId: string) {
    return this.post(`/api/notifications/${notificationId}/read`);
  }

  getChatThread(threadId: string): Promise<ApiResponse<ChatThread>> {
    return this.get<ApiResponse<ChatThread>>(`/api/chat/${threadId}`);
  }

  sendChatMessage(threadId: string, message: string): Promise<SendMessageResponse> {
    return this.post<SendMessageResponse>(`/api/chat/${threadId}/send`, { message });
  }

  getHotelStats(hotelId: string) {
    return this.get(`/api/v2/hotels/${hotelId}/stats`);
  }

  getHotelEvents(hotelId: string, params?: { status?: BookingStatus; upcoming?: boolean }) {
    return this.get(`/api/v2/hotels/${hotelId}/events`, params);
  }

  getChat(hotelId: string, params?: { threadId?: string; limit?: number }) {
    return this.get(`/api/v2/hotels/${hotelId}/chat`, params);
  }

  cancelHotelBooking(bookingId: string) {
    return this.cancelBooking(bookingId);
  }

  checkInHotelBooking(bookingId: string) {
    return this.post(`/api/v2/hotels/bookings/${bookingId}/check-in`);
  }

  checkOutHotelBooking(bookingId: string) {
    return this.post(`/api/v2/hotels/bookings/${bookingId}/check-out`);
  }

  getMyHotelBookings(email: string, status?: BookingStatus): Promise<MyHotelBookingsResponse> {
    return this.getBookingsByEmail(email, status);
  }

  getHotels() {
    return this.getAllHotels();
  }

  async testHotelsV2(): Promise<ApiResponse<{ message: string; count?: number }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/v2/hotels/search?location=Maputo&limit=1`);
      const v2Working = response.ok;
      const v2Data = v2Working ? await response.json() : null;
      
      return {
        success: v2Working,
        data: {
          message: v2Working 
            ? `✅ API funcionando (${v2Data?.count || 0} hotéis)` 
            : '❌ API não está respondendo',
          count: v2Data?.count
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
      };
    }
  }

  async getNightlyPrices(params: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    units?: number;
  }): Promise<ApiResponse<NightlyPrice[]>> {
    try {
      return await this.get<ApiResponse<NightlyPrice[]>>('/api/v2/hotels/availability/nightly-prices', params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter preços'
      };
    }
  }

  async getRoomTypeDetails(hotelId: string, roomTypeId: string): Promise<ApiResponse<RoomType>> {
    try {
      return await this.get<ApiResponse<RoomType>>(`/api/v2/hotels/${hotelId}/room-types/${roomTypeId}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes do tipo de quarto'
      };
    }
  }

  async getBookingStatus(bookingId: string): Promise<ApiResponse<{ status: BookingStatus; paymentStatus: PaymentStatus }>> {
    try {
      return await this.get<ApiResponse<{ status: BookingStatus; paymentStatus: PaymentStatus }>>(`/api/v2/hotels/bookings/${bookingId}/status`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter status da reserva'
      };
    }
  }

  async sendChatMessageFull(threadId: string, messageData: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      return await this.post<SendMessageResponse>(`/api/chat/${threadId}/send`, messageData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      };
    }
  }

  async getNotificationsByType(type: string): Promise<ApiResponse<Notification[]>> {
    try {
      return await this.get<ApiResponse<Notification[]>>(`/api/notifications/type/${type}`);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter notificações'
      };
    }
  }

  async bookRide(bookingData: RideBookingRequest): Promise<{ success: boolean; data: { booking: Booking } }> {
    return this.request('POST', '/api/bookings', bookingData);
  }

  async createBooking(
    type: 'ride' | 'hotel',
    bookingData: any
  ): Promise<{ success: boolean; data?: { booking: Booking }; error?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { 
          success: false, 
          error: 'Usuário não autenticado' 
        };
      }

      if (type === 'ride') {
        const payload = {
          rideId: bookingData.rideId,
          passengerId: user.uid,
          seatsBooked: bookingData.passengers,
          totalPrice: bookingData.totalAmount,
          guestName: bookingData.guestInfo?.name,
          guestEmail: bookingData.guestInfo?.email,
          guestPhone: bookingData.guestInfo?.phone,
          rideDetails: bookingData.rideDetails,
          type: 'ride'
        };
        
        const result = await this.bookRide(payload);
        return { success: true, data: result.data };
        
      } else if (type === 'hotel') {
        const payload: HotelBookingRequest = {
          hotelId: bookingData.hotelId,
          roomTypeId: bookingData.roomTypeId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          adults: bookingData.adults || 1,
          children: bookingData.children || 0,
          units: bookingData.units || 1,
          specialRequests: bookingData.specialRequests,
          promoCode: bookingData.promoCode
        };
        
        const result = await this.createHotelBooking(payload);
        
        return { 
          success: result.success, 
          data: result.booking ? { 
            booking: {
              ...result.booking,
              passengerId: result.booking.guestEmail,
              type: 'hotel'
            } as any as Booking
          } : undefined,
          error: result.error
        };
        
      } else {
        return { 
          success: false, 
          error: 'Tipo de booking inválido' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Erro ao criar reserva' 
      };
    }
  }

  async getUserBookings(): Promise<{ success: boolean; data: { bookings: Booking[] } }> {
    return this.request('GET', '/api/bookings/user');
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('GET', '/api/auth/profile');
  }

  async updateUserProfile(userData: any): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('PUT', '/api/auth/profile', userData);
  }

  async checkHealth(): Promise<{ success: boolean; services: Record<string, string> }> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, services: data.services || {} };
      }
      return { success: false, services: {} };
    } catch (error) {
      return { success: false, services: {} };
    }
  }
}

export const apiService = new ApiService();
export default apiService;