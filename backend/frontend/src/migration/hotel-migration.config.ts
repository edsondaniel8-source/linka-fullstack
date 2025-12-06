/**
 * Configuração de migração para Hotéis v2
 * Ativar/desativar features durante transição
 */

export const hotelMigrationConfig = {
  // Usar API v2 para busca
  useV2Search: true,
  
  // Usar API v2 para detalhes
  useV2Details: true,
  
  // Usar API v2 para reservas
  useV2Booking: true,
  
  // Logar todas as chamadas para debug
  debugMode: true,
  
  // Fallback para v1 se v2 falhar
  enableFallback: true,
  
  // URLs das APIs
  apiUrls: {
    v1: '/api/hotels',
    v2: '/api/v2/hotels'
  }
} as const;

export type HotelMigrationConfig = typeof hotelMigrationConfig;
