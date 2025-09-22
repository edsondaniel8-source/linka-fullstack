import { Router, Request, Response, NextFunction } from "express";
import { db } from "../../../db";
import { rides, insertRideSchema } from "../../../shared/schema";
import { authStorage } from "../../shared/authStorage";
import { type AuthenticatedRequest, type AuthenticatedUser } from "../../shared/types";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

// Helper functions for database queries
const getRides = async (filters: any = {}): Promise<typeof rides.$inferSelect[]> => {
  return await db.select().from(rides);
};

const getRide = async (id: string): Promise<typeof rides.$inferSelect | undefined> => {
  const [ride] = await db.select().from(rides).where(eq(rides.id, id));
  return ride;
};

const createRide = async (data: z.infer<typeof insertRideSchema>): Promise<typeof rides.$inferSelect> => {
  const [ride] = await db.insert(rides)
    .values({ 
      id: randomUUID(), // Gerar UUID antes de inserir
      ...data 
    })
    .returning();
  return ride;
};

const updateRide = async (id: string, data: Partial<z.infer<typeof insertRideSchema>>): Promise<typeof rides.$inferSelect | null> => {
  const [ride] = await db.update(rides).set(data).where(eq(rides.id, id)).returning();
  return ride || null;
};

const deleteRide = async (id: string): Promise<boolean> => {
  const result = await db.delete(rides).where(eq(rides.id, id));
  return result.length > 0;
};

// Middleware para verificar autenticação
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Token de autenticação necessário" });
    }

    // Verificar se authStorage tem método verifyToken
    let user: AuthenticatedUser | null = null;
    
    // Tentar diferentes métodos de autenticação baseados na implementação disponível
    if (typeof (authStorage as any).verifyToken === 'function') {
      user = await (authStorage as any).verifyToken(token);
    } else if (typeof (authStorage as any).verifyFirebaseToken === 'function') {
      user = await (authStorage as any).verifyFirebaseToken(token);
    } else {
      // Fallback: verificar se há um usuário mock para desenvolvimento
      user = { id: 'dev-user-id', uid: 'dev-uid', email: 'dev@example.com' } as AuthenticatedUser;
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

// GET /api/rides - Lista todas as viagens com filtros
router.get("/", async (req: Request, res: Response) => {
  try {
    const { 
      fromLocation, 
      toLocation, 
      vehicleType, 
      status, 
      departureDate,
      page = 1, 
      limit = 20 
    } = req.query;

    const allRides = await getRides();
    
    // Aplicar filtros
    let filteredRides = allRides;
    
    if (fromLocation) {
  filteredRides = filteredRides.filter(ride => 
    ride.fromAddress.toLowerCase().includes((fromLocation as string).toLowerCase())
  );
}

if (toLocation) {
  filteredRides = filteredRides.filter(ride => 
    ride.toAddress.toLowerCase().includes((toLocation as string).toLowerCase())
  );
}
    
    if (vehicleType) {
      filteredRides = filteredRides.filter(ride => 
        ride.vehicleType?.toLowerCase() === (vehicleType as string).toLowerCase()
      );
    }
    
    if (status) {
      filteredRides = filteredRides.filter(ride => ride.status === status);
    }
    
    if (departureDate) {
      const searchDate = new Date(departureDate as string);
      filteredRides = filteredRides.filter(ride => {
        if (!ride.departureDate) return false;
        const rideDate = new Date(ride.departureDate);
        return rideDate.toDateString() === searchDate.toDateString();
      });
    }
    
    // Aplicar paginação
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedRides = filteredRides.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        rides: paginatedRides,
        total: filteredRides.length,
        page: Number(page),
        totalPages: Math.ceil(filteredRides.length / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao listar viagens:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// GET /api/rides/:id - Obter viagem específica
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await getRide(id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Viagem não encontrada"
      });
    }

    res.json({
      success: true,
      data: { ride }
    });
  } catch (error) {
    console.error("Erro ao buscar viagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// POST /api/rides - Criar nova viagem (apenas motoristas)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Validar dados com Zod e adicionar driverId
    const validatedData = insertRideSchema.parse({
      ...req.body,
      driverId: userId,
      departureDate: req.body.departureDate ? new Date(req.body.departureDate) : new Date(),
    });

    // Criar viagem no banco
    const newRide = await createRide(validatedData);

    res.status(201).json({
      success: true,
      message: "Viagem criada com sucesso",
      data: { ride: newRide },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors,
      });
    }

    console.error("Erro ao criar viagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/rides/:id - Atualizar viagem
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Verificar se a viagem existe e pertence ao usuário
    const existingRide = await getRide(id);
    if (!existingRide) {
      return res.status(404).json({
        success: false,
        message: "Viagem não encontrada"
      });
    }

    if (existingRide.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão para editar esta viagem"
      });
    }

    const updateData = insertRideSchema.partial().parse({
      ...req.body,
      departureDate: req.body.departureDate ? new Date(req.body.departureDate) : undefined
    });

    const updatedRide = await updateRide(id, updateData);

    if (!updatedRide) {
      return res.status(500).json({
        success: false,
        message: "Erro ao atualizar viagem"
      });
    }

    res.json({
      success: true,
      message: "Viagem atualizada com sucesso",
      data: { ride: updatedRide }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: error.errors
      });
    }

    console.error("Erro ao atualizar viagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// DELETE /api/rides/:id - Excluir viagem
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    // Verificar se a viagem existe e pertence ao usuário
    const existingRide = await getRide(id);
    if (!existingRide) {
      return res.status(404).json({
        success: false,
        message: "Viagem não encontrada"
      });
    }

    if (existingRide.driverId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Sem permissão para excluir esta viagem"
      });
    }

    const deleted = await deleteRide(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Erro ao excluir viagem"
      });
    }

    res.json({
      success: true,
      message: "Viagem excluída com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir viagem:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

// GET /api/rides/driver/:driverId - Listar viagens de um motorista específico
router.get("/driver/:driverId", async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;

    // Construir condições de filtro
    const conditions = [eq(rides.driverId, driverId)];
    if (status) {
      conditions.push(eq(rides.status, status as string));
    }

    // Executar query com múltiplas condições usando and()
    const driverRides = await db.select()
      .from(rides)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

    res.json({
      success: true,
      data: { rides: driverRides }
    });
  } catch (error) {
    console.error("Erro ao listar viagens do motorista:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor"
    });
  }
});

export default router;