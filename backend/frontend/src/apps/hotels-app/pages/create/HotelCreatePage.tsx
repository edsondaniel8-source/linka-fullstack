// src/apps/hotels-app/pages/create/HotelCreatePage.tsx
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { 
  HotelIcon, 
  MapPin, 
  Mail, 
  Phone, 
  Image as ImageIcon,
  Check,
  ArrowLeft
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

interface HotelFormData {
  name: string;
  description: string;
  address: string;
  locality: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  lat: number;
  lng: number;
}

export default function HotelCreatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    address: '',
    locality: '',
    province: 'Maputo',
    contactEmail: '',
    contactPhone: '',
    lat: -25.9692,
    lng: 32.5732,
  });

  // Corrigir: Incluir HTMLSelectElement no tipo
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast({ 
        title: 'Erro', 
        description: 'Nome do hotel é obrigatório', 
        variant: 'destructive' 
      });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ 
        title: 'Erro', 
        description: 'Endereço é obrigatório', 
        variant: 'destructive' 
      });
      return false;
    }
    if (!formData.contactEmail.trim()) {
      toast({ 
        title: 'Erro', 
        description: 'Email é obrigatório', 
        variant: 'destructive' 
      });
      return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      toast({ 
        title: 'Erro', 
        description: 'Email inválido', 
        variant: 'destructive' 
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) return;

    setLoading(true);
    try {
      // Extrair localidade do endereço se não foi especificada
      const locality = formData.locality || formData.address.split(',')[0]?.trim() || 'Maputo';
      
      // Criar hotel
      const hotelResponse = await apiService.createHotel({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        locality: locality,
        province: formData.province,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        lat: formData.lat,
        lng: formData.lng,
        amenities: selectedAmenities,
        images: [], // Em produção, faria upload das imagens
      });

      if (!hotelResponse.success) {
        throw new Error(hotelResponse.error || 'Erro ao criar hotel');
      }

      // Em produção, aqui faria o upload das imagens
      if (images.length > 0) {
        // Simulação de upload de imagens
        console.log(`${images.length} imagens para upload`);
      }

      toast({
        title: 'Sucesso!',
        description: 'Hotel criado com sucesso.',
      });

      // Redirecionar para o dashboard com um pequeno delay
      setTimeout(() => {
        setLocation('/hotels/dashboard');
      }, 1500);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar hotel',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
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
                  required
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

            <div className="flex justify-between pt-6">
              <Link href="/hotels/dashboard">
                <Button variant="outline" type="button">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Button onClick={() => setStep(2)}>
                Próximo: Amenities
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Amenities e Comodidades</h3>
            <p className="text-gray-600 mb-4">
              Selecione as comodidades disponíveis no seu hotel.
            </p>

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

            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Selecionadas: {selectedAmenities.length} amenities
              </p>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)}>
                Próximo: Imagens
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Imagens do Hotel</h3>
            <p className="text-gray-600 mb-4">
              Adicione fotos do seu hotel para atrair mais clientes. 
              Recomendamos pelo menos 3 imagens de alta qualidade.
            </p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Arraste e solte imagens aqui</p>
              <p className="text-sm text-gray-500 mb-4">ou</p>
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label htmlFor="image-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Selecionar Ficheiros</span>
                </Button>
              </Label>
              <p className="text-xs text-gray-500 mt-4">
                Formatos suportados: JPG, PNG, WebP. Máx. 5MB por imagem.
              </p>
            </div>

            {/* Preview das Imagens */}
            {images.length > 0 && (
              <>
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Imagens selecionadas ({images.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Hotel image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remover imagem"
                          >
                            ×
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded text-center truncate">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Dica: Adicione fotos da fachada, quartos, áreas comuns e amenities.
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Criando Hotel...
                  </>
                ) : (
                  'Criar Hotel'
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HotelIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Hotel</h1>
              <p className="text-gray-600">Preencha as informações do seu hotel</p>
            </div>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNum <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          <div className="relative flex justify-between">
            {['Informações', 'Amenities', 'Imagens'].map((label, index) => (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    index + 1 <= step 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-blue-100">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Complete todos os campos</h4>
              <p className="text-sm text-gray-600">Campos marcados com * são obrigatórios</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Boas imagens</h4>
              <p className="text-sm text-gray-600">Use fotos de alta qualidade</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Localização precisa</h4>
              <p className="text-sm text-gray-600">Ajude clientes a encontrar facilmente</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            As informações podem ser atualizadas a qualquer momento no painel de gestão.
          </p>
          <Link href="/hotels/dashboard">
            <Button variant="link" className="mt-2">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}