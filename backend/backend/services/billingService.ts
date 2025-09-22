import { db } from '../db';
import { bookings, payments, systemSettings } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { calculateDistance } from './distanceService';

interface BillingCalculation {
  subtotal: number;
  platformFee: number;
  providerAmount: number;
  total: number;
  feePercentage: number;
}

interface CreateBillingParams {
  bookingId: string;
  userId: string;
  providerUserId: string;
  serviceType: 'ride' | 'accommodation' | 'event';
  amount: number;
  distanceKm?: number;
  pricePerKm?: number;
}

export class BillingService {
  
  /**
   * Obtém a taxa da plataforma configurada (padrão 11%)
   */
  async getPlatformFeePercentage(): Promise<number> {
    try {
      // Retorna taxa padrão de 11% (pode ser configurada no futuro)
      return 11;
    } catch (error) {
      console.error('Erro ao obter taxa da plataforma:', error);
      return 11.0;
    }
  }

  /**
   * Actualiza a taxa da plataforma (apenas administradores)
   */
  async updatePlatformFeePercentage(percentage: number, adminUserId: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({
        key: 'platform_fee_percentage',
        value: percentage.toString(),
        description: 'Taxa percentual cobrada pela plataforma',
        type: 'number',
        updatedBy: adminUserId
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: percentage.toString(),
          updatedBy: adminUserId,
          updatedAt: new Date()
        }
      });
  }

  /**
   * Calcula preço baseado na distância para boleias
   */
  async calculateRidePrice(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<{
    distance: number;
    pricePerKm: number;
    suggestedPrice: number;
  }> {
    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
    
    // Obter preço por km das configurações
    const [pricePerKmSetting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, 'default_price_per_km'))
      .limit(1);
    
    const pricePerKm = pricePerKmSetting ? parseFloat(pricePerKmSetting.value) : 15.0; // 15 MZN por km por defeito
    const suggestedPrice = distance * pricePerKm;

    return {
      distance,
      pricePerKm,
      suggestedPrice: Math.round(suggestedPrice * 100) / 100 // Arredondar para 2 casas decimais
    };
  }

  /**
   * Calcula a facturação para uma transacção
   */
  async calculateBilling(amount: number): Promise<BillingCalculation> {
    const feePercentage = await this.getPlatformFeePercentage();
    const platformFee = (amount * feePercentage) / 100;
    const providerAmount = amount - platformFee;

    return {
      subtotal: amount,
      platformFee: Math.round(platformFee * 100) / 100,
      providerAmount: Math.round(providerAmount * 100) / 100,
      total: amount,
      feePercentage
    };
  }

  /**
   * Cria facturação para uma reserva confirmada
   */
  async createBilling(params: CreateBillingParams): Promise<void> {
    const billing = await this.calculateBilling(params.amount);

    // ✅ CORREÇÃO: Usar bookingId que existe no schema
    await db.insert(payments).values({
      bookingId: params.bookingId, // ✅ CORRETO: bookingId existe na tabela payments
      userId: params.userId,
      serviceType: params.serviceType,
      subtotal: billing.subtotal.toString(),
      platformFee: billing.platformFee.toString(),
      total: billing.total.toString(),
      paymentStatus: 'completed',
      paymentMethod: 'direct_payment'
    });

    // Actualizar status da reserva
    await db
      .update(bookings)
      .set({
        totalPrice: billing.total.toString(),
        updatedAt: new Date()
      })
      .where(eq(bookings.id, params.bookingId));
  }

  /**
   * Obtém taxas pendentes para um provedor
   */
  async getPendingFees(providerId: string) {
    return await db
      .select({
        id: payments.id,
        bookingId: payments.bookingId, // ✅ CORRETO: bookingId existe
        amount: payments.platformFee,
        status: payments.paymentStatus,
        createdAt: payments.createdAt
      })
      .from(payments)
      .where(and(
        eq(payments.userId, providerId),
        eq(payments.paymentStatus, 'pending')
      ));
  }

  /**
   * Marca uma taxa como paga
   */
  async markFeeAsPaid(feeId: string, paymentMethod: string): Promise<void> {
    await db
      .update(payments)
      .set({
        paymentStatus: 'completed',
        paymentMethod: paymentMethod
      })
      .where(eq(payments.id, feeId));
  }

  /**
   * Obtém relatório financeiro
   */
  async getFinancialReport(startDate: Date, endDate: Date) {
    // Implementar consultas para relatório financeiro
    const totalTransactions = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentStatus, 'completed'));

    const totalRevenue = totalTransactions.reduce((sum, t) => sum + Number(t.total), 0);
    
    const platformFees = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentStatus, 'completed'));

    const totalFees = platformFees.reduce((sum, t) => sum + Number(t.platformFee), 0);

    const pendingPayouts = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentStatus, 'pending'));

    const totalPendingPayouts = pendingPayouts.reduce((sum, t) => sum + Number(t.platformFee), 0);

    return {
      totalTransactions: totalTransactions.length,
      totalRevenue,
      totalFees,
      totalPendingPayouts,
      profitMargin: totalRevenue > 0 ? (totalFees / totalRevenue * 100).toFixed(2) : 0
    };
  }

  /**
   * 🆕 HELPER: Cria fee para prestador após serviço realizado
   * Cliente paga diretamente ao prestador, prestador deve pagar fee à plataforma
   */
  async createFeeForProvider(data: {
    providerId: string;
    type: 'ride' | 'hotel' | 'event';
    totalAmount: number;
    clientId: string;
  }): Promise<void> {
    const feePercentage = await this.getPlatformFeePercentage();
    const feeAmount = (data.totalAmount * feePercentage) / 100;

    // ✅ CORREÇÃO: Usar bookingId com valor gerado
    await db.insert(payments).values({
      bookingId: `${data.type}_${Date.now()}`, // ✅ CORRETO: bookingId existe
      userId: data.clientId,
      serviceType: data.type,
      subtotal: data.totalAmount.toString(),
      platformFee: feeAmount.toString(),
      total: data.totalAmount.toString(),
      paymentStatus: 'pending',
      paymentMethod: 'platform_fee'
    });

    console.log(`✅ Fee criada: ${data.providerId} deve ${feeAmount} MZN à plataforma`);
  }

  /**
   * Configura preços automáticos baseados na distância
   */
  async setAutomaticPricing(enable: boolean, basePrice: number, pricePerKm: number): Promise<void> {
    await Promise.all([
      db.insert(systemSettings).values({
        key: 'automatic_pricing_enabled',
        value: enable.toString(),
        description: 'Preços automáticos baseados na distância',
        type: 'boolean'
      }).onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: enable.toString(), updatedAt: new Date() }
      }),
      
      db.insert(systemSettings).values({
        key: 'base_ride_price',
        value: basePrice.toString(),
        description: 'Preço base para boleias (MZN)',
        type: 'number'
      }).onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: basePrice.toString(), updatedAt: new Date() }
      }),
      
      db.insert(systemSettings).values({
        key: 'default_price_per_km',
        value: pricePerKm.toString(),
        description: 'Preço por quilómetro (MZN)',
        type: 'number'
      }).onConflictDoUpdate({
        target: systemSettings.key,
        set: { value: pricePerKm.toString(), updatedAt: new Date() }
      })
    ]);
  }
}

export const billingService = new BillingService();