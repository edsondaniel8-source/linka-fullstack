import { eq, and, or, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { users, driverDocuments } from '../../shared/schema';
import { 
  UserRole, 
  VerificationStatus 
} from '../../src/shared/types';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  DriverDocuments,
  DriverStats 
} from '../types';

// Helper functions for proper type mapping
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
    userType: user.userType || 'client',
    roles: user.roles || ['client'],
    canOfferServices: user.canOfferServices ?? false,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    profileImageUrl: user.profileImageUrl || '',
    verificationStatus: user.verificationStatus || 'pending',
    verificationDate: user.verificationDate || null,
    verificationNotes: user.verificationNotes || '',
    identityDocumentUrl: user.identityDocumentUrl || '',
    identityDocumentType: user.identityDocumentType || '',
    profilePhotoUrl: user.profilePhotoUrl || '',
    fullName: user.fullName || '',
    documentNumber: user.documentNumber || '',
    dateOfBirth: user.dateOfBirth || null,
    registrationCompleted: user.registrationCompleted ?? false,
    verificationBadge: user.verificationBadge || '',
    badgeEarnedDate: user.badgeEarnedDate || null,
    avatar: user.avatar || ''
  } as User;
}

function mapToDriverDocuments(docs: any): DriverDocuments {
  return {
    ...docs,
    createdAt: docs.createdAt || new Date(),
    updatedAt: docs.updatedAt || new Date(),
    isVerified: docs.isVerified ?? false,
    vehicleYear: docs.vehicleYear || null
  } as DriverDocuments;
}

export interface IAuthStorage {
  // Basic user operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: CreateUserData): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Firebase integration
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  linkFirebaseAccount(userId: string, firebaseUid: string): Promise<void>;
  
  // Role management
  getUsersByRole(role: UserRole): Promise<User[]>;
  updateUserRoles(userId: string, roles: UserRole[]): Promise<User>;
  addUserRole(userId: string, role: UserRole): Promise<User>;
  removeUserRole(userId: string, role: UserRole): Promise<User>;
  
  // Verification
  updateVerificationStatus(userId: string, status: VerificationStatus): Promise<User>;
  getUnverifiedUsers(): Promise<User[]>;
  getPendingVerifications(): Promise<User[]>;
  
  // Driver-specific operations
  updateDriverDocuments(driverId: string, documents: DriverDocuments): Promise<void>;
  getDriverDocuments(driverId: string): Promise<DriverDocuments | undefined>;
  getDriverStatistics(driverId: string): Promise<DriverStats>;
  
  // Search and listing
  searchUsers(query: string): Promise<User[]>;
  getUsersWithPagination(page: number, limit: number): Promise<{ users: User[], total: number }>;
  
  // Additional methods needed by controllers
  upsertUser(userData: any): Promise<User>;
  getUsersByType(userType: string): Promise<User[]>;
}

export class DatabaseAuthStorage implements IAuthStorage {
  
  // ===== BASIC USER OPERATIONS =====
  
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user ? mapToUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user ? mapToUser(user) : undefined;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return mapToUser(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      return mapToUser(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // ===== FIREBASE INTEGRATION =====
  
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    // Note: Using id field as Firebase UID for now
    return this.getUser(firebaseUid);
  }

  async linkFirebaseAccount(userId: string, firebaseUid: string): Promise<void> {
    // Implementation depends on schema design
    // For now, assuming Firebase UID is stored in the id field
    console.log(`Linking user ${userId} with Firebase UID ${firebaseUid}`);
  }

  // ===== ROLE MANAGEMENT =====
  
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.userType, role));
      return userList.map(mapToUser);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return [];
    }
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({
          roles: roles,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return mapToUser(user);
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error('Failed to update user roles');
    }
  }

  async addUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      const currentRoles = user.roles || [];
      if (!currentRoles.includes(role)) {
        currentRoles.push(role);
        return this.updateUserRoles(userId, currentRoles as UserRole[]);
      }
      return user;
    } catch (error) {
      console.error('Error adding user role:', error);
      throw new Error('Failed to add user role');
    }
  }

  async removeUserRole(userId: string, role: UserRole): Promise<User> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error('User not found');
      
      const currentRoles = user.roles || [];
      const updatedRoles = currentRoles.filter(r => r !== role);
      return this.updateUserRoles(userId, updatedRoles as UserRole[]);
    } catch (error) {
      console.error('Error removing user role:', error);
      throw new Error('Failed to remove user role');
    }
  }

  // ===== VERIFICATION =====
  
  async updateVerificationStatus(userId: string, status: VerificationStatus): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({
          verificationStatus: status,
          verificationDate: status === 'verified' ? new Date() : undefined,
          isVerified: status === 'verified',
          canOfferServices: status === 'verified',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return mapToUser(user);
    } catch (error) {
      console.error('Error updating verification status:', error);
      throw new Error('Failed to update verification status');
    }
  }

  async getUnverifiedUsers(): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.isVerified, false));
      return userList.map(mapToUser);
    } catch (error) {
      console.error('Error fetching unverified users:', error);
      return [];
    }
  }

  async getPendingVerifications(): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(or(
          eq(users.verificationStatus, 'pending'),
          eq(users.verificationStatus, 'in_review')
        ));
      return userList.map(mapToUser);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return [];
    }
  }

  // ===== DRIVER-SPECIFIC OPERATIONS =====
  
  async updateDriverDocuments(driverId: string, documents: DriverDocuments): Promise<void> {
    try {
      await db
        .insert(driverDocuments)
        .values({
          driverId,
          ...documents,
          createdAt: new Date(),
        })
        .onConflictDoUpdate({
          target: driverDocuments.driverId,
          set: {
            ...documents,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error('Error updating driver documents:', error);
      throw new Error('Failed to update driver documents');
    }
  }

  async getDriverDocuments(driverId: string): Promise<DriverDocuments | undefined> {
    try {
      const [docs] = await db
        .select()
        .from(driverDocuments)
        .where(eq(driverDocuments.driverId, driverId));
      return docs ? mapToDriverDocuments(docs) : undefined;
    } catch (error) {
      console.error('Error fetching driver documents:', error);
      return undefined;
    }
  }

  async getDriverStatistics(driverId: string): Promise<DriverStats> {
    try {
      // TODO: Implement when bookings table is properly set up
      return {
        totalRides: 0,
        completedRides: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalReviews: 0,
      };
    } catch (error) {
      console.error('Error fetching driver statistics:', error);
      throw new Error('Failed to fetch driver statistics');
    }
  }

  // ===== SEARCH AND LISTING =====
  
  async searchUsers(query: string): Promise<User[]> {
    try {
      // Basic search implementation - can be enhanced with full-text search
      const userList = await db
        .select()
        .from(users)
        .where(or(
          // @ts-ignore - PostgreSQL ilike operator
          sql`${users.firstName} ILIKE ${`%${query}%`}`,
          // @ts-ignore
          sql`${users.lastName} ILIKE ${`%${query}%`}`,
          // @ts-ignore
          sql`${users.email} ILIKE ${`%${query}%`}`
        ));
      return userList.map(mapToUser);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async getUsersWithPagination(page: number, limit: number): Promise<{ users: User[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      
      const userList = await db
        .select()
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt));
      
      const [{ count }] = await db
        .select({ count: sql`count(*)` })
        .from(users);
      
      return {
        users: userList.map(mapToUser),
        total: Number(count),
      };
    } catch (error) {
      console.error('Error fetching users with pagination:', error);
      return { users: [], total: 0 };
    }
  }

  // ===== ADDITIONAL METHODS FOR CONTROLLERS =====
  
  async upsertUser(userData: any): Promise<User> {
    try {
      if (userData.id) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userData.id))
          .returning();
        return mapToUser(user);
      } else {
        // Create new user
        return this.createUser(userData);
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw new Error('Failed to upsert user');
    }
  }

  async getUsersByType(userType: string): Promise<User[]> {
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.userType, userType))
        .orderBy(desc(users.createdAt));
      
      return userList.map(mapToUser);
    } catch (error) {
      console.error('Error fetching users by type:', error);
      return [];
    }
  }
}

// Export singleton instance
export const authStorage = new DatabaseAuthStorage();