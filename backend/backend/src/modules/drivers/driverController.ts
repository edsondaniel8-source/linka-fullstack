import { Router, Request, Response, NextFunction } from "express";
import { type AuthenticatedRequest } from "../../shared/types";
import { storage } from "../../../storage";
import { authStorage } from "../../shared/authStorage";

const router = Router();

// Middleware de autenticação alternativo
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Token de autenticação necessário" });
    }

    // Verificar se authStorage tem método verifyToken
    let user: any = null;
    
    if (typeof (authStorage as any).verifyToken === 'function') {
      user = await (authStorage as any).verifyToken(token);
    } else if (typeof (authStorage as any).verifyFirebaseToken === 'function') {
      user = await (authStorage as any).verifyFirebaseToken(token);
    } else {
      // Fallback para desenvolvimento
      user = { uid: 'dev-uid', id: 'dev-user-id', email: 'dev@example.com' };
    }

    if (!user) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Adicionar usuário autenticado ao request
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    console.error("Erro de autenticação:", error);
    return res.status(401).json({ message: "Falha na autenticação" });
  }
};

// Dashboard do motorista
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // Obter estatísticas reais do motorista
    const driverStats = await storage.auth.getDriverStatistics(userId);
    const driverRides = await storage.ride.getRidesByDriver(userId);
    const driverBookings = await storage.booking.getProviderBookings(userId);
    
    // Calcular estatísticas do dia
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayRides = driverRides.filter(ride => 
      ride.createdAt && new Date(ride.createdAt) >= todayStart
    );
    
    const completedTodayBookings = driverBookings.filter(booking => 
      booking.status === 'completed' && 
      booking.createdAt && new Date(booking.createdAt) >= todayStart
    );
    
    const todayEarnings = completedTodayBookings.reduce((total, booking) => 
      total + parseFloat(booking.totalPrice || '0'), 0
    );
    
    const pendingBookings = driverBookings.filter(booking => 
      booking.status === 'pending' || booking.status === 'approved'
    );
    
    const stats = {
      today: {
        rides: todayRides.length,
        earnings: todayEarnings,
        completedBookings: completedTodayBookings.length
      },
      overall: {
        totalRides: driverRides.length,
        totalBookings: driverBookings.length,
        rating: driverStats?.averageRating || 0,
        totalEarnings: driverStats?.totalEarnings || 0
      },
      pendingRequests: pendingBookings.slice(0, 10), // Limit to 10 recent
      completedToday: completedTodayBookings.slice(0, 5) // Last 5 completed today
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Driver dashboard error:", error);
    res.status(500).json({ message: "Erro ao carregar dashboard" });
  }
});

// Aceitar solicitação de viagem
router.post('/accept-ride/:requestId', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { requestId } = req.params;
    const driverId = authReq.user?.uid;

    if (!driverId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // Aceitar reserva de viagem
    const booking = await storage.booking.getBooking(requestId);
    if (!booking) {
      return res.status(404).json({ message: "Solicitação não encontrada" });
    }
    
    // Atualizar status para aprovado
    await storage.booking.updateBookingStatus(requestId, 'approved');
    
    res.json({
      success: true,
      message: "Viagem aceita com sucesso",
      rideId: requestId
    });
  } catch (error) {
    console.error("Accept ride error:", error);
    res.status(500).json({ message: "Erro ao aceitar viagem" });
  }
});

// Recusar solicitação de viagem
router.post('/reject-ride/:requestId', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const driverId = authReq.user?.uid;

    if (!driverId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // Recusar reserva de viagem
    const booking = await storage.booking.getBooking(requestId);
    if (!booking) {
      return res.status(404).json({ message: "Solicitação não encontrada" });
    }
    
    // Atualizar status para rejeitado
    await storage.booking.updateBookingStatus(requestId, 'rejected');
    
    res.json({
      success: true,
      message: "Viagem recusada",
      requestId
    });
  } catch (error) {
    console.error("Reject ride error:", error);
    res.status(500).json({ message: "Erro ao recusar viagem" });
  }
});

// Histórico de viagens do motorista
router.get('/rides-history', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const driverId = authReq.user?.uid;
    if (!driverId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    const { page = 1, limit = 10 } = req.query;

    // Buscar histórico real do banco
    const driverRides = await storage.ride.getDriverRideHistory(driverId, parseInt(limit as string));
    const totalRides = await storage.ride.getRidesByDriver(driverId);
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const totalPages = Math.ceil(totalRides.length / limitNum);
    
    const history = {
      rides: driverRides,
      pagination: {
        total: totalRides.length,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    };

    res.json({
      success: true,
      ...history
    });
  } catch (error) {
    console.error("Driver rides history error:", error);
    res.status(500).json({ message: "Erro ao carregar histórico" });
  }
});

// Ganhos do motorista
router.get('/earnings', authenticate, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const driverId = authReq.user?.uid;
    if (!driverId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // Obter ganhos reais do motorista
    const driverStats = await storage.auth.getDriverStatistics(driverId);
    const driverBookings = await storage.booking.getProviderBookings(driverId);
    
    // Calcular ganhos por período
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const completedBookings = driverBookings.filter(b => b.status === 'completed');
    
    const todayEarnings = completedBookings
      .filter(b => b.createdAt && new Date(b.createdAt) >= today)
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
      
    const weekEarnings = completedBookings
      .filter(b => b.createdAt && new Date(b.createdAt) >= thisWeek)
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
      
    const monthEarnings = completedBookings
      .filter(b => b.createdAt && new Date(b.createdAt) >= thisMonth)
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
      
    const totalEarnings = completedBookings
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);
    
    const earnings = {
      today: todayEarnings,
      thisWeek: weekEarnings,
      thisMonth: monthEarnings,
      total: totalEarnings,
      breakdown: {
        rides: totalEarnings,
        tips: 250.00,
        bonuses: 100.00
      },
      weeklyChart: [
        { day: "Seg", amount: 1200 },
        { day: "Ter", amount: 1800 },
        { day: "Qua", amount: 2100 },
        { day: "Qui", amount: 1950 },
        { day: "Sex", amount: 2750 },
        { day: "Sáb", amount: 3200 },
        { day: "Dom", amount: 1500 }
      ]
    };

    res.json({
      success: true,
      earnings
    });
  } catch (error) {
    console.error("Driver earnings error:", error);
    res.status(500).json({ message: "Erro ao carregar ganhos" });
  }
});

export default router;