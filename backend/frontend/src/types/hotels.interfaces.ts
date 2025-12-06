// src/types/hotels.interfaces.ts

// ====================== HOTEL ======================
export interface Hotel {
  id: string;
  hotel_id: string;
  hotel_name: string;
  name: string;
  slug?: string;
  hotel_slug?: string;

  description?: string;
  address: string;
  locality: string;
  province: string;
  country?: string;

  lat?: number | string;
  lng?: number | string;

  images?: string[];
  amenities?: string[];

  distance_km?: number;

  min_price_per_night?: number;
  max_price_per_night?: number;
  rating?: string | number;
  total_reviews?: number;

  contact_email: string;
  contact_phone?: string;

  check_in_time?: string;
  check_out_time?: string;
  policies?: string;

  host_id?: string;
  created_by?: string;
  updated_by?: string;

  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;

  available_room_types?: RoomType[];
  match_score?: number;
  total_available_rooms?: number;

  // Fields for compatibility
  price_range?: {
    min: number;
    max: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

// ====================== ROOM TYPE ======================
export interface RoomType {
  id: string;
  room_type_id: string;
  room_type_name: string;
  name: string;

  hotel_id?: string;

  description?: string;
  amenities?: string[];
  images?: string[];

  base_price: number;
  total_units: number;

  base_occupancy: number;
  max_occupancy: number;

  size?: string;
  bed_type?: string;
  bed_types?: string[];
  bathroom_type?: string;

  available_units?: number;
  price_per_night?: number;
  total_price?: number;

  extra_adult_price?: number;
  extra_child_price?: number;
  children_policy?: string;

  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;

  // Availability fields
  availability?: {
    available: boolean;
    available_units: number;
    min_nights?: number;
    max_nights?: number;
  };
}

// ====================== HOTEL MANAGEMENT ======================

// Request para criar hotel
export interface HotelCreateRequest {
  name: string;
  description?: string;
  address: string;
  locality: string;
  province: string;
  lat?: number;
  lng?: number;
  images?: string[];
  amenities?: string[];
  contactEmail: string;
  contactPhone?: string;
  hostId?: string;
  policies?: string;
  checkInTime?: string;
  checkOutTime?: string;
  country?: string;
}

// Request para atualizar hotel
export interface HotelUpdateRequest {
  name?: string;
  description?: string;
  address?: string;
  locality?: string;
  province?: string;
  lat?: number;
  lng?: number;
  images?: string[];
  amenities?: string[];
  contactEmail?: string;
  contactPhone?: string;
  policies?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isActive?: boolean;
  country?: string;
}

// Request para criar tipo de quarto
export interface RoomTypeCreateRequest {
  name: string;
  description?: string;
  maxOccupancy: number;
  baseOccupancy?: number;
  basePrice: number;
  size?: string;
  bedType?: string;
  bedTypes?: string[];
  bathroomType?: string;
  amenities?: string[];
  images?: string[];
  availableUnits: number;
  totalUnits: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  childrenPolicy?: string;
}

// Request para atualizar tipo de quarto
export interface RoomTypeUpdateRequest {
  name?: string;
  description?: string;
  maxOccupancy?: number;
  baseOccupancy?: number;
  basePrice?: number;
  size?: string;
  bedType?: string;
  bedTypes?: string[];
  bathroomType?: string;
  amenities?: string[];
  images?: string[];
  availableUnits?: number;
  totalUnits?: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  childrenPolicy?: string;
  isActive?: boolean;
}

// Request para atualização em massa de disponibilidade
export interface BulkAvailabilityUpdate {
  roomTypeId: string;
  startDate: string;
  endDate: string;
  price?: number;
  availableUnits?: number;
  stopSell?: boolean;
}

// Response para operações de hotel
export interface HotelOperationResponse {
  success: boolean;
  hotel?: Hotel;
  hotelId?: string;
  roomType?: RoomType;
  roomTypeId?: string;
  message?: string;
  error?: string;
  details?: any;
}

// Response para listagem de hotéis
export interface HotelListResponse {
  success: boolean;
  data?: Hotel[];
  hotels?: Hotel[];
  count?: number;
  total?: number;
  error?: string;
}

// Response para tipos de quarto
export interface RoomTypeListResponse {
  success: boolean;
  data?: RoomType[];
  roomTypes?: RoomType[];
  count?: number;
  total?: number;
  error?: string;
}

// ====================== HOTEL STATISTICS ======================
export interface HotelStatistics {
  total_bookings?: number;
  total_revenue?: number;
  occupancy_rate?: number;
  average_daily_rate?: number;
  revenue_per_available_room?: number;
  upcoming_bookings?: number;
  current_guests?: number;
  available_rooms?: number;
  cancelled_bookings?: number;
  monthly_revenue?: {
    month: string;
    revenue: number;
    bookings: number;
  }[];
  top_room_types?: {
    room_type_id: string;
    room_type_name: string;
    bookings: number;
    revenue: number;
    occupancy: number;
  }[];
}

// ====================== HOTEL PERFORMANCE ======================
export interface HotelPerformance {
  period: {
    start_date: string;
    end_date: string;
  };
  metrics: {
    total_revenue: number;
    total_bookings: number;
    total_cancellations: number;
    average_booking_value: number;
    occupancy_rate: number;
    average_daily_rate: number;
    revenue_per_available_room: number;
  };
  daily_metrics?: {
    date: string;
    revenue: number;
    bookings: number;
    occupancy: number;
    average_rate: number;
  }[];
  room_type_performance?: {
    room_type_id: string;
    room_type_name: string;
    revenue: number;
    bookings: number;
    occupancy: number;
    average_rate: number;
  }[];
}

// ====================== AVAILABILITY ======================
export interface RoomAvailability {
  date: string;
  available_units: number;
  price: number;
  stop_sell: boolean;
  min_nights?: number;
  max_nights?: number;
}

export interface AvailabilityCalendar {
  room_type_id: string;
  room_type_name: string;
  calendar: RoomAvailability[];
}

// ====================== SEARCH RESPONSES ======================
export interface HotelSearchResponse {
  success: boolean;
  data: Hotel[];
  hotels?: Hotel[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  filters_applied?: {
    location?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    room_type?: string;
    max_price?: number;
    amenities?: string[];
  };
}

// ====================== COMPATIBILITY TYPES ======================

// Para compatibilidade com código existente
export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomType?: string;
  maxPrice?: number;
  amenities?: string[];
  radius?: number;
  limit?: number;
  page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// CORREÇÃO: Adicionar campos faltantes ao SearchResponse
export interface SearchResponse {
  success: boolean;
  data: Hotel[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  filters?: any;
  error?: string;
  metadata?: {
    total_count?: number;
    per_page?: number;
    has_more?: boolean;
  };
}

// ====================== UTILITY TYPES ======================
export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  locality?: string;
  province?: string;
  country?: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency?: string;
}

export interface HotelFilters {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  room_type?: string;
  price_range?: PriceRange;
  amenities?: string[];
  rating?: number;
  distance?: number;
}

// ====================== PAGINATION ======================
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ====================== HOTEL BOOKING RELATED ======================
export interface HotelBookingSummary {
  hotel_id: string;
  hotel_name: string;
  room_type_id: string;
  room_type_name: string;
  total_bookings: number;
  total_revenue: number;
  average_stay_length: number;
  cancellation_rate: number;
}

// ====================== AVAILABILITY CHECK ======================
export interface AvailabilityCheck {
  is_available?: boolean;
  available?: boolean;
  min_nights_required?: number;
  total_price?: number;
  nightly_prices?: NightlyPrice[];
  available_units?: number;
  message?: string;
  validation_errors?: string[];
  data?: any;
}

export interface NightlyPrice {
  date: string;
  base_price: number;
  season_multiplier?: number;
  promotion_discount?: number;
  final_price: number;
  min_nights?: number;
  stop_sell?: boolean;
}

// ====================== HOTEL BOOKING TYPES ======================
export interface HotelBookingRequest {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  adults?: number;
  children?: number;
  units?: number;
  specialRequests?: string;
  promoCode?: string;
}

export interface HotelBookingData {
  // Campos camelCase
  bookingId?: string;
  hotelId?: string;
  roomTypeId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  units?: number;
  adults?: number;
  children?: number;
  basePrice?: number;
  extraCharges?: number;
  totalPrice?: number;
  specialRequests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  promoCode?: string;
  createdAt?: string;
  updatedAt?: string;
  confirmationCode?: string;
  
  // Campos snake_case para compatibilidade
  booking_id?: string;
  hotel_id?: string;
  room_type_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  check_in?: string;
  check_out?: string;
  base_price?: number;
  extra_charges?: number;
  total_price?: number;
  special_requests?: string;
  payment_status?: string;
  promo_code?: string;
  created_at?: string;
  updated_at?: string;
  confirmation_code?: string;
}

export interface HotelBookingResponse {
  success: boolean;
  booking?: HotelBookingData;
  bookingId?: string;
  error?: string;
  message?: string;
  total_price?: number;
  totalPrice?: number;
  confirmation_code?: string;
  confirmationCode?: string;
}

export interface MyHotelBookingsResponse {
  success: boolean;
  bookings?: HotelBookingData[];
  count?: number;
  error?: string;
}

// ====================== API SERVICE RESPONSE TYPES ======================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
}

// Response para getHotelById
export interface HotelByIdResponse extends ApiResponse<Hotel> {
  // Já inclui data?: Hotel
}

// Response para getRoomTypes
export interface RoomTypesResponse extends ApiResponse<RoomType[]> {
  // Já inclui data?: RoomType[]
}

// Response para checkAvailability
export interface AvailabilityResponse extends ApiResponse<AvailabilityCheck> {
  // Já inclui data?: AvailabilityCheck
}

// ====================== EXPORT ALL TYPES ======================
export type {
  Hotel as IHotel,
  RoomType as IRoomType,
  HotelCreateRequest as IHotelCreateRequest,
  HotelUpdateRequest as IHotelUpdateRequest,
  RoomTypeCreateRequest as IRoomTypeCreateRequest,
  RoomTypeUpdateRequest as IRoomTypeUpdateRequest,
  BulkAvailabilityUpdate as IBulkAvailabilityUpdate,
  HotelOperationResponse as IHotelOperationResponse,
  HotelListResponse as IHotelListResponse,
  RoomTypeListResponse as IRoomTypeListResponse,
  HotelStatistics as IHotelStatistics,
  HotelPerformance as IHotelPerformance,
  RoomAvailability as IRoomAvailability,
  AvailabilityCalendar as IAvailabilityCalendar,
  HotelSearchResponse as IHotelSearchResponse,
  SearchParams as ISearchParams,
  SearchResponse as ISearchResponse,
  GeoLocation as IGeoLocation,
  PriceRange as IPriceRange,
  HotelFilters as IHotelFilters,
  PaginationParams as IPaginationParams,
  PaginatedResponse as IPaginatedResponse,
  HotelBookingSummary as IHotelBookingSummary,
  AvailabilityCheck as IAvailabilityCheck,
  NightlyPrice as INightlyPrice,
  HotelBookingRequest as IHotelBookingRequest,
  HotelBookingData as IHotelBookingData,
  HotelBookingResponse as IHotelBookingResponse,
  MyHotelBookingsResponse as IMyHotelBookingsResponse,
  ApiResponse as IApiResponse,
  HotelByIdResponse as IHotelByIdResponse,
  RoomTypesResponse as IRoomTypesResponse,
  AvailabilityResponse as IAvailabilityResponse
};