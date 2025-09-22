import { Router } from 'express';
import { pmsService } from '../services/pmsService';

const router = Router();

/**
 * GET /api/pms/sync-report
 * Obtém relatório de sincronização com canais externos
 */
router.get('/sync-report', async (req, res) => {
  try {
    const report = await pmsService.getSyncReport();
    res.json(report);
  } catch (error) {
    console.error('Erro ao obter relatório de sincronização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/pms/sync-properties
 * Sincronizar propriedades do QloApps
 */
router.post('/sync-properties', async (req, res) => {
  try {
    await pmsService.syncPropertiesFromPMS();
    res.json({ success: true, message: 'Propriedades sincronizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao sincronizar propriedades:', error);
    res.status(500).json({ error: 'Erro ao sincronizar propriedades' });
  }
});

/**
 * POST /api/pms/configure
 * Configurar credenciais do PMS
 */
router.post('/configure', async (req, res) => {
  try {
    const { baseUrl, apiKey } = req.body;
    
    if (!baseUrl || !apiKey) {
      return res.status(400).json({ error: 'URL base e chave API são obrigatórias' });
    }

    await pmsService.configurePMS(baseUrl, apiKey);
    res.json({ success: true, message: 'PMS configurado com sucesso' });
  } catch (error) {
    console.error('Erro ao configurar PMS:', error);
    res.status(500).json({ error: 'Erro ao configurar PMS' });
  }
});

/**
 * POST /api/pms/sync-availability
 * Sincronizar disponibilidade com canais externos
 */
router.post('/sync-availability', async (req, res) => {
  try {
    const { propertyId, availability } = req.body;
    
    if (!propertyId || !availability) {
      return res.status(400).json({ error: 'ID da propriedade e disponibilidade são obrigatórios' });
    }

    await pmsService.syncAvailabilityToChannels(propertyId, availability);
    res.json({ success: true, message: 'Disponibilidade sincronizada com sucesso' });
  } catch (error) {
    console.error('Erro ao sincronizar disponibilidade:', error);
    res.status(500).json({ error: 'Erro ao sincronizar disponibilidade' });
  }
});

/**
 * POST /api/pms/webhook/:channel
 * Webhook para receber actualizações dos canais externos
 */
router.post('/webhook/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const payload = req.body;

    await pmsService.handleChannelWebhook(channel, payload);
    res.json({ success: true, message: 'Webhook processado com sucesso' });
  } catch (error) {
    console.error(`Erro ao processar webhook do ${req.params.channel}:`, error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

/**
 * POST /api/pms/sync-booking/:bookingId
 * Sincronizar reserva específica com canais externos
 */
router.post('/sync-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    await pmsService.syncOurBookingToChannels(bookingId);
    res.json({ success: true, message: 'Reserva sincronizada com canais externos' });
  } catch (error) {
    console.error('Erro ao sincronizar reserva:', error);
    res.status(500).json({ error: 'Erro ao sincronizar reserva' });
  }
});

export default router;