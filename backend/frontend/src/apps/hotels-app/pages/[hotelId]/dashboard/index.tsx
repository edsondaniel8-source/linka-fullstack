// src/apps/hotels-app/pages/[hotelId]/dashboard/index.tsx - VERSÃO CORRIGIDA
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  Building2, Calendar, Users, DollarSign, TrendingUp,
  Bed, Star, MapPin, CheckCircle, XCircle,
  Eye, Edit, Plus, ArrowRight, RefreshCw, AlertCircle,
  BarChart3, Layers, Phone, Mail, CreditCard, Download,
  ArrowLeft
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../hooks/useHotelData';
import { formatPrice } from '@/apps/hotels-app/utils/hotelHelpers';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { HotelStatistics } from '@/types';

interface HotelSpecificDashboardProps {
  hotelId?: string;
}

export default function HotelSpecificDashboard({ hotelId: propHotelId }: HotelSpecificDashboardProps = {}) {
  const { toast } = useToast();
  
  // 🔥 USAR useHotelData PARA GERENCIAMENTO CENTRALIZADO
  // ⚠️ IMPORTANTE: Este hook deve ser chamado INCONDICIONALMENTE
  const { 
    selectedHotelId, 
    selectHotelById,
    hotel,
    selectedHotelId: globalSelectedHotelId,
    isLoading: hotelLoading,
    getHotelName,
    isHotelActive
  } = useHotelData(propHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    if (propHotelId && propHotelId !== globalSelectedHotelId) {
      selectHotelById(propHotelId);
    }
  }, [propHotelId, globalSelectedHotelId, selectHotelById]);

  // Usar o hotelId do hook ou da prop - sempre definido mesmo se for undefined
  const effectiveHotelId = selectedHotelId || propHotelId;

  // Buscar estatísticas do hotel - com tipo correto
  // ⚠️ Este hook DEVE ser chamado INCONDICIONALMENTE
  const { 
    data: stats, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['hotel-stats-dashboard', effectiveHotelId],
    queryFn: async (): Promise<HotelStatistics & {
      // Campos adicionais para compatibilidade
      total_rooms?: number;
      revenue_growth?: number;
      average_rating?: number;
      top_room_type?: string;
      amenities?: string[];
    }> => {
      // ⚠️ IMPORTANTE: Se não tiver hotelId, retorna dados vazios mas NÃO undefined
      if (!effectiveHotelId) {
        return {
          total_bookings: 0,
          total_revenue: 0,
          occupancy_rate: 0,
          average_daily_rate: 0,
          revenue_per_available_room: 0,
          upcoming_bookings: 0,
          current_guests: 0,
          available_rooms: 0,
          cancelled_bookings: 0,
          total_rooms: 0,
          revenue_growth: 0,
          average_rating: 4.0,
          top_room_type: "N/A",
          amenities: []
        };
      }

      try {
        const response = await apiService.getHotelStatsDetailed(effectiveHotelId);
        if (response.success && response.data) {
          const data = response.data as HotelStatistics;
          
          // 🔥 CALCULAR CAMPOS ADICIONAIS PARA COMPATIBILIDADE
          const totalBookings = data.total_bookings || 0;
          const availableRooms = data.available_rooms || 0;
          
          return {
            // Campos do HotelStatistics (espalha todos os dados originais)
            ...data,
            
            // Campos adicionais para compatibilidade com o UI
            total_rooms: totalBookings + availableRooms + 10, // Estimativa
            revenue_growth: 0, // Não temos este dado na API
            average_rating: 4.2, // Valor padrão
            top_room_type: data.top_room_types?.[0]?.room_type_name || "N/A",
            amenities: hotel?.amenities || [] // Usar amenities do hotel
          };
        }
        
        // Retornar dados padrão se não houver resposta
        return {
          total_bookings: 0,
          total_revenue: 0,
          occupancy_rate: 0,
          average_daily_rate: 0,
          revenue_per_available_room: 0,
          upcoming_bookings: 0,
          current_guests: 0,
          available_rooms: 0,
          cancelled_bookings: 0,
          total_rooms: 0,
          revenue_growth: 0,
          average_rating: 4.0,
          top_room_type: "N/A",
          amenities: []
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          total_bookings: 0,
          total_revenue: 0,
          occupancy_rate: 0,
          average_daily_rate: 0,
          revenue_per_available_room: 0,
          upcoming_bookings: 0,
          current_guests: 0,
          available_rooms: 0,
          cancelled_bookings: 0,
          total_rooms: 0,
          revenue_growth: 0,
          average_rating: 4.0,
          top_room_type: "N/A",
          amenities: []
        };
      }
    },
    // ⚠️ IMPORTANTE: enabled deve ser true mesmo se effectiveHotelId for undefined
    // para que o hook seja sempre chamado
    enabled: true,
  });

  // Buscar tipos de quarto do hotel - INCONDICIONAL
  const { 
    data: roomTypes, 
    isLoading: roomTypesLoading 
  } = useQuery({
    queryKey: ['hotel-room-types-dashboard', effectiveHotelId],
    queryFn: async () => {
      if (!effectiveHotelId) return [];
      
      try {
        const response = await apiService.getRoomTypesByHotel(effectiveHotelId);
        if (response.success) {
          const roomTypesList = Array.isArray(response.data) ? response.data : [];
          return roomTypesList.slice(0, 3); // Mostrar apenas os primeiros 3
        }
        return [];
      } catch (error) {
        console.error('Erro ao buscar tipos de quarto:', error);
        return [];
      }
    },
    enabled: !!effectiveHotelId,
  });

  // Buscar reservas recentes - INCONDICIONAL
  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings', effectiveHotelId],
    queryFn: async () => {
      // Simular dados de reservas recentes
      return [
        { id: 1, guestName: "João Silva", roomType: "Suite Presidencial", checkIn: "15 Dez", checkOut: "18 Dez", status: "confirmada" },
        { id: 2, guestName: "Maria Santos", roomType: "Quarto Duplo", checkIn: "20 Dez", checkOut: "22 Dez", status: "pendente" },
        { id: 3, guestName: "Pedro Costa", roomType: "Quarto Familiar", checkIn: "12 Dez", checkOut: "14 Dez", status: "confirmada" },
        { id: 4, guestName: "Ana Pereira", roomType: "Suite Executiva", checkIn: "25 Dez", checkOut: "28 Dez", status: "cancelada" },
      ];
    },
    enabled: true, // Sempre habilitado
  });

  const handleRefresh = () => {
    refetchStats();
    toast({
      title: "Atualizando dados...",
      description: "Os dados do dashboard estão sendo atualizados.",
    });
  };

  const isLoading = hotelLoading || statsLoading || roomTypesLoading;

  // ⚠️ IMPORTANTE: Verificação de hotelId deve vir APÓS todos os hooks
  if (!effectiveHotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Hotel Selecionado</h2>
            <p className="text-gray-600">
              Para acessar o dashboard, você precisa selecionar um hotel primeiro.
            </p>
          </div>
          <Link href="/hotels">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Hotéis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hotelName = getHotelName(hotel);
  const isActive = isHotelActive(hotel);

  // 🔥 FUNÇÕES AUXILIARES PARA VALORES SEGUROS
  const getSafeNumber = (value: number | undefined, defaultValue: number = 0): number => {
    return value !== undefined ? value : defaultValue;
  };

  const getSafeString = (value: string | undefined, defaultValue: string = ""): string => {
    return value !== undefined ? value : defaultValue;
  };

  // 🔥 VALORES SEGUROS DAS ESTATÍSTICAS
  // ⚠️ IMPORTANTE: stats nunca será undefined porque nossa query sempre retorna um valor
  const safeStats = stats || {
    total_bookings: 0,
    total_revenue: 0,
    occupancy_rate: 0,
    average_daily_rate: 0,
    revenue_per_available_room: 0,
    upcoming_bookings: 0,
    current_guests: 0,
    available_rooms: 0,
    cancelled_bookings: 0,
    total_rooms: 0,
    revenue_growth: 0,
    average_rating: 4.0,
    top_room_type: "N/A",
    amenities: []
  };

  const safeOccupancyRate = getSafeNumber(safeStats.occupancy_rate);
  const safeTotalRevenue = getSafeNumber(safeStats.total_revenue);
  const safeTotalBookings = getSafeNumber(safeStats.total_bookings);
  const safeUpcomingBookings = getSafeNumber(safeStats.upcoming_bookings);
  const safeAvailableRooms = getSafeNumber(safeStats.available_rooms);
  const safeTotalRooms = getSafeNumber((safeStats as any)?.total_rooms, safeAvailableRooms + 10);
  const safeRevenueGrowth = getSafeNumber((safeStats as any)?.revenue_growth);
  const safeAverageRating = getSafeNumber((safeStats as any)?.average_rating, 4.2);
  const safeTopRoomType = getSafeString((safeStats as any)?.top_room_type);
  const safeAmenities = (safeStats as any)?.amenities || hotel?.amenities || [];

  return (
    <div className="space-y-8">
      {/* Header do Dashboard - SEM HotelSelector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard do {hotelName}</h2>
          <p className="text-gray-600 mt-1">
            Visão geral do desempenho e estatísticas deste hotel
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href={`/hotels/${effectiveHotelId}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar Hotel
            </Button>
          </Link>
        </div>
      </div>

      {/* Status do Hotel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                {isActive ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Status do Hotel: {isActive ? 'Ativo' : 'Inativo'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isActive 
                    ? 'Seu hotel está ativo e aceitando reservas.'
                    : 'Seu hotel está inativo e não aceita reservas.'
                  }
                </p>
              </div>
            </div>
            {!isActive && (
              <Link href={`/hotels/${effectiveHotelId}/edit`}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Ativar Hotel
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Bed className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeOccupancyRate}%
                </p>
                <Progress value={safeOccupancyRate} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(safeTotalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">
                    +{safeRevenueGrowth}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeTotalBookings}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {safeUpcomingBookings} pendentes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeAverageRating.toFixed(1)}
                </p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(safeAverageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda - Tipos de Quarto e Reservas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipos de Quarto */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tipos de Quarto</CardTitle>
                  <CardDescription>
                    Tipos de quarto disponíveis neste hotel
                  </CardDescription>
                </div>
                <Link href={`/hotels/${effectiveHotelId}/room-types`}>
                  <Button variant="ghost" size="sm">
                    Ver todos
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {roomTypes && roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {roomTypes.map((roomType: any, index: number) => {
                    const roomTypeId = roomType.id || roomType.room_type_id || `temp-${index}`;
                    const roomTypeName = roomType.name || roomType.room_type_name || 'Tipo de Quarto';
                    const isRoomTypeActive = roomType.is_active !== false;
                    
                    return (
                      <div key={roomTypeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Bed className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{roomTypeName}</h3>
                              {!isRoomTypeActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">
                                <DollarSign className="inline h-3 w-3 mr-1" />
                                {formatPrice(roomType.base_price || 0)}
                              </span>
                              <span className="text-sm text-gray-600">
                                <Users className="inline h-3 w-3 mr-1" />
                                {roomType.base_occupancy || 1}-{roomType.max_occupancy || 2}
                              </span>
                              <span className="text-sm text-gray-600">
                                <Layers className="inline h-3 w-3 mr-1" />
                                {roomType.total_units || 0} unidades
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/hotels/${effectiveHotelId}/room-types/${roomTypeId}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/hotels/${effectiveHotelId}/room-types/${roomTypeId}/edit`}>
                            <Button size="sm" disabled={!isRoomTypeActive}>
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bed className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum tipo de quarto cadastrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crie seu primeiro tipo de quarto para começar a receber reservas.
                  </p>
                  <Link href={`/hotels/${effectiveHotelId}/room-types/create`}>
                    <Button>
                      <Plus className="mr-2 h-5 w-5" />
                      Criar Tipo de Quarto
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservas Recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reservas Recentes</CardTitle>
                  <CardDescription>
                    Últimas reservas deste hotel
                  </CardDescription>
                </div>
                <Link href="/hotels/bookings">
                  <Button variant="ghost" size="sm">
                    Ver todas
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(recentBookings || []).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {booking.roomType}
                          </span>
                          <span className="text-sm text-gray-600">
                            {booking.checkIn} → {booking.checkOut}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={
                      booking.status === 'confirmada' ? 'default' :
                      booking.status === 'pendente' ? 'secondary' :
                      'destructive'
                    }>
                      {booking.status === 'confirmada' ? 'Confirmada' :
                       booking.status === 'pendente' ? 'Pendente' :
                       'Cancelada'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Informações e Ações Rápidas */}
        <div className="space-y-6">
          {/* Informações do Hotel */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="font-medium">Nome:</span>
                  <span className="ml-2 text-gray-600">{hotelName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="font-medium">Localização:</span>
                  <span className="ml-2 text-gray-600">
                    {hotel?.locality || 'Não especificada'}
                    {hotel?.province ? `, ${hotel.province}` : ''}
                  </span>
                </div>
                {hotel?.contact_phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="font-medium">Telefone:</span>
                    <span className="ml-2 text-gray-600">{hotel.contact_phone}</span>
                  </div>
                )}
                {hotel?.contact_email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2 text-gray-600">{hotel.contact_email}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Comodidades</h4>
                <div className="flex flex-wrap gap-2">
                  {safeAmenities.slice(0, 5).map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                  {safeAmenities.length > 5 && (
                    <Badge variant="outline">
                      +{safeAmenities.length - 5} mais
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/hotels/${effectiveHotelId}/edit`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Informações
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/hotels/${effectiveHotelId}/room-types/create`} className="block">
                <Button variant="outline" className="w-full justify-start" disabled={!isActive}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tipo de Quarto
                </Button>
              </Link>
              
              <Link href={`/hotels/${effectiveHotelId}/availability`} className="block">
                <Button variant="outline" className="w-full justify-start" disabled={!isActive}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Gerenciar Disponibilidade
                </Button>
              </Link>
              
              <Link href="/hotels/bookings/create" className="block">
                <Button variant="outline" className="w-full justify-start" disabled={!isActive}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Criar Reserva Manual
                </Button>
              </Link>
              
              <Link href={`/hotels/${effectiveHotelId}/room-types`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Layers className="h-4 w-4 mr-2" />
                  Ver Todos os Tipos de Quarto
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Estatísticas Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quartos Disponíveis</span>
                  <span className="font-semibold">
                    {safeAvailableRooms}/{safeTotalRooms}
                  </span>
                </div>
                <Progress 
                  value={safeTotalRooms > 0 ? ((safeAvailableRooms / safeTotalRooms) * 100) : 0} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ocupação Hoje</span>
                  <span className="font-semibold">
                    {safeOccupancyRate}%
                  </span>
                </div>
                <Progress value={safeOccupancyRate} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tipo Mais Popular</span>
                  <span className="font-semibold">{safeTopRoomType || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer do Dashboard */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              Dashboard específico de {hotelName} • Última atualização: hoje
            </span>
          </div>
          <div className="flex space-x-4">
            <Link href={`/hotels/${effectiveHotelId}/analytics`}>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Análises Detalhadas
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}