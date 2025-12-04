import { db } from '../../../db';
import { sql } from 'drizzle-orm';
import { hotels, room_types, room_availability, hotel_bookings } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

// Para usar funções SQL diretas, precisamos do client do postgres
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://linka_user:@localhost:5432/linka2_database';
const sqlClient = postgres(connectionString);

// Helper function para executar queries SQL cruas
async function executeRawQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sqlClient.unsafe(query, params || []);
    return result as unknown as T[];
  } catch (error) {
    console.error('Error executing raw query:', error);
    throw error;
  }
}

export class NewHotelService {
  
  /**
   * Busca inteligente de hotéis usando função PostgreSQL otimizada
   */
  async searchHotelsSmart(params: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    roomType?: string;
    maxPrice?: number;
    amenities?: string[];
    radius?: number;
    limit?: number;
  }) {
    try {
      const {
        location = '',
        checkIn,
        checkOut,
        guests = 2,
        roomType,
        maxPrice,
        amenities,
        radius = 10,
        limit = 20
      } = params;

      const query = `
        SELECT * FROM search_hotels_smart_professional(
          search_location := $1,
          search_radius_km := $2,
          check_in_date := $3::date,
          check_out_date := $4::date,
          guests := $5,
          room_type_filter := $6,
          max_price := $7,
          required_amenities := $8::text[],
          max_results := $9
        );
      `;

      const rows = await executeRawQuery(query, [
        location,
        radius,
        checkIn || null,
        checkOut || null,
        guests,
        roomType || null,
        maxPrice || null,
        amenities || null,
        limit
      ]);
      
      return {
        success: true,
        data: rows,
        count: rows.length
      };
    } catch (error) {
      console.error('Error in searchHotelsSmart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        count: 0
      };
    }
  }

  /**
   * Verificar disponibilidade detalhada
   */
  async checkAvailabilityDetailed(params: {
    hotelId: string;
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    units?: number;
    promoCode?: string;
  }) {
    try {
      const {
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        units = 1,
        promoCode
      } = params;

      const query = `
        SELECT * FROM check_hotel_availability_detailed(
          p_hotel_id := $1::uuid,
          p_room_type_id := $2::uuid,
          p_check_in := $3::date,
          p_check_out := $4::date,
          p_units := $5,
          p_promo_code := $6
        );
      `;

      const rows = await executeRawQuery(query, [
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        units,
        promoCode || null
      ]);
      
      const row = rows[0] || null;
      
      return {
        success: true,
        data: row
      };
    } catch (error) {
      console.error('Error in checkAvailabilityDetailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Criar reserva usando função PostgreSQL
   */
  async createBookingProfessional(params: {
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
  }) {
    try {
      const {
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        adults = 2,
        children = 0,
        units = 1,
        specialRequests,
        promoCode
      } = params;

      const query = `
        SELECT * FROM create_hotel_booking_professional(
          p_hotel_id := $1::uuid,
          p_room_type_id := $2::uuid,
          p_check_in := $3::date,
          p_check_out := $4::date,
          p_adults := $5,
          p_children := $6,
          p_units := $7,
          p_guest_name := $8,
          p_guest_email := $9,
          p_guest_phone := $10,
          p_special_requests := $11,
          p_promo_code := $12
        );
      `;

      const rows = await executeRawQuery(query, [
        hotelId,
        roomTypeId,
        checkIn,
        checkOut,
        adults,
        children,
        units,
        guestName,
        guestEmail,
        guestPhone || null,
        specialRequests || null,
        promoCode || null
      ]);
      
      const bookingResult = rows[0] || null;
      
      if (bookingResult?.success) {
        return {
          success: true,
          booking: bookingResult,
          bookingId: bookingResult.booking_id
        };
      } else {
        return {
          success: false,
          error: bookingResult?.error || 'Failed to create booking',
          booking: bookingResult
        };
      }
    } catch (error) {
      console.error('Error in createBookingProfessional:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        booking: null
      };
    }
  }

  /**
   * Obter detalhes da reserva
   */
  async getBookingDetails(bookingId: string) {
    try {
      const query = `
        SELECT * FROM get_booking_details($1::uuid);
      `;

      const rows = await executeRawQuery(query, [bookingId]);
      const bookingDetails = rows[0] || null;
      
      if (bookingDetails?.success) {
        return {
          success: true,
          booking: bookingDetails.booking
        };
      } else {
        return {
          success: false,
          error: bookingDetails?.error || 'Booking not found',
          booking: null
        };
      }
    } catch (error) {
      console.error('Error in getBookingDetails:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        booking: null
      };
    }
  }

  /**
   * Gerenciar reserva (cancelar, check-in, check-out)
   */
  async manageBooking(params: {
    action: 'create' | 'cancel' | 'check_in' | 'check_out' | 'confirm' | 'update';
    bookingData: any;
  }) {
    try {
      const { action, bookingData } = params;
      
      const query = `
        SELECT * FROM manage_booking($1, $2::jsonb);
      `;

      const rows = await executeRawQuery(query, [action, JSON.stringify(bookingData)]);
      const manageResult = rows[0] || null;
      
      return manageResult || { success: false, error: 'No result from manage_booking function' };
    } catch (error) {
      console.error('Error in manageBooking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obter reservas por email
   */
  async getBookingsByEmail(email: string, status?: string) {
    try {
      const query = `
        SELECT * FROM get_bookings_by_email($1, $2);
      `;

      const rows = await executeRawQuery(query, [email, status || null]);
      const bookingsResult = rows[0] || null;
      
      return bookingsResult || { success: false, bookings: [], count: 0 };
    } catch (error) {
      console.error('Error in getBookingsByEmail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        bookings: [],
        count: 0
      };
    }
  }

  /**
   * Verificar disponibilidade em tempo real
   */
  async checkRealTimeAvailability(params: {
    roomTypeId: string;
    checkIn: string;
    checkOut: string;
    units?: number;
  }) {
    try {
      const { roomTypeId, checkIn, checkOut, units = 1 } = params;
      
      const query = `
        SELECT * FROM check_real_time_availability(
          p_room_type_id := $1::uuid,
          p_check_in := $2::date,
          p_check_out := $3::date,
          p_units := $4
        );
      `;

      const rows = await executeRawQuery(query, [
        roomTypeId,
        checkIn,
        checkOut,
        units
      ]);

      const availabilityResult = rows[0] || null;
      return availabilityResult || { available: false, error: 'No availability data' };
    } catch (error) {
      console.error('Error in checkRealTimeAvailability:', error);
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obter estatísticas do hotel
   */
  async getHotelStats(hotelId: string) {
    try {
      const query = `
        SELECT * FROM get_hotel_stats($1::uuid);
      `;

      const rows = await executeRawQuery(query, [hotelId]);
      return rows[0] || {};
    } catch (error) {
      console.error('Error in getHotelStats:', error);
      return {};
    }
  }

  /**
   * Criar hotel
   */
  async createHotel(data: {
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
  }) {
    try {
      const result = await db.insert(hotels).values({
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        address: data.address,
        locality: data.locality,
        province: data.province,
        lat: data.lat ? data.lat.toString() : null,
        lng: data.lng ? data.lng.toString() : null,
        images: data.images || [],
        amenities: data.amenities || [],
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        host_id: data.hostId,
        check_in_time: '14:00:00',
        check_out_time: '12:00:00',
        policies: data.policies,
        rating: '0.00',
        total_reviews: 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: data.hostId,
        updated_by: data.hostId
      }).returning();

      return {
        success: true,
        hotel: result[0],
        hotelId: result[0].id
      };
    } catch (error) {
      console.error('Error in createHotel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Atualizar disponibilidade em massa
   */
  async bulkUpdateAvailability(params: {
    hotelId: string;
    roomTypeId: string;
    startDate: string;
    endDate: string;
    price?: number;
    availableUnits?: number;
    stopSell?: boolean;
  }) {
    try {
      const {
        hotelId,
        roomTypeId,
        startDate,
        endDate,
        price,
        availableUnits,
        stopSell = false
      } = params;

      const query = `
        SELECT * FROM bulk_update_availability(
          p_hotel_id := $1::uuid,
          p_room_type_id := $2::uuid,
          p_start_date := $3::date,
          p_end_date := $4::date,
          p_price := $5,
          p_available_units := $6,
          p_stop_sell := $7
        );
      `;

      const rows = await executeRawQuery(query, [
        hotelId,
        roomTypeId,
        startDate,
        endDate,
        price || null,
        availableUnits || null,
        stopSell
      ]);

      const bulkResult = rows[0] || null;
      return bulkResult || { success: false, error: 'No result from bulk_update_availability' };
    } catch (error) {
      console.error('Error in bulkUpdateAvailability:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Obter performance do hotel
   */
  async getHotelPerformance(hotelId: string, startDate?: string, endDate?: string) {
    try {
      const query = `
        SELECT * FROM get_hotel_performance(
          p_hotel_id := $1::uuid,
          p_start_date := $2::date,
          p_end_date := $3::date
        );
      `;

      const rows = await executeRawQuery(query, [
        hotelId,
        startDate || null,
        endDate || null
      ]);

      return rows[0] || {};
    } catch (error) {
      console.error('Error in getHotelPerformance:', error);
      return {};
    }
  }

  /**
   * Obter todos os hotéis (para admin)
   */
  async getAllHotels(limit: number = 50, offset: number = 0) {
    try {
      const hotelsList = await db
        .select()
        .from(hotels)
        .where(eq(hotels.is_active, true))
        .limit(limit)
        .offset(offset)
        .orderBy(hotels.created_at);

      return {
        success: true,
        data: hotelsList,
        count: hotelsList.length
      };
    } catch (error) {
      console.error('Error in getAllHotels:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
        count: 0
      };
    }
  }

  /**
   * Obter hotel por ID
   */
  async getHotelById(hotelId: string) {
    try {
      const [hotel] = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotelId))
        .limit(1);

      if (!hotel) {
        return {
          success: false,
          error: 'Hotel not found',
          data: null
        };
      }

      return {
        success: true,
        data: hotel
      };
    } catch (error) {
      console.error('Error in getHotelById:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  /**
   * Atualizar hotel
   */
  async updateHotel(hotelId: string, data: Partial<{
    name: string;
    description: string;
    address: string;
    locality: string;
    province: string;
    lat: number;
    lng: number;
    images: string[];
    amenities: string[];
    contactEmail: string;
    contactPhone: string;
    policies: string;
    isActive: boolean;
  }>) {
    try {
      const updateData: any = {
        updated_at: new Date()
      };

      // Mapear campos
      if (data.name !== undefined) {
        updateData.name = data.name;
        updateData.slug = data.name.toLowerCase().replace(/\s+/g, '-');
      }
      if (data.description !== undefined) updateData.description = data.description;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.locality !== undefined) updateData.locality = data.locality;
      if (data.province !== undefined) updateData.province = data.province;
      if (data.lat !== undefined) updateData.lat = data.lat.toString();
      if (data.lng !== undefined) updateData.lng = data.lng.toString();
      if (data.images !== undefined) updateData.images = data.images;
      if (data.amenities !== undefined) updateData.amenities = data.amenities;
      if (data.contactEmail !== undefined) updateData.contact_email = data.contactEmail;
      if (data.contactPhone !== undefined) updateData.contact_phone = data.contactPhone;
      if (data.policies !== undefined) updateData.policies = data.policies;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const result = await db
        .update(hotels)
        .set(updateData)
        .where(eq(hotels.id, hotelId))
        .returning();

      if (result.length === 0) {
        return {
          success: false,
          error: 'Hotel not found'
        };
      }

      return {
        success: true,
        hotel: result[0],
        message: 'Hotel updated successfully'
      };
    } catch (error) {
      console.error('Error in updateHotel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Desativar hotel
   */
  async deactivateHotel(hotelId: string) {
    try {
      const result = await db
        .update(hotels)
        .set({
          is_active: false,
          updated_at: new Date()
        })
        .where(eq(hotels.id, hotelId))
        .returning();

      if (result.length === 0) {
        return {
          success: false,
          error: 'Hotel not found'
        };
      }

      return {
        success: true,
        message: 'Hotel deactivated successfully'
      };
    } catch (error) {
      console.error('Error in deactivateHotel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  close() {
    return sqlClient.end();
  }
}

export const newHotelService = new NewHotelService();
