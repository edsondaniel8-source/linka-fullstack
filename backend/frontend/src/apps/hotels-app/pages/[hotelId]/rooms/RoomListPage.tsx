// src/apps/hotels-app/pages/[hotelId]/rooms/RoomListPage.tsx
import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { 
  Bed, Plus, Search, Filter, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, RefreshCw, Building2,
  CheckCircle, XCircle, AlertCircle, Download,
  ArrowLeft, Users, DollarSign, Calendar
} from 'lucide-react';

// Componentes UI
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

// Types
import type { RoomType } from '@/types';

export default function RoomListPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // Buscar detalhes do hotel para mostrar no header
  const { data: hotel } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const response = await apiService.getHotelById(hotelId);
      return response.success ? response.data : null;
    },
    enabled: !!hotelId,
  });

  // Buscar tipos de quarto
  const { 
    data: roomTypesData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['hotel-room-types', hotelId],
    queryFn: async () => {
      if (!hotelId) return { rooms: [], total: 0 };
      
      try {
        const response = await apiService.getRoomTypesByHotel(hotelId);
        
        if (response.success) {
          const rooms = response.data || response.roomTypes || [];
          return {
            rooms: Array.isArray(rooms) ? rooms : [],
            total: rooms.length || 0
          };
        }
        throw new Error(response.error || 'Erro ao buscar quartos');
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar tipos de quarto',
          variant: 'destructive',
        });
        return { rooms: [], total: 0 };
      }
    },
    enabled: !!hotelId,
  });

  // Mutation para deletar quarto
  const deleteRoomMutation = useMutation({
    mutationFn: async (roomTypeId: string) => {
      // Em produção, você implementaria: apiService.deleteRoomType(hotelId!, roomTypeId)
      // Simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Quarto excluído com sucesso' };
    },
    onSuccess: (data, roomTypeId) => {
      toast({
        title: 'Sucesso!',
        description: data.message,
      });
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['hotel-room-types', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['hotel-stats', hotelId] });
      
      setDeletingRoomId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir quarto',
        variant: 'destructive',
      });
      setDeletingRoomId(null);
    },
  });

  // Filtrar e ordenar quartos
  const filteredRooms = roomTypesData?.rooms.filter((room: RoomType) => {
    // Filtro por busca
    const matchesSearch = searchTerm === '' || 
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.bed_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && room.is_active !== false) ||
      (statusFilter === 'inactive' && room.is_active === false);
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Ordenar
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'price_asc':
        return (a.base_price || 0) - (b.base_price || 0);
      case 'price_desc':
        return (b.base_price || 0) - (a.base_price || 0);
      case 'available_desc':
        return (b.available_units || 0) - (a.available_units || 0);
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = sortedRooms.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleDeleteRoom = (roomId: string) => {
    if (!confirm('Tem certeza que deseja excluir este tipo de quarto? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setDeletingRoomId(roomId);
    deleteRoomMutation.mutate(roomId);
  };

  const handleEditRoom = (roomId: string) => {
    setLocation(`/hotels/${hotelId}/rooms/${roomId}/edit`);
  };

  const handleViewRoom = (roomId: string) => {
    setLocation(`/hotels/${hotelId}/rooms/${roomId}`);
  };

  const handleAddRoom = () => {
    setLocation(`/hotels/${hotelId}/rooms/create`);
  };

  const handleBackToHotels = () => {
    setLocation('/hotels/dashboard');
  };

  const handleExport = () => {
    // Em produção, implementar exportação CSV/Excel
    const csvContent = [
      ['Nome', 'Preço Base', 'Unidades', 'Disponíveis', 'Status'],
      ...sortedRooms.map(room => [
        room.name || '',
        `MT ${room.base_price || 0}`,
        room.total_units || 0,
        room.available_units || 0,
        room.is_active === false ? 'Inativo' : 'Ativo'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quartos-${hotel?.name || 'hotel'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: 'Lista de quartos exportada para CSV.',
    });
  };

  // Formatar preço
  const formatPrice = (price?: number) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Obter nome do quarto
  const getRoomName = (room: RoomType) => {
    return room.name || room.room_type_name || 'Tipo de Quarto';
  };

  // Obter ID do quarto
  const getRoomId = (room: RoomType) => {
    return room.id || room.room_type_id || '';
  };

  if (!hotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Hotel Selecionado</h2>
            <p className="text-gray-600">
              Para gerenciar quartos, você precisa selecionar um hotel.
            </p>
          </div>
          <Button onClick={handleBackToHotels} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Hotéis
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/hotels/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tipos de Quarto</h1>
              <div className="flex items-center gap-2 mt-2">
                {hotel ? (
                  <>
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{hotel.name}</span>
                    <Badge variant="outline">{hotel.locality}, {hotel.province}</Badge>
                  </>
                ) : (
                  <span className="text-gray-600">Hotel ID: {hotelId}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={sortedRooms.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={handleAddRoom} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo de Quarto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome, descrição, tipo de cama..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome (A-Z)</SelectItem>
                    <SelectItem value="price_asc">Preço (menor primeiro)</SelectItem>
                    <SelectItem value="price_desc">Preço (maior primeiro)</SelectItem>
                    <SelectItem value="available_desc">Mais disponíveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estatísticas</Label>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-semibold">{roomTypesData?.total || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tipos de quarto...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Erro ao carregar quartos
              </h3>
              <p className="text-gray-600 mb-6">
                {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
              </p>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
                <Button onClick={handleAddRoom}>
                  Criar Primeiro Quarto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && roomTypesData?.total === 0 && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <Bed className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum tipo de quarto encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Este hotel ainda não possui tipos de quarto cadastrados.
              </p>
              <Button onClick={handleAddRoom} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Tipo de Quarto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de Quartos */}
        {!isLoading && !error && paginatedRooms.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedRooms.map((room: RoomType) => {
                const roomId = getRoomId(room);
                const roomName = getRoomName(room);
                const isActive = room.is_active !== false;
                const totalUnits = room.total_units || room.total_units || 0;
                const availableUnits = room.available_units || room.available_units || 0;
                const basePrice = room.base_price || room.base_price || 0;
                const occupancy = `${room.base_occupancy || 1}/${room.max_occupancy || 2}`;
                const occupancyRate = totalUnits > 0 
                  ? Math.round((availableUnits / totalUnits) * 100) 
                  : 0;

                return (
                  <Card key={roomId} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {roomName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {room.bed_type || 'Standard'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {room.description || 'Sem descrição'}
                            </p>
                          </div>
                          {isActive ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="font-semibold">{formatPrice(basePrice)}</span>
                            </div>
                            <p className="text-xs text-gray-500">por noite</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{occupancy} pessoas</span>
                            </div>
                            <p className="text-xs text-gray-500">capacidade</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{availableUnits}/{totalUnits}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${occupancyRate}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{room.size || '--'} m²</span>
                            </div>
                            <p className="text-xs text-gray-500">tamanho</p>
                          </div>
                        </div>

                        {/* Amenities (preview) */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-1">Comodidades:</p>
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {room.amenities.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{room.amenities.length - 3} mais
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between pt-4 border-t">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewRoom(roomId)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRoom(roomId)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRoom(roomId)}
                            disabled={deletingRoomId === roomId}
                          >
                            {deletingRoomId === roomId ? (
                              <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-6">
                <div className="text-sm text-gray-700">
                  Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRooms.length)} de {sortedRooms.length} quartos
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Resumo e Ações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Taxa de Ocupação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesData?.rooms.length && roomTypesData.rooms.length > 0
                    ? Math.round(
                        roomTypesData.rooms.reduce((sum: number, room: RoomType) => {
                          const total = room.total_units || room.total_units || 0;
                          const available = room.available_units || room.available_units || 0;
                          return sum + (total > 0 ? ((total - available) / total) * 100 : 0);
                        }, 0) / roomTypesData.rooms.length
                      )
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesData?.rooms.length && roomTypesData.rooms.length > 0
                    ? formatPrice(
                        roomTypesData.rooms.reduce((sum: number, room: RoomType) => 
                          sum + (room.base_price || room.base_price || 0), 0
                        ) / roomTypesData.rooms.length
                      )
                    : formatPrice(0)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Unidades Disponíveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesData?.rooms.reduce((sum: number, room: RoomType) => 
                    sum + (room.available_units || room.available_units || 0), 0
                  ) || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}