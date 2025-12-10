// src/apps/hotels-app/pages/[hotelId]/room-types/edit/RoomTypeEditPage.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import {
  ArrowLeft, Bed, DollarSign, Users, Building2,
  Image as ImageIcon, Check, Save, Trash2, Upload,
  Eye, AlertCircle, Calendar, Wifi, Tv, Wind,
  Coffee, ShowerHead, Lock, Maximize2, Bath,
  Minus, Plus, RefreshCw, Loader2
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../../hooks/useHotelData';
import type { RoomType, RoomTypeUpdateRequest } from '@/types';

// Definir constantes
const BED_TYPES = [
  'Cama de Casal',
  'Duas Camas de Solteiro',
  'Cama Queen Size',
  'Cama King Size',
  'Cama Individual',
  'Sofá-Cama',
  'Beliche'
];

const BATHROOM_TYPES = [
  'Banheiro Privado',
  'Banheiro Compartilhado',
  'Suíte com Banheira',
  'Banheiro com Chuveiro',
  'Banheiro com Acessibilidade'
];

const ROOM_AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi Grátis', icon: Wifi },
  { id: 'tv', label: 'TV por Cabo', icon: Tv },
  { id: 'air-conditioning', label: 'Ar Condicionado', icon: Wind },
  { id: 'minibar', label: 'Minibar', icon: Coffee },
  { id: 'safe', label: 'Cofre', icon: Lock },
  { id: 'balcony', label: 'Varanda', icon: Maximize2 },
  { id: 'sea-view', label: 'Vista para o Mar', icon: Eye },
  { id: 'city-view', label: 'Vista para a Cidade', icon: Building2 },
  { id: 'hairdryer', label: 'Secador de Cabelo', icon: ShowerHead },
  { id: 'bathrobes', label: 'Roupões', icon: Bath },
  { id: 'slippers', label: 'Chinelos', icon: Bed },
  { id: 'desk', label: 'Escritório', icon: Calendar }
];

export default function RoomTypeEditPage() {
  const { hotelId: urlHotelId, roomTypeId } = useParams<{ 
    hotelId?: string; 
    roomTypeId?: string 
  }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // 🔥 USAR useHotelData PARA GERENCIAMENTO CENTRALIZADO
  const { 
    hotel, 
    selectedHotelId, 
    selectHotelById, 
    isLoading: hotelLoading,
    getHotelName,
    isHotelActive,
    rooms,
    formatPrice,
    refetch: refetchHotelData
  } = useHotelData(urlHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    if (urlHotelId && urlHotelId !== selectedHotelId) {
      selectHotelById(urlHotelId);
    }
  }, [urlHotelId, selectedHotelId, selectHotelById]);

  // Interface local para o formulário
  interface RoomTypeFormData {
    name: string;
    description: string;
    basePrice: number;
    baseOccupancy: number;
    maxOccupancy: number;
    totalUnits: number;
    availableUnits: number;
    size: string;
    bedType: string;
    bedTypes: string[];
    bathroomType: string;
    extraAdultPrice: number;
    extraChildPrice: number;
    childrenPolicy: string;
    isActive: boolean;
    minNightsDefault: number;
    amenities: string[];
    images: string[];
  }

  // Form data state
  const [formData, setFormData] = useState<RoomTypeFormData>({
    name: '',
    description: '',
    basePrice: 0,
    baseOccupancy: 2,
    maxOccupancy: 2,
    totalUnits: 1,
    availableUnits: 1,
    size: '',
    bedType: '',
    bedTypes: [],
    bathroomType: '',
    extraAdultPrice: 0,
    extraChildPrice: 0,
    childrenPolicy: '',
    isActive: true,
    minNightsDefault: 1,
    amenities: [],
    images: []
  });

  // 🔥 Verificar se hotelId existe
  if (!urlHotelId || !roomTypeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">IDs Inválidos</h2>
            <p className="text-gray-600">
              O ID do hotel ou do tipo de quarto não foi fornecido corretamente.
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

  // ✅ Buscar detalhes do room type com tratamento melhorado
  const { 
    data: roomType, 
    isLoading: roomLoading, 
    error: roomError,
    refetch: refetchRoomType
  } = useQuery({
    queryKey: ['room-type-details', roomTypeId],
    queryFn: async () => {
      try {
        const response = await apiService.getRoomTypeById(roomTypeId);
        
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.error || 'Tipo de quarto não encontrado');
      } catch (error: any) {
        console.error('Erro ao carregar detalhes:', error);
        throw new Error(error.message || 'Erro ao carregar detalhes do tipo de quarto');
      }
    },
    enabled: !!roomTypeId,
    staleTime: 30000, // 30 segundos
  });

  // Inicializar form data quando os dados do room type carregarem
  useEffect(() => {
    if (roomType) {
      console.log('🔄 Inicializando formData com room type:', roomType);
      
      // Verificar se o room type está ativo
      if (roomType.is_active === false) {
        toast({
          title: 'Tipo de quarto inativo',
          description: 'Este tipo de quarto está marcado como inativo.',
          variant: 'default',
        });
      }
      
      // 🔥 Converter campos do backend para o formato esperado
      setFormData({
        name: roomType.name || '',
        description: roomType.description || '',
        basePrice: typeof roomType.base_price === 'string' 
          ? parseFloat(roomType.base_price) 
          : (roomType.base_price as number) || 0,
        baseOccupancy: roomType.base_occupancy || 2,
        maxOccupancy: roomType.max_occupancy || 2,
        totalUnits: roomType.total_units || 1,
        availableUnits: roomType.available_units || roomType.total_units || 1,
        size: roomType.size || '',
        bedType: roomType.bed_type || '',
        bedTypes: roomType.bed_types || [],
        bathroomType: roomType.bathroom_type || '',
        extraAdultPrice: typeof roomType.extra_adult_price === 'string'
          ? parseFloat(roomType.extra_adult_price)
          : (roomType.extra_adult_price as number) || 0,
        extraChildPrice: typeof roomType.extra_child_price === 'string'
          ? parseFloat(roomType.extra_child_price)
          : (roomType.extra_child_price as number) || 0,
        childrenPolicy: roomType.children_policy || '',
        isActive: roomType.is_active !== false,
        minNightsDefault: roomType.min_nights_default || 1,
        amenities: roomType.amenities || [],
        images: roomType.images || []
      });
      
      setSelectedAmenities(roomType.amenities || []);
      setImages(roomType.images || []);
    }
  }, [roomType, toast]);

  // ✅ CORREÇÃO: Função de refresh manual
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Forçando refresh dos dados...');
      
      // Invalidar todas as queries relacionadas
      await queryClient.invalidateQueries({ 
        queryKey: ['room-type-details', roomTypeId] 
      });
      
      // Refetch dos dados
      await Promise.all([
        refetchRoomType(),
        refetchHotelData()
      ]);
      
      toast({
        title: 'Dados atualizados',
        description: 'Os dados do tipo de quarto foram atualizados.',
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar os dados. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Handler para inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  // Handler para selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Toggle amenity
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewImages(prev => [...prev, ...newFiles]);
    }
  };

  // Remove existing image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Incrementar/decrementar valores
  const increment = (field: keyof RoomTypeFormData) => {
    const currentValue = Number(formData[field]) || 0;
    setFormData(prev => ({ ...prev, [field]: currentValue + 1 }));
  };

  const decrement = (field: keyof RoomTypeFormData) => {
    const currentValue = Number(formData[field]) || 0;
    if (currentValue > 0) {
      setFormData(prev => ({ ...prev, [field]: currentValue - 1 }));
    }
  };

  // ✅ CORREÇÃO: Mutation para atualizar room type melhorada
  const updateRoomMutation = useMutation({
    mutationFn: async (data: RoomTypeFormData) => {
      if (!roomTypeId) {
        throw new Error('ID do tipo de quarto é inválido');
      }
      
      // Converter para RoomTypeUpdateRequest
      const updateData: RoomTypeUpdateRequest = {
        name: data.name,
        description: data.description || undefined,
        basePrice: data.basePrice,
        baseOccupancy: data.baseOccupancy,
        maxOccupancy: data.maxOccupancy,
        totalUnits: data.totalUnits,
        availableUnits: data.availableUnits,
        size: data.size || undefined,
        bedType: data.bedType || undefined,
        bedTypes: data.bedTypes.length > 0 ? data.bedTypes : undefined,
        bathroomType: data.bathroomType || undefined,
        extraAdultPrice: data.extraAdultPrice,
        extraChildPrice: data.extraChildPrice,
        childrenPolicy: data.childrenPolicy || undefined,
        isActive: data.isActive,
        minNightsDefault: data.minNightsDefault,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        images: images.length > 0 ? images : undefined
      };
      
      return await apiService.updateRoomType(roomTypeId, updateData);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Sucesso!',
          description: 'Tipo de quarto atualizado com sucesso.',
        });
        
        // ✅ Invalidar cache completamente
        queryClient.invalidateQueries({ queryKey: ['room-type-details', roomTypeId] });
        queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel-stats', urlHotelId] });
        
        // Redirecionar após sucesso
        setTimeout(() => {
          setLocation(`/hotels/${urlHotelId}/room-types/${roomTypeId}`);
        }, 1500);
      } else {
        throw new Error(response.error);
      }
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar room type:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Erro ao atualizar tipo de quarto',
        variant: 'destructive',
      });
    },
  });

  // ✅ CORREÇÃO: Mutation para deletar room type aprimorada
  const deleteRoomMutation = useMutation({
    mutationFn: async () => {
      if (!roomTypeId) {
        throw new Error('ID do tipo de quarto é inválido');
      }
      
      const response = await apiService.deleteRoomType(roomTypeId);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (response) => {
      toast({
        title: 'Sucesso!',
        description: response.data?.message || 'Tipo de quarto removido com sucesso.',
      });
      
      // ✅ Invalidar cache completamente antes de redirecionar
      queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
      queryClient.invalidateQueries({ queryKey: ['room-type-details', roomTypeId] });
      queryClient.invalidateQueries({ queryKey: ['hotel-stats', urlHotelId] });
      
      // Redirecionar para a lista de room types
      setTimeout(() => {
        setLocation(`/hotels/${urlHotelId}/room-types`);
      }, 500);
    },
    onError: (error: any) => {
      console.error('Erro ao deletar room type:', error);
      toast({
        title: 'Erro ao deletar',
        description: error.message || 'Erro ao remover tipo de quarto',
        variant: 'destructive',
      });
    },
  });

  // Validar formulário
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Nome do tipo de quarto é obrigatório', 
        variant: 'destructive' 
      });
      return false;
    }
    if (formData.basePrice <= 0) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Preço base deve ser maior que zero', 
        variant: 'destructive' 
      });
      return false;
    }
    if (formData.totalUnits <= 0) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Número de unidades deve ser maior que zero', 
        variant: 'destructive' 
      });
      return false;
    }
    if (formData.availableUnits > formData.totalUnits) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Unidades disponíveis não podem ser maiores que unidades totais', 
        variant: 'destructive' 
      });
      return false;
    }
    if (formData.baseOccupancy <= 0) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Ocupação base deve ser maior que zero', 
        variant: 'destructive' 
      });
      return false;
    }
    if (formData.maxOccupancy < formData.baseOccupancy) {
      toast({ 
        title: 'Erro de validação', 
        description: 'Ocupação máxima não pode ser menor que ocupação base', 
        variant: 'destructive' 
      });
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    updateRoomMutation.mutate(formData, {
      onSettled: () => setLoading(false)
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (!roomTypeId) {
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
    
    setIsDeleting(true);
    deleteRoomMutation.mutate(undefined, {
      onSettled: () => setIsDeleting(false)
    });
  };

  // 🔥 Loading state combinado
  const isLoading = hotelLoading || roomLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando detalhes do tipo de quarto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tipo de quarto não encontrado</h2>
          <p className="text-gray-600 mb-6">
            {roomError instanceof Error ? roomError.message : 'O tipo de quarto solicitado não existe ou foi removido.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link href={`/hotels/${urlHotelId}/room-types`}>
              <Button className="w-full">
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
          </div>
        </div>
      </div>
    );
  }

  const hotelName = getHotelName(hotel);
  const isHotelActiveValue = isHotelActive(hotel);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <Link href={`/hotels/${urlHotelId}/room-types/${roomTypeId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Editar Tipo de Quarto</h1>
                {!formData.isActive && (
                  <Badge variant="secondary">Inativo</Badge>
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
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-600">
                  Hotel: {hotelName}
                </p>
                {!isHotelActiveValue && (
                  <Badge variant="destructive" className="text-xs">
                    Hotel Inativo
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting || deleteRoomMutation.isPending}
            >
              {isDeleting || deleteRoomMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Tipo de Quarto
                </>
              )}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || updateRoomMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading || updateRoomMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 🔥 Aviso se hotel estiver inativo */}
        {!isHotelActiveValue && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                <strong>Atenção:</strong> Este hotel está inativo. Mesmo que o tipo de quarto esteja ativo, 
                ele não estará disponível para reservas até que o hotel seja ativado.
              </span>
            </p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="amenities">Comodidades</TabsTrigger>
            <TabsTrigger value="pricing">Preços</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>

          {/* Tab: Informações Básicas */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Informações essenciais sobre o tipo de quarto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Tipo de Quarto *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Suite Premium Vista Mar"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="size">Tamanho (m²)</Label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      min="0"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="25"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva as características do tipo de quarto..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedType">Tipo de Cama Principal</Label>
                    <Select
                      value={formData.bedType}
                      onValueChange={(value) => handleSelectChange('bedType', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o tipo de cama" />
                      </SelectTrigger>
                      <SelectContent>
                        {BED_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathroomType">Tipo de Banheiro</Label>
                    <Select
                      value={formData.bathroomType}
                      onValueChange={(value) => handleSelectChange('bathroomType', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATHROOM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minNightsDefault">Estadia Mínima (noites)</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => decrement('minNightsDefault')}
                        disabled={formData.minNightsDefault <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="minNightsDefault"
                        name="minNightsDefault"
                        type="number"
                        min="1"
                        value={formData.minNightsDefault}
                        onChange={handleInputChange}
                        className="h-12 text-center"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => increment('minNightsDefault')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Status do Tipo de Quarto</Label>
                    <p className="text-sm text-gray-600">
                      {formData.isActive 
                        ? 'Tipo de quarto está ativo e visível para reservas' 
                        : 'Tipo de quarto está inativo e não visível para reservas'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Detalhes e Capacidade */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capacidade e Unidades</CardTitle>
                <CardDescription>
                  Configure a capacidade do tipo de quarto e disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseOccupancy">Ocupação Base</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => decrement('baseOccupancy')}
                        disabled={formData.baseOccupancy <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Input
                          id="baseOccupancy"
                          name="baseOccupancy"
                          type="number"
                          min="1"
                          value={formData.baseOccupancy}
                          onChange={handleInputChange}
                          className="h-12 text-center"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => increment('baseOccupancy')}
                        disabled={formData.baseOccupancy >= formData.maxOccupancy}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Número de hóspedes incluídos no preço base
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy">Ocupação Máxima</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => decrement('maxOccupancy')}
                        disabled={formData.maxOccupancy <= formData.baseOccupancy}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Input
                          id="maxOccupancy"
                          name="maxOccupancy"
                          type="number"
                          min={formData.baseOccupancy}
                          value={formData.maxOccupancy}
                          onChange={handleInputChange}
                          className="h-12 text-center"
                        />
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => increment('maxOccupancy')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Número máximo de hóspedes permitidos
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Unidades Totais *</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => decrement('totalUnits')}
                        disabled={formData.totalUnits <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Input
                          id="totalUnits"
                          name="totalUnits"
                          type="number"
                          min="1"
                          value={formData.totalUnits}
                          onChange={handleInputChange}
                          className="h-12 text-center"
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => increment('totalUnits')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Número total de quartos deste tipo no hotel
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="availableUnits">Unidades Disponíveis</Label>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => decrement('availableUnits')}
                        disabled={formData.availableUnits <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="relative flex-1">
                        <Input
                          id="availableUnits"
                          name="availableUnits"
                          type="number"
                          min="0"
                          max={formData.totalUnits}
                          value={formData.availableUnits}
                          onChange={handleInputChange}
                          className="h-12 text-center"
                        />
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => increment('availableUnits')}
                        disabled={formData.availableUnits >= formData.totalUnits}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Número de quartos disponíveis para reserva
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-blue-800">Resumo de Capacidade</h4>
                      <p className="text-sm text-blue-700">
                        Este tipo de quarto acomoda {formData.baseOccupancy}-{formData.maxOccupancy} pessoas
                        em {formData.availableUnits}/{formData.totalUnits} unidades disponíveis.
                        Estadia mínima: {formData.minNightsDefault} noite(s).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Comodidades */}
          <TabsContent value="amenities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comodidades do Tipo de Quarto</CardTitle>
                <CardDescription>
                  Selecione as comodidades disponíveis neste tipo de quarto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ROOM_AMENITIES.map((amenity) => {
                    const Icon = amenity.icon;
                    const isSelected = selectedAmenities.includes(amenity.id);
                    
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        className={`border rounded-lg p-4 cursor-pointer transition-all w-full text-left ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Icon className={`h-5 w-5 mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="font-medium">{amenity.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Comodidades Selecionadas</p>
                    <p className="text-sm text-gray-600">
                      {selectedAmenities.length} comodidade{selectedAmenities.length !== 1 ? 's' : ''} selecionada{selectedAmenities.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAmenities([])}
                    disabled={selectedAmenities.length === 0}
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Preços */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Preços</CardTitle>
                <CardDescription>
                  Defina os preços e tarifas do tipo de quarto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Preço Base por Noite *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="basePrice"
                        name="basePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        className="h-12 pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Preço para {formData.baseOccupancy} pessoa{formData.baseOccupancy !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Preço Atual</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(formData.basePrice)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        por noite
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="extraAdultPrice">Preço por Adulto Extra</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="extraAdultPrice"
                        name="extraAdultPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.extraAdultPrice}
                        onChange={handleInputChange}
                        className="h-12 pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Acima de {formData.baseOccupancy} adulto{formData.baseOccupancy !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="extraChildPrice">Preço por Criança Extra</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="extraChildPrice"
                        name="extraChildPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.extraChildPrice}
                        onChange={handleInputChange}
                        className="h-12 pl-10"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Normalmente aplicado a crianças até 12 anos
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-800">Exemplo de Cálculo</h4>
                      <p className="text-sm text-green-700">
                        {formData.maxOccupancy} pessoas por {formatPrice(formData.basePrice)} +{' '}
                        {formData.extraAdultPrice > 0 ? `${formatPrice(formData.extraAdultPrice)} por adulto extra` : ''}{' '}
                        {formData.extraChildPrice > 0 ? `${formatPrice(formData.extraChildPrice)} por criança extra` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Imagens */}
          <TabsContent value="images" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Tipo de Quarto</CardTitle>
                <CardDescription>
                  Adicione ou remova imagens do seu tipo de quarto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload de novas imagens */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Arraste e solte imagens aqui</p>
                  <p className="text-sm text-gray-500 mb-4">ou</p>
                  <input
                    type="file"
                    id="room-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="room-image-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Selecionar Imagens
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-gray-500 mt-4">
                    Formatos suportados: JPG, PNG, WebP. Máx. 5MB por imagem.
                  </p>
                </div>

                {/* Preview das novas imagens */}
                {newImages.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Novas Imagens ({newImages.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {newImages.map((image, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Nova imagem ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remover imagem"
                            >
                              ×
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded text-center truncate">
                            {image.name}
                          </div>
                          <Badge className="absolute top-2 right-2 bg-blue-600">
                            Novo
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imagens existentes */}
                {images.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">
                      Imagens Existentes ({images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={image.startsWith('http') ? image : `https://via.placeholder.com/300x200?text=Tipo+Quarto+${index + 1}`}
                            alt={`Tipo de quarto imagem ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                              title="Remover imagem"
                            >
                              ×
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded text-center">
                            Imagem {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dicas */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-blue-800">Dicas para Imagens</h4>
                      <ul className="text-sm text-blue-700 list-disc list-inside mt-1">
                        <li>Use imagens de alta qualidade e boa iluminação</li>
                        <li>Mostre diferentes ângulos do tipo de quarto</li>
                        <li>Inclua fotos do banheiro e das comodidades</li>
                        <li>Mantenha um estilo consistente entre as imagens</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ações Fixas na Parte Inferior */}
        <div className="sticky bottom-6 mt-8 bg-white border rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900">Resumo das Alterações</h3>
              <p className="text-sm text-gray-600">
                {updateRoomMutation.isPending ? 'Salvando alterações...' : 
                 updateRoomMutation.isSuccess ? 'Alterações salvas com sucesso!' :
                 'Revise as alterações antes de salvar'}
              </p>
              {deleteRoomMutation.isSuccess && (
                <p className="text-sm text-green-600 mt-1">
                  Tipo de quarto excluído com sucesso!
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Link href={`/hotels/${urlHotelId}/room-types/${roomTypeId}`}>
                <Button variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button 
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading || updateRoomMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading || updateRoomMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Todas as Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}