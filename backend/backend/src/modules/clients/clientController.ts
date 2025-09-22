import { Router } from "express";
import { verifyFirebaseToken, type AuthenticatedRequest } from "../../../src/shared/firebaseAuth";
import { storage } from "../../../storage";

const router = Router();

// Buscar viagens disponíveis
router.get('/rides/search', async (req, res) => {
  try {
    const { from, to, date, passengers = 1 } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        message: "Origem e destino são obrigatórios" 
      });
    }

    // Buscar viagens disponíveis
    const rides = await storage.ride.searchRides({ fromLocation: from as string, toLocation: to as string });

    res.json({
      success: true,
      rides,
      searchParams: { from, to, date, passengers }
    });
  } catch (error) {
    console.error("Ride search error:", error);
    res.status(500).json({ message: "Erro ao buscar viagens" });
  }
});

// Solicitar viagem
router.post('/rides/request', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    const {
      rideId,
      passengers,
      pickupLocation,
      notes
    } = req.body;

    if (!rideId) {
      return res.status(400).json({ message: "ID da viagem é obrigatório" });
    }

    // Criar solicitação de viagem
    const bookingData = {
      passengerId: userId,
      rideId,
      seatsBooked: passengers || 1,
      totalPrice: 250.00
    };

    const booking = await storage.booking.createBooking(bookingData);

    res.status(201).json({
      success: true,
      message: "Solicitação de viagem enviada",
      booking
    });
  } catch (error) {
    console.error("Ride request error:", error);
    res.status(500).json({ message: "Erro ao solicitar viagem" });
  }
});

// Histórico de viagens do cliente
router.get('/bookings', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const userId = authReq.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    const bookings = await storage.booking.getUserBookings(userId);

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error("User bookings error:", error);
    res.status(500).json({ message: "Erro ao carregar reservas" });
  }
});

// Cancelar reserva
router.post('/bookings/:bookingId/cancel', verifyFirebaseToken, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { bookingId } = req.params;
    const userId = authReq.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found" });
    }

    const booking = await storage.booking.updateBookingStatus(bookingId, 'cancelled');

    if (!booking) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    res.json({
      success: true,
      message: "Reserva cancelada com sucesso",
      booking
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Erro ao cancelar reserva" });
  }
});

export default router;