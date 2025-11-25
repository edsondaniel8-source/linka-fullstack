import { db } from "../../db";
import { rides, type Ride } from "../../shared/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// ✅ MAPEAMENTO PARA TIPOS DE VEÍCULO
const VEHICLE_TYPE_DISPLAY: Record<string, { label: string; icon: string }> = {
  economy: { label: 'Económico', icon: '🚗' },
  comfort: { label: 'Conforto', icon: '🚙' },
  luxury: { label: 'Luxo', icon: '🏎️' },
  family: { label: 'Familiar', icon: '🚐' },
  cargo: { label: 'Carga', icon: '🚚' },
  motorcycle: { label: 'Moto', icon: '🏍️' }
};

// ✅ FUNÇÃO DE NORMALIZAÇÃO PARA FRONTEND
function normalizeDbRideToDto(raw: any) {
  return {
    // Identificação
    id: raw.ride_id || raw.id,
    driverId: raw.driver_id || raw.driverId,
    
    // Informações do motorista
    driverName: raw.driver_name || raw.driverName || null,
    driverRating: raw.driver_rating ? Number(raw.driver_rating) : 
                 raw.driverRating ? Number(raw.driverRating) : null,
    
    // Informações do veículo
    vehicle: `${raw.vehicle_make || ''} ${raw.vehicle_model || ''}`.trim() || 
             raw.vehicle || null,
    vehicleType: raw.vehicle_type || raw.vehicleType || null,
    vehiclePlate: raw.vehicle_plate || raw.vehiclePlate || null,
    vehicleColor: raw.vehicle_color || raw.vehicleColor || null,
    maxPassengers: raw.max_passengers || raw.maxPassengers || null,
    
    // Localização - origem
    fromAddress: raw.from_address || raw.fromAddress || null,
    fromCity: raw.from_city || raw.fromCity || null,
    fromDistrict: raw.from_district || raw.fromDistrict || null,
    fromProvince: raw.from_province || raw.fromProvince || null,
    fromLat: raw.from_lat ? Number(raw.from_lat) : 
             raw.fromLat ? Number(raw.fromLat) : null,
    fromLng: raw.from_lng ? Number(raw.from_lng) : 
             raw.fromLng ? Number(raw.fromLng) : null,
    
    // Localização - destino
    toAddress: raw.to_address || raw.toAddress || null,
    toCity: raw.to_city || raw.toCity || null,
    toDistrict: raw.to_district || raw.toDistrict || null,
    toProvince: raw.to_province || raw.toProvince || null,
    toLat: raw.to_lat ? Number(raw.to_lat) : 
           raw.toLat ? Number(raw.toLat) : null,
    toLng: raw.to_lng ? Number(raw.to_lng) : 
           raw.toLng ? Number(raw.toLng) : null,
    
    // Data e hora
    departureDate: raw.departuredate ? new Date(raw.departuredate).toISOString() :
                   raw.departureDate ? new Date(raw.departureDate).toISOString() : null,
    departureDateFormatted: raw.departuredate ? 
                           new Date(raw.departuredate).toLocaleDateString('pt-PT') :
                           raw.departureDate ? 
                           new Date(raw.departureDate).toLocaleDateString('pt-PT') : null,
    departureTime: raw.departuredate ? 
                  new Date(raw.departuredate).toLocaleTimeString('pt-PT', {hour:'2-digit', minute:'2-digit'}) :
                  raw.departureDate ? 
                  new Date(raw.departureDate).toLocaleTimeString('pt-PT', {hour:'2-digit', minute:'2-digit'}) : null,
    
    // Disponibilidade e preço
    availableSeats: raw.availableseats || raw.availableSeats || 0,
    pricePerSeat: raw.priceperseat !== undefined && raw.priceperseat !== null ? 
                  Number(raw.priceperseat) :
                  raw.pricePerSeat !== undefined && raw.pricePerSeat !== null ? 
                  Number(raw.pricePerSeat) : null,
    
    // Metadados de busca
    distanceFromUserKm: raw.distance_from_city_km || raw.distanceFromUserKm || null,
    matchType: raw.match_type || raw.matchType || null,
    status: raw.status || 'available',
    
    // Campos de compatibilidade
    searchMetadata: raw.search_metadata || raw.searchMetadata || null,
    createdAt: raw.createdat ? new Date(raw.createdat).toISOString() :
               raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updatedAt: raw.updatedat ? new Date(raw.updatedat).toISOString() :
               raw.updatedAt ? new Date(raw.updatedAt).toISOString() : null
  };
}

// ✅ NORMALIZADOR CORRIGIDO - APENAS DRIZZLE SQL
class LocationNormalizerCorrigido {
  static async normalizeLocation(locationName: string): Promise<string> {
    if (!locationName || locationName.trim() === '') {
      return locationName;
    }

    try {
      console.log('🔍 [NORMALIZADOR] Normalizando:', locationName);
      
      // ✅ CORREÇÃO: Usar sql do Drizzle - NUNCA db.query() ou db.execute()
      const result = await db.execute(
        sql`SELECT normalize_location_name(${locationName}) as normalized`
      );

      // ✅ Extração segura do resultado do Drizzle
      let normalizedValue: string = locationName.split(',')[0].trim().toLowerCase();
      
      if (result && Array.isArray(result) && result.length > 0) {
        normalizedValue = (result[0] as any)?.normalized || normalizedValue;
      } else if (result && typeof result === 'object' && 'rows' in result) {
        const rows = (result as any).rows;
        normalizedValue = rows[0]?.normalized || normalizedValue;
      }

      console.log('✅ [NORMALIZADOR] Resultado:', {
        original: locationName,
        normalized: normalizedValue
      });

      return normalizedValue;

    } catch (error) {
      console.error('❌ [NORMALIZADOR] Erro, usando fallback:', error);
      return locationName.split(',')[0].trim().toLowerCase();
    }
  }

  static normalizeForSearch(locationName: string): string {
    console.warn('⚠️ [NORMALIZADOR] Usando normalizeForSearch síncrono');
    return locationName.split(',')[0].trim().toLowerCase();
  }
}

export class RideService {
  
  // 🎯 MÉTODO UNIVERSAL CENTRALIZADO - CORRIGIDO
  async getRidesUniversal(params: {
    fromLocation?: string;
    toLocation?: string;
    userLat?: number;
    userLng?: number;
    toLat?: number;
    toLng?: number;
    radiusKm?: number;
    maxResults?: number;
    status?: string;
  }): Promise<any[]> {
    try {
      const {
        fromLocation,
        toLocation,
        userLat,
        userLng,
        toLat,
        toLng,
        radiusKm = 100,
        maxResults = 20,
      } = params;

      // ✅ CORREÇÃO: Usar normalizador assíncrono
      const normalizedFrom = fromLocation ? await LocationNormalizerCorrigido.normalizeLocation(fromLocation) : '';
      const normalizedTo = toLocation ? await LocationNormalizerCorrigido.normalizeLocation(toLocation) : '';

      console.log('🎯 [NORMALIZAÇÃO-CORRIGIDA]', {
        original: { from: fromLocation, to: toLocation },
        normalized: { from: normalizedFrom, to: normalizedTo },
        radius: radiusKm
      });

      // ✅ CORREÇÃO: Usar sql do Drizzle para funções PostgreSQL
      const result = await db.execute(
        sql`SELECT * FROM get_rides_smart_final(${normalizedFrom || ''}, ${normalizedTo || ''}, ${radiusKm})`
      );

      // ✅ Extração segura dos resultados
      let rows: any[] = [];
      
      if (Array.isArray(result)) {
        rows = result;
      } else if (result && typeof result === 'object' && 'rows' in result) {
        rows = (result as any).rows;
      } else if (result && typeof result === 'object') {
        const arrayProperties = Object.values(result).filter(val => Array.isArray(val));
        if (arrayProperties.length > 0) {
          rows = arrayProperties[0] as any[];
        }
      }
      
      console.log('✅ [SMART-SERVICE] Resultados processados:', {
        totalEncontrado: rows.length,
        primeiroResultado: rows[0] || 'Nenhum'
      });

      // ✅ APLICAÇÃO DA NORMALIZAÇÃO PARA FRONTEND
      const normalizedRides = rows.slice(0, maxResults).map(normalizeDbRideToDto);

      console.log('🎯 [NORMALIZAÇÃO-FRONTEND] Rides normalizados:', normalizedRides.length);
      normalizedRides.forEach((ride: any, index: number) => {
        console.log(`🎯 Ride ${index + 1}:`, {
          id: ride.id,
          fromCity: ride.fromCity,
          toCity: ride.toCity,
          departureDate: ride.departureDate,
          pricePerSeat: ride.pricePerSeat,
          availableSeats: ride.availableSeats
        });
      });
      
      return normalizedRides;

    } catch (error) {
      console.error("❌ Erro em getRidesUniversal:", error);
      return [];
    }
  }

  // 🔍 BUSCA TRADICIONAL POR TEXTO - CORRIGIDA
  async findRidesExact(fromLocation: string, toLocation: string): Promise<any[]> {
    try {
      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(fromLocation);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(toLocation);

      console.log('🔍 [FIND-EXACT] Busca exata normalizada:', {
        original: { from: fromLocation, to: toLocation },
        normalized: { from: normalizedFrom, to: normalizedTo }
      });

      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        maxResults: 10
      });
    } catch (error) {
      console.error("❌ Erro em findRidesExact:", error);
      return [];
    }
  }

  // 🎯 BUSCA INTELIGENTE USANDO POSTGRES - CORRIGIDA
  async findSmartRides(
    passengerFrom: string, 
    passengerTo: string, 
    passengerFromProvince?: string, 
    passengerToProvince?: string
  ): Promise<any[]> {
    try {
      console.log('🧠 [FIND-SMART] Busca inteligente:', {
        from: passengerFrom,
        to: passengerTo,
        fromProvince: passengerFromProvince,
        toProvince: passengerToProvince
      });

      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(passengerFrom);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(passengerTo);

      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        maxResults: 20,
        radiusKm: 100
      });
    } catch (error) {
      console.error("❌ Erro em findSmartRides:", error);
      
      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(passengerFrom);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(passengerTo);
      
      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        maxResults: 20
      });
    }
  }

  // 🆕 MÉTODO PARA BUSCA HÍBRIDA - CORRIGIDA
  async searchRidesHybrid(
    fromLocation: string, 
    toLocation: string, 
    options?: { 
      passengerFromProvince?: string; 
      passengerToProvince?: string;
      maxResults?: number;
      useNearby?: boolean;
      userLat?: number;
      userLng?: number;
      toLat?: number;
      toLng?: number;
      radiusKm?: number;
    }
  ): Promise<any[]> {
    try {
      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(fromLocation);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(toLocation);

      console.log('🎯 [NORMALIZAÇÃO-CORRIGIDA-HYBRID]', {
        original: { from: fromLocation, to: toLocation },
        normalized: { from: normalizedFrom, to: normalizedTo },
        radius: options?.radiusKm
      });

      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        userLat: options?.userLat,
        userLng: options?.userLng,
        toLat: options?.toLat,
        toLng: options?.toLng,
        radiusKm: options?.radiusKm || 100,
        maxResults: options?.maxResults || 20
      });
    } catch (error) {
      console.error("❌ Erro em searchRidesHybrid:", error);
      
      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(fromLocation);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(toLocation);
      
      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        maxResults: options?.maxResults || 20
      });
    }
  }

  // 🎯 BUSCA BÁSICA - CORRIGIDA
  async getRides(filters: { 
    fromLocation?: string; 
    toLocation?: string;
    status?: string;
  } = {}): Promise<any[]> {
    try {
      const { fromLocation, toLocation, status } = filters;
      
      const normalizedFrom = fromLocation ? await LocationNormalizerCorrigido.normalizeLocation(fromLocation) : undefined;
      const normalizedTo = toLocation ? await LocationNormalizerCorrigido.normalizeLocation(toLocation) : undefined;

      console.log('🎯 [NORMALIZAÇÃO-CORRIGIDA-BASIC]', { 
        original: { fromLocation, toLocation },
        normalized: { normalizedFrom, normalizedTo }
      });

      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        status,
        maxResults: 50,
        radiusKm: 100
      });

    } catch (error) {
      console.error("❌ Erro em getRides:", error);
      throw error;
    }
  }

  // 🌍 BUSCA RIDES ENTRE DUAS CIDADES - CORRIGIDA
  async getRidesBetweenCities(fromCity: string, toCity: string, radiusKm: number = 100): Promise<any[]> {
    try {
      const normalizedFrom = await LocationNormalizerCorrigido.normalizeLocation(fromCity);
      const normalizedTo = await LocationNormalizerCorrigido.normalizeLocation(toCity);

      console.log('🎯 [NORMALIZAÇÃO-CORRIGIDA-CITIES]', {
        original: { from: fromCity, to: toCity },
        normalized: { from: normalizedFrom, to: normalizedTo },
        radius: radiusKm
      });

      return await this.getRidesUniversal({
        fromLocation: normalizedFrom,
        toLocation: normalizedTo,
        radiusKm,
        maxResults: 50
      });
    } catch (error) {
      console.error('❌ Erro em getRidesBetweenCities:', error);
      return [];
    }
  }

  // 🌍 BUSCA VIAGENS PRÓXIMAS AO USUÁRIO
  async findNearbyRides(
    lat: number, 
    lng: number, 
    radiusKm: number = 100,
    toLat?: number,
    toLng?: number
  ): Promise<any[]> {
    try {
      console.log('🧠 [NEARBY-RIDES] Busca por proximidade:', {
        lat, lng, radiusKm
      });

      return await this.getRidesUniversal({
        userLat: lat,
        userLng: lng,
        toLat,
        toLng,
        radiusKm,
        maxResults: 50
      });
    } catch (error) {
      console.error("❌ Erro em findNearbyRides:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO ESPECÍFICO PARA BUSCA SMART FINAL - CORRIGIDO
  async searchRidesSmartFinal(params: {
    fromCity?: string;
    toCity?: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
    date?: string;
    passengers?: number;
    radiusKm?: number;
  }): Promise<any[]> {
    try {
      const { fromCity, toCity, fromLat, fromLng, toLat, toLng, date, passengers = 1, radiusKm = 100 } = params;

      const normalizedFrom = fromCity ? await LocationNormalizerCorrigido.normalizeLocation(fromCity) : '';
      const normalizedTo = toCity ? await LocationNormalizerCorrigido.normalizeLocation(toCity) : '';

      console.log('🎯 [NORMALIZAÇÃO-CORRIGIDA-SMART-FINAL]', {
        original: { from: fromCity, to: toCity },
        normalized: { from: normalizedFrom, to: normalizedTo },
        radiusKm
      });

      // ✅ CORREÇÃO: Usar sql do Drizzle
      const result = await db.execute(
        sql`SELECT * FROM get_rides_smart_final(${normalizedFrom || ''}, ${normalizedTo || ''}, ${radiusKm})`
      );
      
      // ✅ Extração segura dos resultados
      let rows: any[] = [];
      
      if (Array.isArray(result)) {
        rows = result;
      } else if (result && typeof result === 'object' && 'rows' in result) {
        rows = (result as any).rows;
      }
      
      // ✅ APLICAÇÃO DA NORMALIZAÇÃO
      const normalizedRides = rows.map(normalizeDbRideToDto);
      
      console.log('🔍 Rides normalizados para frontend:', normalizedRides.length);
      normalizedRides.forEach((ride: any, index: number) => {
        console.log(`🎯 Ride ${index + 1}:`, {
          id: ride.id,
          fromCity: ride.fromCity,
          toCity: ride.toCity,
          departureDate: ride.departureDate,
          pricePerSeat: ride.pricePerSeat,
          availableSeats: ride.availableSeats
        });
      });
      
      return normalizedRides;
    } catch (error) {
      console.error("❌ Erro no searchRidesSmartFinal:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO DE FALLBACK DIRETO - USANDO DRIZZLE ORM
  async searchRidesDirectFallback(
    fromCity: string,
    toCity: string, 
    radiusKm: number = 100
  ): Promise<any[]> {
    try {
      console.log('🔧 [FALLBACK] Usando busca direta como fallback:', {
        fromCity,
        toCity,
        radiusKm
      });

      // ✅ CORREÇÃO: Usar Drizzle ORM para queries SQL complexas
      const result = await db.execute(sql`
        SELECT 
          r.id as ride_id,
          r."driverId" as driver_id,
          u."firstName" || ' ' || u."lastName" as driver_name,
          r."fromAddress",
          r."toAddress", 
          r."fromCity",
          r."toCity",
          r."fromProvince",
          r."toProvince",
          r."departureDate",
          r."departureTime",
          r."availableSeats",
          r."pricePerSeat",
          r."vehicleType",
          r.status
        FROM rides r
        LEFT JOIN users u ON r."driverId" = u.id
        WHERE r.status = 'available'
        AND r."departureDate" >= NOW()
        AND (
          r."fromCity" ILIKE '%' || ${fromCity} || '%'
          OR r."toCity" ILIKE '%' || ${toCity} || '%'
          OR r."fromProvince" ILIKE '%' || ${fromCity} || '%'
          OR r."toProvince" ILIKE '%' || ${toCity} || '%'
        )
        ORDER BY 
          CASE 
            WHEN r."fromCity" ILIKE ${fromCity} AND r."toCity" ILIKE ${toCity} THEN 1
            WHEN r."fromCity" ILIKE ${fromCity} THEN 2
            WHEN r."toCity" ILIKE ${toCity} THEN 3
            ELSE 4
          END,
          r."departureDate"
        LIMIT 20
      `);

      // ✅ Extração segura dos resultados
      let rows: any[] = [];
      
      if (Array.isArray(result)) {
        rows = result;
      } else if (result && typeof result === 'object' && 'rows' in result) {
        rows = (result as any).rows;
      }
      
      console.log('✅ [FALLBACK] Resultados da busca direta:', {
        fromCity,
        toCity,
        resultsCount: rows.length
      });

      return rows.map(normalizeDbRideToDto);

    } catch (error) {
      console.error("❌ Erro em searchRidesDirectFallback:", error);
      return [];
    }
  }

  // 🆕 MÉTODO PARA OBTER RIDE POR ID
  async getRideById(id: string): Promise<any | null> {
    try {
      const [ride] = await db.select()
        .from(rides)
        .where(eq(rides.id, id));
      
      if (!ride) return null;

      return normalizeDbRideToDto(ride);

    } catch (error) {
      console.error("❌ Erro em getRideById:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO PARA BUSCAR RIDES POR MOTORISTA
  async getRidesByDriver(driverId: string, status?: string): Promise<any[]> {
    try {
      let query = db.select().from(rides);
      const conditions = [eq(rides.driverId, driverId)];
      
      if (status) {
        conditions.push(eq(rides.status, status as any));
      }
      
      const result = await query.where(and(...conditions));
      
      return result.map(ride => normalizeDbRideToDto(ride));

    } catch (error) {
      console.error("❌ Erro em getRidesByDriver:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO SIMPLES PARA TODOS OS RIDES DISPONÍVEIS
  async getAllAvailableRides(): Promise<any[]> {
    try {
      return await this.getRidesUniversal({
        maxResults: 100,
        radiusKm: 200
      });
    } catch (error) {
      console.error("❌ Erro em getAllAvailableRides:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO PARA CRIAR RIDE
  async createRide(rideData: Omit<Ride, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    try {
      const normalizedRideData = {
        ...rideData,
        pricePerSeat: rideData.pricePerSeat.toString(),
        fromProvince: this.normalizeString(rideData.fromProvince || ''),
        toProvince: this.normalizeString(rideData.toProvince || ''),
        fromCity: this.normalizeString(rideData.fromCity || ''),
        toCity: this.normalizeString(rideData.toCity || ''),
        fromLocality: this.normalizeString(rideData.fromLocality || ''),
        toLocality: this.normalizeString(rideData.toLocality || ''),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const [newRide] = await db.insert(rides)
        .values(normalizedRideData)
        .returning();

      return normalizeDbRideToDto(newRide);

    } catch (error) {
      console.error("❌ Erro em createRide:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO PARA ATUALIZAR RIDE
  async updateRide(id: string, rideData: Partial<Omit<Ride, 'id' | 'createdAt' | 'updatedAt'>>): Promise<any | null> {
    try {
      const updateData: any = { 
        ...rideData, 
        updatedAt: new Date() 
      };
      
      if (updateData.pricePerSeat !== undefined) {
        updateData.pricePerSeat = updateData.pricePerSeat.toString();
      }
      
      const locationFields = [
        'fromProvince', 'toProvince', 'fromCity', 'toCity', 
        'fromLocality', 'toLocality'
      ] as const;
      
      locationFields.forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          updateData[field] = this.normalizeString(updateData[field]);
        }
      });
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const [updatedRide] = await db.update(rides)
        .set(updateData)
        .where(eq(rides.id, id))
        .returning();

      if (!updatedRide) return null;

      return normalizeDbRideToDto(updatedRide);

    } catch (error) {
      console.error("❌ Erro em updateRide:", error);
      throw error;
    }
  }

  // 🆕 MÉTODO PARA DELETAR RIDE
  async deleteRide(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(rides)
        .where(eq(rides.id, id))
        .returning();
      
      return !!deleted;

    } catch (error) {
      console.error("❌ Erro em deleteRide:", error);
      throw error;
    }
  }

  // 🔄 MÉTODOS AUXILIARES PRIVADOS
  private async getRidesByIds(ids: string[]): Promise<any[]> {
    if (ids.length === 0) return [];
    
    try {
      const result = await db.select()
        .from(rides)
        .where(inArray(rides.id, ids));
      
      return result.map(ride => normalizeDbRideToDto(ride));
    } catch (error) {
      console.error("❌ Erro em getRidesByIds:", error);
      return [];
    }
  }

  private normalizeString(str: string): string {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}

export const rideService = new RideService();