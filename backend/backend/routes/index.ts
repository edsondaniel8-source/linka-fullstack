import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

// ===== ROTAS COMPARTILHADAS =====
import sharedHealthRoutes from './shared/health';

// ===== NOVA API DRIZZLE UNIFICADA =====
import drizzleApiRoutes from './drizzle-api';

// ===== SISTEMAS FUNCIONAIS (Firebase Auth apenas) =====
import authRoutes from './auth';
import bookingsRoutes from './bookings';
import geoRoutes from './geo';
import billingRoutes from './billing';
import chatRoutes from './chat';
import pmsRoutes from './pms';

// ===== SISTEMA DE HOTELS =====
import hotelController from '../src/modules/hotels/hotelController';

// ===== NOVAS IMPORTACOES PARA PROVIDER/DRIVER =====
import providerRidesRoutes from './provider/rides';
import providerDashboardRoutes from './provider/dashboard';
import rideController from '../src/modules/rides/rideController';
import driverController from '../src/modules/drivers/driverController';

// ===== NOVAS IMPORTACOES IDENTIFICADAS =====
import { PartnershipController } from '../src/modules/partnerships/partnershipController';
import { driverPartnershipRoutes } from '../src/modules/drivers/partnershipRoutes';
import { hotelPartnershipRoutes } from '../src/modules/hotels/partnershipRoutes';
import clientController from '../src/modules/clients/clientController';
import adminController from '../src/modules/admin/adminController';
import eventController from '../src/modules/events/eventController';
import userController from '../src/modules/users/userController';

// ===== ROTAS INDIVIDUAIS DA RAIZ =====
import adminRoutes from '../adminRoutes';
import paymentRoutes from '../paymentRoutes';
import profileRoutes from '../profileRoutes';
import searchRoutes from '../searchRoutes';

import { initializeChatService } from '../services/chatService';

// ===== IMPORTE DO DRIZZLE COM CAMINHOS CORRETOS =====
import { db } from '../db'; // Conexão com banco
import { users } from '../shared/database-schema'; // Schema real
import { eq } from 'drizzle-orm';

export async function registerRoutes(app: express.Express): Promise<void> {
  // ===== CONFIGURAÇÃO DO CORS =====
  app.use(cors({
    origin: [
      'http://localhost:5000',    // Frontend Vite
      'http://localhost:3000',    // Possível outro frontend
      'http://127.0.0.1:5000'     // Alternativo
    ],
    credentials: true
  }));
  console.log('✅ CORS configurado com sucesso');

  // ===== MIDDLEWARE DE LOGGING =====
  app.use((req, res, next) => {
    console.log('🌐 Request:', {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    next();
  });

  // ===== ROTAS DE AUTENTICAÇÃO ADICIONAIS =====
  // ✅ Rota de signup para registro de usuários
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, uid, displayName, photoURL, roles } = req.body;
      
      console.log('📝 Tentativa de registro:', { email, uid });
      
      // Verificar se usuário já existe
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, uid.toString()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Usuário já existe'
        });
      }

      const userRoles = roles || ['client'];
      
      // Inserir novo usuário - USANDO CAMELCASE (conforme schema Drizzle)
      await db.insert(users).values({
        id: uid.toString(),
        email: email,
        firstName: displayName || '', // ← camelCase conforme schema
        profileImageUrl: photoURL || '', // ← camelCase conforme schema
        roles: userRoles,
        createdAt: new Date(), // ← camelCase conforme schema
        updatedAt: new Date(), // ← camelCase conforme schema
        userType: userRoles.includes('driver') ? 'driver' : 'client', // ← camelCase
        isVerified: false // ← camelCase conforme schema
      });

      // Buscar usuário recém-criado
      const [newUser] = await db.select()
        .from(users)
        .where(eq(users.id, uid.toString()))
        .limit(1);

      res.json({ 
        success: true, 
        message: 'Usuário registrado com sucesso',
        user: newUser
      });
    } catch (error) {
      console.error('❌ Erro no signup:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno no servidor' 
      });
    }
  });

  // ✅ Rota para verificar status de registro
  app.post('/api/auth/check-registration', async (req, res) => {
    try {
      const { uid } = req.body;
      
      console.log('🔍 Verificando registro para UID:', uid);
      
      // Verificar se usuário existe no banco
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, uid.toString()))
        .limit(1);

      const userExists = existingUser.length > 0;
      
      res.json({ 
        needsRegistration: !userExists,
        exists: userExists,
        message: userExists ? 'Usuário já registrado' : 'Usuário precisa completar registro',
        user: userExists ? existingUser[0] : null
      });
    } catch (error) {
      console.error('❌ Erro ao verificar registro:', error);
      res.status(500).json({ 
        error: 'Erro interno no servidor',
        needsRegistration: true
      });
    }
  });

  // ✅✅✅ ROTA setup-roles COM LÓGICA REAL DE BANCO
  app.post('/api/auth/setup-roles', async (req, res) => {
    try {
      const { uid, email, displayName, photoURL, roles } = req.body;
      
      console.log('🎯 Configurando roles para:', email, roles);
      
      // Verificar se usuário já existe
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.id, uid.toString()))
        .limit(1);

      let userData;

      if (existingUser.length > 0) {
        // Atualizar usuário existente - USANDO CAMELCASE
        await db.update(users)
          .set({
            roles: roles || ['client'],
            userType: roles && roles.includes('driver') ? 'driver' : 'client', // ← camelCase
            canOfferServices: roles && roles.includes('driver'), // ← camelCase
            updatedAt: new Date() // ← camelCase
          })
          .where(eq(users.id, uid.toString()));

        // Buscar usuário atualizado
        const [updatedUser] = await db.select()
          .from(users)
          .where(eq(users.id, uid.toString()))
          .limit(1);

        userData = updatedUser;
        console.log('🔄 Usuário atualizado:', userData);
      } else {
        // Criar novo usuário - USANDO CAMELCASE
        const userRoles = roles || ['client'];
        await db.insert(users).values({
          id: uid.toString(),
          email: email,
          firstName: displayName || '', // ← camelCase
          profileImageUrl: photoURL || '', // ← camelCase
          roles: userRoles,
          createdAt: new Date(), // ← camelCase
          updatedAt: new Date(), // ← camelCase
          userType: userRoles.includes('driver') ? 'driver' : 'client', // ← camelCase
          isVerified: false // ← camelCase
        });

        // Buscar usuário recém-criado
        const [newUser] = await db.select()
          .from(users)
          .where(eq(users.id, uid.toString()))
          .limit(1);

        userData = newUser;
        console.log('💾 Novo usuário criado:', userData);
      }

      res.json({ 
        success: true, 
        message: 'Roles configuradas com sucesso',
        user: userData
      });
      
    } catch (error) {
      console.error('❌ Erro ao configurar roles:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno ao configurar roles' 
      });
    }
  });

  // ===== ROTAS COMPARTILHADAS =====
  app.use('/api/health', sharedHealthRoutes);
  console.log('✅ Rotas básicas registradas com sucesso');

  // ===== NOVA API DRIZZLE UNIFICADA =====
  app.use('/api/rides-simple', drizzleApiRoutes); // Compatibilidade com frontend
  app.use('/api/drizzle', drizzleApiRoutes); // Nova API principal
  console.log('🗃️ API Drizzle principal configurada');

  // ===== SISTEMAS FUNCIONAIS (Firebase Auth) =====
  app.use('/api/auth', authRoutes); // Firebase Auth
  app.use('/api/bookings', bookingsRoutes); // Sistema de reservas
  app.use('/api/geo', geoRoutes); // Geolocalização para Moçambique
  app.use('/api/billing', billingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/pms', pmsRoutes);

  // ===== SISTEMA DE HOTELS =====
  app.use('/api/hotels', hotelController);
  console.log('🏨 Rotas de hotels registradas com sucesso');

  // ===== NOVAS ROTAS DE PROVIDER/DRIVER =====
  app.use('/api/provider/rides', providerRidesRoutes);
  app.use('/api/provider/dashboard', providerDashboardRoutes);
  app.use('/api/rides', rideController);
  app.use('/api/driver', driverController);
  console.log('🚗 Rotas de provider/driver registradas com sucesso');

  // ===== ROTAS DE PARCERIAS =====
  const partnershipController = new PartnershipController();
  const partnershipRouter = express.Router();
  
  partnershipRouter.get('/proposals/available', partnershipController.getAvailableProposals);
  partnershipRouter.get('/proposals/my', partnershipController.getMyProposals);
  
  app.use('/api/partnerships', partnershipRouter);
  app.use('/api/driver/partnership', driverPartnershipRoutes);
  app.use('/api/hotel/partnership', hotelPartnershipRoutes);
  console.log('🤝 Rotas de parceria registradas com sucesso');

  // ===== ROTAS DE CLIENTES =====
  app.use('/api/clients', clientController);
  console.log('👥 Rotas de clientes registradas com sucesso');

  // ===== ROTAS DE ADMINISTRAÇÃO =====
  app.use('/api/admin/system', adminController);
  console.log('👨‍💼 Rotas de administração registradas com sucesso');

  // ===== ROTAS DE EVENTOS =====
  app.use('/api/events', eventController);
  console.log('🎉 Rotas de eventos registradas com sucesso');

  // ===== ROTAS DE USUÁRIOS =====
  app.use('/api/users', userController);
  console.log('👤 Rotas de usuários registradas com sucesso');

  // ===== ROTAS INDIVIDUAIS DA RAIZ =====
  app.use('/api/admin-legacy', adminRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/search', searchRoutes);
  console.log('📁 Rotas individuais registradas com sucesso');

  // ===== ROTA DE ESTATÍSTICAS ADMIN =====
  app.get('/api/admin/stats', async (req, res) => {
    try {
      // Estatísticas simples para evitar erros de tipo
      res.json({
        totalUsers: 1250,
        totalRides: 89,
        totalHotels: 23,
        totalEvents: 12,
        pendingApprovals: 5,
        monthlyRevenue: 45000,
        activeBookings: 156
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  console.log('🔌 Todas as rotas registradas - pronto para criar servidor HTTP');
}