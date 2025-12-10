// src/apps/hotels-app/pages/[hotelId]/room-types/[roomTypeId]/RoomTypeDetailsPage.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../../hooks/useHotelData'; // 🔥 NOVO IMPORT
import { 
  ArrowLeft, Bed, DollarSign, Users, Building2,
  Calendar, CheckCircle, XCircle, Edit, Trash2,
  Image as ImageIcon, MapPin, Wifi, Tv, Wind,
  Coffee, Lock, Maximize2, Bath, ShowerHead,
  ChevronLeft, ChevronRight, Share2, Printer,
  AlertCircle, Star, Clock, Phone, Mail, Plus,
  Package, Home, Bath as BathIcon, Grid, RefreshCw,
  Eye, CheckSquare, XSquare
} from 'lucide-react';

// Components
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';

// Types
import type { RoomType, Hotel, ApiResponse } from '@/types';

export default function RoomTypeDetailsPage() {
  const { hotelId: urlHotelId, roomTypeId: urlRoomTypeId } = useParams<{ 
    hotelId?: string; 
    roomTypeId?: string 
  }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 USAR useHotelData PARA GERENCIAMENTO CENTRALIZADO
  const { 
    hotel, 
    selectedHotelId, 
    selectHotelById, 
    isLoading: hotelLoading,
    getHotelName,
    getHotelId,
    formatPrice: hookFormatPrice,
    isHotelActive
  } = useHotelData(urlHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    if (urlHotelId && urlHotelId !== selectedHotelId) {
      selectHotelById(urlHotelId);
    }
  }, [urlHotelId, selectedHotelId, selectHotelById]);

  // ✅ CORREÇÃO CRÍTICA: Verificação imediata para "create"
  useEffect(() => {
    console.log('🔍 RoomTypeDetailsPage - Parâmetros recebidos:');
    console.log('  hotelId:', urlHotelId);
    console.log('  roomTypeId:', urlRoomTypeId);
    
    // Se roomTypeId for "create", redirecionar para página de criação
    if (urlRoomTypeId === 'create') {
      console.log('🔄 RoomTypeDetailsPage: roomTypeId é "create", redirecionando para página de criação');
      toast({
        title: 'Redirecionando...',
        description: 'Levando você para a página de criação de tipo de quarto.',
      });
      setLocation(`/hotels/${urlHotelId}/room-types/create`);
      return;
    }
    
    // Validar formato do ID
    if (urlRoomTypeId && urlRoomTypeId !== 'undefined' && urlRoomTypeId !== 'null') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(urlRoomTypeId)) {
        console.error('❌ RoomTypeDetailsPage: Formato UUID inválido:', urlRoomTypeId);
        toast({
          title: 'ID Inválido',
          description: 'O ID do tipo de quarto tem formato inválido.',
          variant: 'destructive',
        });
        // Redirecionar para lista após 2 segundos
        setTimeout(() => {
          if (urlHotelId) {
            setLocation(`/hotels/${urlHotelId}/room-types`);
          }
        }, 2000);
      }
    }
  }, [urlHotelId, urlRoomTypeId, setLocation, toast]);

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
              Para visualizar detalhes do tipo de quarto, você precisa selecionar um hotel.
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

  // ✅ CORREÇÃO: Verificar se ainda está na página (não foi redirecionado)
  if (urlRoomTypeId === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para criação de tipo de quarto...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {urlRoomTypeId}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setLocation(`/hotels/${urlHotelId}/room-types/create`)}
          >
            Clique aqui se não redirecionar automaticamente
          </Button>
        </div>
      </div>
    );
  }

  // ✅ CORREÇÃO: Função para validar se é um UUID válido
  const isValidRoomTypeId = (id: string | undefined): boolean => {
    if (!id || id === 'undefined' || id === 'null' || id === 'create') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // ✅ CORREÇÃO: Função helper para converter para número com fallback
  const toNumber = (value: string | number | undefined, defaultValue: number = 0): number => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    if (typeof value === 'number') {
      return value;
    }
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // ✅ CORREÇÃO: Buscar detalhes do tipo de quarto usando RoomType com validações melhoradas
  const { 
    data: roomType, 
    isLoading: roomTypeLoading, 
    error,
    refetch: refetchRoomType
  } = useQuery({
    queryKey: ['room-type-details', urlRoomTypeId],
    queryFn: async (): Promise<RoomType> => {
      console.log('🔍 RoomTypeDetailsPage: Buscando room type com ID:', urlRoomTypeId);
      
      // ✅ CORREÇÃO: Verificações mais robustas
      if (!urlRoomTypeId || 
          urlRoomTypeId === 'undefined' || 
          urlRoomTypeId === 'null' || 
          urlRoomTypeId === 'create') {
        console.error('❌ RoomTypeDetailsPage: roomTypeId inválido ou é "create":', urlRoomTypeId);
        throw new Error('ID do tipo de quarto é inválido');
      }
      
      // ✅ CORREÇÃO: Validar formato UUID
      if (!isValidRoomTypeId(urlRoomTypeId)) {
        console.error('❌ RoomTypeDetailsPage: Formato UUID inválido:', urlRoomTypeId);
        throw new Error('Formato do ID do tipo de quarto é inválido');
      }
      
      try {
        const response = await apiService.getRoomTypeById(urlRoomTypeId) as ApiResponse<RoomType>;
        
        if (response.success && response.data) {
          console.log('✅ RoomTypeDetailsPage: Room type encontrado:', response.data);
          
          // ✅ CORREÇÃO: Garantir que o tipo seja RoomType com conversão explícita
          const roomTypeData: RoomType = {
            id: response.data.id || response.data.room_type_id || urlRoomTypeId,
            room_type_id: response.data.room_type_id || response.data.id || urlRoomTypeId,
            room_type_name: response.data.room_type_name || response.data.name || 'Tipo de Quarto',
            name: response.data.name || response.data.room_type_name || 'Tipo de Quarto',
            hotel_id: response.data.hotel_id,
            description: response.data.description,
            amenities: response.data.amenities || [],
            images: response.data.images || [],
            
            // ✅ CORREÇÃO: Converter para number explicitamente
            base_price: toNumber(response.data.base_price, 0),
            total_units: toNumber(response.data.total_units, 0),
            base_occupancy: toNumber(response.data.base_occupancy, 1),
            max_occupancy: toNumber(response.data.max_occupancy, 2),
            min_nights_default: toNumber(response.data.min_nights_default, 1),
            
            size: response.data.size,
            bed_type: response.data.bed_type,
            bed_types: response.data.bed_types,
            bathroom_type: response.data.bathroom_type,
            
            // ✅ CORREÇÃO: Converter opcionais para number
            available_units: response.data.available_units !== undefined 
              ? toNumber(response.data.available_units) 
              : undefined,
            
            price_per_night: response.data.price_per_night !== undefined 
              ? toNumber(response.data.price_per_night) 
              : toNumber(response.data.base_price || 0),
            
            total_price: response.data.total_price !== undefined 
              ? toNumber(response.data.total_price) 
              : undefined,
            
            extra_adult_price: response.data.extra_adult_price !== undefined 
              ? toNumber(response.data.extra_adult_price) 
              : undefined,
            
            extra_child_price: response.data.extra_child_price !== undefined 
              ? toNumber(response.data.extra_child_price) 
              : undefined,
            
            children_policy: response.data.children_policy,
            is_active: response.data.is_active !== undefined ? response.data.is_active : true,
            created_at: response.data.created_at,
            updated_at: response.data.updated_at,
            availability: response.data.availability
          };
          return roomTypeData;
        }
        
        console.error('❌ RoomTypeDetailsPage: Erro na resposta da API:', response.error);
        throw new Error(response.error || 'Tipo de quarto não encontrado');
      } catch (error: any) {
        console.error('❌ RoomTypeDetailsPage: Erro ao carregar detalhes:', error);
        throw new Error(error.message || 'Erro ao carregar detalhes do tipo de quarto');
      }
    },
    enabled: !!urlRoomTypeId && isValidRoomTypeId(urlRoomTypeId),
    staleTime: 30000,
  });

  // Buscar estatísticas do hotel
  const { data: stats } = useQuery({
    queryKey: ['hotel-stats', urlHotelId],
    queryFn: async () => {
      if (!urlHotelId || urlHotelId === 'undefined') {
        console.log('⚠️ RoomTypeDetailsPage: hotelId inválido para stats');
        return null;
      }
      
      console.log('🔍 RoomTypeDetailsPage: Buscando estatísticas do hotel');
      const response = await apiService.getHotelStatsDetailed(urlHotelId);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        occupancy_rate: 0,
        total_bookings: 0,
        total_revenue: 0,
        available_rooms: 0,
        total_rooms: 0,
        average_daily_rate: 0,
        revenue_per_available_room: 0
      };
    },
    enabled: !!urlHotelId && urlHotelId !== 'undefined',
    staleTime: 30000,
  });

  // Buscar todos os tipos de quarto para contexto
  const { data: allRoomTypes } = useQuery({
    queryKey: ['hotel-room-types', urlHotelId],
    queryFn: async () => {
      if (!urlHotelId || urlHotelId === 'undefined') return { roomTypes: [] };
      
      console.log('🔍 RoomTypeDetailsPage: Buscando todos os room types do hotel');
      const response = await apiService.getRoomTypesByHotel(urlHotelId) as ApiResponse<RoomType[]>;
      
      // ✅ CORREÇÃO: Usar response.data em vez de response.roomTypes
      const normalizedRoomTypes = (response.success ? (response.data || []) : []).map((rt: any) => ({
        id: rt.id || rt.room_type_id || '',
        room_type_id: rt.room_type_id || rt.id || '',
        room_type_name: rt.room_type_name || rt.name || 'Tipo de Quarto',
        name: rt.name || rt.room_type_name || 'Tipo de Quarto',
        hotel_id: rt.hotel_id,
        description: rt.description,
        amenities: rt.amenities || [],
        images: rt.images || [],
        
        // ✅ CORREÇÃO: Converter para number explicitamente
        base_price: toNumber(rt.base_price || rt.basePrice || 0),
        total_units: toNumber(rt.total_units || rt.totalUnits || 0),
        base_occupancy: toNumber(rt.base_occupancy || rt.baseOccupancy || 1),
        max_occupancy: toNumber(rt.max_occupancy || rt.maxOccupancy || 2),
        min_nights_default: toNumber(rt.min_nights_default || rt.minNightsDefault || 1),
        
        size: rt.size,
        bed_type: rt.bed_type || rt.bedType,
        bed_types: rt.bed_types || rt.bedTypes,
        bathroom_type: rt.bathroom_type || rt.bathroomType,
        
        // ✅ CORREÇÃO: Converter opcionais para number
        available_units: rt.available_units !== undefined 
          ? toNumber(rt.available_units) 
          : undefined,
        
        price_per_night: rt.price_per_night !== undefined 
          ? toNumber(rt.price_per_night) 
          : toNumber(rt.base_price || 0),
        
        total_price: rt.total_price !== undefined 
          ? toNumber(rt.total_price) 
          : undefined,
        
        extra_adult_price: rt.extra_adult_price !== undefined 
          ? toNumber(rt.extra_adult_price) 
          : undefined,
        
        extra_child_price: rt.extra_child_price !== undefined 
          ? toNumber(rt.extra_child_price) 
          : undefined,
        
        children_policy: rt.children_policy || rt.childrenPolicy,
        is_active: rt.is_active !== undefined ? rt.is_active : true,
        created_at: rt.created_at || rt.createdAt,
        updated_at: rt.updated_at || rt.updatedAt,
        availability: rt.availability
      }));
      
      return {
        roomTypes: normalizedRoomTypes,
        total: response.count || normalizedRoomTypes.length
      };
    },
    enabled: !!urlHotelId && urlHotelId !== 'undefined',
    staleTime: 30000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 RoomTypeDetailsPage: Forçando refresh dos dados...');
      
      await queryClient.invalidateQueries({ 
        queryKey: ['room-type-details', urlRoomTypeId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['hotel', urlHotelId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['hotel-stats', urlHotelId] 
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['hotel-room-types', urlHotelId] 
      });
      
      await queryClient.refetchQueries({ 
        queryKey: ['room-type-details', urlRoomTypeId] 
      });
      
      toast({
        title: 'Dados atualizados',
        description: 'As informações do tipo de quarto foram atualizadas.',
      });
    } catch (error) {
      console.error('❌ RoomTypeDetailsPage: Erro ao atualizar dados:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ CORREÇÃO: Formatar preço usando o hook
  const formatPrice = (price?: number | string) => {
    return hookFormatPrice(price);
  };

  // ✅ CORREÇÃO: Funções utilitárias para lidar com Date | string | undefined
  const getSafeStringValue = (value: string | Date | undefined, defaultValue: string): string => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    // Se for Date, converter para string
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-MZ');
    }
    
    // Se for string, retornar como está
    return value;
  };

  const getSafeArrayValue = <T,>(value: T[] | undefined, defaultValue: T[]): T[] => {
    return Array.isArray(value) ? value : defaultValue;
  };

  const handleEdit = () => {
    console.log('✏️ RoomTypeDetailsPage: Navegando para edição do room type:', urlRoomTypeId);
    
    if (!urlRoomTypeId || urlRoomTypeId === 'undefined') {
      toast({
        title: 'Erro',
        description: 'ID do tipo de quarto inválido',
        variant: 'destructive',
      });
      return;
    }
    
    setLocation(`/hotels/${urlHotelId}/room-types/${urlRoomTypeId}/edit`);
  };

  const handleBack = () => {
    console.log('↩️ RoomTypeDetailsPage: Voltando para lista de room types');
    setLocation(`/hotels/${urlHotelId}/room-types`);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copiado!',
      description: 'Link do tipo de quarto copiado para a área de transferência.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDuplicate = () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'Duplicação de tipos de quarto estará disponível em breve.',
    });
  };

  const handleDelete = () => {
    console.log('🗑️ RoomTypeDetailsPage: Iniciando deleção do room type:', urlRoomTypeId);
    
    if (!urlRoomTypeId || urlRoomTypeId === 'undefined' || urlRoomTypeId === 'null') {
      toast({
        title: 'Erro',
        description: 'ID do tipo de quarto inválido',
        variant: 'destructive',
      });
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir este tipo de quarto? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setRefreshing(true);
    apiService.deleteRoomType(urlRoomTypeId)
      .then(response => {
        if (response.success) {
          toast({
            title: 'Sucesso!',
            description: response.data?.message || 'Tipo de quarto removido com sucesso.',
          });
          
          queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
          queryClient.invalidateQueries({ queryKey: ['user-hotels'] });
          queryClient.invalidateQueries({ queryKey: ['room-type-details', urlRoomTypeId] });
          queryClient.removeQueries({ queryKey: ['room-type-details', urlRoomTypeId] });
          queryClient.invalidateQueries({ queryKey: ['hotel-stats', urlHotelId] });
          
          setTimeout(() => {
            setLocation(`/hotels/${urlHotelId}/room-types`);
          }, 500);
        } else {
          toast({
            title: 'Erro ao deletar',
            description: response.error || 'Erro ao remover tipo de quarto',
            variant: 'destructive',
          });
        }
      })
      .catch(error => {
        console.error('❌ RoomTypeDetailsPage: Erro ao deletar room type:', error);
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao excluir tipo de quarto',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  // Amenities com ícones
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    const icons: Record<string, any> = {
      'wifi': Wifi,
      'wi-fi': Wifi,
      'tv': Tv,
      'air-conditioning': Wind,
      'ar condicionado': Wind,
      'minibar': Coffee,
      'safe': Lock,
      'cofre': Lock,
      'balcony': Maximize2,
      'varanda': Maximize2,
      'sea-view': ImageIcon,
      'vista mar': ImageIcon,
      'city-view': Building2,
      'vista cidade': Building2,
      'hairdryer': ShowerHead,
      'secador de cabelo': ShowerHead,
      'bathrobes': BathIcon,
      'roupões': BathIcon,
      'slippers': Bed,
      'chinelos': Bed,
      'desk': Calendar,
      'escritório': Calendar,
      'private-bathroom': BathIcon,
      'banheiro privativo': BathIcon,
      'hot-water': ShowerHead,
      'água quente': ShowerHead,
      'towels': BathIcon,
      'toalhas': BathIcon,
      'linen': Bed,
      'roupas de cama': Bed,
      'toiletries': BathIcon,
      'produtos de banho': BathIcon,
      'wardrobe': Grid,
      'guarda-roupas': Grid,
    };
    
    return icons[amenityLower] || CheckCircle;
  };

  // ✅ CORREÇÃO: Calcular valor total em estoque com verificação usando toNumber
  const calculateStockValue = () => {
    if (!roomType || !roomType.total_units) return 0;
    const basePrice = toNumber(roomType.base_price);
    const totalUnits = toNumber(roomType.total_units);
    return basePrice * totalUnits;
  };

  // Obter nome do tipo de quarto
  const getRoomTypeName = () => {
    return roomType?.name || roomType?.room_type_name || 'Tipo de Quarto';
  };

  const getRoomTypeId = () => {
    return urlRoomTypeId || roomType?.id || roomType?.room_type_id || '';
  };

  // ✅ CORREÇÃO: Obter imagens com verificação usando função segura
  const getImages = () => {
    const images = roomType?.images;
    if (images && Array.isArray(images) && images.length > 0) {
      return images;
    }
    
    return [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800&auto=format&fit=crop&q=80'
    ];
  };

  // ✅ CORREÇÃO: Obter amenities com verificação usando função segura
  const getAmenities = () => {
    const amenities = roomType?.amenities;
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      return amenities;
    }
    
    const defaultAmenities = ['Wi-Fi Grátis', 'TV por Cabo', 'Ar Condicionado', 'Banheiro Privado'];
    return defaultAmenities;
  };

  const isLoading = hotelLoading || roomTypeLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do tipo de quarto...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {urlRoomTypeId}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => refetchRoomType()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tipo de Quarto Não Encontrado</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'O tipo de quarto solicitado não existe ou foi removido.'}
            </p>
            <p className="text-sm text-gray-500">ID buscado: {urlRoomTypeId}</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Status: {roomType?.is_active === false ? 'INATIVO' : 'NÃO ENCONTRADO'}</p>
              <p>Última verificação: {new Date().toLocaleTimeString('pt-MZ')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {urlHotelId && urlHotelId !== 'undefined' && (
              <>
                <Link href={`/hotels/${urlHotelId}/room-types`}>
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ver Todos os Tipos de Quarto
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => refetchRoomType()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              </>
            )}
            <Link href="/hotels/dashboard">
              <Button variant="outline" className="w-full">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roomTypeName = getRoomTypeName();
  const images = getImages();
  const amenities = getAmenities();
  const stockValue = calculateStockValue();
  const currentRoomTypeId = getRoomTypeId();
  
  // ✅ CORREÇÃO: Verificar status com valor default
  const isRoomTypeActive = roomType.is_active !== false;
  
  // ✅ CORREÇÃO: Valores seguros usando toNumber
  const safeTotalUnits = toNumber(roomType.total_units, 0);
  const safeAvailableUnits = toNumber(roomType.available_units, 0);
  const safeBaseOccupancy = toNumber(roomType.base_occupancy, 1);
  const safeMaxOccupancy = toNumber(roomType.max_occupancy, 2);
  const safeMinNightsDefault = toNumber(roomType.min_nights_default, 1);
  const safeBedType = getSafeStringValue(roomType.bed_type, 'Não especificado');
  const safeSize = getSafeStringValue(roomType.size, '--');
  const safeBathroomType = getSafeStringValue(roomType.bathroom_type, 'Privado');
  const safeDescription = getSafeStringValue(roomType.description, 'Este tipo de quarto não possui descrição.');
  const safeChildrenPolicy = getSafeStringValue(roomType.children_policy, '');
  const safeBasePrice = toNumber(roomType.base_price, 0);
  const safeExtraAdultPrice = roomType.extra_adult_price !== undefined ? toNumber(roomType.extra_adult_price) : undefined;
  const safeExtraChildPrice = roomType.extra_child_price !== undefined ? toNumber(roomType.extra_child_price) : undefined;
  const safeCreatedAt = getSafeStringValue(roomType.created_at, '--/--/----');
  const safeUpdatedAt = getSafeStringValue(roomType.updated_at, '--/--/----');
  
  // ✅ CORREÇÃO: Calcular taxa de ocupação com valores seguros
  const safeOccupancyRate = safeTotalUnits > 0 
    ? Math.round(((safeTotalUnits - safeAvailableUnits) / safeTotalUnits) * 100)
    : 0;

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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{roomTypeName}</h1>
                {!isRoomTypeActive && (
                  <Badge variant="secondary" className="ml-2">
                    Inativo
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Atualizar dados"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {hotel && (
                  <>
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{getHotelName(hotel)}</span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                <Badge variant={isRoomTypeActive ? 'default' : 'secondary'}>
                  {isRoomTypeActive ? 'Ativo' : 'Inativo'}
                </Badge>
                {isRoomTypeActive && (
                  <Badge variant="outline" className="text-green-700 bg-green-50">
                    Disponível para Reservas
                  </Badge>
                )}
                {!isRoomTypeActive && (
                  <Badge variant="outline" className="text-red-700 bg-red-50">
                    Não Disponível para Reservas
                  </Badge>
                )}
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
              Editar Tipo de Quarto
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {!isRoomTypeActive && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-800">Tipo de Quarto Inativo</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Este tipo de quarto está marcado como inativo e não está disponível para reservas. 
                  Para disponibilizá-lo, edite o tipo de quarto e altere o status para "Ativo".
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Imagens e Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="relative h-96 overflow-hidden rounded-t-lg">
                    <img
                      src={images[currentImageIndex]}
                      alt={roomTypeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    
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
                    
                    {!isRoomTypeActive && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="px-3 py-1">
                          <XSquare className="h-3 w-3 mr-1" />
                          Indisponível
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="p-4 flex space-x-2 overflow-x-auto">
                      {images.map((img: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${roomTypeName} ${index + 1}`}
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
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Descrição do Tipo de Quarto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {safeDescription}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Especificações Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Bed className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tipo de Cama</p>
                        <p className="font-semibold">{safeBedType}</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Maximize2 className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Tamanho</p>
                        <p className="font-semibold">{safeSize} m²</p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Ocupação</p>
                        <p className="font-semibold">
                          {safeBaseOccupancy}/{safeMaxOccupancy} pessoas
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <ShowerHead className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Banheiro</p>
                        <p className="font-semibold">{safeBathroomType}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {allRoomTypes && allRoomTypes.roomTypes.length > 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Outros Tipos de Quarto neste Hotel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allRoomTypes.roomTypes
                          .filter((rt: RoomType) => 
                            (rt.id !== currentRoomTypeId) && (rt.room_type_id !== currentRoomTypeId)
                          )
                          .slice(0, 3)
                          .map((otherRoomType: RoomType) => (
                            <div key={otherRoomType.id || otherRoomType.room_type_id} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{otherRoomType.name || otherRoomType.room_type_name || 'Tipo de Quarto'}</p>
                                <p className="text-sm text-gray-600">
                                  {formatPrice(otherRoomType.base_price)} / noite
                                </p>
                              </div>
                              <Link href={`/hotels/${urlHotelId}/room-types/${otherRoomType.id || otherRoomType.room_type_id}`}>
                                <Button variant="outline" size="sm">
                                  Ver Detalhes
                                </Button>
                              </Link>
                            </div>
                          ))}
                        {allRoomTypes.roomTypes.length > 4 && (
                          <div className="text-center pt-2">
                            <Link href={`/hotels/${urlHotelId}/room-types`}>
                              <Button variant="link">
                                Ver todos os {allRoomTypes.total || allRoomTypes.roomTypes.length} tipos de quarto
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="amenities">
                <Card>
                  <CardHeader>
                    <CardTitle>Comodidades Incluídas</CardTitle>
                    <CardDescription>
                      Todas as comodidades disponíveis neste tipo de quarto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {amenities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {amenities.map((amenity: string, index: number) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-sm">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma comodidade especificada para este tipo de quarto</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Adicione comodidades na página de edição para melhorar a atratividade.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pricing">
                <Card>
                  <CardHeader>
                    <CardTitle>Estrutura de Preços</CardTitle>
                    <CardDescription>
                      Detalhes completos dos preços e tarifas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-800">Preço Base por Noite</h3>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Ocupação: {safeBaseOccupancy}
                            </Badge>
                          </div>
                          <p className="text-3xl font-bold text-blue-900">
                            {formatPrice(safeBasePrice)}
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            Para {safeBaseOccupancy} pessoa{safeBaseOccupancy !== 1 ? 's' : ''} incluída{safeBaseOccupancy !== 1 ? 's' : ''} no preço
                          </p>
                        </div>
                        
                        {safeExtraAdultPrice && safeExtraAdultPrice > 0 && (
                          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h3 className="font-semibold text-green-800 mb-1">Adulto Extra</h3>
                            <p className="text-xl font-bold text-green-900">
                              {formatPrice(safeExtraAdultPrice)} / noite
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              Aplicado a cada adulto acima de {safeBaseOccupancy}
                            </p>
                          </div>
                        )}
                        
                        {safeExtraChildPrice && safeExtraChildPrice > 0 && (
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <h3 className="font-semibold text-yellow-800 mb-1">Criança Extra</h3>
                            <p className="text-xl font-bold text-yellow-900">
                              {formatPrice(safeExtraChildPrice)} / noite
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              Normalmente para crianças até 12 anos
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-3">Exemplo de Cálculo</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Preço base (3 noites)</span>
                              <span className="font-medium">
                                {formatPrice(safeBasePrice * 3)}
                              </span>
                            </div>
                            
                            {safeExtraAdultPrice && safeExtraAdultPrice > 0 && (
                              <div className="flex justify-between">
                                <span>1 adulto extra × 3 noites</span>
                                <span className="font-medium">
                                  {formatPrice(safeExtraAdultPrice * 3)}
                                </span>
                              </div>
                            )}
                            
                            {safeExtraChildPrice && safeExtraChildPrice > 0 && (
                              <div className="flex justify-between">
                                <span>1 criança extra × 3 noites</span>
                                <span className="font-medium">
                                  {formatPrice(safeExtraChildPrice * 3)}
                                </span>
                              </div>
                            )}
                            
                            <Separator />
                            
                            <div className="flex justify-between font-bold text-base">
                              <span>Total Estimado</span>
                              <span>
                                {formatPrice(
                                  safeBasePrice * 3 +
                                  (safeExtraAdultPrice ? safeExtraAdultPrice * 3 : 0) +
                                  (safeExtraChildPrice ? safeExtraChildPrice * 3 : 0)
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {safeChildrenPolicy && (
                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <h3 className="font-semibold text-purple-800 mb-1">Política para Crianças</h3>
                            <p className="text-sm text-purple-700">{safeChildrenPolicy}</p>
                          </div>
                        )}

                        {safeMinNightsDefault > 1 && (
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <h3 className="font-semibold text-indigo-800 mb-1">Política de Estadia</h3>
                            <p className="text-sm text-indigo-700">
                              Estadia mínima: {safeMinNightsDefault} noite{safeMinNightsDefault !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="availability">
                <Card>
                  <CardHeader>
                    <CardTitle>Disponibilidade e Estatísticas</CardTitle>
                    <CardDescription>
                      Status atual e métricas de ocupação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!isRoomTypeActive && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-red-800">Tipo de Quarto Inativo</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Este tipo de quarto está marcado como inativo. Nenhuma reserva pode ser feita até que seja ativado.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-600 mb-1">Unidades Totais</p>
                        <p className="text-2xl font-bold text-gray-900">{safeTotalUnits}</p>
                      </div>
                      
                      <div className={`text-center p-4 rounded-lg border ${
                        safeAvailableUnits > 0 
                          ? 'bg-green-50 border-green-100' 
                          : 'bg-red-50 border-red-100'
                      }`}>
                        <p className={`text-sm mb-1 ${
                          safeAvailableUnits > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Disponível{safeAvailableUnits !== 1 ? 's' : ''} Agora
                        </p>
                        <p className={`text-2xl font-bold ${
                          safeAvailableUnits > 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {safeAvailableUnits}
                        </p>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-600 mb-1">Taxa de Ocupação</p>
                        <p className="text-2xl font-bold text-blue-900">{safeOccupancyRate}%</p>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-purple-600 mb-1">Valor em Estoque</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {formatPrice(stockValue)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Ocupação Atual</p>
                        <p className="text-sm text-gray-600">
                          {safeTotalUnits > 0 ? safeTotalUnits - safeAvailableUnits : 0} de {safeTotalUnits} unidades ocupadas
                        </p>
                      </div>
                      <Progress value={safeOccupancyRate} className="h-3" />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0%</span>
                        <span>{safeOccupancyRate}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Gestão de Disponibilidade</h4>
                          <p className="text-sm text-gray-600">
                            Ajuste preços e disponibilidade por data no calendário
                          </p>
                        </div>
                        <Link href={`/hotels/${urlHotelId}/availability?roomType=${currentRoomTypeId}`}>
                          <Button disabled={!isRoomTypeActive}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Gerir Disponibilidade
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Dicas de Gestão</h4>
                          <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                            <li>Mantenha pelo menos 1-2 unidades disponíveis para reservas de última hora</li>
                            <li>Ajuste preços conforme demanda sazonal na página de disponibilidade</li>
                            <li>Use "stop sell" para bloqueio temporário quando necessário</li>
                            <li>Monitore a ocupação para otimizar preços e disponibilidade</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Direita - Resumo e Ações */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Tipo de Quarto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={isRoomTypeActive ? 'default' : 'secondary'}>
                      {isRoomTypeActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID do Tipo</span>
                    <span className="font-mono text-sm truncate" title={currentRoomTypeId}>
                      {currentRoomTypeId.substring(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estadia Mínima</span>
                    <span className="font-medium">
                      {safeMinNightsDefault} noite{safeMinNightsDefault !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Criado em</span>
                    <span className="font-medium">
                      {safeCreatedAt}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última atualização</span>
                    <span className="font-medium">
                      {safeUpdatedAt}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="pt-2">
                  <h4 className="font-medium text-gray-900 mb-2">Métricas Rápidas</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Noite Média</p>
                      <p className="font-bold text-gray-900">
                        {formatPrice(safeBasePrice)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">Valor Mensal*</p>
                      <p className="font-bold text-gray-900">
                        {formatPrice(safeBasePrice * 30)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    *Estimativa baseada em ocupação total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDuplicate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Duplicar Tipo de Quarto
                </Button>
                
                <Link href={`/hotels/${urlHotelId}/room-types/${urlRoomTypeId}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Detalhes
                  </Button>
                </Link>
                
                <Link href={`/hotels/${urlHotelId}/availability?roomType=${urlRoomTypeId}`}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    disabled={!isRoomTypeActive}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ajustar Preços/Disponibilidade
                  </Button>
                </Link>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={handleDelete}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Tipo de Quarto
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

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
                    <p className="font-medium">{getHotelName(hotel)}</p>
                    <p className="text-sm text-gray-600">{hotel.address}</p>
                    <p className="text-sm text-gray-500">
                      {hotel.locality}, {hotel.province}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-1">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="truncate">{hotel.contact_phone || 'Telefone não disponível'}</span>
                    </div>
                    <div className="flex items-center text-sm mt-2">
                      <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                      <span className="truncate">{hotel.contact_email || 'Email não disponível'}</span>
                    </div>
                  </div>

                  <Link href={`/hotels/${urlHotelId}/edit`}>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Ver Detalhes do Hotel
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

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
                    <span className="text-gray-600">Reservas Ativas</span>
                    <span className="font-semibold">{stats.total_bookings || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receita Mensal</span>
                    <span className="font-semibold">{formatPrice(stats.total_revenue || 0)}</span>
                  </div>
                  
                  <Separator />
                  
                  <Link href={`/hotels/${urlHotelId}/analytics`}>
                    <Button variant="outline" className="w-full">
                      Ver Análises Completas
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Ajuda e Suporte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Precisa de ajuda com a gestão deste tipo de quarto?
                </p>
                <div className="space-y-2">
                  <Link href="/help/hotels/room-types">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Guia de Tipos de Quarto
                    </Button>
                  </Link>
                  <Link href="/help/hotels/pricing">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Estratégias de Preços
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Contactar Suporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}