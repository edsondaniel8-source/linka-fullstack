// src/types/hotelbooking.interfaces.ts
// ✅ VERSÃO COMPLETA E COMPATÍVEL COM hotels.interfaces.ts

// ====================== TIPOS DE STATUS ======================
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed';

// ====================== REQUISIÇÃO PARA CRIAR RESERVA ======================
export interface HotelBookingRequest {
  hotelId: string;
  roomTypeId: string;
  
  checkIn: string;           // Data de check-in (YYYY-MM-DD)
  checkOut: string;          // Data de check-out (YYYY-MM-DD)
  
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  
  adults?: number;           // ✅ Tornado opcional para compatibilidade
  children?: number;         // ✅ Tornado opcional para compatibilidade
  units?: number;            // ✅ Tornado opcional para compatibilidade
  
  specialRequests?: string;
  promoCode?: string;
}

// ====================== ESTRUTURA DETALHADA DA RESERVA ======================
export interface HotelBookingData {
  // ✅ Campos camelCase (formato TypeScript/JavaScript)
  bookingId?: string;
  hotelId?: string;
  roomTypeId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  adults?: number;
  children?: number;
  units?: number;
  basePrice?: number;
  extraCharges?: number;
  totalPrice?: number;
  specialRequests?: string;
  status?: BookingStatus;    // ✅ Usando tipo correto (underscore)
  paymentStatus?: PaymentStatus;
  promoCode?: string;
  createdAt?: string;
  updatedAt?: string;
  confirmationCode?: string;
  
  // ✅ Campos snake_case (formato backend/API)
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

// ====================== RESPOSTA AO CRIAR RESERVA ======================
export interface HotelBookingResponse {
  success: boolean;
  bookingId?: string;        // ID da reserva criada (camelCase)
  booking_id?: string;       // ID da reserva criada (snake_case)
  booking?: HotelBookingData; // Detalhes da reserva
  message?: string;          // Mensagem da API
  error?: string;            // Erro, se houver
  
  // ✅ Campos de preço em ambos formatos
  totalPrice?: number;
  total_price?: number;
  
  // ✅ Campos de confirmação em ambos formatos
  confirmationCode?: string;
  confirmation_code?: string;
}

// ====================== RESPOSTA DA API PARA RESERVAS DO USUÁRIO ======================
export interface MyHotelBookingsResponse {
  success: boolean;
  bookings?: HotelBookingData[];
  count?: number;
  error?: string;
}

// ====================== TIPOS ADICIONAIS PARA COMPATIBILIDADE ======================

// ✅ Interface para cancelar reserva
export interface CancelBookingRequest {
  bookingId: string;
  reason?: string;
}

// ✅ Interface para atualizar reserva
export interface UpdateBookingRequest {
  bookingId: string;
  checkIn?: string;
  checkOut?: string;
  guests?: {
    adults?: number;
    children?: number;
  };
  specialRequests?: string;
}

// ✅ Interface para buscar reservas com filtros
export interface BookingsFilter {
  status?: BookingStatus;
  hotelId?: string;
  roomTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  email?: string;
}

// ====================== TIPOS PARA CONFIRMAÇÃO DE PAGAMENTO ======================
export interface PaymentConfirmationRequest {
  bookingId: string;
  paymentMethod: string;
  transactionId?: string;
  amount: number;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  bookingId?: string;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  message?: string;
  error?: string;
}

// ====================== EXPORT ALL TYPES ======================
export type {
  BookingStatus as IBookingStatus,
  PaymentStatus as IPaymentStatus,
  HotelBookingRequest as IHotelBookingRequest,
  HotelBookingData as IHotelBookingData,
  HotelBookingResponse as IHotelBookingResponse,
  MyHotelBookingsResponse as IMyHotelBookingsResponse,
  CancelBookingRequest as ICancelBookingRequest,
  UpdateBookingRequest as IUpdateBookingRequest,
  BookingsFilter as IBookingsFilter,
  PaymentConfirmationRequest as IPaymentConfirmationRequest,
  PaymentConfirmationResponse as IPaymentConfirmationResponse
};