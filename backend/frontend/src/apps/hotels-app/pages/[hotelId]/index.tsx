// src/apps/hotels-app/pages/[hotelId]/index.tsx - VERSÃO FINAL CORRIGIDA
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Calendar, Users, 
  DollarSign, TrendingUp, Bed, Edit, Plus, Settings,
  BarChart3, Clock, Star, ArrowLeft, Share2, Printer,
  Heart, AlertCircle, CheckCircle, XCircle, ChevronRight,
  Eye, Trash2, RefreshCw, MoreVertical, Wifi, Tv,
  Wind, Coffee, Lock, Maximize2, Bath, ShowerHead
} from 'lucide-react';
import { apiService } from '@/services/api';
import { formatPrice } from '@/apps/hotels-app/utils/hotelHelpers';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import HotelSpecificDashboard from './dashboard';

// Tipos genéricos que aceitam dados da API
type ApiHotel = Record<string, any> & {
  id?: string;
  name?: string;
  locality?: string;
  province?: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  check_in_time?: string;
  check_out_time?: string;
  rating?: string | number;
  is_active?: boolean;
  hotel_id?: string;
  hotel_name?: string;
};

type ApiRoomType = Record<string, any> & {
  id?: string;
  room_type_id?: string;
  name?: string;
  room_type_name?: string;
  base_price?: string | number;
  base_occupancy?: string | number;
  max_occupancy?: string | number;
  total_units?: string | number;
  available_units?: string | number;
};

type RoomTypesApiResponse = {
  data?: ApiRoomType[] | any[];
  roomTypes?: ApiRoomType[];
  count?: number;
  total?: number;
  success?: boolean;
};

export default function HotelDetailsPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Verificar se hotelId existe
  if (!hotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Não Encontrado</h2>
          <p className="text-gray-600 mb-4">
            O ID do hotel não foi fornecido.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/hotels">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Hotéis
              </Button>
            </Link>
            <Link href="/hotels/create">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Hotel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Buscar detalhes do hotel
  const { data: hotel, isLoading: hotelLoading, error: hotelError } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      try {
        const response = await apiService.getHotelById(hotelId);
        return response.success ? (response.data as ApiHotel) : null;
      } catch (error) {
        console.error('Erro ao buscar hotel:', error);
        return null;
      }
    },
    enabled: !!hotelId,
  });

  // Buscar estatísticas do hotel
  const { data: stats } = useQuery({
    queryKey: ['hotel-stats', hotelId],
    queryFn: async () => {
      try {
        const response = await apiService.getHotelStatsDetailed(hotelId);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }
    },
    enabled: !!hotelId,
  });

  // Buscar tipos de quarto do hotel
  const { data: roomTypesResponse } = useQuery<RoomTypesApiResponse>({
    queryKey: ['hotel-room-types', hotelId],
    queryFn: async () => {
      try {
        const response = await apiService.getRoomTypesByHotel(hotelId);
        return response as RoomTypesApiResponse;
      } catch (error) {
        console.error('Erro ao buscar tipos de quarto:', error);
        return { data: [] };
      }
    },
    enabled: !!hotelId,
  });

  if (hotelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do hotel...</p>
        </div>
      </div>
    );
  }

  if (hotelError || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Não Encontrado</h2>
          <p className="text-gray-600 mb-4">
            O hotel solicitado não existe ou você não tem acesso.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/hotels">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Hotéis
              </Button>
            </Link>
            <Link href="/hotels/create">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Hotel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper para converter valores para número
  const toNumber = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Helper para converter rating para número
  const getRatingNumber = (rating: string | number | undefined): number | undefined => {
    if (rating === undefined || rating === null) return undefined;
    if (typeof rating === 'number') return rating;
    if (typeof rating === 'string') {
      const parsed = parseFloat(rating);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  // Cast hotel para ApiHotel para acessar propriedades com segurança
  const hotelData = hotel as ApiHotel;

  const getHotelId = (hotelData: ApiHotel) => {
    return hotelData.id || hotelData.hotel_id || '';
  };

  const getHotelName = (hotelData: ApiHotel) => {
    return hotelData.name || hotelData.hotel_name || 'Hotel sem nome';
  };

  const hotelName = getHotelName(hotelData);
  const hotelIdActual = getHotelId(hotelData);
  const isHotelActive = hotelData.is_active !== false;
  const ratingNumber = getRatingNumber(hotelData.rating);
  
  // Extrair dados dos tipos de quarto da resposta da API
  const roomTypesList: ApiRoomType[] = Array.isArray(roomTypesResponse?.data) 
    ? roomTypesResponse.data 
    : Array.isArray(roomTypesResponse?.roomTypes) 
      ? roomTypesResponse.roomTypes 
      : [];

  const roomTypesCount = roomTypesResponse?.count || roomTypesResponse?.total || roomTypesList.length;
  const hasRoomTypes = roomTypesList.length > 0;

  // Helper para obter dados de um roomType de forma segura
  const getRoomTypeData = (roomType: ApiRoomType) => {
    return {
      id: roomType.id || roomType.room_type_id || '',
      name: roomType.name || roomType.room_type_name || 'Tipo de quarto sem nome',
      basePrice: toNumber(roomType.base_price),
      baseOccupancy: toNumber(roomType.base_occupancy),
      maxOccupancy: toNumber(roomType.max_occupancy),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/hotels">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{hotelName}</h1>
                  <Badge variant={isHotelActive ? 'default' : 'secondary'}>
                    {isHotelActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {ratingNumber !== undefined && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      <Star className="h-3 w-3 mr-1" />
                      {ratingNumber.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {hotelData.locality || 'Local não especificado'}
                    {hotelData.province ? `, ${hotelData.province}` : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Link href={`/hotels/${hotelId}/edit`}>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Hotel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rooms">Tipos de Quarto</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* 🔥 CORREÇÃO: Não passe hotelId como prop, o componente usa useParams() */}
            <HotelSpecificDashboard />
          </TabsContent>

          {/* Tipos de Quarto Tab */}
          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tipos de Quarto</CardTitle>
                    <CardDescription>
                      Gerencie os tipos de quarto deste hotel
                    </CardDescription>
                  </div>
                  <Link href={`/hotels/${hotelId}/room-types/create`}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tipo de Quarto
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {hasRoomTypes ? (
                  <div className="space-y-4">
                    {roomTypesList.slice(0, 5).map((roomType: ApiRoomType, index: number) => {
                      const roomTypeData = getRoomTypeData(roomType);
                      
                      return (
                        <div key={roomTypeData.id || `roomtype-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Bed className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{roomTypeData.name}</h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  <DollarSign className="inline h-3 w-3 mr-1" />
                                  {formatPrice(roomTypeData.basePrice)} / noite
                                </span>
                                <span className="text-sm text-gray-600">
                                  <Users className="inline h-3 w-3 mr-1" />
                                  {roomTypeData.baseOccupancy}-{roomTypeData.maxOccupancy} pessoas
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {roomTypeData.id && (
                              <>
                                <Link href={`/hotels/${hotelId}/room-types/${roomTypeData.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                </Link>
                                <Link href={`/hotels/${hotelId}/room-types/${roomTypeData.id}/edit`}>
                                  <Button size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {roomTypesCount > 5 && (
                      <div className="text-center pt-4">
                        <Link href={`/hotels/${hotelId}/room-types`}>
                          <Button variant="link">
                            Ver todos os {roomTypesCount} tipos de quarto
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Bed className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum tipo de quarto cadastrado
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Crie seu primeiro tipo de quarto para começar a receber reservas.
                    </p>
                    <Link href={`/hotels/${hotelId}/room-types/create`}>
                      <Button>
                        <Plus className="mr-2 h-5 w-5" />
                        Criar Primeiro Tipo de Quarto
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservas Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservas</CardTitle>
                <CardDescription>
                  Gerencie as reservas deste hotel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Módulo de Reservas
                  </h3>
                  <p className="text-gray-600 mb-6">
                    As funcionalidades de gestão de reservas estarão disponíveis em breve.
                  </p>
                  <Link href="/hotels/bookings">
                    <Button>
                      <ChevronRight className="mr-2 h-5 w-5" />
                      Ver Reservas Globais
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disponibilidade Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Disponibilidade</CardTitle>
                    <CardDescription>
                      Gerencie preços e disponibilidade por data
                    </CardDescription>
                  </div>
                  <Link href={`/hotels/${hotelId}/availability`}>
                    <Button size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendário Completo
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Calendário de Disponibilidade
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ajuste preços e disponibilidade para datas específicas.
                  </p>
                  <Link href={`/hotels/${hotelId}/availability`}>
                    <Button>
                      <ChevronRight className="mr-2 h-5 w-5" />
                      Abrir Calendário
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Hotel</CardTitle>
                <CardDescription>
                  Gerencie as configurações específicas deste hotel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
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
                            {hotelData.address || hotelData.locality || 'Não especificada'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-medium">Telefone:</span>
                          <span className="ml-2 text-gray-600">
                            {hotelData.contact_phone || 'Não especificado'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-medium">Email:</span>
                          <span className="ml-2 text-gray-600">
                            {hotelData.contact_email || 'Não especificado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Horários</h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-medium">Check-in:</span>
                          <span className="ml-2 text-gray-600">
                            {hotelData.check_in_time || '14:00'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="font-medium">Check-out:</span>
                          <span className="ml-2 text-gray-600">
                            {hotelData.check_out_time || '12:00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Badge variant={isHotelActive ? 'default' : 'secondary'}>
                            {isHotelActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo para reservas
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {isHotelActive 
                            ? 'Este hotel está ativo e aceitando reservas.'
                            : 'Este hotel está inativo e não aceita reservas.'
                          }
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ações</h4>
                      <div className="space-y-3">
                        <Link href={`/hotels/${hotelId}/edit`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Informações do Hotel
                          </Button>
                        </Link>
                        <Link href={`/hotels/${hotelId}/room-types/create`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Tipo de Quarto
                          </Button>
                        </Link>
                        <Link href={`/hotels/${hotelId}/availability`} className="block">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="h-4 w-4 mr-2" />
                            Gerenciar Disponibilidade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}