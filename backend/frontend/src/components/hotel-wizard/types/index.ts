// src/components/hotel-wizard/types/index.ts
// ✅ TIPOS COMPLETOS E CONSISTENTES DO HOTEL WIZARD

export interface RoomFormData {
  id: string;
  name: string;
  description: string;
  type: string;
  quantity: number;
  maxOccupancy: number;
  baseOccupancy: number;
  basePrice: number;
  pricePerNight: number;
  size?: number; // ✅ Alterado para number (em metros quadrados)
  bedType?: string;
  bedTypes?: string[];
  bathroomType?: string;
  amenities: string[];
  images: (File | string)[];
  existingImages: string[];
  totalUnits: number;
  availableUnits: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  childrenPolicy?: string;
  isActive: boolean;
}

export interface HotelFormData {
  // Identificação
  id?: string;
  hotel_id?: string;
  
  // Informações básicas
  name: string;
  description: string;
  category: string;
  
  // Contato
  email: string;
  phone: string;
  
  // Localização
  address: string;
  city: string;
  state: string;
  locality: string;
  province: string;
  country: string;
  zipCode: string;
  
  // Coordenadas (consistentes com o sistema)
  lat?: number; // ✅ Alterado para number
  lng?: number; // ✅ Alterado para number
  location?: {
    lat: number;
    lng: number;
    address?: string;
  }; // ✅ Objeto GeoLocation, não string
  
  // Características
  amenities: string[];
  rooms: RoomFormData[];
  
  // Imagens
  images: (File | string)[];
  existingImages: string[];
  
  // Horários e políticas
  checkInTime: string;
  checkOutTime: string;
  policies: string[];
  
  // Status
  isActive: boolean;
}