import { auth } from '@/shared/lib/firebaseConfig';
import { Booking, RideBookingRequest, HotelBookingRequest } from '@/shared/types/booking';

/**
 * Interfaces para tipagem
 */
interface Hotel {
  id: string;
  userId: string;
  name: string;
  description: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  amenities: string[];
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  type: string;
  description?: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  maxGuests: number;
  images?: string[];
  amenities?: string[];
  size?: number;
  bedType?: string;
  hasBalcony: boolean;
  hasSeaView: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HotelStats {
  totalBookings: number;
  monthlyRevenue: number;
  averageRating: number;
  averageOccupancy: number;
  totalEvents: number;
  upcomingEvents: number;
  activePartnerships: number;
  partnershipEarnings: number;
  totalRoomTypes: number;
  totalRooms: number;
  availableRooms: number;
}

interface HotelEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  venue: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  maxTickets: number;
  ticketsSold: number;
  status: string;
  organizerId?: string;
}

interface DriverPartnership {
  id: string;
  driver: string;
  route: string;
  commission: number;
  clientsBrought: number;
  totalEarnings: number;
  lastMonth: number;
  rating: number;
  joinedDate: string;
  status: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  time: string;
  isHotel: boolean;
}

// ✅ INTERFACE RIDE CORRIGIDA - pricePerSeat como number | undefined
export interface Ride {
  id: string;
  driverId: string;
  fromLocation: string;
  toLocation: string;
  fromAddress?: string;
  toAddress?: string;
  fromProvince?: string;
  toProvince?: string;
  departureDate: string;
  departureTime: string;
  price: number;
  pricePerSeat?: number; // ✅ CORRIGIDO: number | undefined
  availableSeats: number;
  maxPassengers: number;
  
  // ✅ Campos principais do backend
  vehicle?: string;
  vehicleType?: string;
  
  // ✅ Dados do motorista do backend
  driverName?: string;
  driverRating?: number;
  
  // ✅ Campos de cidade do backend
  fromCity?: string;
  toCity?: string;
  
  // ✅ Dados formatados do backend
  departureDateFormatted?: string;
  
  status: string;
  type?: string;
  
  // ✅ Campos de matching
  matchType?: string;
  matchScore?: number;
}

export interface RideSearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  minPrice?: number;
  maxPrice?: number;
  vehicleType?: string;
  smartSearch?: boolean;
  maxDistance?: number;
  radiusKm?: number;
}

// ✅ INTERFACE PARA MATCHSTATS SIMPLIFICADA
export interface MatchStats {
  exact_match?: number;
  same_segment?: number;
  same_direction?: number;
  potential?: number;
  traditional?: number;
  total: number;
  smart_matches?: number;
  drivers_with_ratings?: number;
  average_driver_rating?: number;
  vehicle_types?: Record<string, number>;
}

export interface RideSearchResponse {
  success: boolean;
  rides: Ride[];
  matchStats?: MatchStats;
  searchParams?: {
    from: string;
    to: string;
    date?: string;
    passengers?: number;
    smartSearch: boolean;
    appliedFilters?: any;
    radiusKm?: number;
    searchMethod?: string;
  };
  total?: number;
  data?: {
    rides: Ride[];
    stats?: MatchStats;
    searchParams?: any;
    smart_search?: boolean;
  };
  smart_search?: boolean;
}

// ✅✅✅ FUNÇÃO DE NORMALIZAÇÃO CORRIGIDA - pricePerSeat como number | undefined
export function normalizeRide(apiRide: any): Ride {
  // Debug para ver o que chega do backend
  console.log('🎯 Dado RAW recebido do backend:', {
    id: apiRide.id,
    driverName: apiRide.driverName,
    fromCity: apiRide.fromCity,
    toCity: apiRide.toCity,
    pricePerSeat: apiRide.pricePerSeat,
    departureDate: apiRide.departureDate,
    availableSeats: apiRide.availableSeats
  });
  
  // ✅ CORREÇÃO: pricePerSeat como number | undefined (não null)
  const pricePerSeatValue = apiRide.pricePerSeat !== undefined && apiRide.pricePerSeat !== null ? 
                           Number(apiRide.pricePerSeat) : undefined;

  const normalized: Ride = {
    // Identificação
    id: apiRide.id || '',
    driverId: apiRide.driverId || '',
    
    // Motorista
    driverName: apiRide.driverName || 'Motorista não disponível',
    driverRating: apiRide.driverRating ? Number(apiRide.driverRating) : undefined,
    
    // Localização ORIGEM
    fromAddress: apiRide.fromAddress || apiRide.fromCity || 'Localização não disponível',
    fromCity: apiRide.fromCity || 'Cidade não disponível',
    fromLocation: apiRide.fromLocation || apiRide.fromAddress || apiRide.fromCity || '',
    
    // Localização DESTINO  
    toAddress: apiRide.toAddress || apiRide.toCity || 'Localização não disponível',
    toCity: apiRide.toCity || 'Cidade não disponível',
    toLocation: apiRide.toLocation || apiRide.toAddress || apiRide.toCity || '',
    
    // Províncias
    fromProvince: apiRide.fromProvince || undefined,
    toProvince: apiRide.toProvince || undefined,
    
    // Data e hora
    departureDate: apiRide.departureDate || '',
    departureDateFormatted: apiRide.departureDateFormatted || 
                           (apiRide.departureDate ? 
                            new Date(apiRide.departureDate).toLocaleDateString('pt-PT') : 
                            'Data não disponível'),
    departureTime: apiRide.departureTime || 
                  (apiRide.departureDate ? 
                   new Date(apiRide.departureDate).toLocaleTimeString('pt-PT', {hour:'2-digit', minute:'2-digit'}) : 
                   'Hora não disponível'),
    
    // ✅ CORREÇÃO: Preço (JÁ EM MZN - sem conversão) - pricePerSeat como number | undefined
    price: pricePerSeatValue || 0,
    pricePerSeat: pricePerSeatValue,
    availableSeats: apiRide.availableSeats || 0,
    maxPassengers: apiRide.maxPassengers || apiRide.availableSeats || 4,
    
    // Veículo
    vehicle: apiRide.vehicle || 'Veículo não disponível',
    vehicleType: apiRide.vehicleType || undefined,
    
    // Status e metadados
    status: apiRide.status || 'available',
    matchType: apiRide.matchType || undefined,
    matchScore: apiRide.matchScore || undefined,
    type: apiRide.type || 'one-way'
  };
  
  console.log('🔄 Dado NORMALIZADO para UI:', {
    id: normalized.id,
    driverName: normalized.driverName,
    fromCity: normalized.fromCity,
    toCity: normalized.toCity,
    price: normalized.pricePerSeat,
    date: normalized.departureDateFormatted,
    time: normalized.departureTime,
    seats: normalized.availableSeats
  });
  
  return normalized;
}

// ✅ FUNÇÃO DE NORMALIZAÇÃO DE LISTA
export function normalizeRides(backendRides: any[]): Ride[] {
  console.log(`🔄 [NORMALIZAÇÃO] Normalizando ${backendRides?.length || 0} rides`);
  return (backendRides || []).map(normalizeRide);
}

// ✅ CRIAR MATCHSTATS PADRÃO
export function createDefaultMatchStats(): MatchStats {
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
    total: 0
  };
}

// ✅ FUNÇÃO AUXILIAR: Obter nome do motorista
export function getDriverName(ride: Ride): string {
  return ride.driverName || 'Motorista não disponível';
}

// ✅ FUNÇÃO AUXILIAR: Obter rating do motorista
export function getDriverRating(ride: Ride): number {
  return ride.driverRating || 4.5;
}

// ✅ FUNÇÃO AUXILIAR: Formatar preço em MZN
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(price);
}

/**
 * Serviço central de API para todas as apps
 * Gerencia autenticação Firebase e comunicação com Railway backend
 */
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    console.log('🏗️ API Base URL:', this.baseURL);
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = await auth.currentUser?.getIdToken() || localStorage.getItem('authToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.debug('No auth token available');
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
    
    console.log(`🔧 API Request: ${method} ${url}`, data || '');
    
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText || 'Request failed'}`);
      }
      const result = await response.json() as T;
      console.log(`✅ API Response: ${method} ${endpoint}`, result);
      return result;
    } catch (error) {
      console.error(`❌ API Error: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // ===== RIDES API SIMPLIFICADA =====
  async searchRides(params: RideSearchParams): Promise<RideSearchResponse> {
    try {
      // ✅ PRIMEIRO TENTA BUSCA INTELIGENTE SE smartSearch=true
      if (params.smartSearch !== false) {
        try {
          const searchParams = new URLSearchParams();
          if (params.from) searchParams.append('from', params.from);
          if (params.to) searchParams.append('to', params.to);
          if (params.passengers) searchParams.append('passengers', params.passengers.toString());
          if (params.date) searchParams.append('date', params.date);
          
          const radiusKm = params.radiusKm || params.maxDistance || 100;
          searchParams.append('radiusKm', radiusKm.toString());
          
          console.log(`🧠 FRONTEND: Buscando rides inteligentes: ${params.from} → ${params.to} (raio: ${radiusKm}km)`);
          
          const response = await this.request<any>('GET', `/api/rides/smart/search?${searchParams.toString()}`);
          
          // ✅ NORMALIZAR RESPOSTA DO BACKEND
          if (response.success) {
            const rides = response.results || response.data?.rides || response.rides || [];
            
            const searchParamsResponse = {
              from: params.from || '',
              to: params.to || '',
              date: params.date,
              passengers: params.passengers,
              smartSearch: true,
              radiusKm: radiusKm,
              searchMethod: response.metadata?.searchMethod || 'smart_final',
              appliedFilters: params
            };

            return {
              success: true,
              rides: normalizeRides(rides),
              matchStats: response.data?.stats || createDefaultMatchStats(),
              searchParams: searchParamsResponse,
              total: response.total || rides.length || 0,
              data: response.data,
              smart_search: true
            };
          }
        } catch (smartError) {
          console.warn('❌ FRONTEND: Busca inteligente falhou, usando busca tradicional:', smartError);
        }
      }
      
      // ✅ FALLBACK PARA BUSCA TRADICIONAL
      const searchParams = new URLSearchParams();
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.date) searchParams.append('date', params.date);
      if (params.passengers) searchParams.append('passengers', params.passengers.toString());

      console.log(`🔍 FRONTEND: Buscando rides tradicionais: ${params.from} → ${params.to}`);
      
      const response = await this.request<any>('GET', `/api/rides/smart/search?${searchParams.toString()}`);
      
      const rides = response.results || response.data?.rides || response.rides || [];
      
      const searchParamsResponse = {
        from: params.from || '',
        to: params.to || '',
        date: params.date,
        passengers: params.passengers,
        smartSearch: false,
        appliedFilters: params
      };

      return {
        success: true,
        rides: normalizeRides(rides),
        matchStats: response.matchStats || response.data?.stats || createDefaultMatchStats(),
        searchParams: searchParamsResponse,
        total: response.total || rides.length || 0,
        smart_search: response.smart_search || false
      };
      
    } catch (error) {
      console.error('❌ FRONTEND: Erro na busca de rides:', error);
      throw error;
    }
  }

  // ✅ BUSCA INTELIGENTE ESPECÍFICA
  async searchSmartRides(params: {
    from: string;
    to: string;
    date?: string;
    passengers?: number;
    radiusKm?: number;
  }): Promise<RideSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('from', params.from);
    searchParams.append('to', params.to);
    if (params.date) searchParams.append('date', params.date);
    if (params.passengers) searchParams.append('passengers', params.passengers.toString());
    const radiusKm = params.radiusKm || 100;
    searchParams.append('radiusKm', radiusKm.toString());

    console.log(`🧠 FRONTEND: Busca SMART específica: ${params.from} → ${params.to} (${radiusKm}km)`);

    const response = await this.request<any>('GET', `/api/rides/smart/search?${searchParams.toString()}`);
    
    if (response.success) {
      const rides = response.results || response.data?.rides || [];
      
      const searchParamsResponse = {
        from: params.from,
        to: params.to,
        date: params.date,
        passengers: params.passengers,
        smartSearch: true,
        radiusKm: radiusKm,
        searchMethod: response.metadata?.searchMethod || 'smart_final',
        appliedFilters: params
      };

      return {
        success: true,
        rides: normalizeRides(rides),
        matchStats: response.data?.stats || createDefaultMatchStats(),
        searchParams: searchParamsResponse,
        total: response.total || rides.length || 0,
        data: response.data,
        smart_search: true
      };
    }

    throw new Error('Busca inteligente falhou');
  }

  // ✅ BUSCA UNIVERSAL INTELIGENTE
  async searchUniversalRides(params: {
    from?: string;
    to?: string;
    lat?: number;
    lng?: number;
    toLat?: number;
    toLng?: number;
    radiusKm?: number;
    maxResults?: number;
  }): Promise<RideSearchResponse> {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.lat) searchParams.append('lat', params.lat.toString());
    if (params.lng) searchParams.append('lng', params.lng.toString());
    if (params.toLat) searchParams.append('toLat', params.toLat.toString());
    if (params.toLng) searchParams.append('toLng', params.toLng.toString());
    const radiusKm = params.radiusKm || 100;
    searchParams.append('radiusKm', radiusKm.toString());
    if (params.maxResults) searchParams.append('maxResults', params.maxResults.toString());

    console.log(`🌍 FRONTEND: Busca universal inteligente`, params);

    const response = await this.request<any>('GET', `/api/rides/search/universal?${searchParams.toString()}`);
    
    if (response.success && response.data) {
      const searchParamsResponse = {
        from: params.from || '',
        to: params.to || '',
        smartSearch: true,
        radiusKm: radiusKm,
        appliedFilters: params
      };

      return {
        success: true,
        rides: normalizeRides(response.data.rides),
        matchStats: response.data.stats || createDefaultMatchStats(),
        searchParams: searchParamsResponse,
        total: response.data.rides?.length || 0,
        data: response.data,
        smart_search: response.data.smart_search || true
      };
    }

    throw new Error('Busca universal falhou');
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

  // 🆕 OBTER DETALHES DE UM RIDE ESPECÍFICO
  async getRideDetails(rideId: string): Promise<{ success: boolean; data: { ride: Ride } }> {
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

  // 🆕 BUSCAR RIDES PRÓXIMOS
  async getNearbyRides(location: string, radius: number = 50, passengers: number = 1): Promise<RideSearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('location', location);
    searchParams.append('radius', radius.toString());
    searchParams.append('passengers', passengers.toString());

    const response = await this.request<any>('GET', `/api/rides/nearby?${searchParams.toString()}`);
    
    const searchParamsResponse = {
      from: location,
      to: location,
      passengers,
      smartSearch: false,
      appliedFilters: { location, radius, passengers }
    };

    return {
      success: true,
      rides: normalizeRides(response.data?.rides || response.rides),
      matchStats: response.data?.stats || createDefaultMatchStats(),
      searchParams: searchParamsResponse,
      total: response.data?.total || response.total || 0,
      smart_search: response.data?.smart_search || false
    };
  }

  // 🆕 SOLICITAR RESERVA DE VIAGEM
  async requestRide(rideId: string, passengers: number, pickupLocation?: string, notes?: string): Promise<{ 
    success: boolean; 
    message: string; 
    booking: any;
    rideDetails: any;
  }> {
    return this.request('POST', '/api/bookings', {
      rideId,
      passengers,
      pickupLocation,
      notes,
      type: 'ride'
    });
  }

  // ===== BOOKINGS API =====
  async bookRide(bookingData: RideBookingRequest): Promise<{ success: boolean; data: { booking: Booking } }> {
    return this.request('POST', '/api/bookings', bookingData);
  }

  async bookHotel(bookingData: HotelBookingRequest): Promise<{ success: boolean; data: { booking: Booking } }> {
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

      let payload: any;

      if (type === 'ride') {
        payload = {
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
        payload = {
          accommodationId: bookingData.accommodationId,
          passengerId: user.uid,
          totalPrice: bookingData.totalAmount,
          guestName: bookingData.guestInfo?.name,
          guestEmail: bookingData.guestInfo?.email,
          guestPhone: bookingData.guestInfo?.phone,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          type: 'hotel'
        };
        
        const result = await this.bookHotel(payload);
        return { success: true, data: result.data };
        
      } else {
        return { 
          success: false, 
          error: 'Tipo de booking inválido' 
        };
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar booking:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao criar reserva' 
      };
    }
  }

  async getUserBookings(): Promise<{ success: boolean; data: { bookings: Booking[] } }> {
    return this.request('GET', '/api/bookings/user');
  }

  // ===== USER/AUTH API =====
  async getUserProfile(): Promise<{ success: boolean; data: any }> {
    return this.request('GET', '/api/auth/profile');
  }

  async updateUserProfile(userData: any): Promise<{ success: boolean; data: any }> {
    return this.request('PUT', '/api/auth/profile', userData);
  }

  // ===== HOTELS API =====
  async searchAccommodations(params: { location?: string; checkIn?: string; checkOut?: string; guests?: number }): Promise<{ success: boolean; data: { accommodations: Hotel[] } }> {
    const searchParams = new URLSearchParams();
    if (params.location) searchParams.append('location', params.location);
    if (params.checkIn) searchParams.append('checkIn', params.checkIn);
    if (params.checkOut) searchParams.append('checkOut', params.checkOut);
    if (params.guests) searchParams.append('guests', params.guests.toString());
    
    return this.request('GET', `/api/search/accommodations?${searchParams.toString()}`);
  }

  async createAccommodation(accommodationData: any): Promise<{ success: boolean; data: { hotel: Hotel } }> {
    return this.request('POST', '/api/hotels', accommodationData);
  }

  async getUserAccommodations(): Promise<{ success: boolean; data: { hotels: Hotel[] } }> {
    try {
      return await this.request('GET', '/api/hotels/my-hotels');
    } catch (error) {
      console.error('Erro ao buscar acomodações do usuário:', error);
      return { success: false, data: { hotels: [] } };
    }
  }

  async getHotelById(hotelId: string): Promise<{ success: boolean; data: { hotel: Hotel } }> {
    return this.request('GET', `/api/hotels/${hotelId}`);
  }

  async updateHotel(hotelId: string, hotelData: Partial<Hotel>): Promise<{ success: boolean; data: { hotel: Hotel } }> {
    return this.request('PUT', `/api/hotels/${hotelId}`, hotelData);
  }

  async deleteHotel(hotelId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/hotels/${hotelId}`);
  }

  async updateRoom(roomId: string, roomData: Partial<RoomType>): Promise<{ success: boolean; data: { room: RoomType } }> {
    return this.request('PUT', `/api/rooms/${roomId}`, roomData);
  }

  async getHotelStats(hotelId: string): Promise<{ success: boolean; data: { stats: HotelStats } }> {
    return this.request('GET', `/api/hotels/${hotelId}/stats`);
  }

  // ===== ROOMS API =====
  async getRoomsByHotelId(hotelId: string): Promise<{ success: boolean; data: { rooms: RoomType[] } }> {
    return this.request('GET', `/api/hotels/${hotelId}/rooms`);
  }

  async createRoom(roomData: Partial<RoomType>): Promise<{ success: boolean; data: { room: RoomType } }> {
    return this.request('POST', '/api/rooms', roomData);
  }

  async deleteRoom(roomId: string): Promise<{ success: boolean }> {
    return this.request('DELETE', `/api/rooms/${roomId}`);
  }

  // ===== PARTNERSHIPS API =====
  async createPartnership(partnershipData: { partnerId: string; type: 'driver-hotel' | 'hotel-driver'; terms: string }): Promise<{ success: boolean; data: any }> {
    return this.request('POST', '/api/partnerships/create', partnershipData);
  }

  async getPartnershipRequests(): Promise<{ success: boolean; data: { requests: any[] } }> {
    return this.request('GET', '/api/partnerships/requests');
  }

  async getDriverPartnerships(hotelId: string): Promise<{ success: boolean; data: { partnerships: DriverPartnership[] } }> {
    return this.request('GET', `/api/partnerships/driver?hotelId=${hotelId}`);
  }

  // ===== EVENTS API =====
  async getEvents(hotelId?: string): Promise<{ success: boolean; data: { events: HotelEvent[] } }> {
    const url = hotelId ? `/api/events?hotelId=${hotelId}` : '/api/events';
    return this.request('GET', url);
  }

  async createEvent(eventData: any): Promise<{ success: boolean; data: { event: HotelEvent } }> {
    return this.request('POST', '/api/events/create', eventData);
  }

  async updateEvent(eventId: string, eventData: Partial<HotelEvent>): Promise<{ success: boolean; data: { event: HotelEvent } }> {
    return this.request('PUT', `/api/events/${eventId}`, eventData);
  }

  // ===== FEATURED OFFERS API =====
  async getFeaturedOffers(): Promise<{ success: boolean; data: { offers: any[] } }> {
    return this.request('GET', '/api/offers/featured');
  }

  // ===== CHAT API =====
  async getChatRooms(): Promise<{ success: boolean; data: { rooms: any[] } }> {
    return this.request('GET', '/api/chat/rooms');
  }

  async getChatMessages(roomId: string): Promise<{ success: boolean; data: { messages: ChatMessage[] } }> {
    return this.request('GET', `/api/chat/messages/${roomId}`);
  }

  async sendChatMessage(roomId: string, messageData: { message: string }): Promise<{ success: boolean; data: { message: ChatMessage } }> {
    return this.request('POST', `/api/chat/messages/${roomId}`, messageData);
  }

  // ===== ADMIN API =====
  async getAdminStats(): Promise<{ success: boolean; data: any }> {
    return this.request('GET', '/api/admin/stats');
  }

  async getAdminRides(): Promise<{ success: boolean; data: { rides: any[] } }> {
    return this.request('GET', '/api/admin/rides');
  }

  async getAdminBookings(): Promise<{ success: boolean; data: { bookings: Booking[] } }> {
    return this.request('GET', '/api/admin/bookings');
  }

  // ===== LOCATIONS API =====
  async searchLocations(query: string, limit: number = 10): Promise<{ success: boolean; data: any[] }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('limit', limit.toString());
    
    return this.request('GET', `/api/locations/autocomplete?${searchParams.toString()}`);
  }
}

export const apiService = new ApiService();
export default apiService;