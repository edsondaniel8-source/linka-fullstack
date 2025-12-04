import { Router } from 'express';
import newHotelController from './newHotelController';
import { authenticate } from '../../../middleware/role-auth';

const router = Router();

// Rotas públicas
router.use('/', newHotelController);

// Rotas protegidas para hotel managers
router.post('/admin/create', authenticate('hotel_manager'), async (req, res) => {
  // Rota para criar hotéis (será implementada)
  res.status(200).json({ message: 'Create hotel endpoint' });
});

router.post('/admin/:hotelId/availability/bulk', authenticate('hotel_manager'), async (req, res) => {
  // Rota para atualizar disponibilidade em massa
  res.status(200).json({ message: 'Bulk availability endpoint' });
});

export { router as newHotelRoutes };
