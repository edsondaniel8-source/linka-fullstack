// src/apps/hotels-app/pages/[hotelId]/room-types/RoomTypeListPage.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../hooks/useHotelData';
import { 
  Bed, Plus, Search, Filter, Edit, Trash2, Eye,
  ChevronLeft, ChevronRight, RefreshCw, Building2,
  CheckCircle, XCircle, AlertCircle, Download,
  ArrowLeft, Users, DollarSign, Calendar,
  Layers, Home, Grid, Package
} from 'lucide-react';

// Componentes UI
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
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
import type { RoomType, RoomTypeListResponse } from '@/types';

export default function RoomTypeListPage() {
  const { hotelId: urlHotelId } = useParams<{ hotelId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingRoomTypeId, setDeletingRoomTypeId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // 🔥 USAR useHotelData PARA GERENCIAMENTO CENTRALIZADO
  const { 
    hotel, 
    selectedHotelId, 
    selectHotelById, 
    isLoading: hotelLoading,
    getHotelName,
    getHotelId,
    formatPrice: hookFormatPrice,
    isHotelActive,
    rooms: roomTypesFromHook,
    roomsLoading
  } = useHotelData(urlHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    if (urlHotelId && urlHotelId !== selectedHotelId) {
      selectHotelById(urlHotelId);
    }
  }, [urlHotelId, selectedHotelId, selectHotelById]);

  // 🔥 VERIFICAR SE hotelId EXISTE
  if (!urlHotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Hotel Selecionado</h2>
            <p className="text-gray-600">
              Para gerenciar tipos de quarto, você precisa selecionar um hotel.
            </p>
          </div>
          <Button onClick={() => setLocation('/hotels')} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Hotéis
          </Button>
        </div>
      </div>
    );
  }

  // Buscar tipos de quarto (usando também do hook para cache)
  const { 
    data: roomTypesResponse, 
    isLoading: roomTypesLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['hotel-room-types', urlHotelId],
    queryFn: async () => {
      try {
        const response = await apiService.getRoomTypesByHotel(urlHotelId) as RoomTypeListResponse;
        
        if (response.success) {
          // 🔥 CORREÇÃO: A resposta usa `data` ou `roomTypes`, não `roomTypes`
          const roomTypes = response.data || response.roomTypes || [];
          return {
            roomTypes: Array.isArray(roomTypes) ? roomTypes : [],
            total: response.count || response.total || roomTypes.length,
            count: response.count || roomTypes.length
          };
        }
        throw new Error(response.error || 'Erro ao buscar tipos de quarto');
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar tipos de quarto',
          variant: 'destructive',
        });
        return { roomTypes: [], total: 0, count: 0 };
      }
    },
    enabled: !!urlHotelId,
  });

  // Usar dados do hook ou da query
  const roomTypesData = roomTypesFromHook && roomTypesFromHook.length > 0 
    ? { roomTypes: roomTypesFromHook, total: roomTypesFromHook.length }
    : roomTypesResponse;

  const roomTypesList = roomTypesData?.roomTypes || [];
  const roomTypesCount = roomTypesData?.total || 0;

  // Mutation para deletar tipo de quarto
  const deleteRoomTypeMutation = useMutation({
    mutationFn: async (roomTypeId: string) => {
      const response = await apiService.deleteRoomType(roomTypeId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao desativar tipo de quarto');
      }
      
      return response;
    },
    onSuccess: (data, roomTypeId) => {
      toast({
        title: 'Sucesso!',
        description: data.message || 'Tipo de quarto desativado com sucesso',
      });
      
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
      queryClient.invalidateQueries({ queryKey: ['hotel-stats', urlHotelId] });
      queryClient.invalidateQueries({ queryKey: ['hotel', urlHotelId] });
      
      setDeletingRoomTypeId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao desativar tipo de quarto',
        variant: 'destructive',
      });
      setDeletingRoomTypeId(null);
    },
  });

  // 🔥 USAR formatPrice DO HOOK
  const formatPrice = (price?: number | string) => {
    return hookFormatPrice(price);
  };

  // Obter nome do tipo de quarto
  const getRoomTypeName = (roomType: RoomType) => {
    return roomType.name || roomType.room_type_name || 'Tipo de Quarto';
  };

  // Obter ID do tipo de quarto
  const getRoomTypeId = (roomType: RoomType) => {
    return roomType.id || roomType.room_type_id || '';
  };

  // 🔥 OBTER amenities COM VERIFICAÇÃO SEGURA
  const getRoomTypeAmenities = (roomType: RoomType): string[] => {
    if (!roomType.amenities) return [];
    
    if (Array.isArray(roomType.amenities)) {
      return roomType.amenities;
    }
    
    if (typeof roomType.amenities === 'string') {
      try {
        const parsed = JSON.parse(roomType.amenities);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return [];
      }
    }
    
    return [];
  };

  // Filtrar e ordenar tipos de quarto
  const filteredRoomTypes = roomTypesList.filter((roomType: RoomType) => {
    // Filtro por busca
    const matchesSearch = searchTerm === '' || 
      getRoomTypeName(roomType).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (roomType.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (roomType.bed_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && roomType.is_active !== false) ||
      (statusFilter === 'inactive' && roomType.is_active === false);
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar
  const sortedRoomTypes = [...filteredRoomTypes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return getRoomTypeName(a).localeCompare(getRoomTypeName(b));
      case 'price_asc':
        return (Number(a.base_price) || 0) - (Number(b.base_price) || 0);
      case 'price_desc':
        return (Number(b.base_price) || 0) - (Number(a.base_price) || 0);
      case 'units_desc':
        return (Number(b.total_units) || 0) - (Number(a.total_units) || 0);
      default:
        return 0;
    }
  });

  // Paginação
  const totalPages = Math.ceil(sortedRoomTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoomTypes = sortedRoomTypes.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleDeleteRoomType = (roomTypeId: string) => {
    if (!confirm('Tem certeza que deseja desativar este tipo de quarto? Ele não estará disponível para novas reservas.')) {
      return;
    }
    
    setDeletingRoomTypeId(roomTypeId);
    deleteRoomTypeMutation.mutate(roomTypeId);
  };

  const handleEditRoomType = (roomTypeId: string) => {
    setLocation(`/hotels/${urlHotelId}/room-types/${roomTypeId}/edit`);
  };

  const handleViewRoomType = (roomTypeId: string) => {
    setLocation(`/hotels/${urlHotelId}/room-types/${roomTypeId}`);
  };

  const handleAddRoomType = () => {
    setLocation(`/hotels/${urlHotelId}/room-types/create`);
  };

  const handleExport = () => {
    if (sortedRoomTypes.length === 0) {
      toast({
        title: 'Nenhum dado',
        description: 'Não há tipos de quarto para exportar',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = [
      ['Nome', 'Preço Base', 'Unidades Totais', 'Ocupação', 'Status', 'Tipo de Cama'],
      ...sortedRoomTypes.map(roomType => [
        getRoomTypeName(roomType),
        `MT ${Number(roomType.base_price) || 0}`,
        roomType.total_units || 0,
        `${roomType.base_occupancy || 1}/${roomType.max_occupancy || 2}`,
        roomType.is_active === false ? 'Inativo' : 'Ativo',
        roomType.bed_type || 'Standard'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tipos-de-quarto-${hotel?.name || 'hotel'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: 'Lista de tipos de quarto exportada para CSV.',
    });
  };

  const isLoading = hotelLoading || roomTypesLoading || roomsLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/hotels/${urlHotelId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para Hotel
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tipos de Quarto</h1>
              <div className="flex items-center gap-2 mt-2">
                {hotel ? (
                  <>
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{getHotelName(hotel)}</span>
                    <Badge variant={isHotelActive(hotel) ? 'default' : 'secondary'}>
                      {isHotelActive(hotel) ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {hotel.locality || 'Local não especificado'}
                      {hotel.province ? `, ${hotel.province}` : ''}
                    </Badge>
                  </>
                ) : (
                  <span className="text-gray-600">Carregando hotel...</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExport} 
              disabled={sortedRoomTypes.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button 
              onClick={handleAddRoomType} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!hotel || !isHotelActive(hotel)}
            >
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
                    <SelectItem value="units_desc">Mais unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estatísticas</Label>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-semibold">{roomTypesCount}</span>
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
                Erro ao carregar tipos de quarto
              </h3>
              <p className="text-gray-600 mb-6">
                {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
              </p>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" onClick={() => refetch()}>
                  Tentar Novamente
                </Button>
                <Button onClick={handleAddRoomType}>
                  Criar Primeiro Tipo de Quarto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && roomTypesCount === 0 && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <Layers className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum tipo de quarto encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Este hotel ainda não possui tipos de quarto cadastrados. 
                Crie tipos como "Standard", "Deluxe", "Suite" com diferentes capacidades e preços.
              </p>
              <Button 
                onClick={handleAddRoomType} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!hotel || !isHotelActive(hotel)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Tipo de Quarto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lista de Tipos de Quarto */}
        {!isLoading && !error && paginatedRoomTypes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedRoomTypes.map((roomType: RoomType, index: number) => {
                const roomTypeId = getRoomTypeId(roomType);
                const roomTypeName = getRoomTypeName(roomType);
                const isActive = roomType.is_active !== false;
                const totalUnits = roomType.total_units || 0;
                const basePrice = Number(roomType.base_price) || 0;
                const baseOccupancy = roomType.base_occupancy || 2;
                const maxOccupancy = roomType.max_occupancy || 2;
                const minNights = roomType.min_nights_default || 1;
                const occupancy = `${baseOccupancy}/${maxOccupancy}`;
                const amenities = getRoomTypeAmenities(roomType);

                return (
                  <Card key={roomTypeId || `roomtype-${index}`} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {roomTypeName}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {roomType.bed_type || 'Standard'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {roomType.description || 'Sem descrição'}
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
                            <p className="text-xs text-gray-500">preço base/noite</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Package className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{totalUnits} unidades</span>
                            </div>
                            <p className="text-xs text-gray-500">capacidade total</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{occupancy} pessoas</span>
                            </div>
                            <p className="text-xs text-gray-500">base/máx</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Min: {minNights}</span>
                            </div>
                            <p className="text-xs text-gray-500">noites mínimas</p>
                          </div>
                        </div>

                        {/* Amenities (preview) */}
                        {amenities.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs text-gray-500 mb-1">Comodidades:</p>
                            <div className="flex flex-wrap gap-1">
                              {amenities.slice(0, 3).map((amenity: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {amenities.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{amenities.length - 3} mais
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
                              onClick={() => handleViewRoomType(roomTypeId)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRoomType(roomTypeId)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRoomType(roomTypeId)}
                            disabled={deletingRoomTypeId === roomTypeId || !isActive}
                            title={isActive ? "Desativar tipo de quarto" : "Tipo já desativado"}
                          >
                            {deletingRoomTypeId === roomTypeId ? (
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
                  Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRoomTypes.length)} de {sortedRoomTypes.length} tipos de quarto
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
                <div className="flex items-center justify-center mb-2">
                  <Layers className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-gray-600">Total de Unidades</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesList.reduce((sum: number, roomType: RoomType) => 
                    sum + (roomType.total_units || 0), 0
                  ) || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-gray-600">Preço Médio</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesList.length > 0
                    ? formatPrice(
                        roomTypesList.reduce((sum: number, roomType: RoomType) => 
                          sum + (Number(roomType.base_price) || 0), 0
                        ) / roomTypesList.length
                      )
                    : formatPrice(0)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Home className="h-5 w-5 text-purple-600 mr-2" />
                  <p className="text-sm text-gray-600">Tipos de Quarto Ativos</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {roomTypesList.filter((roomType: RoomType) => 
                    roomType.is_active !== false
                  ).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ajuda/Informações */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              Sobre Tipos de Quarto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium mb-1">O que é um Tipo de Quarto?</p>
                <p className="mb-2">
                  Um tipo de quarto define uma categoria de acomodação no seu hotel (ex: Standard, Deluxe, Suite).
                  Cada tipo tem seu próprio preço, capacidade e características.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-medium">Unidades Totais:</span> Número fixo de quartos deste tipo no hotel</li>
                  <li><span className="font-medium">Preço Base:</span> Preço para ocupação base por noite</li>
                  <li><span className="font-medium">Ocupação:</span> Número mínimo/máximo de pessoas</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Gerenciamento de Disponibilidade</p>
                <p className="mb-2">
                  A disponibilidade real é controlada por data na tabela de disponibilidade. 
                  Para ajustar preços ou bloquear datas, use a página de "Disponibilidade".
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Dica:</strong> Crie tipos de quarto genéricos como "Standard" e "Deluxe" 
                    em vez de quartos individuais numerados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}