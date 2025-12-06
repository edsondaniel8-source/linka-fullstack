// src/apps/hotels-app/pages/[hotelId]/edit/HotelEditPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { 
  Building2, ArrowLeft, MapPin, Mail, Phone,
  Image as ImageIcon, Check, Save
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';

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
];

export default function HotelEditPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Buscar dados do hotel
  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      const response = await apiService.getHotelById(hotelId);
      if (response.success && response.data) {
        setSelectedAmenities(response.data.amenities || []);
        return response.data;
      }
      throw new Error(response.error);
    },
    enabled: !!hotelId,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    locality: '',
    province: 'Maputo',
    contactEmail: '',
    contactPhone: '',
    policies: '',
  });

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        description: hotel.description || '',
        address: hotel.address || '',
        locality: hotel.locality || '',
        province: hotel.province || 'Maputo',
        contactEmail: hotel.contact_email || '',
        contactPhone: hotel.contact_phone || '',
        policies: hotel.policies || '',
      });
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
      return await apiService.updateHotel(hotelId, {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        locality: formData.locality,
        province: formData.province,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        amenities: selectedAmenities,
        policies: formData.policies,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso!',
        description: 'Hotel atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['hotel', hotelId] });
      queryClient.invalidateQueries({ queryKey: ['user-hotels'] });
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
    setLoading(true);
    updateHotelMutation.mutate();
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Hotel</h1>
              <p className="text-gray-600">Atualize as informações do seu hotel</p>
            </div>
          </div>
          <Link href={`/hotels/dashboard`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-blue-100">
          <CardContent className="p-8">
            <div className="space-y-6">
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
                  placeholder="Descreva seu hotel..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contacto *</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="exemplo@hotel.com"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="+258 84 000 0000"
                    className="h-12"
                  />
                </div>
              </div>

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

              {/* Amenities */}
              <div>
                <Label className="mb-4 block">Amenities e Comodidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {AMENITIES.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAmenities.includes(amenity.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleAmenity(amenity.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{amenity.label}</span>
                        {selectedAmenities.includes(amenity.id) && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policies">Políticas e Regras</Label>
                <Textarea
                  id="policies"
                  name="policies"
                  value={formData.policies}
                  onChange={handleInputChange}
                  placeholder="Políticas de check-in/check-out, cancelamento, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-6">
                <Link href={`/hotels/dashboard`}>
                  <Button variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}