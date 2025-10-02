import { auth } from '@/shared/lib/firebaseConfig';
import { Booking, RideBookingRequest, HotelBookingRequest } from '@/shared/types/booking';

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
    const response = await fetch(url, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
    return response.json();
  }

  // ===== RIDES API =====
  async searchRides(params: { from?: string; to?: string; passengers?: number; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.passengers) searchParams.append('passengers', params.passengers.toString());
    if (params.date) searchParams.append('date', params.date);
    return this.request('GET', `/api/rides-simple/search?${searchParams.toString()}`);
  }

  async createRide(rideData: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    pricePerSeat: number;
    availableSeats: number;
    vehicleType?: string;
    additionalInfo?: string;
  }) {
    return this.request('POST', '/api/rides-simple/create', rideData);
  }

  // ===== BOOKINGS API =====
  async bookRide(bookingData: RideBookingRequest): Promise<{ success: boolean; booking: Booking }> {
    return this.request('POST', '/api/rides-simple/book', bookingData);
  }

  async bookHotel(bookingData: HotelBookingRequest): Promise<{ success: boolean; booking: Booking }> {
    return this.request('POST', '/api/bookings/create', bookingData);
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
    return this.request('GET', '/api/bookings/user');
  }

  // ===== USER/AUTH API =====
  async getUserProfile() {
    return this.request('GET', '/api/auth/profile');
  }

  async updateUserProfile(userData: any) {
    return this.request('PUT', '/api/auth/profile', userData);
  }

  // ===== HOTELS API =====
  async searchAccommodations(params: { location?: string; checkIn?: string; checkOut?: string; guests?: number }) {
    const searchParams = new URLSearchParams();
    if (params.location) searchParams.append('address', params.location);
    if (params.checkIn) searchParams.append('checkIn', params.checkIn);
    if (params.checkOut) searchParams.append('checkOut', params.checkOut);
    if (params.guests) searchParams.append('guests', params.guests.toString());
    searchParams.append('isAvailable', 'true');
    return this.request('GET', `/api/hotels?${searchParams.toString()}`);
  }

  async createAccommodation(accommodationData: any) {
    return this.request('POST', '/api/hotels', accommodationData);
  }

  // ===== HOTELS DETAIL/UPDATE/DELETE API =====
  async getHotelById(hotelId: string) {
    return this.request('GET', `/api/hotels/${hotelId}`);
  }

  async updateAccommodation(hotelId: string, accommodationData: any) {
    return this.request('PUT', `/api/hotels/${hotelId}`, accommodationData);
  }

  async deleteAccommodation(hotelId: string) {
    return this.request('DELETE', `/api/hotels/${hotelId}`);
  }

  // ===== ADMIN API =====
  async getAdminStats() {
    return this.request('GET', '/api/admin/stats');
  }

  async getAdminRides() {
    return this.request('GET', '/api/admin/rides');
  }

  async getAdminBookings() {
    return this.request('GET', '/api/admin/bookings');
  }

  // ===== PARTNERSHIPS API =====
  async createPartnership(partnershipData: { partnerId: string; type: 'driver-hotel' | 'hotel-driver'; terms: string }) {
    return this.request('POST', '/api/partnerships/create', partnershipData);
  }

  async getPartnershipRequests() {
    return this.request('GET', '/api/partnerships/requests');
  }

  // ===== EVENTS API =====
  async getEvents() {
    return this.request('GET', '/api/events');
  }

  async createEvent(eventData: any) {
    return this.request('POST', '/api/events/create', eventData);
  }

  // ===== FEATURED OFFERS API =====
  async getFeaturedOffers() {
    return this.request('GET', '/api/offers/featured');
  }

  // ===== CHAT API =====
  async getChatRooms() {
    return this.request('GET', '/api/chat/rooms');
  }

  async getChatMessages(roomId: string) {
    return this.request('GET', `/api/chat/messages/${roomId}`);
  }

  async sendMessage(roomId: string, message: string) {
    return this.request('POST', `/api/chat/messages/${roomId}`, { message });
  }
}

export const apiService = new ApiService();
export default apiService;