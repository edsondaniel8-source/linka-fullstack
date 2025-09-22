import { Router, Request, Response, NextFunction } from "express";
import { db } from "../../../db";
import { accommodations, insertAccommodationSchema } from "../../../shared/schema";
import { authStorage } from "../../shared/authStorage";
import { type AuthenticatedRequest, verifyFirebaseToken } from "../../../src/shared/firebaseAuth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const router = Router();

// Define o tipo Accommodation baseado na tabela accommodations
type Accommodation = typeof accommodations.$inferSelect;

// Helper functions for database queries
const getAccommodations = async (filters: any = {}): Promise<Accommodation[]> => {
  return await db.select().from(accommodations);
};

const getAccommodation = async (id: string): Promise<Accommodation | undefined> => {
  const [accommodation] = await db.select().from(accommodations).where(eq(accommodations.id, id));
  return accommodation;
};

const createAccommodation = async (data: any): Promise<Accommodation> => {
  const [accommodation] = await db.insert(accommodations).values(data).returning();
  return accommodation;
};

const updateAccommodation = async (id: string, data: any): Promise<Accommodation | null> => {
  const [accommodation] = await db.update(accommodations).set(data).where(eq(accommodations.id, id)).returning();
  return accommodation || null;
};

// GET /api/hotels - Lista todas as acomodações com filtros
router.get("/", async (req, res) => {
  try {
    const { 
      type, 
      address, 
      isAvailable, 
      minPrice,
      maxPrice,
      sortBy = 'rating',
      page = 1, 
      limit = 20 
    } = req.query;

    const filters: any = {};
    
    if (type) filters.type = type;
    if (address) filters.address = address;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;

    let accommodationsList = await getAccommodations(filters);
    
    // Ordenação personalizada
    if (sortBy === 'price_asc') {
      accommodationsList = accommodationsList.sort((a: Accommodation, b: Accommodation) => Number(a.pricePerNight) - Number(b.pricePerNight));
    } else if (sortBy === 'price_desc') {
      accommodationsList = accommodationsList.sort((a: Accommodation, b: Accommodation) => Number(b.pricePerNight) - Number(a.pricePerNight));
    } else if (sortBy === 'rating') {
      accommodationsList = accommodationsList.sort((a: Accommodation, b: Accommodation) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    
    // Aplicar paginação
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedAccommodations = accommodationsList.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        accommodations: paginatedAccommodations,
        total: accommodationsList.length,
        page: Number(page),
        totalPages: Math.ceil(accommodationsList.length / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar acomodações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: "Failed to fetch accommodations"
    });
  }
});

// GET /api/hotels/:id - Obter acomodação específica
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const accommodation = await getAccommodation(id);

    if (!accommodation) {
      return res.status(404).json({
        success: false,
        message: "Acomodação não encontrada"
      });
    }

    res.json({
      success: true,
      data: { accommodation }
    });
  } catch (error) {
    console.error("Erro ao buscar acomodação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// POST /api/hotels - Criar nova acomodação (apenas anfitriões)
router.post("/", verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const userId = authReq.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Validar dados com Zod
    const createAccommodationSchema = insertAccommodationSchema.omit({
      id: true
    });

    const validatedData = createAccommodationSchema.parse({
      ...req.body,
      hostId: userId
    });

    const newAccommodation = await createAccommodation(validatedData);

    res.status(201).json({
      success: true,
      message: "Acomodação criada com sucesso",
      data: { accommodation: newAccommodation }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }

    console.error("Erro ao criar acomodação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// PUT /api/hotels/:id - Atualizar acomodação
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    const userId = authReq.user?.uid;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Verificar se a acomodação existe e pertence ao usuário
    const existingAccommodation = await getAccommodation(id);
    if (!existingAccommodation) {
      return res.status(404).json({
        success: false,
        message: "Acomodação não encontrada"
      });
    }

    if (existingAccommodation.hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão para editar esta acomodação"
      });
    }

    const updatedAccommodation = await updateAccommodation(id, req.body);

    res.json({
      success: true,
      message: "Acomodação atualizada com sucesso",
      data: { accommodation: updatedAccommodation }
    });
  } catch (error) {
    console.error("Erro ao atualizar acomodação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// Dashboard do hotel
router.get('/dashboard', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    const stats = {
      occupancy: {
        today: 85,
        currentRooms: 34,
        totalRooms: 40
      },
      revenue: {
        today: 12450.00,
        changePercent: '+15%'
      },
      checkins: {
        today: 18,
        pending: 6
      },
      rating: {
        average: 4.7,
        totalReviews: 128
      },
      todayCheckins: [
        {
          id: "checkin-1",
          guestName: "Maria Santos",
          roomType: "Quarto Duplo Superior",
          nights: 3,
          checkInTime: "14:00",
          status: "confirmed",
          price: 1250.00
        },
        {
          id: "checkin-2", 
          guestName: "João Pedro",
          roomType: "Suite Executiva",
          nights: 2,
          checkInTime: "15:30",
          status: "pending",
          price: 2100.00
        }
      ],
      weeklyOccupancy: [
        { day: 'Dom', date: '25', occupancy: 78, rooms: '31/40' },
        { day: 'Seg', date: '26', occupancy: 65, rooms: '26/40' },
        { day: 'Ter', date: '27', occupancy: 82, rooms: '33/40' },
        { day: 'Qua', date: '28', occupancy: 85, rooms: '34/40' },
        { day: 'Qui', date: '29', occupancy: 92, rooms: '37/40' },
        { day: 'Sex', date: '30', occupancy: 95, rooms: '38/40' },
        { day: 'Sáb', date: '31', occupancy: 88, rooms: '35/40' }
      ],
      pendingTasks: [
        {
          id: "task-1",
          type: "cleaning",
          description: "Limpeza urgente - Quarto 205",
          detail: "Check-in às 15:00",
          priority: "urgent"
        },
        {
          id: "task-2",
          type: "confirmation", 
          description: "Confirmar reserva - Ana Costa",
          detail: "Check-in amanhã",
          priority: "normal"
        }
      ]
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Hotel dashboard error:", error);
    res.status(500).json({ message: "Erro ao carregar dashboard" });
  }
});

// Reservas do hotel
router.get('/reservations', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const hotelId = authReq.user?.uid;
    if (!hotelId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // TODO: Implement getProviderBookings function
    const reservations: any[] = []; // await getProviderBookings(hotelId);

    res.json({
      success: true,
      reservations
    });
  } catch (error) {
    console.error("Hotel reservations error:", error);
    res.status(500).json({ message: "Erro ao carregar reservas" });
  }
});

// Confirmar check-in
router.post('/checkin/:reservationId', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { reservationId } = req.params;
    const hotelId = authReq.user?.uid;

    if (!hotelId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // TODO: Implement updateBookingStatus function
    const reservation = null; // await updateBookingStatus(reservationId, 'in_progress');

    res.json({
      success: true,
      message: "Check-in realizado com sucesso",
      reservation
    });
  } catch (error) {
    console.error("Hotel checkin error:", error);
    res.status(500).json({ message: "Erro ao realizar check-in" });
  }
});

// Quartos disponíveis
router.get('/rooms', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const hotelId = authReq.user?.uid;
    if (!hotelId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    // TODO: Implementar busca real de quartos
    const rooms = [
      {
        id: "room-101",
        number: "101",
        type: "Standard",
        status: "available",
        price: 850.00,
        capacity: 2
      },
      {
        id: "room-102",
        number: "102", 
        type: "Deluxe",
        status: "occupied",
        price: 1250.00,
        capacity: 2
      }
    ];

    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error("Hotel rooms error:", error);
    res.status(500).json({ message: "Erro ao carregar quartos" });
  }
});

export default router;