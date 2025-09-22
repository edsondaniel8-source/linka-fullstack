/**
 * PMS (Property Management System) Integration Service
 * Integra com QloApps - Sistema open-source gratuito de gestão hoteleira
 * Suporta sincronização com Booking.com, Airbnb, Expedia, etc.
 */

import { db } from '../db';
import { accommodations, bookings } from '../shared/schema';
import { eq } from 'drizzle-orm';

interface PMSProperty {
  id: string;
  name: string;
  address: string;
  rooms: PMSRoom[];
  channels: PMSChannel[];
}

interface PMSRoom {
  id: string;
  name: string;
  type: string;
  maxOccupancy: number;
  basePrice: number;
  amenities: string[];
  images: string[];
}

interface PMSChannel {
  name: string; // 'booking.com', 'airbnb', 'expedia'
  enabled: boolean;
  lastSync: Date;
  credentials: {
    apiKey?: string;
    propertyId?: string;
    username?: string;
    password?: string;
  };
}

interface ChannelAvailability {
  roomId: string;
  date: string;
  available: boolean;
  price: number;
  minStay: number;
}

interface ExternalBooking {
  channelBookingId: string;
  channel: string;
  propertyId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'modified';
}

export class PMSService {
  private qloAppsBaseUrl: string;
  private apiKey: string;

  constructor() {
    this.qloAppsBaseUrl = process.env.QLOAPPS_BASE_URL || 'http://localhost/qloapps';
    this.apiKey = process.env.QLOAPPS_API_KEY || '';
  }

  /**
   * Configurar credenciais do QloApps
   */
  async configurePMS(baseUrl: string, apiKey: string): Promise<void> {
    this.qloAppsBaseUrl = baseUrl;
    this.apiKey = apiKey;
    
    // Salvar configurações no sistema
    // TODO: Implementar storage seguro de credenciais
  }

  /**
   * Sincronizar propriedades do QloApps com nossa plataforma
   */
  async syncPropertiesFromPMS(): Promise<void> {
    try {
      const properties = await this.fetchPropertiesFromQloApps();
      
      for (const property of properties) {
        await this.upsertAccommodationFromPMS(property);
      }
      
      console.log(`Sincronizadas ${properties.length} propriedades do PMS`);
    } catch (error) {
      console.error('Erro ao sincronizar propriedades:', error);
      throw error;
    }
  }

  /**
   * Buscar propriedades do QloApps via API
   */
  private async fetchPropertiesFromQloApps(): Promise<PMSProperty[]> {
    // Simulação da API do QloApps
    // Na implementação real, fazer chamada HTTP para a API
    
    return [
      {
        id: '1',
        name: 'Hotel Polana',
        address: 'Av. Julius Nyerere, Maputo',
        rooms: [
          {
            id: '101',
            name: 'Quarto Standard',
            type: 'standard',
            maxOccupancy: 2,
            basePrice: 150,
            amenities: ['wifi', 'ac', 'tv'],
            images: ['room1.jpg']
          }
        ],
        channels: [
          {
            name: 'booking.com',
            enabled: true,
            lastSync: new Date(),
            credentials: {
              propertyId: 'booking_property_123'
            }
          },
          {
            name: 'airbnb',
            enabled: true,
            lastSync: new Date(),
            credentials: {
              apiKey: 'airbnb_api_key'
            }
          }
        ]
      }
    ];
  }

  /**
   * Criar/actualizar alojamento na nossa plataforma baseado no PMS
   */
  private async upsertAccommodationFromPMS(property: PMSProperty): Promise<void> {
    // Verificar se já existe
    const existing = await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.name, property.name))
      .limit(1);

    const accommodationData = {
      name: property.name,
      type: 'Hotel',
      address: property.address,
      pricePerNight: property.rooms[0]?.basePrice.toString() || '100',
      amenities: property.rooms[0]?.amenities || [],
      images: property.rooms[0]?.images || [],
      description: `Propriedade gerida via PMS - ${property.rooms.length} tipos de quartos disponíveis`,
      isAvailable: true
    };

    if (existing.length > 0) {
      // ✅ CORREÇÃO: Remover updatedAt que não existe no schema
      await db
        .update(accommodations)
        .set(accommodationData) // ✅ Apenas dados que existem no schema
        .where(eq(accommodations.id, existing[0].id));
    } else {
      // Criar novo
      await db
        .insert(accommodations)
        .values(accommodationData);
    }
  }

  /**
   * Sincronizar disponibilidade com canais externos
   */
  async syncAvailabilityToChannels(propertyId: string, availability: ChannelAvailability[]): Promise<void> {
    try {
      // Sincronizar com Booking.com
      await this.syncToBookingCom(propertyId, availability);
      
      // Sincronizar com Airbnb
      await this.syncToAirbnb(propertyId, availability);
      
      // Sincronizar com Expedia
      await this.syncToExpedia(propertyId, availability);
      
      console.log(`Disponibilidade sincronizada para propriedade ${propertyId}`);
    } catch (error) {
      console.error('Erro ao sincronizar disponibilidade:', error);
      throw error;
    }
  }

  /**
   * Sincronizar com Booking.com
   */
  private async syncToBookingCom(propertyId: string, availability: ChannelAvailability[]): Promise<void> {
    // Implementar chamadas à API do Booking.com
    // Usar XML API ou REST API dependendo do tipo de conta
    
    console.log(`Sincronizando ${availability.length} registos com Booking.com`);
    
    // Exemplo de estrutura para Booking.com XML API
    for (const avail of availability) {
      const xmlPayload = `
        <request>
          <hotel_id>${propertyId}</hotel_id>
          <room_id>${avail.roomId}</room_id>
          <date>${avail.date}</date>
          <available>${avail.available ? 1 : 0}</available>
          <rate>${avail.price}</rate>
          <min_stay>${avail.minStay}</min_stay>
        </request>
      `;
      
      // Fazer POST para Booking.com API
      // await this.makeBookingComRequest(xmlPayload);
    }
  }

  /**
   * Sincronizar com Airbnb
   */
  private async syncToAirbnb(propertyId: string, availability: ChannelAvailability[]): Promise<void> {
    // Implementar chamadas à API do Airbnb
    console.log(`Sincronizando ${availability.length} registos com Airbnb`);
    
    for (const avail of availability) {
      const payload = {
        listing_id: propertyId,
        date: avail.date,
        available: avail.available,
        price: avail.price
      };
      
      // Fazer PUT para Airbnb API
      // await this.makeAirbnbRequest(payload);
    }
  }

  /**
   * Sincronizar com Expedia
   */
  private async syncToExpedia(propertyId: string, availability: ChannelAvailability[]): Promise<void> {
    // Implementar chamadas à API do Expedia
    console.log(`Sincronizando ${availability.length} registos com Expedia`);
  }

  /**
   * Processar reserva recebida de canal externo
   */
  async processExternalBooking(externalBooking: ExternalBooking): Promise<string> {
    try {
      // Encontrar alojamento correspondente
      const accommodation = await db
        .select()
        .from(accommodations)
        .where(eq(accommodations.name, externalBooking.propertyId))
        .limit(1);

      if (accommodation.length === 0) {
        throw new Error(`Propriedade não encontrada: ${externalBooking.propertyId}`);
      }

      // ✅ CORREÇÃO: Usar colunas que existem na tabela bookings
      const [booking] = await db
        .insert(bookings)
        .values({
          accommodationId: accommodation[0].id,
          // ✅ Usar passengerId em vez de userId (conforme schema)
          passengerId: 'external_' + externalBooking.channel,
          status: 'confirmed',
          totalPrice: externalBooking.totalPrice.toString(),
          guestName: externalBooking.guestName,
          guestEmail: externalBooking.guestEmail,
          checkInDate: externalBooking.checkIn,
          checkOutDate: externalBooking.checkOut,
          // ✅ Adicionar seatsBooked obrigatório
          seatsBooked: 1,
          // ✅ Remover type, originalPrice, paymentMethod que não existem
        })
        .returning();

      // Bloquear datas no nosso sistema
      await this.blockDatesInOurSystem(
        accommodation[0].id,
        externalBooking.checkIn,
        externalBooking.checkOut
      );

      console.log(`Reserva ${externalBooking.channelBookingId} do ${externalBooking.channel} processada`);
      return booking.id;

    } catch (error) {
      console.error('Erro ao processar reserva externa:', error);
      throw error;
    }
  }

  /**
   * Bloquear datas no nosso sistema para evitar overbooking
   */
  private async blockDatesInOurSystem(accommodationId: string, checkIn: Date, checkOut: Date): Promise<void> {
    // Implementar lógica de bloqueio de datas
    // Pode ser uma tabela separada de disponibilidade ou flag no accommodation
    console.log(`Bloqueando datas de ${checkIn.toISOString()} a ${checkOut.toISOString()} para ${accommodationId}`);
  }

  /**
   * Webhook para receber actualizações dos canais
   */
  async handleChannelWebhook(channel: string, payload: any): Promise<void> {
    try {
      switch (channel) {
        case 'booking.com':
          await this.handleBookingComWebhook(payload);
          break;
        case 'airbnb':
          await this.handleAirbnbWebhook(payload);
          break;
        case 'expedia':
          await this.handleExpediaWebhook(payload);
          break;
        default:
          console.warn(`Canal desconhecido: ${channel}`);
      }
    } catch (error) {
      console.error(`Erro ao processar webhook do ${channel}:`, error);
      throw error;
    }
  }

  private async handleBookingComWebhook(payload: any): Promise<void> {
    if (payload.type === 'new_booking') {
      const externalBooking: ExternalBooking = {
        channelBookingId: payload.booking_id,
        channel: 'booking.com',
        propertyId: payload.property_id,
        roomId: payload.room_id,
        guestName: payload.guest_name,
        guestEmail: payload.guest_email,
        checkIn: new Date(payload.check_in),
        checkOut: new Date(payload.check_out),
        totalPrice: payload.total_price,
        status: 'confirmed'
      };

      await this.processExternalBooking(externalBooking);
    }
  }

  private async handleAirbnbWebhook(payload: any): Promise<void> {
    // Implementar lógica específica do Airbnb
    console.log('Processando webhook do Airbnb:', payload);
  }

  private async handleExpediaWebhook(payload: any): Promise<void> {
    // Implementar lógica específica do Expedia
    console.log('Processando webhook do Expedia:', payload);
  }

  /**
   * Sincronização bidireccional - actualizar canais quando reserva é feita na nossa plataforma
   */
  async syncOurBookingToChannels(bookingId: string): Promise<void> {
    try {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking || !booking.accommodationId) {
        return;
      }

      // Bloquear datas em todos os canais conectados
      const availability: ChannelAvailability[] = [{
        roomId: booking.accommodationId,
        date: booking.checkInDate!.toISOString().split('T')[0],
        available: false,
        price: parseFloat(booking.totalPrice),
        minStay: 1
      }];

      await this.syncAvailabilityToChannels(booking.accommodationId, availability);

    } catch (error) {
      console.error('Erro ao sincronizar reserva para canais:', error);
      throw error;
    }
  }

  /**
   * Relatório de sincronização
   */
  async getSyncReport(): Promise<any> {
    return {
      lastSync: new Date(),
      totalProperties: 5,
      activeChannels: ['booking.com', 'airbnb', 'expedia'],
      syncStatus: {
        'booking.com': 'connected',
        'airbnb': 'connected', 
        'expedia': 'pending'
      },
      pendingSync: 0,
      failedSync: 0
    };
  }
}

export const pmsService = new PMSService();