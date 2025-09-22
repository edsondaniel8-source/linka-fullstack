import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { users } from '../shared/database-schema.js';
import { eq } from 'drizzle-orm';

// ✅ IMPORTAR DO ARQUIVO SUPERIOR
import { 
  verifyFirebaseToken, 
  createApiResponse, 
  createApiError,
  AuthenticatedRequest 
} from '../src/shared/firebaseAuth.js';

const router = Router();

// Registration/Login endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, uid));
    
    if (existingUser) {
      return res.json(createApiResponse({ 
        user: existingUser,
        requiresRoleSetup: !existingUser.roles || existingUser.roles.length === 0
      }, 'Usuário já existe'));
    }

    // Create new user
    const [newUser] = await db.insert(users).values({
      id: uid,
      email,
      firstName: displayName?.split(' ')[0] || '',
      lastName: displayName?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: photoURL,
      roles: ['client'],
      userType: 'client',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.json(createApiResponse({
      user: newUser,
      requiresRoleSetup: true
    }, 'Usuário criado com sucesso'));
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json(createApiError('Erro interno do servidor', 'INTERNAL_ERROR'));
  }
});

// Get user profile - ✅ AGORA COM TIPAGEM CORRETA
router.get('/profile', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.uid;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json(createApiError('Usuário não encontrado', 'USER_NOT_FOUND'));
    }

    res.json(createApiResponse({ user }));
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json(createApiError('Erro interno do servidor', 'INTERNAL_ERROR'));
  }
});

// Update user roles
const updateRolesSchema = z.object({
  roles: z.array(z.enum(['client', 'driver', 'hotel_manager', 'admin'])).min(1)
});

router.put('/roles', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.uid;
    const { roles } = updateRolesSchema.parse(req.body);

    // Admin role can only be assigned by existing admins
    if (roles.includes('admin')) {
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      if (!currentUser?.roles?.includes('admin')) {
        return res.status(403).json(createApiError(
          'Apenas administradores podem atribuir o papel de admin', 
          'ADMIN_REQUIRED'
        ));
      }
    }

    const [updatedUser] = await db.update(users)
      .set({ 
        roles,
        userType: roles.includes('admin') ? 'admin' : roles.includes('hotel_manager') ? 'hotel_manager' : roles.includes('driver') ? 'driver' : 'client',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    res.json(createApiResponse({ user: updatedUser }, 'Roles atualizados com sucesso'));
  } catch (error) {
    console.error('Erro ao atualizar roles:', error);
    res.status(500).json(createApiError('Erro interno do servidor', 'INTERNAL_ERROR'));
  }
});

// Setup user roles after Google OAuth signup
router.post('/setup-user-roles', verifyFirebaseToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.uid;
    const { roles } = req.body;
    
    if (!userId) {
      return res.status(401).json(createApiError('Token inválido', 'INVALID_TOKEN'));
    }
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json(createApiError(
        'Pelo menos um role deve ser selecionado', 
        'ROLES_REQUIRED'
      ));
    }

    // Check if user exists, if not create them
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!existingUser) {
      // Create new user with Firebase data
      const userDisplayName = authReq.user.displayName || '';
      const [newUser] = await db.insert(users).values({
        id: userId,
        email: authReq.user.email || '',
        firstName: userDisplayName?.split(' ')[0] || '',
        lastName: userDisplayName?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: authReq.user.photoURL || null,
        roles: roles,
        userType: roles.includes('admin') ? 'admin' : roles.includes('hotel_manager') ? 'hotel_manager' : roles.includes('driver') ? 'driver' : 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.json(createApiResponse({
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roles: newUser.roles,
          userType: newUser.userType,
          profileImageUrl: newUser.profileImageUrl,
          isVerified: newUser.isVerified || false
        }
      }));
    } else {
      // Update existing user roles
      const [updatedUser] = await db.update(users)
        .set({ 
          roles,
          userType: roles.includes('admin') ? 'admin' : roles.includes('hotel_manager') ? 'hotel_manager' : roles.includes('driver') ? 'driver' : 'client',
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json(createApiResponse({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          roles: updatedUser.roles,
          userType: updatedUser.userType,
          profileImageUrl: updatedUser.profileImageUrl,
          isVerified: updatedUser.isVerified || false
        }
      }));
    }
  } catch (error) {
    console.error('Erro ao configurar roles:', error);
    res.status(500).json(createApiError('Erro interno do servidor', 'INTERNAL_ERROR'));
  }
});

export default router;