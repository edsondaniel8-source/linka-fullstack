// src/types/hotel-v2.types.ts
export interface HotelV2 {
  hotel_id: string;
  hotel_name: string;
  description?: string;
  address: string;
  locality: string;
  province: string;
  lat?: string;
  lng?: string;
  distance_km?: number;
  available_room_types?: RoomTypeV2[];
  min_price_per_night?: string;
  max_price_per_night?: string;
  match_score?: number;
  total_available_rooms?: number;
  amenities?: string[];
  images?: string[];
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive';
}

export interface RoomTypeV2 {
  room_type_id: string;
  room_type_name: string;
  base_price: number;
  max_occupancy: number;
  available_units: number;
  price_per_night: number;
  total_price: number;
  amenities: string[];
  images: string[];
  extra_adult_price: number;
  extra_child_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface SearchParamsV2 {
  location: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  rooms?: number;
  page?: number;
  limit?: number;
  min_price?: number;
  max_price?: number;
  amenities?: string[];
  sort_by?: 'price' | 'distance' | 'rating';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResponseV2 {
  success: boolean;
  data: {
    hotels: HotelV2[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    summary: {
      total_hotels: number;
      min_price: number;
      max_price: number;
      available_rooms: number;
    };
  };
  error?: string;
}

export interface HotelDetailsV2 {
  hotel: HotelV2;
  room_types: RoomTypeV2[];
  policies?: {
    check_in?: string;
    check_out?: string;
    cancellation?: string;
    children_policy?: string;
    pet_policy?: string;
  };
  reviews?: {
    average_rating: number;
    total_reviews: number;
  };
}

export interface CreateHotelRequestV2 {
  hotel_name: string;
  description?: string;
  address: string;
  locality: string;
  province: string;
  lat?: string;
  lng?: string;
  amenities?: string[];
  images?: string[];
  contact_email?: string;
  contact_phone?: string;
}

export interface UpdateHotelRequestV2 {
  hotel_name?: string;
  description?: string;
  address?: string;
  locality?: string;
  province?: string;
  lat?: string;
  lng?: string;
  amenities?: string[];
  images?: string[];
  status?: 'active' | 'inactive';
}

export interface BookingRequestV2 {
  hotel_id: string;
  room_type_id: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  special_requests?: string;
}

export interface BookingResponseV2 {
  success: boolean;
  data: {
    booking_id: string;
    hotel_name: string;
    room_type_name: string;
    checkin: string;
    checkout: string;
    total_nights: number;
    total_price: number;
    booking_status: 'confirmed' | 'pending' | 'cancelled';
    confirmation_number: string;
  };
  error?: string;
}