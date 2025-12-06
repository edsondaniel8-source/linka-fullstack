/**
 * Utilitários para migração de hotéis v1 → v2
 */

import { hotelMigrationConfig } from './hotel-migration.config';

// Tipos do schema v1 (antigo)
export interface HotelV1 {
  id: string;
  name: string;
  description?: string;
  address: string;
  locality: string;
  province: string;
  price?: number;
  amenities?: string[];
  images?: string[];
  // ... outros campos v1
}

// Tipos do schema v2 (novo)
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
}

/**
 * Adapta hotel v2 para o schema v1 (para compatibilidade)
 */
export function adaptHotelV2ToV1(hotelV2: HotelV2): HotelV1 {
  if (!hotelV2) return {} as HotelV1;
  
  return {
    id: hotelV2.hotel_id || '',
    name: hotelV2.hotel_name || '',
    description: hotelV2.description,
    address: hotelV2.address || '',
    locality: hotelV2.locality || '',
    province: hotelV2.province || '',
    price: hotelV2.min_price_per_night ? parseFloat(hotelV2.min_price_per_night) : 0,
    amenities: hotelV2.amenities || [],
    images: hotelV2.images || []
  };
}

/**
 * Adapta lista de hotéis v2 para v1
 */
export function adaptHotelsV2ToV1(hotelsV2: HotelV2[]): HotelV1[] {
  return hotelsV2.map(adaptHotelV2ToV1);
}

/**
 * Log de migração (apenas em debug mode)
 */
export function logMigration(message: string, data?: any) {
  if (hotelMigrationConfig.debugMode) {
    console.log(`[Hotel Migration] ${message}`, data || '');
  }
}

/**
 * Verifica se deve usar API v2 baseado na configuração
 */
export function shouldUseV2(feature: keyof typeof hotelMigrationConfig): boolean {
  return hotelMigrationConfig[feature] === true;
}
