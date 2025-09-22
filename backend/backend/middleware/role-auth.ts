import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../shared/types';

// Defina os tipos de roles válidos
export type UserRole = 'client' | 'driver' | 'hotel_manager' | 'admin';

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Simulação básica - depois implementamos Firebase
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Simular usuário autenticado (para desenvolvimento)
    req.user = {
      id: 'user-id-from-token',
      uid: 'firebase-uid',
      email: 'user@example.com',
      roles: ['client'] // Role padrão para desenvolvimento
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Função genérica para verificar roles
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.roles?.some(role => allowedRoles.includes(role as UserRole))) {
      return res.status(403).json({ 
        error: `Acesso negado. Requer uma das seguintes roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Roles específicas usando a função genérica
export const requireAdminRole = requireRole(['admin']);
export const requireClientRole = requireRole(['client']);
export const requireDriverRole = requireRole(['driver']);
export const requireHotelManagerRole = requireRole(['hotel_manager']);

// Função para autenticação combinada (token + role)
export const authenticate = (role: UserRole) => {
  return [verifyFirebaseToken, requireRole([role])];
};

// Função para múltiplas roles
export const requireAnyRole = (roles: UserRole[]) => {
  return requireRole(roles);
};

// Função para verificar se é provider (driver ou hotel_manager)
export const requireProviderRole = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  const isProvider = req.user?.roles?.some(role => 
    role === 'driver' || role === 'hotel_manager'
  );
  
  if (!isProvider) {
    return res.status(403).json({ 
      error: 'Acesso negado. Requer role de provider (driver ou hotel_manager).' 
    });
  }
  next();
};