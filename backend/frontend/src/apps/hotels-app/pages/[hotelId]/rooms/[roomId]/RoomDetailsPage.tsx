// src/apps/hotels-app/pages/[hotelId]/rooms/[roomId]/RoomDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  ArrowLeft, Bed, DollarSign, Users, Building2,
  Calendar, CheckCircle, XCircle, Edit, Trash2,
  Image as ImageIcon, MapPin, Wifi, Tv, Wind,
  Coffee, Lock, Maximize2, Bath, ShowerHead,
  ChevronLeft, ChevronRight, Share2, Printer,
  AlertCircle, Star, Clock
} from 'lucide-react';

// Components
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';

// Types
import type { RoomType } from '@/types';

export default function RoomDetailsPage() {
  const { hotelId, roomId } = useParams<{ hotelId: string; roomId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Buscar detalhes do quarto
  const { data: room, isLoading, error } = useQuery({
    queryKey: ['room-details', hotelId, roomId],
    queryFn: async () => {
      if (!hotelId || !roomId) throw new Error('IDs necessários não fornecidos');
      
      try {
        // Primeiro tenta pelo endpoint específico
        const response = await apiService.getRoomTypeDetails(hotelId, roomId);
        
        if (response.success && response.data) {
          return response.data;
        }
        
        // Fallback: buscar da lista
        const roomTypesResponse = await apiService.getRoomTypesByHotel(hotelId);
        if (roomTypesResponse.success && roomTypesResponse.data) {
          const roomInList = roomTypesResponse.data.find(
            (r: RoomType) => r.id === roomId || r.room_type_id === roomId
          );
          
          if (roomInList) {
            return roomInList;
          }
        }
        
        throw new Error('Quarto não encontrado');
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao carregar detalhes do quarto');
      }
    },
    enabled: !!hotelId && !!roomId,
  });

  // Buscar detalhes do hotel
  const { data: hotel } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const response = await apiService.getHotelById(hotelId!);
      return response.success ? response.data : null;
    },
    enabled: !!hotelId,
  });

  // Buscar estatísticas do hotel (para contexto)
  const { data: stats } = useQuery({
    queryKey: ['hotel-stats', hotelId],
    queryFn: async () => {
      const response = await apiService.getHotelStatsDetailed(hotelId!);
      return response.success ? response.data : null;
    },
    enabled: !!hotelId,
  });

  // Formatar preço
  const formatPrice = (price?: number) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calcular ocupação
  const occupancyRate = room && room.total_units && room.available_units
    ? Math.round(((room.total_units - room.available_units) / room.total_units) * 100)
    : 0;

  // Handlers
  const handleEdit = () => {
    setLocation(`/hotels/${hotelId}/rooms/${roomId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/hotels/${hotelId}/rooms`);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copiado!',
      description: 'Link do quarto copiado para a área de transferência.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Amenities com ícones
  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      'wifi': Wifi,
      'tv': Tv,
      'air-conditioning': Wind,
      'minibar': Coffee,
      'safe': Lock,
      'balcony': Maximize2,
      'sea-view': ImageIcon,
      'city-view': Building2,
      'hairdryer': ShowerHead,
      'bathrobes': Bath,
      'slippers': Bed,
      'desk': Calendar
    };
    
    return icons[amenity.toLowerCase().replace(/ /g, '-')] || CheckCircle;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do quarto...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quarto não encontrado</h2>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'O quarto solicitado não existe ou foi removido.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/hotels/${hotelId}/rooms`}>
              <Button className="w-full">
                Ver Todos os Quartos
              </Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const roomName = room.name || room.room_type_name || 'Tipo de Quarto';
  const images = room.images || [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w-800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800&auto=format&fit=crop'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{roomName}</h1>
              <div className="flex items-center gap-2 mt-1">
                {hotel && (
                  <>
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{hotel.name}</span>
                  </>
                )}
                <Badge variant={room.is_active === false ? 'secondary' : 'default'}>
                  {room.is_active === false ? 'Inativo' : 'Ativo'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Quarto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Imagens e Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  {/* Imagem Principal */}
                  <div className="relative h-96 overflow-hidden rounded-t-lg">
                    <img
                      src={images[currentImageIndex]}
                      alt={roomName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
                    {/* Navegação de Imagens */}
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === 0 ? images.length - 1 : prev - 1
                          )}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === images.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex 
                              ? 'border-blue-500' 
                              : 'border-transparent'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${roomName} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs de Conteúdo */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="amenities">Comodidades</TabsTrigger>
                <TabsTrigger value="pricing">Preços</TabsTrigger>
                <TabsTrigger value="availability">Disponibilidade</TabsTrigger>
              </TabsList>
              
              {/* Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Descrição</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {room.description || 'Este quarto não possui descrição.'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Especificações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Bed className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tipo de Cama</p>
                        <p className="font-semibold">{room.bed_type || 'Não especificado'}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Maximize2 className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tamanho</p>
                        <p className="font-semibold">{room.size || '--'} m²</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Ocupação</p>
                        <p className="font-semibold">
                          {room.base_occupancy || 1}-{room.max_occupancy || 2} pessoas
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <ShowerHead className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Banheiro</p>
                        <p className="font-semibold">{room.bathroom_type || 'Privado'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Comodidades */}
              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Comodidades do Quarto</CardTitle>
                    <CardDescription>
                      Todas as comodidades incluídas neste tipo de quarto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {room.amenities && room.amenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {room.amenities.map((amenity: string, index: number) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Icon className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma comodidade especificada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preços */}
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes de Preços</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-800">Preço Base</h3>
                            <Badge className="bg-blue-100 text-blue-800">por noite</Badge>
                          </div>
                          <p className="text-3xl font-bold text-blue-900">
                            {formatPrice(room.base_price || room.base_price)}
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            Inclui {room.base_occupancy || 1} pessoa{room.base_occupancy !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        {room.extra_adult_price && room.extra_adult_price > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-800 mb-1">Adulto Extra</h3>
                            <p className="text-xl font-bold text-green-900">
                              {formatPrice(room.extra_adult_price)} / noite
                            </p>
                          </div>
                        )}
                        
                        {room.extra_child_price && room.extra_child_price > 0 && (
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 mb-1">Criança Extra</h3>
                            <p className="text-xl font-bold text-yellow-900">
                              {formatPrice(room.extra_child_price)} / noite
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="font-semibold text-gray-800 mb-3">Exemplo de Cálculo</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>2 adultos × 3 noites</span>
                              <span>{formatPrice((room.base_price || 0) * 3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>1 criança extra × 3 noites</span>
                              <span>{formatPrice((room.extra_child_price || 0) * 3)}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>
                                  {formatPrice(
                                    (room.base_price || 0) * 3 + 
                                    (room.extra_child_price || 0) * 3
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {room.children_policy && (
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-semibold text-purple-800 mb-1">Política para Crianças</h3>
                            <p className="text-sm text-purple-700">{room.children_policy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Disponibilidade */}
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Disponibilidade e Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Unidades Totais</p>
                        <p className="text-2xl font-bold text-gray-900">{room.total_units || 0}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 mb-1">Disponíveis</p>
                        <p className="text-2xl font-bold text-green-900">{room.available_units || 0}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 mb-1">Taxa de Ocupação</p>
                        <p className="text-2xl font-bold text-blue-900">{occupancyRate}%</p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 mb-1">Valor em Estoque</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatPrice((room.base_price || 0) * (room.total_units || 0))}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Disponibilidade Atual</p>
                        <p className="text-sm text-gray-600">
                          {room.available_units || 0} de {room.total_units || 0} unidades
                        </p>
                      </div>
                      <Progress value={occupancyRate} className="h-2" />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0%</span>
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Gestão de Disponibilidade</h4>
                          <p className="text-sm text-gray-600">
                            Ajuste preços e disponibilidade por data
                          </p>
                        </div>
                        <Link href={`/hotels/${hotelId}/availability`}>
                          <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Gerir Disponibilidade
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Direita - Resumo e Ações */}
          <div className="space-y-6">
            {/* Card de Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Quarto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={room.is_active === false ? 'secondary' : 'default'}>
                      {room.is_active === false ? 'Inativo' : 'Ativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Código</span>
                    <span className="font-mono">{room.id || room.room_type_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criado em</span>
                    <span className="font-medium">
                      {room.created_at 
                        ? new Date(room.created_at).toLocaleDateString('pt-MZ')
                        : '--/--/----'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização</span>
                    <span className="font-medium">
                      {room.updated_at 
                        ? new Date(room.updated_at).toLocaleDateString('pt-MZ')
                        : '--/--/----'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open(`/hotels/${hotelId}/rooms/create?duplicate=${roomId}`, '_blank')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Duplicar Quarto
                </Button>
                
                <Link href={`/hotels/${hotelId}/rooms/${roomId}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Detalhes
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setLocation(`/hotels/${hotelId}/availability?roomType=${roomId}`)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Ajustar Preços
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir este quarto?')) {
                      toast({
                        title: 'Funcionalidade em desenvolvimento',
                        description: 'A exclusão de quartos estará disponível em breve.',
                      });
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Quarto
                </Button>
              </CardContent>
            </Card>

            {/* Informações do Hotel */}
            {hotel && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4" />
                    Hotel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{hotel.name}</p>
                    <p className="text-sm text-gray-600">{hotel.address}</p>
                    <p className="text-sm text-gray-500">
                      {hotel.locality}, {hotel.province}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{hotel.contact_phone || '--'}</span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{hotel.contact_email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estatísticas Rápidas */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Hotel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ocupação Total</span>
                    <span className="font-semibold">{stats.occupancy_rate || 0}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reservas (30 dias)</span>
                    <span className="font-semibold">{stats.total_bookings || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receita Mensal</span>
                    <span className="font-semibold">{formatPrice(stats.total_revenue || 0)}</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <Link href={`/hotels/${hotelId}/availability`}>
                      <Button variant="outline" className="w-full">
                        Ver Estatísticas Completas
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}