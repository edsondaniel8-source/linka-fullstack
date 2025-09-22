import { eq, and, or, gte, lte, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { rides, users } from '../../shared/schema';
import { 
  Ride, 
  CreateRideData, 
  UpdateRideData, 
  RideSearchCriteria,
  DriverStats,
  User 
} from '../types';

// Helper functions for proper type mapping
function mapToRide(ride: any, driver?: any): Ride {
  return {
    ...ride,
    pricePerSeat: ride.pricePerSeat ? Number(ride.pricePerSeat) : 0,
    availableSeats: ride.availableSeats || 0,
    createdAt: ride.createdAt || new Date(),
    updatedAt: ride.updatedAt || new Date(),
    departureDate: ride.departureDate || new Date(),
    status: ride.status || 'active',
    vehicleType: ride.vehicleType || '',
    additionalInfo: ride.additionalInfo || '',
    driver: driver ? mapToUser(driver) : null
  } as Ride;
}

function mapToUser(user: any): User {
  return {
    ...user,
    rating: user.rating ? Number(user.rating) : 0,
    totalReviews: user.totalReviews || 0,
    isVerified: user.isVerified ?? false,
    createdAt: user.createdAt || new Date(),
    updatedAt: user.updatedAt || new Date(),
    email: user.email || '',
    phone: user.phone || '',
    userType: user.userType || 'driver',
    roles: user.roles || ['driver'],
    canOfferServices: user.canOfferServices ?? true,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    profileImageUrl: user.profileImageUrl || ''
  } as User;
}

export interface IRideStorage {
  // Ride management
  createRide(rideData: CreateRideData): Promise<Ride>;
  updateRide(rideId: string, data: UpdateRideData): Promise<Ride>;
  deleteRide(rideId: string): Promise<void>;
  getRide(rideId: string): Promise<Ride | undefined>;
  
  // Search and discovery
  searchRides(criteria: RideSearchCriteria): Promise<Ride[]>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  getActiveRides(): Promise<Ride[]>;
  getNearbyRides(location: string, radius?: number): Promise<Ride[]>;
  
  // Booking integration
  updateRideAvailability(rideId: string, bookedSeats: number): Promise<Ride>;
  checkRideAvailability(rideId: string, requestedSeats: number): Promise<boolean>;
  
  // Driver-specific
  getDriverStatistics(driverId: string): Promise<DriverStats>;
  getDriverRideHistory(driverId: string, limit?: number): Promise<Ride[]>;
  
  // Analytics
  getRideStatistics(dateRange?: { from: Date; to: Date }): Promise<{
    totalRides: number;
    activeRides: number;
    completedRides: number;
    totalRevenue: number;
  }>;
}

export class DatabaseRideStorage implements IRideStorage {
  
  // ===== RIDE MANAGEMENT =====
  
  async createRide(rideData: CreateRideData): Promise<Ride> {
    try {
      const [ride] = await db
        .insert(rides)
        .values({
          ...rideData,
          pricePerSeat: rideData.pricePerSeat.toString(),
          status: 'active',
          createdAt: new Date(),
        })
        .returning();
      
      return mapToRide(ride);
    } catch (error) {
      console.error('Error creating ride:', error);
      throw new Error('Failed to create ride');
    }
  }

  async updateRide(rideId: string, data: UpdateRideData): Promise<Ride> {
    try {
      const updateData: any = { ...data };
      if (data.pricePerSeat !== undefined) {
        updateData.pricePerSeat = data.pricePerSeat.toString();
      }

      const [ride] = await db
        .update(rides)
        .set(updateData)
        .where(eq(rides.id, rideId))
        .returning();
      
      return mapToRide(ride);
    } catch (error) {
      console.error('Error updating ride:', error);
      throw new Error('Failed to update ride');
    }
  }

  async deleteRide(rideId: string): Promise<void> {
    try {
      await db.delete(rides).where(eq(rides.id, rideId));
    } catch (error) {
      console.error('Error deleting ride:', error);
      throw new Error('Failed to delete ride');
    }
  }

  async getRide(rideId: string): Promise<Ride | undefined> {
    try {
      const result = await db
        .select({
          ride: rides,
          driver: users
        })
        .from(rides)
        .leftJoin(users, eq(rides.driverId, users.id))
        .where(eq(rides.id, rideId));
      
      if (result.length === 0) return undefined;
      
      const { ride, driver } = result[0];
      return mapToRide(ride, driver);
    } catch (error) {
      console.error('Error fetching ride:', error);
      return undefined;
    }
  }

  // ===== SEARCH AND DISCOVERY =====
  
  async searchRides(criteria: RideSearchCriteria): Promise<Ride[]> {
    try {
      let query = db
        .select({
          ride: rides,
          driver: users
        })
        .from(rides)
        .leftJoin(users, eq(rides.driverId, users.id));

      const conditions = [eq(rides.status, 'active')];

      if (criteria.fromLocation) {
        conditions.push(sql`${rides.fromLocation} ILIKE ${`%${criteria.fromLocation}%`}`);
      }

      if (criteria.toLocation) {
        conditions.push(sql`${rides.toLocation} ILIKE ${`%${criteria.toLocation}%`}`);
      }

      if (criteria.departureDate) {
        conditions.push(gte(rides.departureDate, criteria.departureDate));
      }

      if (criteria.minSeats) {
        conditions.push(gte(rides.availableSeats, criteria.minSeats));
      }

      if (criteria.maxPrice) {
        conditions.push(sql`CAST(${rides.pricePerSeat} AS DECIMAL) <= ${criteria.maxPrice}`);
      }

      if (criteria.driverId) {
        conditions.push(eq(rides.driverId, criteria.driverId));
      }

      const results = await query
        .where(and(...conditions))
        .orderBy(desc(rides.departureDate))
        .limit(50);

      return results.map(({ ride, driver }) => mapToRide(ride, driver));
    } catch (error) {
      console.error('Error searching rides:', error);
      return [];
    }
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    try {
      const rideList = await db
        .select()
        .from(rides)
        .where(eq(rides.driverId, driverId))
        .orderBy(desc(rides.departureDate));
      
      return rideList.map(ride => mapToRide(ride));
    } catch (error) {
      console.error('Error fetching rides by driver:', error);
      return [];
    }
  }

  async getActiveRides(): Promise<Ride[]> {
    try {
      const results = await db
        .select({
          ride: rides,
          driver: users
        })
        .from(rides)
        .leftJoin(users, eq(rides.driverId, users.id))
        .where(and(
          eq(rides.status, 'active'),
          gte(rides.departureDate, new Date())
        ))
        .orderBy(desc(rides.departureDate))
        .limit(100);

      return results.map(({ ride, driver }) => mapToRide(ride, driver));
    } catch (error) {
      console.error('Error fetching active rides:', error);
      return [];
    }
  }

  async getNearbyRides(location: string, radius: number = 50): Promise<Ride[]> {
    try {
      // Basic implementation - can be enhanced with geospatial queries
      return this.searchRides({ fromLocation: location });
    } catch (error) {
      console.error('Error fetching nearby rides:', error);
      return [];
    }
  }

  // ===== BOOKING INTEGRATION =====
  
  async updateRideAvailability(rideId: string, bookedSeats: number): Promise<Ride> {
    try {
      const ride = await this.getRide(rideId);
      if (!ride) throw new Error('Ride not found');

      const newAvailableSeats = ride.availableSeats - bookedSeats;
      if (newAvailableSeats < 0) {
        throw new Error('Not enough seats available');
      }

      const status = newAvailableSeats === 0 ? 'full' : 'active';

      return this.updateRide(rideId, {
        availableSeats: newAvailableSeats,
        status,
      });
    } catch (error) {
      console.error('Error updating ride availability:', error);
      throw error;
    }
  }

  async checkRideAvailability(rideId: string, requestedSeats: number): Promise<boolean> {
    try {
      const ride = await this.getRide(rideId);
      if (!ride) return false;

      return ride.availableSeats >= requestedSeats && ride.status === 'active';
    } catch (error) {
      console.error('Error checking ride availability:', error);
      return false;
    }
  }

  // ===== DRIVER-SPECIFIC =====
  
  async getDriverStatistics(driverId: string): Promise<DriverStats> {
    try {
      const [totalRides] = await db
        .select({ count: sql`count(*)` })
        .from(rides)
        .where(eq(rides.driverId, driverId));

      const [completedRides] = await db
        .select({ count: sql`count(*)` })
        .from(rides)
        .where(and(
          eq(rides.driverId, driverId),
          eq(rides.status, 'completed')
        ));

      // TODO: Calculate earnings when payment integration is complete
      // TODO: Get rating data when ratings table is properly integrated

      return {
        totalRides: Number(totalRides.count),
        completedRides: Number(completedRides.count),
        totalEarnings: 0, // TODO: Calculate from bookings/payments
        averageRating: 0, // TODO: Calculate from ratings
        totalReviews: 0,  // TODO: Calculate from ratings
      };
    } catch (error) {
      console.error('Error fetching driver statistics:', error);
      return {
        totalRides: 0,
        completedRides: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
      };
    }
  }

  async getDriverRideHistory(driverId: string, limit: number = 20): Promise<Ride[]> {
    try {
      const rideList = await db
        .select()
        .from(rides)
        .where(eq(rides.driverId, driverId))
        .orderBy(desc(rides.departureDate))
        .limit(limit);
      
      return rideList.map(ride => mapToRide(ride));
    } catch (error) {
      console.error('Error fetching driver ride history:', error);
      return [];
    }
  }

  // ===== ANALYTICS =====
  
  async getRideStatistics(dateRange?: { from: Date; to: Date }): Promise<{
    totalRides: number;
    activeRides: number;
    completedRides: number;
    totalRevenue: number;
  }> {
    try {
      let conditions: any[] = [];

      if (dateRange) {
        conditions.push(
          gte(rides.createdAt, dateRange.from),
          lte(rides.createdAt, dateRange.to)
        );
      }

      const [totalRides] = await db
        .select({ count: sql`count(*)` })
        .from(rides);

      const [activeRides] = await db
        .select({ count: sql`count(*)` })
        .from(rides)
        .where(eq(rides.status, 'active'));

      const [completedRides] = await db
        .select({ count: sql`count(*)` })
        .from(rides)
        .where(eq(rides.status, 'completed'));

      // TODO: Calculate revenue when payment integration is complete

      return {
        totalRides: Number(totalRides.count),
        activeRides: Number(activeRides.count),
        completedRides: Number(completedRides.count),
        totalRevenue: 0, // TODO: Calculate from bookings/payments
      };
    } catch (error) {
      console.error('Error fetching ride statistics:', error);
      return {
        totalRides: 0,
        activeRides: 0,
        completedRides: 0,
        totalRevenue: 0,
      };
    }
  }
}

export const rideStorage = new DatabaseRideStorage();