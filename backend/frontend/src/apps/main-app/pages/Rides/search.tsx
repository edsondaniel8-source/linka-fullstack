import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft, Phone, Mail, CreditCard, User, Star, MapPin, Navigation, RefreshCw, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import PageHeader from "@/shared/components/PageHeader";
import MobileNavigation from "@/shared/components/MobileNavigation";
import useAuth from "@/shared/hooks/useAuth";

// ✅✅✅ CORREÇÃO: IMPORTAR FUNÇÃO DE NORMALIZAÇÃO DO API SERVICE
import { normalizeRide, formatPrice, type Ride } from "@/services/api";

// ✅✅✅ CORREÇÃO: INTERFACE COMPATÍVEL COM A Ride DO SERVIÇO API
export interface RideFrontend {
  // ✅ Campos básicos da interface Ride do serviço
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  fromLocation: string;
  toLocation: string;
  fromCity: string;
  toCity: string;
  fromAddress: string;
  toAddress: string;
  fromProvince?: string;
  toProvince?: string;
  departureDate: string;
  departureTime: string;
  price: number;
  pricePerSeat: number;
  availableSeats: number;
  maxPassengers: number;
  vehicle: string;
  vehicleType: string;
  status: string;
  type: string;
  
  // ✅ Campos opcionais que podem vir do backend
  currentPassengers?: number;
  vehicleInfo?: any;
  description?: string;
  vehiclePhoto?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  allowNegotiation?: boolean;
  allowPickupEnRoute?: boolean;
  isVerifiedDriver?: boolean;
  driver?: {
    firstName?: string;
    lastName?: string;
    rating?: number;
    isVerified?: boolean;
  };
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicleFeatures?: string[];
}

// ✅ CORREÇÃO: Interface MatchStats atualizada
export interface MatchStats {
  total: number;
  exact?: number;
  compatible?: number;
  same_segment?: number;
  same_direction?: number;
  potential_match?: number;
  smart_matches?: number;
}

// ✅ CORREÇÃO: Interface para informações de matching
export interface RideMatchInfo {
  match_type?: 'exact_match' | 'same_segment' | 'covers_route' | 'nearby' | 'same_direction' | 'smart_match' | 'potential_match' | 'smart_final_direct';
  route_compatibility?: number;
  matchScore?: number;
  dist_from_user_km?: number;
  distance_from_city_km?: number;
  distance_to_city_km?: number;
}

// ✅✅✅ CORREÇÃO: TIPO COMBINADO PARA RIDE COM MATCHING
type RideWithMatch = RideFrontend & RideMatchInfo;

// ✅ INTERFACE EXTENDIDA PARA PARÂMETROS DE BUSCA COM COORDENADAS
interface RideSearchParamsExtended {
  from: string;
  to: string;
  date: string;
  passengers: number;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  radius?: number;
  transportType?: string;
  fromCity?: string;
  toCity?: string;
  fromId?: string;
  toId?: string;
}

interface LocationState {
  rides: RideWithMatch[];
  searchParams: RideSearchParamsExtended;
  timestamp?: number;
}

// ✅ INTERFACE PARA BOOKING REQUEST
interface BookingRequest {
  rideId: string;
  passengers: number;
  pickupLocation: string;
  notes: string;
}

// ✅✅✅ CORREÇÃO: FUNÇÃO DE MAPEAMENTO COMPATÍVEL COM A Ride DO SERVIÇO
const mapRidesToFrontend = (rides: any[]): RideWithMatch[] => {
  console.log('🔄 [MAPEAMENTO-LOCAL] Mapeando rides para frontend:', rides?.length || 0);
  
  if (!rides || !Array.isArray(rides)) {
    console.warn('⚠️ [MAPEAMENTO-LOCAL] Dados inválidos para mapeamento');
    return [];
  }

  return rides.map((ride, index) => {
    console.log(`🚗 [MAPEAMENTO-${index}] Processando ride:`, {
      id: ride.id,
      driverName: ride.driverName,
      price: ride.price,
      fromLocation: ride.fromLocation,
      toLocation: ride.toLocation
    });

    // ✅✅✅ CORREÇÃO: Usar normalizeRide do serviço API para consistência
    const normalizedRide = normalizeRide(ride);
    
    // ✅✅✅ CORREÇÃO: Extrair campos adicionais do ride original antes da normalização
    const additionalFields = {
      currentPassengers: ride.currentPassengers || ride.current_passengers || 0,
      vehicleInfo: ride.vehicleInfo,
      description: ride.description,
      vehiclePhoto: ride.vehiclePhoto || ride.vehicle_photo,
      estimatedDuration: ride.estimatedDuration || ride.estimated_duration,
      estimatedDistance: ride.estimatedDistance || ride.estimated_distance,
      allowNegotiation: ride.allowNegotiation,
      allowPickupEnRoute: ride.allowPickupEnRoute,
      isVerifiedDriver: ride.isVerifiedDriver,
      driver: ride.driver,
      from_lat: ride.from_lat || ride.fromLat,
      from_lng: ride.from_lng || ride.fromLng,
      to_lat: ride.to_lat || ride.toLat,
      to_lng: ride.to_lng || ride.toLng,
      vehicleFeatures: ride.vehicleFeatures,
      
      // Campos de matching
      match_type: ride.match_type || ride.matchType,
      route_compatibility: ride.route_compatibility || ride.matchScore || 0,
      matchScore: ride.matchScore || ride.route_compatibility || 0,
      dist_from_user_km: ride.dist_from_user_km || ride.distanceFromUserKm,
      distance_from_city_km: ride.distance_from_city_km || ride.distanceFromCityKm,
      distance_to_city_km: ride.distance_to_city_km || ride.distanceToCityKm,
    };

    // ✅✅✅ CORREÇÃO: Criar objeto compatível com RideFrontend
    const mappedRide: RideWithMatch = {
      // ✅ Campos básicos da interface Ride
      id: normalizedRide.id || '',
      driverId: normalizedRide.driverId || '',
      driverName: normalizedRide.driverName || 'Motorista não disponível',
      driverRating: normalizedRide.driverRating || 4.5,
      fromLocation: normalizedRide.fromLocation || normalizedRide.fromCity || 'Localização não disponível',
      toLocation: normalizedRide.toLocation || normalizedRide.toCity || 'Localização não disponível',
      fromCity: normalizedRide.fromCity || 'Cidade não disponível',
      toCity: normalizedRide.toCity || 'Cidade não disponível',
      fromAddress: normalizedRide.fromAddress || normalizedRide.fromLocation || 'Endereço não disponível',
      toAddress: normalizedRide.toAddress || normalizedRide.toLocation || 'Endereço não disponível',
      fromProvince: normalizedRide.fromProvince || '',
      toProvince: normalizedRide.toProvince || '',
      departureDate: normalizedRide.departureDate || '',
      departureTime: normalizedRide.departureTime || '',
      price: normalizedRide.price || 0,
      pricePerSeat: normalizedRide.pricePerSeat || normalizedRide.price || 0,
      availableSeats: normalizedRide.availableSeats || 0,
      maxPassengers: normalizedRide.maxPassengers || 4,
      vehicle: normalizedRide.vehicle || 'Veículo não disponível',
      vehicleType: normalizedRide.vehicleType || 'economy',
      status: normalizedRide.status || 'available',
      type: normalizedRide.type || 'one-way',
      
      // ✅ Campos adicionais (opcionais)
      ...additionalFields
    };

    console.log(`✅ [MAPEAMENTO-${index}] Ride mapeado:`, {
      id: mappedRide.id,
      driverName: mappedRide.driverName,
      price: mappedRide.price,
      match_type: mappedRide.match_type,
      route_compatibility: mappedRide.route_compatibility
    });

    return mappedRide;
  });
};

export default function RideSearchPage() {
  const [location, setLocation] = useLocation();
  const [selectedRide, setSelectedRide] = useState<RideWithMatch | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    passengers: 1,
    phone: "",
    email: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  // ✅ USAR INTERFACE RIDE COM MATCHING - INICIALIZAR SEMPRE COMO ARRAY
  const [rides, setRides] = useState<RideWithMatch[]>([]);
  const [searchParams, setSearchParams] = useState<RideSearchParamsExtended>({
    from: "",
    to: "",
    date: "",
    passengers: 1,
    radius: 100 // ✅ CORREÇÃO: Raio padrão aumentado para 100km
  });

  // ✅ ESTADO PARA INDICAR BUSCA INTELIGENTE
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅✅✅ CORREÇÃO CRÍTICA: Nova função para ler parâmetros da URL
  const getSearchParamsFromURL = (): Partial<RideSearchParamsExtended> => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: Partial<RideSearchParamsExtended> = {};
    
    // Parâmetros básicos
    if (urlParams.has('from')) params.from = urlParams.get('from') || '';
    if (urlParams.has('to')) params.to = urlParams.get('to') || '';
    if (urlParams.has('date')) params.date = urlParams.get('date') || '';
    if (urlParams.has('passengers')) params.passengers = parseInt(urlParams.get('passengers') || '1');
    if (urlParams.has('radius')) params.radius = parseInt(urlParams.get('radius') || '100');
    
    // IDs das localizações
    if (urlParams.has('fromId')) params.fromId = urlParams.get('fromId') || '';
    if (urlParams.has('toId')) params.toId = urlParams.get('toId') || '';
    
    // Coordenadas (se disponíveis)
    if (urlParams.has('fromLat')) params.fromLat = parseFloat(urlParams.get('fromLat') || '0');
    if (urlParams.has('fromLng')) params.fromLng = parseFloat(urlParams.get('fromLng') || '0');
    if (urlParams.has('toLat')) params.toLat = parseFloat(urlParams.get('toLat') || '0');
    if (urlParams.has('toLng')) params.toLng = parseFloat(urlParams.get('toLng') || '0');
    
    console.log('🔗 [DEBUG-URL-PARAMS] Parâmetros da URL:', params);
    return params;
  };

  // ✅✅✅ CORREÇÃO CRÍTICA: useEffect completamente corrigido
  useEffect(() => {
    console.log('🚗 RideSearchPage - Iniciando...');
    
    const currentState = (history.state || {}) as LocationState;
    const urlParams = getSearchParamsFromURL();
    
    console.log('🔍 [DEBUG-NAVIGATION] Dados recebidos:', {
      viaState: !!currentState?.searchParams,
      viaURL: Object.keys(urlParams).length > 0,
      stateDate: currentState?.searchParams?.date,
      urlDate: urlParams.date,
      fullURLParams: urlParams,
      fullStateParams: currentState?.searchParams
    });
    
    // ✅✅✅ CORREÇÃO CRÍTICA: Combinar parâmetros do state E da URL
    const combinedParams: RideSearchParamsExtended = {
      // Começar com state (se disponível) ou padrões
      ...(currentState?.searchParams || {
        from: "",
        to: "", 
        date: "",
        passengers: 1,
        radius: 100
      }),
      
      // URL tem PRIORIDADE MÁXIMA (sobrescreve tudo)
      ...urlParams
    };

    console.log('🎯 [DEBUG-COMBINED] Parâmetros finais:', {
      from: combinedParams.from,
      to: combinedParams.to, 
      date: combinedParams.date,
      passengers: combinedParams.passengers,
      source: urlParams.from ? 'URL' : currentState?.searchParams?.from ? 'STATE' : 'DEFAULT'
    });
    
    // ✅✅✅ CORREÇÃO CRÍTICA: Atualizar estado E executar busca de forma síncrona
    setSearchParams(combinedParams);
    
    // ✅✅✅ CORREÇÃO: Executar busca DIRETAMENTE com os parâmetros combinados
    // Não depender do estado do React que é assíncrono
    if (combinedParams.from && combinedParams.to) {
      console.log('📍 Parâmetros válidos, iniciando busca DIRETA...');
      
      // ✅ Pequeno delay para garantir que componentes estão montados
      setTimeout(() => {
        executeSearchWithParams(combinedParams);
      }, 50);
    } else {
      console.log('❌ Parâmetros insuficientes para busca');
      redirectToHome();
    }
  }, []); // ✅ Executar apenas no mount

  const redirectToHome = () => {
    toast({
      title: "Dados não encontrados",
      description: "Por favor, realize uma nova busca.",
      variant: "destructive",
      duration: 4000,
    });
    setLocation('/');
  };

  // ✅✅✅ CORREÇÃO CRÍTICA: Função fetchSmartRides SIMPLIFICADA
  const fetchSmartRides = async (params: RideSearchParamsExtended): Promise<RideWithMatch[]> => {
    try {
      console.log('🧠 [SMART-FINAL] Buscando com parâmetros:', {
        from: params.from,
        to: params.to,
        date: params.date
      });

      // ✅✅✅ CORREÇÃO CRÍTICA: Usar parâmetros PASSADOS, não searchParams do estado
      const smartParams = new URLSearchParams({
        from: params.from || '',
        to: params.to || '',
        date: params.date || '',
        passengers: params.passengers.toString(),
        radiusKm: (params.radius || 100).toString()
      });

      console.log('🔍 [DEBUG-SMART-PARAMS] URL que será enviada:', `/api/rides/smart/search?${smartParams.toString()}`);

      // ✅✅✅ CORREÇÃO CRÍTICA: Usar endpoint CORRETO - /api/rides/smart/search
      const response = await fetch(`/api/rides/smart/search?${smartParams.toString()}`);
      
      if (!response.ok) {
        console.error('❌ Erro na resposta:', response.status, response.statusText);
        throw new Error("Erro ao buscar rotas inteligentes");
      }
      
      const data = await response.json();
      
      console.log('✅ Resposta smart final:', {
        success: data.success,
        totalRides: data.data?.rides?.length || data.results?.length || 0,
        smartSearch: data.smart_search,
        matchStats: data.data?.stats,
        searchMetadata: data.metadata
      });

      // ✅ CORREÇÃO: Processar resposta específica da função smart final
      if (data.success) {
        const ridesArray = Array.isArray(data.data?.rides) ? data.data.rides : 
                          Array.isArray(data.results) ? data.results : 
                          Array.isArray(data.rides) ? data.rides : [];
        
        // ✅✅✅ CORREÇÃO CRÍTICA: USAR mapRidesToFrontend LOCAL
        console.log('🔄 [MAPEAMENTO-AUTO] Aplicando mapRidesToFrontend...');
        const mappedRides: RideWithMatch[] = mapRidesToFrontend(ridesArray);
        
        console.log('🎯 Rides mapeados do smart final:', mappedRides.length);
        
        // ✅ LOG DETALHADO DOS MATCHES ENCONTRADOS
        if (mappedRides.length > 0) {
          const exactMatches = mappedRides.filter(r => r.match_type === 'exact_match').length;
          const smartMatches = mappedRides.filter(r => r.match_type && r.match_type !== 'exact_match').length;
          
          console.log(`📊 Estatísticas Smart: ${exactMatches} exatos, ${smartMatches} inteligentes`);
        }
        
        return mappedRides;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Erro na busca smart final:', error);
      // Fallback para busca tradicional SEGURA
      return await fetchTraditionalRidesSafely(params);
    }
  };

  // ✅✅✅ CORREÇÃO: fetchTraditionalRidesSafely também recebe parâmetros
  const fetchTraditionalRidesSafely = async (params: RideSearchParamsExtended): Promise<RideWithMatch[]> => {
    // Verificação rigorosa antes de fazer a requisição
    if (!params.from || !params.to) {
      console.warn('⚠️ [TRADITIONAL-SAFE] Parâmetros insuficientes, pulando busca tradicional');
      return [];
    }

    try {
      console.log('🔍 [TRADITIONAL-SECONDARY] Buscando tradicionalmente...');
      
      const queryParams = new URLSearchParams({
        from: params.from,
        to: params.to,
        passengers: params.passengers.toString(),
        date: params.date || '',
        radiusKm: (params.radius || 150).toString()
      });

      const response = await fetch(`/api/rides/traditional/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        console.warn('⚠️ [TRADITIONAL-SECONDARY] Busca tradicional falhou:', response.status);
        return [];
      }
      
      const data = await response.json();
      console.log('✅ [TRADITIONAL-SECONDARY] Resultados:', data.length);
      
      // ✅✅✅ CORREÇÃO: USAR mapRidesToFrontend local para resultados tradicionais
      return mapRidesToFrontend(data);
      
    } catch (error) {
      console.error('❌ [TRADITIONAL-SECONDARY] Erro seguro:', error);
      return [];
    }
  };

  // ✅✅✅ CORREÇÃO: Função handleSmartSearch simplificada
  const handleSmartSearch = async () => {
    console.log('🧠 [HANDLE-SMART-SEARCH] Iniciando busca...');
    
    // ✅ Usar searchParams atual + fallback da URL se necessário
    const currentFrom = searchParams.from;
    const currentTo = searchParams.to;
    
    console.log('🔍 [HANDLE-SEARCH-STATE] Estado atual:', {
      currentFrom,
      currentTo,
      hasFrom: !!currentFrom,
      hasTo: !!currentTo
    });

    // ✅ Se estado não tem dados, buscar da URL diretamente
    if (!currentFrom || !currentTo) {
      console.log('🔄 [HANDLE-SEARCH-FALLBACK] Buscando parâmetros da URL...');
      const urlParams = getSearchParamsFromURL();
      
      if (urlParams.from && urlParams.to) {
        console.log('✅ [HANDLE-SEARCH-URL-SUCCESS] Usando URL:', {
          from: urlParams.from,
          to: urlParams.to
        });
        
        // ✅ Atualizar estado e buscar
        setSearchParams(prev => ({ ...prev, ...urlParams }));
        await executeSearchWithParams({ ...searchParams, ...urlParams } as RideSearchParamsExtended);
        return;
      }
    }

    // ✅ Se temos parâmetros, executar busca normal
    if (currentFrom && currentTo) {
      await executeSearchWithParams(searchParams);
    } else {
      console.error('❌ [HANDLE-SEARCH-CRITICAL] Nenhum parâmetro disponível');
      toast({
        title: "Erro nos parâmetros",
        description: "Não foi possível obter origem e destino para a busca.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  // ✅✅✅ CORREÇÃO: executeSearchWithParams recebe parâmetros explicitamente
  const executeSearchWithParams = async (params: RideSearchParamsExtended) => {
    console.log('🚀 [EXECUTE-SEARCH] Executando busca com parâmetros:', {
      from: params.from,
      to: params.to,
      date: params.date,
      hasCompleteCoordinates: !!(params.fromLat && params.fromLng && params.toLat && params.toLng)
    });

    setIsLoading(true);
    
    try {
      let searchResults: RideWithMatch[] = [];

      // ✅ PRIMEIRO: Busca Inteligente (Principal)
      console.log('🧠 [PRIMARY-SMART] Buscando com smart final...');
      searchResults = await fetchSmartRides(params); // ✅ Passar params explicitamente
      console.log('🎯 [PRIMARY-SMART-RESULTS] Resultados smart:', searchResults.length);
      
      // ✅ SECUNDÁRIO: Se inteligente não encontrou nada, tenta tradicional APENAS se válido
      if (searchResults.length === 0) {
        console.log('🔍 [SECONDARY-TRADITIONAL] Nenhum resultado inteligente, tentando tradicional...');
        searchResults = await fetchTraditionalRidesSafely(params); // ✅ Passar params explicitamente
        console.log('📊 [SECONDARY-TRADITIONAL-RESULTS] Resultados tradicionais:', searchResults.length);
      }
      
      // ✅✅✅ CORREÇÃO: Exibir estatísticas de matching
      if (searchResults.length > 0) {
        const smartMatches = searchResults.filter(r => r.match_type).length;
        const exactMatches = searchResults.filter(r => r.match_type === 'exact_match').length;
        const similarMatches = searchResults.filter(r => 
          r.match_type === 'same_segment' || r.match_type === 'same_direction'
        ).length;
        
        console.log(`📊 Estatísticas: ${exactMatches} exatos, ${similarMatches} similares, ${smartMatches} smart no total`);
        
        // ✅ FEEDBACK POSITIVO PARA BUSCA INTELIGENTE
        toast({
          title: `🎯 ${searchResults.length} viagens encontradas`,
          description: `${exactMatches} matchs exatos + ${similarMatches} rotas similares`,
          variant: "default",
          duration: 4000,
        });
      }

      // ✅✅✅ CORREÇÃO: Usar os rides mapeados
      setRides(searchResults);
      
      // ✅ ATUALIZAR SESSION STORAGE
      const searchState: LocationState = {
        rides: searchResults,
        searchParams: params, // ✅ Usar params passados
        timestamp: Date.now()
      };
      sessionStorage.setItem('lastSearchResults', JSON.stringify(searchState));

      if (searchResults.length === 0) {
        toast({
          title: "Nenhuma viagem encontrada",
          description: "Tente aumentar o raio de busca para encontrar rotas similares",
          variant: "default",
          duration: 3000,
        });
      } else {
        console.log('✅ [SEARCH-SUCCESS] Busca concluída:', searchResults.length, 'resultados');
      }

    } catch (error) {
      console.error('❌ [SEARCH-ERROR] Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar viagens. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NOVA FUNÇÃO: Recarregar resultados
  const handleRefreshResults = () => {
    handleSmartSearch();
  };

  // 🆕 Função para obter nome do motorista (compatibilidade) - CORRIGIDA
  const getDriverName = (ride: RideFrontend): string => {
    if (ride.driver && typeof ride.driver === 'object') {
      // ✅ CORREÇÃO: Verificar se driver é um objeto
      return `${ride.driver.firstName ?? ''} ${ride.driver.lastName ?? ''}`.trim() || 'Motorista';
    }
    return ride.driverName || 'Motorista';
  };

  // 🆕 Função para obter rating do motorista (compatibilidade) - CORRIGIDA
  const getDriverRating = (ride: RideFrontend): string => {
    if (ride.driver && typeof ride.driver === 'object' && ride.driver.rating !== undefined) {
      return ride.driver.rating.toString();
    }
    return ride.driverRating?.toString() || '4.5';
  };

  // ✅✅✅ CORREÇÃO COMPLETA: Função getAvailableSeats robusta
  const getAvailableSeats = (ride: RideFrontend): number => {
    if (!ride) {
      console.warn('⚠️ [SEATS] Ride undefined');
      return 0;
    }
    
    console.log('🔍 [SEATS] Analisando assentos do ride:', {
      id: ride.id,
      availableSeats: ride.availableSeats,
      maxPassengers: ride.maxPassengers,
      currentPassengers: ride.currentPassengers
    });

    // ✅ CORREÇÃO: Usar availableSeats diretamente
    let availableSeats = Number(ride.availableSeats || 0);
    
    // ✅ CORREÇÃO: Se availableSeats for 0, tentar calcular a partir de maxPassengers
    if (availableSeats === 0) {
      const maxPassengers = Number(ride.maxPassengers || 0);
      const currentPassengers = Number(ride.currentPassengers || 0);
      
      if (maxPassengers > 0) {
        const calculatedSeats = maxPassengers - currentPassengers;
        if (calculatedSeats > 0) {
          console.log('✅ [SEATS] Usando cálculo alternativo:', { 
            maxPassengers, 
            currentPassengers, 
            calculatedSeats 
          });
          availableSeats = calculatedSeats;
        }
      }
    }
    
    // ✅ CORREÇÃO: Garantir que não seja negativo
    const finalSeats = Math.max(0, availableSeats);
    
    console.log('✅ [SEATS] Assentos finais calculados:', finalSeats);
    return finalSeats;
  };

  // ✅ CORREÇÃO: Função tipada para obter tipo de match para exibição
  const getMatchTypeDisplay = (ride: RideWithMatch): { text: string; color: string } => {
    const matchType = ride.match_type;
    
    switch (matchType) {
      case 'exact_match':
        return { text: '🎯 Match Exato', color: 'bg-green-100 text-green-800' };
      case 'same_segment':
      case 'covers_route':
        return { text: '🛣️ Mesmo Trecho', color: 'bg-blue-100 text-blue-800' };
      case 'nearby':
        return { text: '📍 Próximo', color: 'bg-purple-100 text-purple-800' };
      case 'same_direction':
        return { text: '🧭 Mesma Direção', color: 'bg-orange-100 text-orange-800' };
      case 'smart_match':
      case 'smart_final_direct':
        return { text: '🧠 Inteligente', color: 'bg-indigo-100 text-indigo-800' };
      case 'potential_match':
        return { text: '🤝 Compatível', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { text: '🔍 Tradicional', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // ✅ CORREÇÃO: Função tipada para obter score de compatibilidade
  const getCompatibilityScore = (ride: RideWithMatch): number => {
    return ride.route_compatibility || ride.matchScore || 0;
  };

  // ✅ NOVA FUNÇÃO: Obter descrição do match
  const getMatchDescription = (ride: RideWithMatch): string => {
    const matchType = ride.match_type;
    const compatibility = getCompatibilityScore(ride);
    
    const descriptions: { [key: string]: string } = {
      'exact_match': `Match perfeito (${compatibility}% de compatibilidade)`,
      'same_segment': `No mesmo trecho da rota (${compatibility}% compatível)`,
      'same_direction': `Mesma direção geográfica (${compatibility}% compatível)`,
      'smart_match': `Encontrado por busca inteligente (${compatibility}% compatível)`,
      'smart_final_direct': `Rota similar encontrada (${compatibility}% compatível)`,
      'potential_match': `Rota potencialmente compatível (${compatibility}% compatível)`,
      'nearby': `Próximo da localização desejada`
    };
    
    return descriptions[matchType || ''] || 'Rota disponível';
  };

  const handleBookRide = (ride: RideWithMatch) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para reservar uma viagem.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    const availableSeats = getAvailableSeats(ride);
    if (availableSeats < bookingData.passengers) {
      toast({
        title: "Lugares insuficientes",
        description: `Apenas ${availableSeats} lugar(es) disponível(is)`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setSelectedRide(ride);
    setBookingModal(true);
  };

  // ✅ CORREÇÃO: Mutation com tipagem adequada
  const bookingMutation = useMutation<void, Error, BookingRequest>({
    mutationFn: async (data: BookingRequest) => {
      const response = await fetch('/api/client/rides/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId: data.rideId,
          passengers: data.passengers,
          pickupLocation: data.pickupLocation,
          notes: data.notes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book ride');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva confirmada!",
        description: "Sua reserva foi criada com sucesso. Você receberá mais detalhes por email.",
        duration: 4000,
      });
      setBookingModal(false);
      setSelectedRide(null);
      setBookingData({
        passengers: 1,
        phone: "",
        email: "",
        notes: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na reserva",
        description: error.message || "Não foi possível processar sua reserva. Tente novamente.",
        variant: "destructive",
        duration: 4000,
      });
    }
  });

  const handleConfirmBooking = () => {
    if (!selectedRide) return;
    
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para confirmar a reserva.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    const availableSeats = getAvailableSeats(selectedRide);
    if (availableSeats < bookingData.passengers) {
      toast({
        title: "Lugares insuficientes",
        description: `Apenas ${availableSeats} lugar(es) disponível(is)`,
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    if (!bookingData.phone || !bookingData.email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha telefone e email.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    bookingMutation.mutate({
      rideId: selectedRide.id,
      passengers: bookingData.passengers,
      pickupLocation: `${selectedRide.fromLocation} (Ponto de encontro)`,
      notes: `Telefone: ${bookingData.phone}, Email: ${bookingData.email}. ${bookingData.notes}`
    });
  };

  // ✅✅✅ CORREÇÃO: Usar formatPrice do serviço API
  const displayPrice = (price?: number | string | null): string => {
    return formatPrice(price);
  };

  // ✅✅✅ CORREÇÃO CRÍTICA: Função formatDate completamente corrigida
  const formatDate = (dateString: string) => {
    try {
      console.log('📅 [DATE] Formatando data:', dateString);
      
      if (!dateString) {
        return 'Data não disponível';
      }

      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.warn('⚠️ [DATE] Data inválida:', dateString);
        return 'Data inválida';
      }

      const formatted = date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      console.log('✅ [DATE] Data formatada:', dateString, '->', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ [DATE] Erro ao formatar data:', error);
      return 'Erro na data';
    }
  };

  // ✅✅✅ CORREÇÃO CRÍTICA: Função para obter localização formatada
  const getLocationDisplay = (ride: RideFrontend, type: 'from' | 'to'): string => {
    const location = type === 'from' ? ride.fromLocation : ride.toLocation;
    const city = type === 'from' ? ride.fromCity : ride.toCity;
    
    // ✅ Se temos localização específica, usar ela
    if (location && location !== city) {
      return location;
    }
    
    // ✅ Se não, usar cidade com fallback
    return city || 'Localização não disponível';
  };

  // ✅ CORREÇÃO: Função para validar mudança de passageiros
  const handlePassengersChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const availableSeats = selectedRide ? getAvailableSeats(selectedRide) : 1;
    
    // ✅ CORREÇÃO: Limitar ao máximo disponível
    const finalValue = Math.min(Math.max(1, numValue), availableSeats);
    
    setBookingData({...bookingData, passengers: finalValue});
  };

  // ✅ VERIFICAR SE TEM COORDENADAS COMPLETAS
  const hasCompleteCoordinates = 
    searchParams.fromLat !== undefined && 
    searchParams.fromLng !== undefined &&
    searchParams.toLat !== undefined && 
    searchParams.toLng !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Resultados da Busca" />
      
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          {/* ✅ BOTÃO PARA RECARREGAR RESULTADOS */}
          <Button 
            onClick={handleRefreshResults}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Buscando...' : 'Atualizar Resultados'}
          </Button>
        </div>

        {/* ✅ RESUMO DA BUSCA MELHORADO */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm flex-1">
                <div>
                  <Label>Saindo de</Label>
                  <p className="font-semibold">{searchParams.from || "Não especificado"}</p>
                  {searchParams.fromCity && (
                    <p className="text-xs text-gray-500">{searchParams.fromCity}</p>
                  )}
                  {hasCompleteCoordinates && (
                    <p className="text-xs text-green-600">
                      📍 {searchParams.fromLat?.toFixed(4)}, {searchParams.fromLng?.toFixed(4)}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Indo para</Label>
                  <p className="font-semibold">{searchParams.to || "Não especificado"}</p>
                  {searchParams.toCity && (
                    <p className="text-xs text-gray-500">{searchParams.toCity}</p>
                  )}
                  {hasCompleteCoordinates && (
                    <p className="text-xs text-green-600">
                      📍 {searchParams.toLat?.toFixed(4)}, {searchParams.toLng?.toFixed(4)}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Data</Label>
                  <p className="font-semibold">{searchParams.date || "Não especificada"}</p>
                </div>
                <div>
                  <Label>Passageiros</Label>
                  <p className="font-semibold">{searchParams.passengers}</p>
                </div>
              </div>
              
              {/* ✅ INDICADOR DE BUSCA INTELIGENTE */}
              {hasCompleteCoordinates && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
                  <Navigation className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">Busca Inteligente</p>
                    <p className="text-xs">Raio: {searchParams.radius || 100}km</p>
                    <p className="text-xs">Usando get_rides_smart_final</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ RESULTADOS - AGORA COM GARANTIA DE QUE RIDES É ARRAY */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Buscando viagens inteligentes...
                  </div>
                ) : (
                  <>
                    {rides.length} viagem(s) encontrada(s)
                    {hasCompleteCoordinates && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <MapPin className="w-3 h-3 mr-1" />
                        Busca Inteligente
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <p className="text-gray-600">Buscando viagens mais relevantes...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {hasCompleteCoordinates 
                    ? "Usando algoritmo inteligente para encontrar rotas similares" 
                    : "Buscando viagens tradicionais"}
                </p>
              </div>
            ) : rides.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhuma viagem encontrada</p>
                <p className="text-sm text-gray-500 mt-2">
                  {hasCompleteCoordinates 
                    ? "Tente aumentar o raio de busca para encontrar rotas similares" 
                    : "Tente alterar os critérios de busca na página principal"}
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="mt-4"
                >
                  Voltar à Página Principal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => {
                  const availableSeats = getAvailableSeats(ride);
                  const canBook = availableSeats >= bookingData.passengers;
                  const isFullyBooked = availableSeats === 0;
                  const matchInfo = getMatchTypeDisplay(ride);
                  const compatibilityScore = getCompatibilityScore(ride);
                  const matchDescription = getMatchDescription(ride);
                  
                  return (
                    <div key={ride.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          {/* ✅ CABEÇALHO COM INFO DE MATCHING */}
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {/* ✅ CORREÇÃO: Usar função de localização formatada */}
                              {getLocationDisplay(ride, 'from')} → {getLocationDisplay(ride, 'to')}
                            </h3>
                            {compatibilityScore > 0 && (
                              <Badge className={matchInfo.color}>
                                {matchInfo.text} {compatibilityScore}%
                              </Badge>
                            )}
                          </div>
                          
                          {/* ✅ DESCRIÇÃO DO MATCH */}
                          {ride.match_type && (
                            <p className="text-sm text-gray-600 mb-2 italic">
                              {matchDescription}
                            </p>
                          )}
                          
                          {/* ✅ CORREÇÃO: Data formatada com tratamento de erro */}
                          <p className="text-gray-600">{formatDate(ride.departureDate)}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4" />
                            {/* ✅ USAR NOVA FUNÇÃO PARA NOME */}
                            <span className="text-sm">{getDriverName(ride)}</span>
                            {/* ✅ USAR NOVA FUNÇÃO PARA RATING */}
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{getDriverRating(ride)}</span>
                            </div>
                          </div>
                          
                          {/* ✅ EXIBIR DISPONIBILIDADE */}
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${
                              isFullyBooked ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isFullyBooked ? (
                                <span className="flex items-center">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  LOTADO
                                </span>
                              ) : (
                                `${availableSeats} lugar(es) disponível(is)`
                              )}
                            </span>
                          </div>
                          
                          {/* ✅ VEHICLE TYPE E FEATURES */}
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                            {ride.vehicleType && (
                              <span>🚗 {ride.vehicleType}</span>
                            )}
                            {ride.estimatedDuration && (
                              <span>⏱️ {ride.estimatedDuration} min</span>
                            )}
                            {/* ✅ EXIBIR DISTÂNCIA SE DISPONÍVEL - AGORA TIPADO */}
                            {(ride.dist_from_user_km || ride.distance_from_city_km) && (
                              <span>📍 {(ride.dist_from_user_km || ride.distance_from_city_km)?.toFixed(1)} km</span>
                            )}
                          </div>

                          {/* ✅ FEATURES DO VEÍCULO */}
                          {ride.vehicleFeatures && ride.vehicleFeatures.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {ride.vehicleFeatures.map((feature, index) => (
                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* ✅ CORREÇÃO: Fallback para imagem do veículo */}
                          {ride.vehiclePhoto && (
                            <img 
                              src={ride.vehiclePhoto} 
                              alt="Veículo" 
                              className="w-20 h-20 object-cover rounded mt-2"
                              onError={(e) => {
                                // ✅ CORREÇÃO: Fallback para imagem quebrada
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {/* ✅ USAR PROPRIEDADE price EM VEZ DE pricePerSeat */}
                          <span className="text-2xl font-bold text-green-600">
                            {displayPrice(ride.price)}
                          </span>
                          {ride.pricePerSeat && ride.pricePerSeat !== ride.price && (
                            <span className="text-sm text-gray-500">
                              {displayPrice(ride.pricePerSeat)}/passageiro
                            </span>
                          )}
                          <Button 
                            onClick={() => handleBookRide(ride)}
                            // ✅ CORREÇÃO: Simplificar disabled
                            disabled={isFullyBooked || !user}
                            className={`${
                              !isFullyBooked && user
                                ? 'bg-primary hover:bg-red-600' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {!user ? 'Faça login para reservar' : 
                             isFullyBooked ? 'LOTADO' : 
                             'Reservar Agora'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ MODAL DE RESERVA */}
      <Dialog open={bookingModal} onOpenChange={setBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Complete os dados para confirmar sua reserva
            </DialogDescription>
          </DialogHeader>
          
          {selectedRide && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-sm">
                    {/* ✅ USAR NOVAS PROPRIEDADES */}
                    <span className="font-semibold">{getLocationDisplay(selectedRide, 'from')}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">{getLocationDisplay(selectedRide, 'to')}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(selectedRide.departureDate)}
                </div>
                {/* ✅ USAR NOVA FUNÇÃO PARA NOME */}
                <div className="text-sm text-gray-600">
                  Motorista: {getDriverName(selectedRide)}
                </div>
                {/* ✅ USAR PROPRIEDADE price EM VEZ DE pricePerSeat */}
                <div className="text-sm font-semibold mt-2">
                  Preço: {displayPrice(selectedRide.price)}
                </div>
                
                {/* ✅ EXIBIR INFO OF MATCHING NO MODAL */}
                {selectedRide.match_type && (
                  <div className="text-sm text-blue-600 mt-2">
                    🎯 {getMatchDescription(selectedRide)}
                  </div>
                )}
                
                {/* ✅ EXIBIR DISPONIBILIDADE NO MODAL */}
                <div className={`text-sm font-medium mt-2 ${
                  getAvailableSeats(selectedRide) === 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {getAvailableSeats(selectedRide) === 0 
                    ? 'LOTADO' 
                    : `${getAvailableSeats(selectedRide)} lugar(es) disponível(is)`
                  }
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="passengers">Número de Passageiros</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max={getAvailableSeats(selectedRide)}
                    value={bookingData.passengers}
                    onChange={(e) => handlePassengersChange(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {getAvailableSeats(selectedRide)} lugares disponíveis
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="84 123 4567"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação especial..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Total ({bookingData.passengers} passageiro{bookingData.passengers > 1 ? 's' : ''})</span>
                    {/* ✅ CORREÇÃO: Multiplicação segura de preço */}
                    <span className="text-xl font-bold text-blue-600">
                      {displayPrice((selectedRide.price || 0) * bookingData.passengers)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmBooking}
                  disabled={bookingMutation.isPending || getAvailableSeats(selectedRide) < bookingData.passengers || !user}
                  className="flex-1"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirmar Reserva
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNavigation />
    </div>
  );
}