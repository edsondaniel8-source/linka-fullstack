import { auth } from '@/shared/lib/firebaseConfig';
import { Booking, RideBookingRequest, HotelBookingRequest } from '@/shared/types/booking';
import { Offer, HotelPartner } from '@/shared/types/dashboard';

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
      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.debug('No auth token available:', error);
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
    
    console.log(`🌐 API ${method} Request:`, { url, headers: Object.keys(headers), data });
    
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    
    // Para respostas sem conteúdo (como DELETE 204)
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  // ===== HOTEL WIZARD API =====
  
  /**
   * Criar hotel completo (com informações básicas, localização, comodidades, quartos)
   */
  async createHotel(hotelData: any): Promise<{ hotelId: string; success: boolean; message: string }> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar hotéis.');
    }

    const hotelDataWithHost = {
      ...hotelData,
      hostId: user.uid, // 🔑 HostId dinâmico do usuário logado
      createdBy: user.uid // 📝 Campo adicional para auditoria
    };

    console.log('🏨 Criando hotel com hostId:', user.uid);

    return this.request<{ hotelId: string; success: boolean; message: string }>(
      'POST', 
      '/api/hotels/create-complete', 
      hotelDataWithHost
    );
  }

  /**
   * Criar tipo de quarto para um hotel
   */
  async createRoomType(roomTypeData: any): Promise<any> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar tipos de quarto.');
    }

    const roomTypeDataWithHost = {
      ...roomTypeData,
      hostId: user.uid,
      createdBy: user.uid
    };

    return this.request<any>('POST', '/api/hotels/room-types', roomTypeDataWithHost);
  }

  /**
   * Criar quarto específico
   */
  async createRoom(roomData: any): Promise<any> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar quartos.');
    }

    const roomDataWithHost = {
      ...roomData,
      hostId: user.uid,
      createdBy: user.uid
    };

    return this.request<any>('POST', '/api/hotels/rooms', roomDataWithHost);
  }

  /**
   * Obter estatísticas de um hotel
   */
  async getHotelStats(hotelId: string): Promise<any> {
    return this.request<any>('GET', `/api/hotels/${hotelId}/stats`);
  }

  /**
   * Upload de imagens para hotel (usando FormData)
   */
  async uploadHotelImages(hotelId: string, images: File[]): Promise<any> {
    const formData = new FormData();
    formData.append('hotelId', hotelId);
    
    images.forEach((image, index) => {
      formData.append('images', image);
      formData.append(`imageOrder_${index}`, index.toString());
    });

    const headers = await this.getAuthHeaders();
    // Remover Content-Type para FormData (será definido automaticamente com boundary)
    delete headers['Content-Type'];

    const response = await fetch(`${this.baseURL}/api/hotels/upload-images`, {
      method: 'POST',
      headers: {
        'Authorization': headers.Authorization || ''
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }

    return response.json();
  }

  /**
   * Obter tipos de quarto de um hotel
   */
  async getRoomTypes(hotelId: string): Promise<any[]> {
    return this.request<any[]>('GET', `/api/hotels/${hotelId}/room-types`);
  }

  /**
   * Obter quartos de um hotel
   */
  async getRooms(hotelId: string): Promise<any[]> {
    return this.request<any[]>('GET', `/api/hotels/${hotelId}/rooms`);
  }

  // ===== OFFERS API =====
  async createOffer(offerData: Offer): Promise<Offer> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar ofertas.');
    }

    const offerDataWithHost = {
      ...offerData,
      hostId: user.uid,
      createdBy: user.uid
    };

    return this.request<Offer>('POST', '/api/offers/create', offerDataWithHost);
  }

  async getOffers(params?: { hotelId?: string; date?: string }): Promise<Offer[]> {
    const searchParams = new URLSearchParams();
    if (params?.hotelId) searchParams.append('hotelId', params.hotelId);
    if (params?.date) searchParams.append('date', params.date);
    return this.request<Offer[]>('GET', `/api/offers?${searchParams.toString()}`);
  }

  async getOfferById(offerId: string): Promise<Offer> {
    return this.request<Offer>('GET', `/api/offers/${offerId}`);
  }

  async deleteOffer(offerId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/offers/${offerId}`);
  }

  // ===== RIDES API =====
  async searchRides(params: { from?: string; to?: string; passengers?: number; date?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.passengers) searchParams.append('passengers', params.passengers.toString());
    if (params.date) searchParams.append('date', params.date);
    return this.request<any>('GET', `/api/rides-simple/search?${searchParams.toString()}`);
  }

  async createRide(rideData: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    pricePerSeat: number;
    availableSeats: number;
    vehicleType?: string;
    additionalInfo?: string;
  }): Promise<any> {
    // ✅ CORREÇÃO: Adicionar driverId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar viagens.');
    }

    const rideDataWithDriver = {
      ...rideData,
      driverId: user.uid, // 🔑 DriverId dinâmico do usuário logado
      createdBy: user.uid
    };

    return this.request<any>('POST', '/api/rides-simple/create', rideDataWithDriver);
  }

  // ===== BOOKINGS API =====
  async bookRide(bookingData: RideBookingRequest): Promise<{ success: boolean; booking: Booking }> {
    return this.request<{ success: boolean; booking: Booking }>('POST', '/api/rides-simple/book', bookingData);
  }

  async bookHotel(bookingData: HotelBookingRequest): Promise<{ success: boolean; booking: Booking }> {
    return this.request<{ success: boolean; booking: Booking }>('POST', '/api/bookings/create', bookingData);
  }

  // ===== MÉTODO UNIFICADO createBooking =====
  async createBooking(
    bookingData: RideBookingRequest | HotelBookingRequest
  ): Promise<{ success: boolean; booking: Booking }> {
    if ('rideId' in bookingData) {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const payload: RideBookingRequest = {
        rideId: bookingData.rideId!,
        passengerId: user.uid,
        seatsBooked: bookingData.seatsBooked!,
        totalPrice: bookingData.totalPrice,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
      };

      return this.bookRide(payload);
    } else if ('accommodationId' in bookingData) {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const payload: HotelBookingRequest = {
        accommodationId: bookingData.accommodationId,
        passengerId: user.uid,
        totalPrice: bookingData.totalPrice,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkInDate: bookingData.checkInDate!,
        checkOutDate: bookingData.checkOutDate!,
      };

      return this.bookHotel(payload);
    } else {
      throw new Error('Booking must have rideId or accommodationId');
    }
  }

  async getUserBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('GET', '/api/bookings/user');
  }

  // ===== USER/AUTH API =====
  async getUserProfile(): Promise<any> {
    return this.request<any>('GET', '/api/auth/profile');
  }

  async updateUserProfile(userData: any): Promise<any> {
    return this.request<any>('PUT', '/api/auth/profile', userData);
  }

  async register(userData: any): Promise<any> {
    return this.request<any>('POST', '/api/auth/register', userData);
  }

  async checkUser(): Promise<any> {
    return this.request<any>('GET', '/api/auth/check');
  }

  async refresh(): Promise<any> {
    return this.request<any>('POST', '/api/auth/refresh');
  }

  // ===== HOTELS API =====
  async searchAccommodations(params: { location?: string; checkIn?: string; checkOut?: string; guests?: number }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.location) searchParams.append('address', params.location);
    if (params.checkIn) searchParams.append('checkIn', params.checkIn);
    if (params.checkOut) searchParams.append('checkOut', params.checkOut);
    if (params.guests) searchParams.append('guests', params.guests.toString());
    searchParams.append('isAvailable', 'true');
    return this.request<any>('GET', `/api/hotels?${searchParams.toString()}`);
  }

  async createAccommodation(accommodationData: any): Promise<any> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente + remover pricePerNight
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar acomodações.');
    }

    const { pricePerNight, ...dataWithoutPrice } = accommodationData;
    
    const accommodationDataWithHost = {
      ...dataWithoutPrice,
      hostId: user.uid, // 🔑 HostId dinâmico do usuário logado
      createdBy: user.uid
    };

    console.log('🏠 Criando acomodação com hostId:', user.uid);

    return this.request<any>('POST', '/api/hotels', accommodationDataWithHost);
  }

  // ===== HOTELS DETAIL/UPDATE/DELETE API =====
  async getHotelById(hotelId: string): Promise<HotelPartner> {
    return this.request<HotelPartner>('GET', `/api/hotels/${hotelId}`);
  }

  async updateAccommodation(hotelId: string, accommodationData: any): Promise<any> {
    // ✅ CORREÇÃO: Remover pricePerNight
    const { pricePerNight, ...dataWithoutPrice } = accommodationData;
    return this.request<any>('PUT', `/api/hotels/${hotelId}`, dataWithoutPrice);
  }

  async deleteAccommodation(hotelId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/hotels/${hotelId}`);
  }

  // ===== ROOMS API =====
  async getRoomsByHotel(hotelId: string): Promise<any[]> {
    return this.request<any[]>('GET', `/api/hotels/${hotelId}/rooms`);
  }

  async getRoomById(roomId: string): Promise<any> {
    return this.request<any>('GET', `/api/rooms/${roomId}`);
  }

  async updateRoom(roomId: string, roomData: any): Promise<any> {
    return this.request<any>('PUT', `/api/rooms/${roomId}`, roomData);
  }

  async deleteRoom(roomId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/rooms/${roomId}`);
  }

  // ===== ROOM TYPES API =====
  async getRoomTypesByHotel(hotelId: string): Promise<any[]> {
    return this.request<any[]>('GET', `/api/hotels/${hotelId}/room-types`);
  }

  async updateRoomType(roomTypeId: string, roomTypeData: any): Promise<any> {
    return this.request<any>('PUT', `/api/room-types/${roomTypeId}`, roomTypeData);
  }

  async deleteRoomType(roomTypeId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/room-types/${roomTypeId}`);
  }

  // ===== ADMIN API =====
  async getAdminStats(): Promise<any> {
    return this.request<any>('GET', '/api/admin/stats');
  }

  async getAdminRides(): Promise<any> {
    return this.request<any>('GET', '/api/admin/rides');
  }

  async getAdminBookings(): Promise<any> {
    return this.request<any>('GET', '/api/admin/bookings');
  }

  // ===== PARTNERSHIPS API =====
  async createPartnership(partnershipData: { partnerId: string; type: 'driver-hotel' | 'hotel-driver'; terms: string }): Promise<any> {
    // ✅ CORREÇÃO: Adicionar userId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar parcerias.');
    }

    const partnershipDataWithUser = {
      ...partnershipData,
      userId: user.uid,
      createdBy: user.uid
    };

    return this.request<any>('POST', '/api/partnerships/create', partnershipDataWithUser);
  }

  async getPartnershipRequests(): Promise<any> {
    return this.request<any>('GET', '/api/partnerships/requests');
  }

  // ===== EVENTS API =====
  async getEvents(): Promise<any> {
    return this.request<any>('GET', '/api/events');
  }

  async createEvent(eventData: any): Promise<any> {
    // ✅ CORREÇÃO: Adicionar hostId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar eventos.');
    }

    const eventDataWithHost = {
      ...eventData,
      hostId: user.uid,
      createdBy: user.uid
    };

    return this.request<any>('POST', '/api/events/create', eventDataWithHost);
  }

  // ===== FEATURED OFFERS API =====
  async getFeaturedOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('GET', '/api/offers/featured');
  }

  // ===== CHAT API =====
  async getChatRooms(): Promise<any> {
    return this.request<any>('GET', '/api/chat/rooms');
  }

  async getChatMessages(roomId: string): Promise<any> {
    return this.request<any>('GET', `/api/chat/messages/${roomId}`);
  }

  async sendMessage(roomId: string, message: string): Promise<any> {
    return this.request<any>('POST', `/api/chat/messages/${roomId}`, { message });
  }

  // ===== NOVOS MÉTODOS PARA HOTEL MANAGEMENT =====
  
  /**
   * Obter todos os hotéis de um usuário (host)
   */
  async getUserHotels(): Promise<any[]> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    // ✅ CORREÇÃO: Enviar hostId como parâmetro ou usar endpoint específico
    return this.request<any[]>('GET', `/api/hotels/user/${user.uid}`);
  }

  /**
   * Atualizar hotel completo
   */
  async updateHotel(hotelId: string, hotelData: any): Promise<any> {
    return this.request<any>('PUT', `/api/hotels/${hotelId}/update-complete`, hotelData);
  }

  /**
   * Obter disponibilidade de quartos
   */
  async getRoomAvailability(hotelId: string, checkIn: string, checkOut: string): Promise<any> {
    const searchParams = new URLSearchParams();
    searchParams.append('checkIn', checkIn);
    searchParams.append('checkOut', checkOut);
    return this.request<any>('GET', `/api/hotels/${hotelId}/availability?${searchParams.toString()}`);
  }

  /**
   * Obter reviews de um hotel
   */
  async getHotelReviews(hotelId: string): Promise<any[]> {
    return this.request<any[]>('GET', `/api/hotels/${hotelId}/reviews`);
  }

  /**
   * Criar review para um hotel
   */
  async createHotelReview(hotelId: string, reviewData: any): Promise<any> {
    // ✅ CORREÇÃO: Adicionar userId automaticamente
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para criar reviews.');
    }

    const reviewDataWithUser = {
      ...reviewData,
      userId: user.uid,
      userName: user.displayName || user.email,
      createdBy: user.uid
    };

    return this.request<any>('POST', `/api/hotels/${hotelId}/reviews`, reviewDataWithUser);
  }
}

export const apiService = new ApiService();
export default apiService;