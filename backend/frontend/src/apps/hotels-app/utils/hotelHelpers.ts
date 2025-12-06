// src/apps/hotels-app/utils/hotelHelpers.ts

// Formatar preço em Meticais
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Calcular receita estimada
export function calculateEstimatedRevenue(
  pricePerNight: number,
  availableRooms: number,
  occupancyRate: number = 0.7,
  days: number = 30
): number {
  const estimatedNights = availableRooms * occupancyRate * days;
  return pricePerNight * estimatedNights;
}

// Gerar slug para hotel
export function generateHotelSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validar telefone moçambicano
export function isValidMozambicanPhone(phone: string): boolean {
  const regex = /^(\+258|258)?\s?(8[2-7]|84|85|86|87)\s?[0-9]{3}\s?[0-9]{3}$/;
  return regex.test(phone.replace(/\s+/g, ''));
}

// Formatar telefone moçambicano
export function formatMozambicanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('258')) {
    return `+258 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  if (cleaned.startsWith('8')) {
    return `+258 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
}

// Calcular taxa de ocupação
export function calculateOccupancyRate(
  totalRooms: number,
  occupiedRooms: number,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): number {
  if (totalRooms === 0) return 0;
  
  let multiplier = 1;
  if (period === 'weekly') multiplier = 7;
  if (period === 'monthly') multiplier = 30;
  
  const availableRoomNights = totalRooms * multiplier;
  const occupiedRoomNights = occupiedRooms * multiplier;
  
  return (occupiedRoomNights / availableRoomNights) * 100;
}

// Agrupar amenidades por categoria
export const AMENITY_CATEGORIES = {
  geral: ['Wi-Fi Gratuito', 'Estacionamento', 'Recepção 24h', 'Ar Condicionado Central'],
  alimentacao: ['Pequeno-Almoço', 'Restaurante', 'Bar', 'Room Service'],
  lazer: ['Piscina', 'Ginásio', 'Spa', 'Sauna', 'Jacuzzi'],
  quarto: ['TV por Cabo', 'Cofre', 'Minibar', 'Varanda', 'Vista Mar'],
  servicos: ['Lavandaria', 'Serviço de Limpeza Diário', 'Serviço de Transfer', 'Business Center'],
};

// Verificar se hotel tem todas as amenidades necessárias
export function hasRequiredAmenities(
  hotelAmenities: string[],
  requiredAmenities: string[]
): boolean {
  return requiredAmenities.every(amenity => hotelAmenities.includes(amenity));
}

// Ordenar hotéis por relevância
export function sortHotelsByRelevance(
  hotels: any[],
  userPreferences: {
    amenities?: string[];
    maxPrice?: number;
    location?: string;
  }
): any[] {
  return [...hotels].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Pontuar por amenities
    if (userPreferences.amenities) {
      const matchA = userPreferences.amenities.filter(amenity => 
        a.amenities?.includes(amenity)
      ).length;
      const matchB = userPreferences.amenities.filter(amenity => 
        b.amenities?.includes(amenity)
      ).length;
      
      scoreA += matchA * 10;
      scoreB += matchB * 10;
    }

    // Pontuar por preço
    if (userPreferences.maxPrice) {
      if (a.pricePerNight <= userPreferences.maxPrice) scoreA += 5;
      if (b.pricePerNight <= userPreferences.maxPrice) scoreB += 5;
    }

    // Pontuar por localização
    if (userPreferences.location && a.address && b.address) {
      if (a.address.toLowerCase().includes(userPreferences.location.toLowerCase())) scoreA += 15;
      if (b.address.toLowerCase().includes(userPreferences.location.toLowerCase())) scoreB += 15;
    }

    // Pontuar por avaliação
    scoreA += (a.rating || 0) * 2;
    scoreB += (b.rating || 0) * 2;

    return scoreB - scoreA;
  });
}

// Calcular preço total da estadia
export function calculateStayPrice(
  pricePerNight: number,
  checkIn: Date,
  checkOut: Date,
  guests: number = 2,
  extraGuestPrice: number = 0
): {
  totalNights: number;
  basePrice: number;
  extraGuestCost: number;
  totalPrice: number;
} {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const basePrice = pricePerNight * nights;
  const extraGuests = Math.max(0, guests - 2);
  const extraGuestCost = extraGuestPrice * extraGuests * nights;
  const totalPrice = basePrice + extraGuestCost;

  return {
    totalNights: nights,
    basePrice,
    extraGuestCost,
    totalPrice,
  };
}

// Gerar código de reserva
export function generateBookingCode(hotelId: string, date: Date): string {
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HOT${hotelId.slice(0, 3)}${dateStr}${random}`;
}

// Validar datas de check-in/check-out
export function validateStayDates(
  checkIn: Date,
  checkOut: Date,
  minStay: number = 1,
  maxStay: number = 30
): {
  isValid: boolean;
  error?: string;
  nights: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);

  const checkOutDate = new Date(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);

  // Verificar se check-in é no futuro
  if (checkInDate < today) {
    return {
      isValid: false,
      error: 'Check-in deve ser uma data futura',
      nights: 0,
    };
  }

  // Verificar se check-out é depois do check-in
  if (checkOutDate <= checkInDate) {
    return {
      isValid: false,
      error: 'Check-out deve ser após o check-in',
      nights: 0,
    };
  }

  // Calcular número de noites
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Verificar estadia mínima
  if (nights < minStay) {
    return {
      isValid: false,
      error: `Estadia mínima é de ${minStay} noite(s)`,
      nights,
    };
  }

  // Verificar estadia máxima
  if (nights > maxStay) {
    return {
      isValid: false,
      error: `Estadia máxima é de ${maxStay} noites`,
      nights,
    };
  }

  return {
    isValid: true,
    nights,
  };
}

// Converter imagem para Base64 (para preview)
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Truncar texto
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Formatar data para exibição
export function formatDateDisplay(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: format === 'long' ? 'long' : undefined,
    year: 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    day: '2-digit',
  };

  return dateObj.toLocaleDateString('pt-MZ', options);
}

// Calcular distância entre coordenadas (em km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Gerar cor baseada no status
export function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
    case 'available':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'pending':
    case 'processing':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
      };
    case 'cancelled':
    case 'unavailable':
    case 'inactive':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
      };
    case 'completed':
    case 'checked-out':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
      };
  }
}

// Exportar todos os utilitários
export default {
  formatPrice,
  calculateEstimatedRevenue,
  generateHotelSlug,
  isValidMozambicanPhone,
  formatMozambicanPhone,
  calculateOccupancyRate,
  AMENITY_CATEGORIES,
  hasRequiredAmenities,
  sortHotelsByRelevance,
  calculateStayPrice,
  generateBookingCode,
  validateStayDates,
  imageToBase64,
  truncateText,
  formatDateDisplay,
  calculateDistance,
  getStatusColor,
};