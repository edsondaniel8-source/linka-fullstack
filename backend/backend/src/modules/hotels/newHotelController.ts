import { Router, Request, Response } from "express";
import { newHotelService } from "./newHotelService";
import { z } from "zod";
import { db } from "../../../db"; // Importe o db se precisar
import { room_types } from "../../../shared/schema"; // Importe o schema
import { eq } from "drizzle-orm"; // Importe eq

// CORREÇÃO: Importe a função verifyFirebaseToken do seu auth existente
import { verifyFirebaseToken } from "../../../src/shared/firebaseAuth.js";

const router = Router();

// Schema de validação para busca
const searchHotelsSchema = z.object({
  location: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.coerce.number().int().positive().default(2),
  roomType: z.string().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  amenities: z.string().optional().transform(val => 
    val ? val.split(',').map(a => a.trim()).filter(a => a.length > 0) : undefined
  ),
  radius: z.coerce.number().positive().default(10),
  limit: z.coerce.number().int().positive().default(20)
});

// Schema para verificar disponibilidade
const checkAvailabilitySchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  units: z.coerce.number().int().positive().default(1),
  promoCode: z.string().optional()
});

// Schema para criar reserva
const createBookingSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  adults: z.coerce.number().int().positive().default(2),
  children: z.coerce.number().int().nonnegative().default(0),
  units: z.coerce.number().int().positive().default(1),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional()
});

// Schema para criar hotel
const createHotelSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  locality: z.string().min(1),
  province: z.string().min(1),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  hostId: z.string().optional(),
  policies: z.string().optional()
});

/**
 * Rota: Buscar hotéis inteligente
 * GET /api/v2/hotels/search
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const params = searchHotelsSchema.parse(req.query);
    
    const result = await newHotelService.searchHotelsSmart(params);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in search hotels:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
});

/**
 * Rota: Verificar disponibilidade
 * GET /api/v2/hotels/availability
 */
router.get("/availability", async (req: Request, res: Response) => {
  try {
    const params = checkAvailabilitySchema.parse(req.query);
    
    const result = await newHotelService.checkAvailabilityDetailed(params);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in check availability:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
});

/**
 * Rota: Criar reserva
 * POST /api/v2/hotels/bookings
 */
router.post("/bookings", async (req: Request, res: Response) => {
  try {
    const params = createBookingSchema.parse(req.body);
    
    const result = await newHotelService.createBookingProfessional(params);
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Error in create booking:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
});

/**
 * Rota: Obter detalhes da reserva
 * GET /api/v2/hotels/bookings/:bookingId
 */
router.get("/bookings/:bookingId", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required"
      });
    }
    
    const result = await newHotelService.getBookingDetails(bookingId);
    
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error in get booking details:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Cancelar reserva
 * POST /api/v2/hotels/bookings/:bookingId/cancel
 */
router.post("/bookings/:bookingId/cancel", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: "Booking ID is required"
      });
    }
    
    const result = await newHotelService.manageBooking({
      action: 'cancel',
      bookingData: {
        booking_id: bookingId
      }
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in cancel booking:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Obter reservas por email
 * GET /api/v2/hotels/my-bookings
 */
router.get("/my-bookings", async (req: Request, res: Response) => {
  try {
    const { email, status } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    
    const result = await newHotelService.getBookingsByEmail(
      email,
      typeof status === 'string' ? status : undefined
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in get bookings by email:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Obter estatísticas do hotel
 * GET /api/v2/hotels/:hotelId/stats
 */
router.get("/:hotelId/stats", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: "Hotel ID is required"
      });
    }
    
    const stats = await newHotelService.getHotelStats(hotelId);
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error in get hotel stats:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Obter tipos de quarto do hotel
 * GET /api/v2/hotels/:hotelId/room-types
 * CORRIGIDA: Usando Drizzle ORM em vez de executeRawQuery
 */
router.get("/:hotelId/room-types", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        error: "Hotel ID is required"
      });
    }
    
    // Usando Drizzle ORM (como no restante do código)
    const roomTypes = await db
      .select()
      .from(room_types)
      .where(eq(room_types.hotel_id, hotelId))
      .orderBy(room_types.name);
    
    res.status(200).json({
      success: true,
      data: roomTypes || []
    });
  } catch (error) {
    console.error("Error in get hotel room types:", error);
    // Retorna 200 com array vazio para não quebrar o frontend
    res.status(200).json({
      success: true,
      data: []
    });
  }
});

/**
 * Rota: Verificar disponibilidade em tempo real
 * GET /api/v2/hotels/availability/quick
 */
router.get("/availability/quick", async (req: Request, res: Response) => {
  try {
    const { roomTypeId, checkIn, checkOut, units } = req.query;
    
    if (!roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: "roomTypeId, checkIn, and checkOut are required"
      });
    }
    
    const result = await newHotelService.checkRealTimeAvailability({
      roomTypeId: roomTypeId as string,
      checkIn: checkIn as string,
      checkOut: checkOut as string,
      units: units ? parseInt(units as string) : 1
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in quick availability check:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Obter todos os hotéis (admin)
 * GET /api/v2/hotels
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // ✅ CORREÇÃO: Validação segura dos parâmetros
    const limitStr = req.query.limit as string | undefined;
    const offsetStr = req.query.offset as string | undefined;
    
    // Validação segura dos parâmetros
    const limit = limitStr 
      ? Math.max(1, Math.min(parseInt(limitStr) || 50, 100)) 
      : 50;
    
    const offset = offsetStr 
      ? Math.max(0, parseInt(offsetStr) || 0) 
      : 0;
    
    const result = await newHotelService.getAllHotels(limit, offset);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in get all hotels:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Obter hotel por ID
 * GET /api/v2/hotels/:hotelId
 */
router.get("/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    
    const result = await newHotelService.getHotelById(hotelId);
    
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error in get hotel by ID:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Criar hotel (admin/host)
 * POST /api/v2/hotels
 * CORREÇÃO: Usando verifyFirebaseToken que já existe
 */
router.post("/", verifyFirebaseToken, async (req: Request, res: Response) => {
  try {
    // Agora temos o usuário autenticado do middleware
    const userId = (req as any).user?.uid; // Firebase usa 'uid'
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated or user ID not found in token"
      });
    }
    
    const data = createHotelSchema.parse(req.body);
    
    // ✅ CORREÇÃO APLICADA: Passar o userId como segundo parâmetro!
    const result = await newHotelService.createHotel(data, userId);
    
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error("Error in create hotel:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }
});

/**
 * Rota: Atualizar hotel (admin/host)
 * PUT /api/v2/hotels/:hotelId
 */
router.put("/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const data = req.body;
    
    const result = await newHotelService.updateHotel(hotelId, data);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in update hotel:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

/**
 * Rota: Desativar hotel (admin)
 * DELETE /api/v2/hotels/:hotelId
 */
router.delete("/:hotelId", async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    
    const result = await newHotelService.deactivateHotel(hotelId);
    
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in deactivate hotel:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

export default router;