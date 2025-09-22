import { eq, and, or, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { bookings, users, rides } from '../../shared/schema';
import { 
  BookingStats,
  PaymentData,
  Payment,
  DateRange 
} from '../types';
// Import from shared types
import { BookingStatus } from '../../src/shared/types';

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Simplified Booking interface matching actual schema
export interface Booking {
  id: string;
  rideId: string | null;
  accommodationId?: string | null;
  eventId?: string | null;
  passengerId: string | null;
  seatsBooked: number;
  totalPrice: string;
  status: string | null;
  type?: string; // 'ride', 'accommodation', 'event'
  createdAt: Date | null;
}

export interface CreateBookingData {
  rideId?: string;
  accommodationId?: string;
  eventId?: string;
  passengerId: string;
  seatsBooked: number;
  totalPrice: number;
  type?: string;
  providerId?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestName?: string;
}

export interface IBookingStorage {
  // Basic booking operations
  createBooking(data: CreateBookingData): Promise<Booking>;
  updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking>;
  cancelBooking(bookingId: string, reason: string): Promise<Booking>;
  getBooking(bookingId: string): Promise<Booking | undefined>;
  
  // User bookings
  getUserBookings(userId: string): Promise<Booking[]>;
  getProviderBookings(providerId: string): Promise<Booking[]>;
  
  // Business logic
  confirmBooking(bookingId: string): Promise<Booking>;
  completeBooking(bookingId: string): Promise<Booking>;
  processPayment(bookingId: string, paymentData: PaymentData): Promise<Payment>;
  
  // Analytics
  getBookingStatistics(dateRange?: DateRange): Promise<BookingStats>;
  getBookingsByStatus(status: BookingStatus): Promise<Booking[]>;
  
  // Additional methods needed by controllers
  updateBooking(bookingId: string, data: any): Promise<Booking>;
}

export class DatabaseBookingStorage implements IBookingStorage {
  
  // ===== BASIC BOOKING OPERATIONS =====
  
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const bookingData = {
        id: generateId(),
        rideId: data.rideId || null,
        passengerId: data.passengerId,
        seatsBooked: data.seatsBooked,
        totalPrice: data.totalPrice.toString(),
        status: 'pending',
        type: data.type || 'ride',
        guestEmail: data.guestEmail || '',
        guestPhone: data.guestPhone || '',
        guestName: data.guestName || 'Cliente',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [booking] = await db
        .insert(bookings)
        .values(bookingData)
        .returning();
      
      return booking as Booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    try {
      const [booking] = await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, bookingId))
        .returning();
      
      return booking as Booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }

  async cancelBooking(bookingId: string, reason: string): Promise<Booking> {
    try {
      const [booking] = await db
        .update(bookings)
        .set({ status: 'cancelled' })
        .where(eq(bookings.id, bookingId))
        .returning();
      
      return booking as Booking;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }

  async getBooking(bookingId: string): Promise<Booking | undefined> {
    try {
      const [booking] = await db
        .select({
          id: bookings.id,
          rideId: bookings.rideId,
          passengerId: bookings.passengerId,
          seatsBooked: bookings.seatsBooked,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(eq(bookings.id, bookingId));
      
      return booking as Booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return undefined;
    }
  }

  // ===== USER BOOKINGS =====
  
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const bookingList = await db
        .select({
          id: bookings.id,
          rideId: bookings.rideId,
          passengerId: bookings.passengerId,
          seatsBooked: bookings.seatsBooked,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(eq(bookings.passengerId, userId))
        .orderBy(desc(bookings.createdAt));

      return bookingList as Booking[];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  async getProviderBookings(providerId: string): Promise<Booking[]> {
    try {
      // Get bookings for rides owned by the provider (driver)
      const bookingList = await db
        .select({
          id: bookings.id,
          rideId: bookings.rideId,
          passengerId: bookings.passengerId,
          seatsBooked: bookings.seatsBooked,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .leftJoin(rides, eq(bookings.rideId, rides.id))
        .where(eq(rides.driverId, providerId))
        .orderBy(desc(bookings.createdAt));

      return bookingList as Booking[];
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      return [];
    }
  }

  // ===== BUSINESS LOGIC =====
  
  async confirmBooking(bookingId: string): Promise<Booking> {
    try {
      return this.updateBookingStatus(bookingId, 'confirmed');
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw error;
    }
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    try {
      return this.updateBookingStatus(bookingId, 'completed');
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  async processPayment(bookingId: string, paymentData: PaymentData): Promise<Payment> {
    try {
      // TODO: Implement payment processing with Stripe
      const payment: Payment = {
        id: `pay_${Date.now()}`,
        bookingId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'MZN',
        status: 'completed',
        method: paymentData.method,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update booking status to confirmed after successful payment
      await this.updateBookingStatus(bookingId, 'confirmed');

      return payment;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  // ===== ANALYTICS =====
  
  async getBookingStatistics(dateRange?: DateRange): Promise<BookingStats> {
    try {
      const [totalBookings] = await db
        .select({ count: sql`count(*)` })
        .from(bookings);

      const [completedBookings] = await db
        .select({ count: sql`count(*)` })
        .from(bookings)
        .where(eq(bookings.status, 'completed'));

      const [cancelledBookings] = await db
        .select({ count: sql`count(*)` })
        .from(bookings)
        .where(eq(bookings.status, 'cancelled'));

      const [totalRevenue] = await db
        .select({ sum: sql`SUM(CAST(${bookings.totalPrice} AS DECIMAL))` })
        .from(bookings)
        .where(eq(bookings.status, 'completed'));

      const [averageBookingValue] = await db
        .select({ avg: sql`AVG(CAST(${bookings.totalPrice} AS DECIMAL))` })
        .from(bookings);

      return {
        totalBookings: Number(totalBookings.count),
        completedBookings: Number(completedBookings.count),
        cancelledBookings: Number(cancelledBookings.count),
        totalRevenue: Number(totalRevenue.sum) || 0,
        averageBookingValue: Number(averageBookingValue.avg) || 0,
        bookingsByType: { ride: Number(totalBookings.count), accommodation: 0, event: 0 },
      };
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      return {
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        bookingsByType: { ride: 0, accommodation: 0, event: 0 },
      };
    }
  }

  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    try {
      const bookingList = await db
        .select({
          id: bookings.id,
          rideId: bookings.rideId,
          passengerId: bookings.passengerId,
          seatsBooked: bookings.seatsBooked,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
        })
        .from(bookings)
        .where(eq(bookings.status, status))
        .orderBy(desc(bookings.createdAt));

      return bookingList as Booking[];
    } catch (error) {
      console.error('Error fetching bookings by status:', error);
      return [];
    }
  }

  // ===== UTILITY METHODS =====
  
  async getBookingWithDetails(bookingId: string): Promise<any> {
    try {
      const [booking] = await db
        .select({
          id: bookings.id,
          rideId: bookings.rideId,
          passengerId: bookings.passengerId,
          seatsBooked: bookings.seatsBooked,
          totalPrice: bookings.totalPrice,
          status: bookings.status,
          createdAt: bookings.createdAt,
          // Passenger details
          passenger: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
            profileImageUrl: users.profileImageUrl,
          },
          // Ride details
          ride: {
            id: rides.id,
            fromLocation: rides.fromLocation,
            toLocation: rides.toLocation,
            departureDate: rides.departureDate,
            departureTime: rides.departureTime,
            driverId: rides.driverId,
          },
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.passengerId, users.id))
        .leftJoin(rides, eq(bookings.rideId, rides.id))
        .where(eq(bookings.id, bookingId));
      
      return booking;
    } catch (error) {
      console.error('Error fetching booking with details:', error);
      return null;
    }
  }

  // ===== ADDITIONAL METHODS FOR CONTROLLERS =====
  
  async updateBooking(bookingId: string, data: any): Promise<Booking> {
    try {
      const [booking] = await db
        .update(bookings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();
      
      return booking as Booking;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw new Error('Failed to update booking');
    }
  }
}

export const bookingStorage = new DatabaseBookingStorage();
