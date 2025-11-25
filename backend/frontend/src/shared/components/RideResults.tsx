import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Map from "./Map";

// ✅ Todos os imports necessários
import BookingModal from "./BookingModal";
import PreBookingChat from "./PreBookingChat"; 
import UserRatings from "./UserRatings";
import PaymentModal from "./PaymentModal";
import PriceNegotiationModal from "./PriceNegotiationModal";
import EnRoutePickupModal from "./EnRoutePickupModal";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";

// ✅ Importar a função normalizeRide do serviço API
import { normalizeRide, formatPrice } from "@/services/api";

// ✅✅✅ INTERFACE RIDE COMPLETAMENTE CORRIGIDA - SEM DUPLICAÇÕES
interface Ride {
  id: string;
  driverId: string;
  
  // ✅✅✅ CORREÇÃO: Campos CRÍTICOS (sem duplicações)
  driverName: string;
  driverRating: number;
  fromCity: string;
  toCity: string;
  
  // Campos de localização
  fromLocation: string;
  toLocation: string;
  fromAddress: string;
  toAddress: string;
  fromProvince?: string;
  toProvince?: string;
  
  // Data e hora
  departureDate: string;
  departureTime: string;
  
  // Preços e capacidade
  price: number;
  pricePerSeat: number;
  availableSeats: number;
  maxPassengers: number;
  currentPassengers: number;
  
  // Veículo
  vehicle: string;
  vehicleType: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired' | 'active' | 'available';
  
  // Tipo
  type: string;
  
  // ✅✅✅ Dados completos do veículo
  vehicleInfo?: {
    make: string;
    model: string;
    type: string;
    typeDisplay: string;
    typeIcon: string;
    plate: string;
    color: string;
    maxPassengers: number;
  };
  
  // Campos opcionais
  description?: string;
  vehiclePhoto?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  allowNegotiation?: boolean;
  allowPickupEnRoute?: boolean;
  isVerifiedDriver?: boolean;
  availableIn?: number;
  
  // Campos de matching
  match_type?: string;
  route_compatibility?: number;
  match_description?: string;
  vehicleFeatures?: string[];
  
  // Driver info
  driver?: {
    firstName?: string;
    lastName?: string;
    rating?: number;
    isVerified?: boolean;
  };
  
  // ✅✅✅ Dados de localização geográfica
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  distanceFromCityKm?: number;
  distanceToCityKm?: number;
}

// ✅ INTERFACE ATUALIZADA com a prop rides
interface RideResultsProps {
  searchParams: {
    from: string;
    to: string;
    when: string;
  };
  rides?: Ride[];
  onRideSelect?: (ride: Ride) => void;
}

// ✅✅✅ FUNÇÕES HELPER SIMPLIFICADAS - CORRIGIDAS
const getDisplayLocation = (ride: any, type: 'from' | 'to') => {
  const location = type === 'from' ? ride.fromCity : ride.toCity;
  return location && location !== 'Cidade não disponível' ? location : 'Localização não disponível';
};

const getDisplayDate = (ride: any) => {
  return ride.departureDateFormatted && ride.departureDateFormatted !== 'Data não disponível' 
    ? ride.departureDateFormatted 
    : 'Data não disponível';
};

const getDisplayPrice = (ride: any) => {
  if (ride.pricePerSeat === null || ride.pricePerSeat === undefined) {
    return 'Preço não disponível';
  }
  
  // Formatar como MZN
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(ride.pricePerSeat);
};

// 🎯 COMPONENTE DE DEBUG - MELHORADO PARA VERIFICAR OS DADOS
const DebugComponent = ({ rides }: { rides: any[] }) => {
  if (!rides || rides.length === 0) return null;
  
  return (
    <div style={{
      background: '#fff3cd',
      border: '2px solid #ffc107',
      borderRadius: '8px',
      padding: '15px',
      margin: '20px 0',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>🔍 DEBUG - Dados Recebidos ({rides.length} rides):</h3>
      {rides.slice(0, 3).map((ride, index) => (
        <div key={ride.id} style={{
          border: '1px solid #ccc',
          padding: '8px',
          margin: '8px 0',
          background: '#f8f9fa'
        }}>
          <strong>Ride {index + 1}:</strong>
          <div>ID: {ride.id}</div>
          <div>Driver: "{ride.driverName}" | Rating: {ride.driverRating}</div>
          <div>Price: {ride.price} | PricePerSeat: {ride.pricePerSeat}</div>
          <div>From: {ride.fromLocation} → To: {ride.toLocation}</div>
          <div>Departure: {ride.departureDate} | Time: {ride.departureTime}</div>
          <div>Vehicle: {ride.vehicleInfo ? `${ride.vehicleInfo.make} ${ride.vehicleInfo.model} - ${ride.vehicleInfo.color} (${ride.vehicleInfo.plate})` : 'N/A'}</div>
          <div>Seats: {ride.availableSeats}</div>
          <div>Match Type: {ride.match_type} | Compatibility: {ride.route_compatibility}%</div>
          <div>Vehicle Type: {ride.vehicleType}</div>
          <div>Distance From City: {ride.distanceFromCityKm} km | Distance To City: {ride.distanceToCityKm} km</div>
        </div>
      ))}
    </div>
  );
};

// 🎯 MAPEAMENTO PARA TIPOS DE VEÍCULO - CORRIGIDO
const VEHICLE_TYPE_DISPLAY: Record<string, { label: string; icon: string }> = {
  economy: { label: 'Económico', icon: '🚗' },
  comfort: { label: 'Conforto', icon: '🚙' },
  luxury: { label: 'Luxo', icon: '🏎️' },
  family: { label: 'Familiar', icon: '🚐' },
  cargo: { label: 'Carga', icon: '🚚' },
  motorcycle: { label: 'Moto', icon: '🏍️' }
};

// 🆕 Função para obter badge de compatibilidade - CORRIGIDA
const getMatchBadge = (ride: Ride) => {
  if (!ride.match_type) return null;

  const matchConfig: { [key: string]: { label: string; color: string } } = {
    'smart_match': { label: '🧠 Inteligente', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'smart_final_direct': { label: '🧠 Inteligente', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'exact_match': { label: '🎯 Match Exato', color: 'bg-green-100 text-green-800 border-green-200' },
    'same_segment': { label: '📍 Mesmo Trecho', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'same_origin': { label: '🚩 Mesma Origem', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'same_destination': { label: '🏁 Mesmo Destino', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'same_direction': { label: '🧭 Mesma Direção', color: 'bg-teal-100 text-teal-800 border-teal-200' }
  };

  const config = matchConfig[ride.match_type] || { label: ride.match_type, color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <Badge className={`${config.color} border text-xs font-medium`}>
      {config.label} {ride.route_compatibility && `(${ride.route_compatibility}%)`}
    </Badge>
  );
};

// 🆕 Função para obter nome do motorista - COMPLETAMENTE CORRIGIDA
const getDriverName = (ride: Ride): string => {
  // ✅✅✅ CORREÇÃO: Priorizar driverName do PostgreSQL, depois dados do driver
  if (ride.driverName && ride.driverName !== 'Motorista') {
    return ride.driverName;
  }
  
  return ride.driver
    ? `${ride.driver.firstName ?? ''} ${ride.driver.lastName ?? ''}`.trim() || 'Motorista'
    : 'Motorista';
};

// 🆕 Função para obter rating do motorista - COMPLETAMENTE CORRIGIDA
const getDriverRating = (ride: Ride): number => {
  // ✅✅✅ CORREÇÃO: Priorizar driverRating do PostgreSQL
  if (ride.driverRating && ride.driverRating > 0) {
    return ride.driverRating;
  }
  
  return ride.driver?.rating ?? 4.5;
};

// 🆕 Função para obter informações do veículo - COMPLETAMENTE CORRIGIDA
const getVehicleInfo = (ride: Ride) => {
  // ✅✅✅ CORREÇÃO: Se temos vehicleInfo completo do PostgreSQL, usar ele
  if (ride.vehicleInfo) {
    return {
      display: `${ride.vehicleInfo.make} ${ride.vehicleInfo.model}`,
      typeDisplay: ride.vehicleInfo.typeDisplay || VEHICLE_TYPE_DISPLAY[ride.vehicleInfo.type]?.label || 'Económico',
      typeIcon: ride.vehicleInfo.typeIcon || VEHICLE_TYPE_DISPLAY[ride.vehicleInfo.type]?.icon || '🚗',
      plate: ride.vehicleInfo.plate || 'Não informada',
      color: ride.vehicleInfo.color || 'Não informada',
      maxPassengers: ride.vehicleInfo.maxPassengers || 4,
      make: ride.vehicleInfo.make,
      model: ride.vehicleInfo.model
    };
  }
  
  // ✅ Fallback para dados antigos
  const typeInfo = VEHICLE_TYPE_DISPLAY[ride.vehicleType || ride.type || 'economy'] || VEHICLE_TYPE_DISPLAY.economy;
  
  return {
    display: ride.vehicleType || ride.type || 'Veículo',
    typeDisplay: typeInfo.label,
    typeIcon: typeInfo.icon,
    plate: 'Não informada',
    color: 'Não informada',
    maxPassengers: ride.maxPassengers || 4,
    make: '',
    model: 'Veículo'
  };
};

// 🆕 Função para formatar data/hora - CORRIGIDA
const formatDateTime = (ride: Ride) => {
  try {
    const departureDate = ride.departureDate ? new Date(ride.departureDate) : new Date();
    const formattedDate = departureDate.toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // ✅✅✅ CORREÇÃO: Usar departureTime real do PostgreSQL
    const formattedTime = ride.departureTime && ride.departureTime !== '08:00' 
      ? ride.departureTime 
      : departureDate.toLocaleTimeString('pt-MZ', {
          hour: '2-digit',
          minute: '2-digit'
        });
    
    return { formattedDate, formattedTime };
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return { formattedDate: 'Data inválida', formattedTime: '--:--' };
  }
};

// ✅✅✅ COMPONENTE RIDECARD CORRIGIDO - COM FUNÇÕES HELPER SIMPLIFICADAS
const RideCard = ({ ride, onBookRide, onNegotiatePrice, onEnRoutePickup }: { 
  ride: Ride; 
  onBookRide: (ride: Ride) => void;
  onNegotiatePrice: (ride: Ride) => void;
  onEnRoutePickup: (ride: Ride) => void;
}) => {
  const normalizedRide = normalizeRide(ride);
  
  return (
    <div className="ride-card" style={{ 
      border: '1px solid #e0e0e0', 
      padding: '16px', 
      margin: '12px 0', 
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    }}>
      {/* Localização */}
      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
        🚩 {getDisplayLocation(normalizedRide, 'from')} 
        <span style={{ margin: '0 8px', color: '#666' }}>→</span>
        🎯 {getDisplayLocation(normalizedRide, 'to')}
      </div>
      
      {/* Data e Hora */}
      <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
        <span style={{ marginRight: '12px' }}>📅 {getDisplayDate(normalizedRide)}</span>
        {normalizedRide.departureTime && normalizedRide.departureTime !== 'Hora não disponível' && (
          <span>⏰ {normalizedRide.departureTime}</span>
        )}
      </div>
      
      {/* Preço e Lugares */}
      <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#2c5aa0' }}>
        💰 {getDisplayPrice(normalizedRide)}
        {normalizedRide.availableSeats > 0 && (
          <span style={{ marginLeft: '12px', fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
            • 🪑 {normalizedRide.availableSeats} {normalizedRide.availableSeats === 1 ? 'lugar' : 'lugares'}
          </span>
        )}
      </div>
      
      {/* Motorista e Veículo */}
      <div style={{ color: '#333', fontSize: '14px' }}>
        <span>👤 {normalizedRide.driverName}</span>
        {normalizedRide.driverRating && (
          <span style={{ marginLeft: '8px' }}>⭐ {normalizedRide.driverRating.toFixed(1)}</span>
        )}
        {normalizedRide.vehicle && (
          <span style={{ marginLeft: '8px' }}>• 🚗 {normalizedRide.vehicle}</span>
        )}
      </div>

      {/* Botões de Ação */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => onBookRide(ride)}
          style={{
            flex: 1,
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          disabled={!normalizedRide.availableSeats || normalizedRide.availableSeats <= 0}
        >
          📅 {(!normalizedRide.availableSeats || normalizedRide.availableSeats <= 0) ? 'Lotado' : 'Reservar Agora'}
        </button>
        
        {ride.allowNegotiation && (
          <button 
            onClick={() => onNegotiatePrice(ride)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🤝 Negociar
          </button>
        )}
      </div>

      {ride.allowPickupEnRoute && (
        <button 
          onClick={() => onEnRoutePickup(ride)}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '8px'
          }}
        >
          📍 Pickup em Rota
        </button>
      )}
    </div>
  );
};

// ✅ Interface para resposta da API
interface RideApiResponse {
  success: boolean;
  rides: Ride[];
  data?: {
    rides: Ride[];
  };
}

export default function RideResults({
  searchParams,
  rides: externalRides = [],
  onRideSelect
}: RideResultsProps) {
  const { toast } = useToast();
  console.log('🔍 [DEBUG] RideResults mounted with params:', searchParams);
  
  // ✅ States para funcionalidades
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<any>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [negotiationRide, setNegotiationRide] = useState<Ride | null>(null);
  const [pickupRide, setPickupRide] = useState<Ride | null>(null);

  // ✅ Query para buscar viagens (só executa se não houver rides externos) - COMPLETAMENTE CORRIGIDA
  const { data: internalRides, isLoading } = useQuery<Ride[]>({
    queryKey: ["rides-search", searchParams.from, searchParams.to, searchParams.when, externalRides.length],
    queryFn: async () => {
      console.log('🔍 [DEBUG] Fetching rides with:', searchParams);
      
      const params = new URLSearchParams();
      if (searchParams.from) params.append('from', searchParams.from);
      if (searchParams.to) params.append('to', searchParams.to);
      if (searchParams.when) params.append('date', searchParams.when);
      
      // ✅✅✅ CORREÇÃO: Usar endpoint de busca inteligente
      params.append('smartSearch', 'true');
      params.append('radiusKm', '100');
      
      const url = `/api/rides/smart/search?${params.toString()}`;
      console.log('🔍 [DEBUG] Fetch URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao buscar viagens');
      
      const result = await response.json() as RideApiResponse;
      console.log('🔍 [DEBUG] API response:', result);
      
      // ✅✅✅ CORREÇÃO: Usar dados consistentes da resposta
      const ridesData = Array.isArray(result.rides) ? result.rides : 
                       Array.isArray(result.data?.rides) ? result.data.rides : [];
      
      console.log('🔍 [DEBUG] Rides data to process:', ridesData);
      
      // ✅✅✅ CORREÇÃO CRÍTICA: Processar resposta com TODOS os novos campos do PostgreSQL
      const processedRides = ridesData.map((ride: any) => {
        console.log('🚗 [DEBUG] Processando ride individual:', ride);

        // ✅✅✅ CORREÇÃO CRÍTICA: Extrair dados do vehicleInfo do PostgreSQL
        const vehicleInfo = ride.vehicleInfo ? {
          make: ride.vehicleInfo.make || ride.vehicle_make || '',
          model: ride.vehicleInfo.model || ride.vehicle_model || 'Veículo',
          type: ride.vehicleInfo.type || ride.vehicle_type || 'economy',
          typeDisplay: ride.vehicleInfo.typeDisplay || VEHICLE_TYPE_DISPLAY[ride.vehicle_type || 'economy']?.label || 'Económico',
          typeIcon: ride.vehicleInfo.typeIcon || VEHICLE_TYPE_DISPLAY[ride.vehicle_type || 'economy']?.icon || '🚗',
          plate: ride.vehicleInfo.plate || ride.vehicle_plate || 'Não informada',
          color: ride.vehicleInfo.color || ride.vehicle_color || 'Não informada',
          maxPassengers: ride.vehicleInfo.maxPassengers || ride.max_passengers || 4
        } : {
          // ✅✅✅ SE vehicleInfo não existe, usar dados diretos do PostgreSQL
          make: ride.vehicle_make || '',
          model: ride.vehicle_model || 'Veículo',
          type: ride.vehicle_type || 'economy',
          typeDisplay: VEHICLE_TYPE_DISPLAY[ride.vehicle_type || 'economy']?.label || 'Económico',
          typeIcon: VEHICLE_TYPE_DISPLAY[ride.vehicle_type || 'economy']?.icon || '🚗',
          plate: ride.vehicle_plate || 'Não informada',
          color: ride.vehicle_color || 'Não informada',
          maxPassengers: ride.max_passengers || 4
        };

        // ✅✅✅ CORREÇÃO CRÍTICA: Converter preço considerando TODAS as fontes possíveis
        const pricePerSeatNum = Number(
          ride.pricePerSeat ?? 
          ride.price_per_seat ?? 
          ride.priceperseat ?? 
          ride.price ?? 
          0
        );
        
        const driverRatingNum = Number(ride.driverRating ?? ride.driver_rating ?? ride.driver?.rating ?? 4.5);
        const availableSeatsNum = Number(ride.availableSeats ?? ride.availableseats ?? 0);
        const maxPassengersNum = Number(ride.maxPassengers ?? ride.max_passengers ?? vehicleInfo.maxPassengers ?? 4);
        
        // ✅✅✅ CORREÇÃO: Formatar data e hora
        const departureDate = ride.departureDate || ride.departuredate;
        const departureTime = ride.departureTime || '08:00';
        
        const processedRide: Ride = {
          id: ride.id?.toString() || ride.ride_id?.toString() || Math.random().toString(),
          driverId: ride.driverId || ride.driver_id,
          
          // ✅✅✅ CORREÇÃO: Campos CRÍTICOS adicionados (SEM DUPLICAÇÕES)
          driverName: ride.driver_name || ride.driverName || 'Motorista',
          driverRating: driverRatingNum,
          fromCity: ride.fromCity || ride.from_city || ride.fromLocation || ride.from_address || 'Partida',
          toCity: ride.toCity || ride.to_city || ride.toLocation || ride.to_address || 'Destino',
          fromLocation: ride.fromLocation || ride.from_address || ride.from_city || '',
          toLocation: ride.toLocation || ride.to_address || ride.to_city || '',
          fromAddress: ride.fromAddress || ride.from_address || ride.fromLocation || '',
          toAddress: ride.toAddress || ride.to_address || ride.toLocation || '',
          fromProvince: ride.fromProvince || ride.from_province,
          toProvince: ride.toProvince || ride.to_province,
          vehicle: ride.vehicle || ride.vehicleInfo || '',
          
          // ✅✅✅ NOVOS CAMPOS: Dados completos do veículo do PostgreSQL
          vehicleInfo: vehicleInfo,
          
          // Data e hora - ✅✅✅ CORREÇÃO APLICADA
          departureDate: departureDate || new Date().toISOString(),
          departureTime: departureTime,
          status: ride.status || 'available',
          
          // Preços e capacidade - ✅✅✅ CORREÇÃO APLICADA
          price: pricePerSeatNum,
          pricePerSeat: pricePerSeatNum,
          maxPassengers: maxPassengersNum,
          currentPassengers: ride.currentPassengers || 0,
          availableSeats: availableSeatsNum,
          
          // Tipo de veículo
          type: ride.type || ride.vehicleType || ride.vehicle_type || 'economy',
          vehicleType: ride.vehicleType || ride.vehicle_type || 'economy',
          
          // Campos de matching
          match_type: ride.match_type || 'smart_match',
          route_compatibility: ride.route_compatibility || 85,
          match_description: ride.match_description || `Encontrado por busca inteligente (${ride.route_compatibility || 85}% compatível)`,
          
          // ✅✅✅ NOVOS CAMPOS: Dados geográficos do PostgreSQL - CORRIGIDOS
          from_lat: ride.from_lat,
          from_lng: ride.from_lng,
          to_lat: ride.to_lat,
          to_lng: ride.to_lng,
          distanceFromCityKm: ride.distance_from_city_km,
          distanceToCityKm: ride.distance_to_city_km,
          
          // Campos opcionais
          description: ride.description,
          estimatedDuration: ride.estimatedDuration,
          estimatedDistance: ride.estimatedDistance,
          allowNegotiation: ride.allowNegotiation ?? true,
          allowPickupEnRoute: ride.allowPickupEnRoute ?? true,
          isVerifiedDriver: ride.isVerifiedDriver,
          
          // Compatibilidade com estrutura antiga
          driver: ride.driver ? {
            firstName: ride.driver.firstName || ride.driver_name?.split(' ')[0] || 'Motorista',
            lastName: ride.driver.lastName || ride.driver_name?.split(' ').slice(1).join(' ') || '',
            rating: driverRatingNum,
            isVerified: ride.driver.isVerified || ride.isVerifiedDriver
          } : ride.driver_name ? {
            firstName: ride.driver_name.split(' ')[0] || 'Motorista',
            lastName: ride.driver_name.split(' ').slice(1).join(' ') || '',
            rating: driverRatingNum,
            isVerified: ride.isVerifiedDriver
          } : undefined
        };

        console.log('🚗 [DEBUG] Ride processado:', {
          id: processedRide.id,
          driverName: processedRide.driverName,
          driverRating: processedRide.driverRating,
          vehicleInfo: processedRide.vehicleInfo,
          price: processedRide.pricePerSeat,
          availableSeats: processedRide.availableSeats,
          fromLocation: processedRide.fromLocation,
          toLocation: processedRide.toLocation,
          distanceFromCityKm: processedRide.distanceFromCityKm,
          distanceToCityKm: processedRide.distanceToCityKm
        });
        
        return processedRide;
      });
      
      console.log('✅ [DEBUG] Total de rides processados:', processedRides.length);
      return processedRides;
    },
    enabled: !!searchParams.from && !!searchParams.to && externalRides.length === 0,
  });

  // ✅ CORREÇÃO: Usar rides externos se disponíveis, senão usar os internos
  const ridesToShow = externalRides.length > 0 ? externalRides : internalRides ?? [];

  console.log('🔍 [DEBUG] Rides data:', ridesToShow);
  console.log('🔍 [DEBUG] Loading state:', isLoading);
  console.log('🔍 [DEBUG] External rides provided:', externalRides.length > 0);

  // ✅ Função para lidar com sucesso de pagamento
  const handlePaymentSuccess = () => {
    console.log('💰 [DEBUG] Payment successful');
    setShowPaymentModal(false);
    setPaymentBooking(null);
    toast({
      title: "Pagamento confirmado!",
      description: "Sua reserva foi confirmada com sucesso.",
      variant: "default"
    });
  };

  // ✅ Funções para os modais
  const handleBookRide = (ride: Ride) => {
    console.log('📋 [DEBUG] Booking ride:', ride.id);
    
    if (onRideSelect) {
      onRideSelect(ride);
    } else {
      setSelectedRide(ride);
      setShowBookingModal(true);
    }
  };

  const handleNegotiatePrice = (ride: Ride) => {
    console.log('💬 [DEBUG] Negotiating price for ride:', ride.id);
    setNegotiationRide(ride);
    setShowNegotiationModal(true);
  };

  const handleEnRoutePickup = (ride: Ride) => {
    console.log('📍 [DEBUG] En route pickup for ride:', ride.id);
    setPickupRide(ride);
    setShowPickupModal(true);
  };

  const submitNegotiation = (negotiationData: any) => {
    console.log('💰 [DEBUG] Price negotiation submitted:', negotiationData);
    setShowNegotiationModal(false);
    setNegotiationRide(null);
    toast({
      title: "Negociação enviada!",
      description: "O motorista recebeu sua proposta de preço.",
    });
  };

  const submitPickupRequest = (pickupData: any) => {
    console.log('🚗 [DEBUG] Pickup request submitted:', pickupData);
    setShowPickupModal(false);
    setPickupRide(null);
    toast({
      title: "Pickup solicitado!",
      description: "O motorista foi notificado do seu ponto de encontro.",
    });
  };

  if (isLoading && externalRides.length === 0) {
    return <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto my-8" />;
  }

  return (
    <>
      {/* 🔍 COMPONENTE DE DEBUG - ADICIONADO PARA VERIFICAR OS DADOS */}
      <DebugComponent rides={ridesToShow} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <Map
            type="ride"
            from={searchParams.from}
            to={searchParams.to}
            markers={ridesToShow.map(ride => ({
              lat: ride.from_lat || -25.9692,
              lng: ride.from_lng || 32.5732,
              popup: `${getVehicleInfo(ride).typeDisplay} - ${formatPrice(ride.pricePerSeat)} - ${getDriverName(ride)}`,
            }))}
          />
        </div>

        {/* Lista de Viagens */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Viagens Disponíveis</h3>
          
          {/* Estatísticas de Matching - CORRIGIDA */}
          {ridesToShow.some(ride => ride.route_compatibility) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">⚡</span>
                Compatibilidade das Viagens
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="text-center">
                  <div className="text-blue-700 font-bold">
                    {ridesToShow.filter(r => r.match_type === 'exact_match').length}
                  </div>
                  <div className="text-blue-600">Exatas</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-700 font-bold">
                    {ridesToShow.filter(r => r.match_type === 'smart_match' || r.match_type === 'smart_final_direct').length}
                  </div>
                  <div className="text-blue-600">Inteligentes</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-700 font-bold">
                    {ridesToShow.filter(r => r.route_compatibility && r.route_compatibility >= 80).length}
                  </div>
                  <div className="text-blue-600">Alta Comp.</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-700 font-bold">{ridesToShow.length}</div>
                  <div className="text-blue-600">Total</div>
                </div>
              </div>
            </div>
          )}
          
          {ridesToShow.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🚗</span>
              </div>
              <p className="text-gray-500">Nenhuma viagem encontrada</p>
            </div>
          ) : (
            ridesToShow.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onBookRide={handleBookRide}
                onNegotiatePrice={handleNegotiatePrice}
                onEnRoutePickup={handleEnRoutePickup}
              />
            ))
          )}
        </div>
      </div>

      {/* MODAIS ATIVADOS */}
      {selectedRide && !onRideSelect && (
        <BookingModal
          type="ride"
          item={selectedRide}
          searchParams={searchParams}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {negotiationRide && (
        <PriceNegotiationModal
          ride={negotiationRide}
          isOpen={showNegotiationModal}
          onClose={() => setShowNegotiationModal(false)}
          onSubmit={submitNegotiation}
        />
      )}

      {pickupRide && (
        <EnRoutePickupModal
          ride={pickupRide}
          isOpen={showPickupModal}
          onClose={() => setShowPickupModal(false)}
          onSubmit={submitPickupRequest}
        />
      )}

      {paymentBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={paymentBooking}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}