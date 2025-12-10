// src/apps/hotels-app/pages/[hotelId]/room-types/create/RoomTypeCreatePage.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { 
  Bed, 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Building2,
  Check,
  Image as ImageIcon,
  Save,
  AlertCircle,
  Loader2,
  Home,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Shield,
  Maximize2,
  Eye,
  Droplets,
  Umbrella,
  Key,
  Bath,
  ThermometerSun,
  ShowerHead,
  Sofa,
  Table
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../../hooks/useHotelData';
import type { RoomTypeCreateRequest } from '@/types';

const BED_TYPES = [
  'Cama de Casal',
  'Duas Camas de Solteiro',
  'Cama Queen',
  'Cama King',
  'Cama Individual',
  'Sofá-Cama',
];

const BATHROOM_TYPES = [
  'Privado',
  'Partilhado',
  'Suite com Banheira',
];

const ROOM_AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'tv', label: 'TV', icon: <Tv className="h-4 w-4" /> },
  { id: 'air-conditioning', label: 'Ar Condicionado', icon: <Wind className="h-4 w-4" /> },
  { id: 'minibar', label: 'Minibar', icon: <Coffee className="h-4 w-4" /> },
  { id: 'safe', label: 'Cofre', icon: <Shield className="h-4 w-4" /> },
  { id: 'balcony', label: 'Varanda', icon: <Maximize2 className="h-4 w-4" /> },
  { id: 'sea-view', label: 'Vista Mar', icon: <Eye className="h-4 w-4" /> },
  { id: 'city-view', label: 'Vista Cidade', icon: <Eye className="h-4 w-4" /> },
  { id: 'private-bathroom', label: 'Banheiro Privativo', icon: <Bath className="h-4 w-4" /> },
  { id: 'hot-water', label: 'Água Quente 24h', icon: <ThermometerSun className="h-4 w-4" /> },
  { id: 'hairdryer', label: 'Secador de Cabelo', icon: <Droplets className="h-4 w-4" /> },
  { id: 'towels', label: 'Toalhas Incluídas', icon: <Umbrella className="h-4 w-4" /> },
  { id: 'linen', label: 'Roupas de Cama', icon: <Bed className="h-4 w-4" /> },
  { id: 'toiletries', label: 'Produtos de Banho', icon: <ShowerHead className="h-4 w-4" /> },
  { id: 'desk', label: 'Escrivaninha', icon: <Table className="h-4 w-4" /> },
  { id: 'wardrobe', label: 'Guarda-roupas', icon: <Sofa className="h-4 w-4" /> },
];

export default function RoomCreatePage() {
  const { hotelId: urlHotelId } = useParams<{ hotelId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // 🔥 USAR useHotelData PARA GERENCIAMENTO CENTRALIZADO
  const { 
    hotel, 
    selectedHotelId, 
    selectHotelById, 
    isLoading: hotelLoading,
    getHotelName,
    isHotelActive,
    rooms,
    refetch: refetchRoomTypes
  } = useHotelData(urlHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA
  useEffect(() => {
    if (urlHotelId && urlHotelId !== selectedHotelId) {
      selectHotelById(urlHotelId);
    }
  }, [urlHotelId, selectedHotelId, selectHotelById]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bedType: 'Cama de Casal',
    bathroomType: 'Privado',
    baseOccupancy: '2',
    maxOccupancy: '3',
    basePrice: '',
    extraAdultPrice: '0',
    extraChildPrice: '0',
    totalUnits: '1',
    minNightsDefault: '1',
    size: '25',
    childrenPolicy: 'Crianças até 12 anos: 50% desconto',
    isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Permite valores vazios temporariamente
    const numValue = value === '' ? '' : Math.max(0, Number(value));
    setFormData(prev => ({ 
      ...prev, 
      [name]: String(numValue) // Garantir que seja string
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ 
        title: 'Erro', 
        description: 'Nome do tipo de quarto é obrigatório', 
        variant: 'destructive' 
      });
      return false;
    }
    
    const basePrice = Number(formData.basePrice);
    if (isNaN(basePrice) || basePrice <= 0) {
      toast({ 
        title: 'Erro', 
        description: 'Preço base deve ser maior que zero', 
        variant: 'destructive' 
      });
      return false;
    }
    
    const totalUnits = Number(formData.totalUnits);
    if (isNaN(totalUnits) || totalUnits <= 0) {
      toast({ 
        title: 'Erro', 
        description: 'Número de unidades deve ser maior que zero', 
        variant: 'destructive' 
      });
      return false;
    }
    
    if (Number(formData.maxOccupancy) < Number(formData.baseOccupancy)) {
      toast({ 
        title: 'Erro', 
        description: 'Ocupação máxima deve ser maior ou igual à ocupação base', 
        variant: 'destructive' 
      });
      return false;
    }
    
    return true;
  };

  // 🔥 Mutation para criar room type - CORRIGIDO
  const createRoomTypeMutation = useMutation({
    mutationFn: async (roomTypeData: RoomTypeCreateRequest) => {
      if (!urlHotelId) throw new Error('Hotel ID não encontrado');
      console.log('📤 Enviando dados:', { hotelId: urlHotelId, ...roomTypeData });
      
      const response = await apiService.createRoomType(urlHotelId, roomTypeData);
      console.log('📥 Resposta da API:', response);
      
      return response;
    },
    onSuccess: (response) => {
      console.log('✅ Mutation success:', response);
      
      if (response.success) {
        toast({
          title: 'Sucesso!',
          description: 'Tipo de quarto criado com sucesso.',
        });

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel-stats', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel-room-types-dashboard', urlHotelId] });

        // Refetch do hook
        if (refetchRoomTypes) {
          refetchRoomTypes();
        }

        // Redirecionar após sucesso
        setTimeout(() => {
          setLocation(`/hotels/${urlHotelId}/room-types`);
        }, 1500);
      } else {
        throw new Error(response.error || 'Erro ao criar tipo de quarto');
      }
    },
    onError: (error: Error) => {
      console.error('❌ Mutation error:', error);
      toast({
        title: 'Erro ao criar tipo de quarto',
        description: error.message || 'Ocorreu um erro. Por favor, tente novamente.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleSubmit = async () => {
    console.log('🔄 Iniciando submit...');
    
    if (!validateForm() || !urlHotelId) {
      console.log('❌ Validação falhou ou hotelId não existe');
      return;
    }

    setLoading(true);
    console.log('📝 Dados do formulário:', formData);
    console.log('🏷️ Amenities selecionadas:', selectedAmenities);

    try {
      // 🔥 CORREÇÃO: Converter todos os valores numéricos e garantir tipos corretos
      // 🔥 REMOVIDO: base_price_low e base_price_high (não existem no tipo RoomTypeCreateRequest)
      const roomTypeData: RoomTypeCreateRequest = {
        // Campos obrigatórios
        name: formData.name.trim(),
        basePrice: Number(formData.basePrice),
        totalUnits: Number(formData.totalUnits),
        
        // Campos opcionais numéricos
        baseOccupancy: Number(formData.baseOccupancy) || 2,
        maxOccupancy: Number(formData.maxOccupancy) || 3,
        minNightsDefault: Number(formData.minNightsDefault) || 1,
        extraAdultPrice: Number(formData.extraAdultPrice) || 0,
        extraChildPrice: Number(formData.extraChildPrice) || 0,
        
        // Campos opcionais de string
        description: formData.description?.trim() || undefined,
        
        // 🔥 CORREÇÃO: size deve ser string se existir
        size: formData.size ? String(formData.size) : undefined,
        
        bedType: formData.bedType || undefined,
        bathroomType: formData.bathroomType || undefined,
        childrenPolicy: formData.childrenPolicy || undefined,
        
        // Arrays
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        images: [], // Para compatibilidade com a API
        
        // Boolean
        isActive: Boolean(formData.isActive),
        
        // ✅ Campos adicionais para compatibilidade (segundo o types/index.ts)
        bedTypes: formData.bedType ? [formData.bedType] : undefined,
        availableUnits: Number(formData.totalUnits) || undefined,
      };

      console.log('🚀 Dados para API:', roomTypeData);
      
      await createRoomTypeMutation.mutateAsync(roomTypeData);
      
    } catch (error: any) {
      console.error('💥 Erro no submit:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar tipo de quarto',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // 🔥 Verificação se hotelId existe
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
              Para criar tipos de quarto, você precisa selecionar um hotel.
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

  if (hotelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do hotel...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Não Encontrado</h2>
          <p className="text-gray-600 mb-6">
            O hotel solicitado não existe ou você não tem acesso.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => setLocation('/hotels')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Hotéis
            </Button>
            <Link href="/hotels/create">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Criar Novo Hotel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hotelName = getHotelName(hotel);
  const isHotelActiveValue = isHotelActive(hotel);
  const totalRoomTypes = rooms?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link href={`/hotels/${urlHotelId}/room-types`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Tipos de Quarto
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Tipo de Quarto</h1>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Hotel: {hotelName}</span>
                <span className="text-sm text-gray-500">
                  • {totalRoomTypes} tipo(s) de quarto existente(s)
                </span>
              </div>
            </div>
          </div>
          
          {!isHotelActiveValue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>
                  <strong>Atenção:</strong> Este hotel está inativo. Tipos de quarto criados 
                  não estarão disponíveis para reservas até que o hotel seja ativado.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Informações Básicas */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações do Tipo de Quarto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Informações do Tipo de Quarto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center">
                      Nome do Tipo de Quarto *
                      {formData.name && (
                        <Check className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Standard, Deluxe, Suite Premium"
                      className="h-12"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Nome único para identificar este tipo de quarto
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits" className="flex items-center">
                      Número de Unidades *
                      {formData.totalUnits && Number(formData.totalUnits) > 0 && (
                        <Check className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="totalUnits"
                      name="totalUnits"
                      type="number"
                      min="1"
                      value={formData.totalUnits}
                      onChange={handleNumberInputChange}
                      placeholder="Ex: 10"
                      className="h-12"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Quantas unidades deste tipo existem no hotel
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva as características deste tipo de quarto..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    Esta descrição aparecerá para os hóspedes na página de reserva
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="size">Tamanho Aproximado (m²)</Label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      min="1"
                      value={formData.size}
                      onChange={handleNumberInputChange}
                      placeholder="25"
                      className="h-12"
                    />
                    <p className="text-sm text-gray-500">Metragem quadrada aproximada</p>
                  </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathroomType">Tipo de Banheiro</Label>
                  <Select
                    value={formData.bathroomType}
                    onValueChange={(value) => handleSelectChange('bathroomType', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecione o tipo de banheiro" />
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
              </CardContent>
            </Card>

            {/* Preços e Ocupação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Preços e Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice" className="flex items-center">
                      Preço Base por Noite (MT) *
                      {formData.basePrice && Number(formData.basePrice) > 0 && (
                        <Check className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={handleNumberInputChange}
                      placeholder="1500.00"
                      className="h-12"
                      required
                    />
                    <p className="text-sm text-gray-500">Preço para ocupação base</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minNightsDefault">Noites Mínimas *</Label>
                    <Input
                      id="minNightsDefault"
                      name="minNightsDefault"
                      type="number"
                      min="1"
                      value={formData.minNightsDefault}
                      onChange={handleNumberInputChange}
                      placeholder="1"
                      className="h-12"
                      required
                    />
                    <p className="text-sm text-gray-500">Estadia mínima permitida</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseOccupancy">Ocupação Base (pessoas)</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <Input
                        id="baseOccupancy"
                        name="baseOccupancy"
                        type="number"
                        min="1"
                        value={formData.baseOccupancy}
                        onChange={handleNumberInputChange}
                        placeholder="2"
                        className="h-12"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Número padrão de pessoas incluídas no preço base
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy">Ocupação Máxima (pessoas)</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <Input
                        id="maxOccupancy"
                        name="maxOccupancy"
                        type="number"
                        min="1"
                        value={formData.maxOccupancy}
                        onChange={handleNumberInputChange}
                        placeholder="3"
                        className="h-12"
                      />
                    </div>
                    <p className="text-sm text-gray-500">Máximo de pessoas permitidas</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="extraAdultPrice">Preço por Adulto Extra (MT)</Label>
                    <Input
                      id="extraAdultPrice"
                      name="extraAdultPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.extraAdultPrice}
                      onChange={handleNumberInputChange}
                      placeholder="300.00"
                      className="h-12"
                    />
                    <p className="text-sm text-gray-500">Acima da ocupação base (por noite)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extraChildPrice">Preço por Criança Extra (MT)</Label>
                    <Input
                      id="extraChildPrice"
                      name="extraChildPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.extraChildPrice}
                      onChange={handleNumberInputChange}
                      placeholder="150.00"
                      className="h-12"
                    />
                    <p className="text-sm text-gray-500">Acima da ocupação base (por noite)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities do Quarto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-5 w-5" />
                  Comodidades Incluídas
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Selecione as comodidades disponíveis neste tipo de quarto
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ROOM_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        className={`border rounded-lg p-3 cursor-pointer transition-all flex flex-col items-center justify-center h-24 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <div className="mb-2">{amenity.icon}</div>
                        <span className="font-medium text-xs text-center">{amenity.label}</span>
                        {isSelected && (
                          <Check className="absolute top-2 right-2 h-4 w-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 text-sm">
                  {selectedAmenities.length === 0 ? (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Nenhuma comodidade selecionada</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600">
                      <Check className="h-4 w-4 mr-2" />
                      <span>Selecionadas: {selectedAmenities.length} comodidade(s)</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Resumo e Ações */}
          <div className="space-y-8">
            {/* Status e Configurações */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Tipo de quarto ativo
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Tipos de quarto inativos não estarão disponíveis para reservas.
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                  />
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Dica:</strong> Mesmo que o hotel esteja inativo, você pode criar tipos de quarto
                    e ativá-los depois quando o hotel for ativado.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Tipo de Quarto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Nome:</span>
                    <span className={`font-medium truncate max-w-[150px] text-right ${
                      formData.name ? 'text-gray-900' : 'text-red-500'
                    }`}>
                      {formData.name || 'Obrigatório'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Preço Base:</span>
                    <span className={`font-medium ${
                      formData.basePrice && Number(formData.basePrice) > 0 ? 'text-gray-900' : 'text-red-500'
                    }`}>
                      {formData.basePrice ? 
                        `${Number(formData.basePrice).toLocaleString('pt-MZ')} MT` : 
                        'Obrigatório'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Unidades:</span>
                    <span className={`font-medium ${
                      formData.totalUnits && Number(formData.totalUnits) > 0 ? 'text-gray-900' : 'text-red-500'
                    }`}>
                      {formData.totalUnits || 'Obrigatório'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Ocupação:</span>
                    <span className="font-medium text-gray-900">
                      {formData.baseOccupancy}-{formData.maxOccupancy} pessoas
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Noites Mínimas:</span>
                    <span className="font-medium text-gray-900">{formData.minNightsDefault}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Comodidades:</span>
                    <span className="font-medium text-gray-900">{selectedAmenities.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagens (opcional) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Imagens (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="room-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="room-image-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center space-y-3">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <span className="text-sm text-gray-600">Clique para adicionar imagens</span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</span>
                      <Button variant="outline" size="sm" type="button">
                        Selecionar Imagens
                      </Button>
                    </div>
                  </Label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      {images.length} imagem(ns) selecionada(s)
                    </p>
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate flex-1 mr-2">{image.name}</span>
                        <span className="text-xs text-gray-500 mr-2">
                          {(image.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 text-lg font-bold"
                          title="Remover imagem"
                          type="button"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3 text-center">
                  <strong>Nota:</strong> O upload de imagens será implementado na próxima versão.
                </p>
              </CardContent>
            </Card>

            {/* Botão de Criação */}
            <div className="sticky top-8">
              <Button 
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={loading || createRoomTypeMutation.isPending}
              >
                {loading || createRoomTypeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando Tipo de Quarto...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Criar Tipo de Quarto
                  </>
                )}
              </Button>
              
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-500 text-center">
                  {!isHotelActiveValue ? (
                    <span className="text-yellow-600 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      O hotel está inativo. Este tipo de quarto não estará disponível para reservas.
                    </span>
                  ) : (
                    'Este tipo de quarto estará disponível para reservas imediatamente.'
                  )}
                </p>
                
                <div className="text-xs text-gray-400 text-center">
                  * Campos obrigatórios
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}