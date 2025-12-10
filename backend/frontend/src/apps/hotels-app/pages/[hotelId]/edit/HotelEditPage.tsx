// src/apps/hotels-app/pages/[hotelId]/edit/HotelEditPage.tsx - VERSÃO CORRIGIDA COM TIPOS
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Building2, ArrowLeft, MapPin, Mail, Phone, Calendar,
  Check, Save, Loader2, AlertCircle, Clock
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { useHotelData } from '../../../hooks/useHotelData';
import type { Hotel, HotelUpdateRequest } from '@/types'; // 🔥 IMPORT TIPOS CORRETOS

const AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi Gratuito' },
  { id: 'parking', label: 'Estacionamento' },
  { id: 'breakfast', label: 'Pequeno-Almoço' },
  { id: 'pool', label: 'Piscina' },
  { id: 'gym', label: 'Ginásio' },
  { id: 'spa', label: 'Spa' },
  { id: 'restaurant', label: 'Restaurante' },
  { id: 'bar', label: 'Bar' },
  { id: 'air-conditioning', label: 'Ar Condicionado' },
  { id: 'tv', label: 'TV' },
  { id: 'safe', label: 'Cofre' },
  { id: 'laundry', label: 'Lavandaria' },
  { id: 'hot-water', label: 'Água Quente' },
  { id: 'kitchenette', label: 'Kitchenette' },
  { id: 'balcony', label: 'Varanda' },
  { id: 'sea-view', label: 'Vista para o Mar' },
];

export default function HotelEditPage() {
  const { hotelId: urlHotelId } = useParams<{ hotelId?: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // 🔥 USAR O NOVO HOOK useHotelData
  const { 
    hotel, 
    selectedHotelId, 
    selectHotelById, 
    isLoading, 
    isHotelActive,
    getHotelName,
    getHotelId 
  } = useHotelData(urlHotelId);

  // 🔥 SINCRONIZAÇÃO AUTOMÁTICA: URL → estado
  useEffect(() => {
    if (urlHotelId && urlHotelId !== selectedHotelId) {
      selectHotelById(urlHotelId);
    }
  }, [urlHotelId, selectedHotelId, selectHotelById]);

  // 🔥 INTERFACE CORRIGIDA
  interface FormData {
    name: string;
    description: string;
    address: string;
    locality: string;
    province: string;
    contact_email: string;
    contact_phone: string;
    policies: string;
    check_in_time: string;
    check_out_time: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    address: '',
    locality: '',
    province: 'Maputo',
    contact_email: '',
    contact_phone: '',
    policies: '',
    check_in_time: '14:00',
    check_out_time: '12:00',
  });

  // 🔥 Atualizar formData quando hotel carregar
  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '', // ✅ O tipo Hotel tem description
        address: hotel.address || '',
        locality: hotel.locality || '',
        province: hotel.province || 'Maputo',
        contact_email: hotel.contact_email || '',
        contact_phone: hotel.contact_phone || '',
        policies: hotel.policies || '', // ✅ O tipo Hotel tem policies
        check_in_time: hotel.check_in_time || '14:00',
        check_out_time: hotel.check_out_time || '12:00',
      });
      
      // 🔥 Carregar amenities com verificação segura
      if (hotel.amenities) {
        if (Array.isArray(hotel.amenities)) {
          setSelectedAmenities(hotel.amenities);
        } else if (typeof hotel.amenities === 'string') {
          try {
            const parsed = JSON.parse(hotel.amenities);
            if (Array.isArray(parsed)) {
              setSelectedAmenities(parsed);
            }
          } catch {
            setSelectedAmenities([]);
          }
        }
      }
    }
  }, [hotel]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const updateHotelMutation = useMutation({
    mutationFn: async () => {
      if (!urlHotelId) throw new Error('Hotel ID não encontrado');
      
      // 🔥 CORREÇÃO: Usar camelCase para os campos exigidos pela API
      const updateData: HotelUpdateRequest = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        locality: formData.locality,
        province: formData.province,
        contactEmail: formData.contact_email, // ✅ camelCase para API
        contactPhone: formData.contact_phone, // ✅ snake_case convertido para camelCase
        amenities: selectedAmenities,
        policies: formData.policies,
        checkInTime: formData.check_in_time, // ✅ camelCase
        checkOutTime: formData.check_out_time, // ✅ camelCase
        // Campos opcionais
        isActive: hotel?.is_active
      };
      
      return await apiService.updateHotel(urlHotelId, updateData);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Sucesso!',
          description: 'Hotel atualizado com sucesso.',
        });
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['hotel', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['user-hotels'] });
        queryClient.invalidateQueries({ queryKey: ['hotel-dashboard', urlHotelId] });
        queryClient.invalidateQueries({ queryKey: ['hotel-room-types', urlHotelId] });
      } else {
        throw new Error(response.error);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar hotel',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do hotel é obrigatório',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.contact_email.trim() || !formData.contact_email.includes('@')) {
      toast({
        title: 'Erro',
        description: 'Email de contacto inválido',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      await updateHotelMutation.mutateAsync();
    } catch (error) {
      // Erro já tratado no onError
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Verificação se hotelId existe
  if (!urlHotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hotel Não Encontrado</h2>
          <p className="text-gray-600 mb-6">
            O ID do hotel não foi fornecido.
          </p>
          <Link href="/hotels">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Hotéis
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
            <Link href="/hotels">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Hotéis
              </Button>
            </Link>
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
  const isActive = isHotelActive(hotel);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔥 HEADER COM INDICADOR DO HOTEL ATUAL */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link href={`/hotels/${urlHotelId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Hotel
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Editando: {hotelName}</h1>
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {hotel.locality || 'Local não especificado'}
                    {hotel.province ? `, ${hotel.province}` : ''}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link href={`/hotels/${urlHotelId}`}>
                <Button variant="outline" size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Ver Hotel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Form Card */}
        <Card className="shadow-xl border-blue-100">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Seção: Informações Básicas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Hotel *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Hotel Premium Maputo"
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Ex: Av. Marginal 100, Maputo"
                      className="h-12"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Descrição
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição do Hotel</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descreva seu hotel, serviços oferecidos, localização privilegiada..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    Esta descrição aparecerá para os hóspedes na página do hotel.
                  </p>
                </div>
              </div>

              {/* Seção: Contactos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Informações de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email de Contacto *</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="exemplo@hotel.com"
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone</Label>
                    <Input
                      id="contact_phone"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      placeholder="+258 84 000 0000"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Localização */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="locality">Localidade</Label>
                    <Input
                      id="locality"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      placeholder="Ex: Maputo"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Província</Label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full h-12 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="Maputo">Maputo</option>
                      <option value="Gaza">Gaza</option>
                      <option value="Inhambane">Inhambane</option>
                      <option value="Sofala">Sofala</option>
                      <option value="Manica">Manica</option>
                      <option value="Tete">Tete</option>
                      <option value="Zambézia">Zambézia</option>
                      <option value="Nampula">Nampula</option>
                      <option value="Cabo Delgado">Cabo Delgado</option>
                      <option value="Niassa">Niassa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção: Horários */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Horários
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="check_in_time">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Check-in
                      </div>
                    </Label>
                    <Input
                      id="check_in_time"
                      name="check_in_time"
                      type="time"
                      value={formData.check_in_time}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="check_out_time">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Check-out
                      </div>
                    </Label>
                    <Input
                      id="check_out_time"
                      name="check_out_time"
                      type="time"
                      value={formData.check_out_time}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Seção: Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Amenities e Comodidades
                </h3>
                <Label className="mb-4 block text-gray-600">
                  Selecione as comodidades oferecidas pelo seu hotel
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    
                    return (
                      <div
                        key={amenity.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{amenity.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  {selectedAmenities.length === 0 ? (
                    <span className="text-yellow-600">Nenhuma amenity selecionada</span>
                  ) : (
                    <span>Selecionadas: {selectedAmenities.length} amenities</span>
                  )}
                </div>
              </div>

              {/* Seção: Políticas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                  Políticas e Regras
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="policies">Políticas do Hotel</Label>
                  <Textarea
                    id="policies"
                    name="policies"
                    value={formData.policies}
                    onChange={handleInputChange}
                    placeholder="Políticas de check-in/check-out, cancelamento, crianças, animais, etc."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    Estas informações serão exibidas aos hóspedes durante o processo de reserva.
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                <div className="space-y-2">
                  <Link href={`/hotels/${urlHotelId}`}>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancelar e Voltar
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500">
                    As alterações não salvas serão perdidas
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading || updateHotelMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {loading || updateHotelMutation.isPending ? (
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
                  <p className="text-xs text-gray-500 text-right">
                    * Campos obrigatórios
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Adicionais */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/hotels/${urlHotelId}/room-types`}>
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Gerenciar Tipos de Quarto
            </Button>
          </Link>
          
          <Link href={`/hotels/${urlHotelId}/availability`}>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Configurar Disponibilidade
            </Button>
          </Link>
          
          <Link href={`/hotels/${urlHotelId}`}>
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Ver Dashboard do Hotel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}