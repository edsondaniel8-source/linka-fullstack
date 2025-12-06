// src/apps//hotels-app/pages/[hotelId]/rooms/create/RoomCreatePage.tsx
import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { 
  Bed, 
  ArrowLeft, 
  Users, 
  DollarSign, 
  Building2,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';

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
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'tv', label: 'TV' },
  { id: 'air-conditioning', label: 'Ar Condicionado' },
  { id: 'minibar', label: 'Minibar' },
  { id: 'safe', label: 'Cofre' },
  { id: 'balcony', label: 'Varanda' },
  { id: 'sea-view', label: 'Vista Mar' },
  { id: 'city-view', label: 'Vista Cidade' },
];

export default function RoomCreatePage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bedType: 'Cama de Casal',
    bathroomType: 'Privado',
    baseOccupancy: 2,
    maxOccupancy: 2,
    basePrice: 0,
    extraAdultPrice: 0,
    extraChildPrice: 0,
    totalUnits: 1,
    availableUnits: 1,
    size: '25',
    childrenPolicy: 'Crianças até 12 anos: 50% desconto',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name.includes('Price') || name.includes('Occupancy') || name.includes('Units') 
        ? Number(value) 
        : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome do quarto é obrigatório', variant: 'destructive' });
      return false;
    }
    if (formData.basePrice <= 0) {
      toast({ title: 'Erro', description: 'Preço base deve ser maior que zero', variant: 'destructive' });
      return false;
    }
    if (formData.totalUnits <= 0) {
      toast({ title: 'Erro', description: 'Número de unidades deve ser maior que zero', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !hotelId) return;

    setLoading(true);
    try {
      const response = await apiService.createRoomType(hotelId, {
        name: formData.name,
        description: formData.description,
        maxOccupancy: formData.maxOccupancy,
        baseOccupancy: formData.baseOccupancy,
        basePrice: formData.basePrice,
        availableUnits: formData.availableUnits,
        totalUnits: formData.totalUnits,
        size: formData.size,
        bedType: formData.bedType,
        bedTypes: [formData.bedType],
        bathroomType: formData.bathroomType,
        amenities: selectedAmenities,
        images: [],
        extraAdultPrice: formData.extraAdultPrice,
        extraChildPrice: formData.extraChildPrice,
        childrenPolicy: formData.childrenPolicy,
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar tipo de quarto');
      }

      toast({
        title: 'Sucesso!',
        description: 'Tipo de quarto criado com sucesso.',
      });

      // Redirecionar para a página do hotel
      setTimeout(() => {
        window.location.href = `/dashboard/hotels?hotel=${hotelId}`;
      }, 1500);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar tipo de quarto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Novo Tipo de Quarto</h1>
              <p className="text-gray-600">Configure as características do seu quarto</p>
            </div>
          </div>
          <Link href={`/dashboard/hotels?hotel=${hotelId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Informações Básicas */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informações do Quarto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Informações do Quarto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Quarto *</Label>
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
                    placeholder="Descreva as características do quarto..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedType">Tipo de Cama</Label>
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
                    <Label htmlFor="bathroomType">Tipo de Casa de Banho</Label>
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
                    <Label htmlFor="basePrice">Preço Base por Noite (MT) *</Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      min="0"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Unidades Totais *</Label>
                    <Input
                      id="totalUnits"
                      name="totalUnits"
                      type="number"
                      min="1"
                      value={formData.totalUnits}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="baseOccupancy">Ocupação Base (pessoas)</Label>
                    <Input
                      id="baseOccupancy"
                      name="baseOccupancy"
                      type="number"
                      min="1"
                      value={formData.baseOccupancy}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxOccupancy">Ocupação Máxima (pessoas)</Label>
                    <Input
                      id="maxOccupancy"
                      name="maxOccupancy"
                      type="number"
                      min="1"
                      value={formData.maxOccupancy}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="extraAdultPrice">Preço Adulto Extra (MT)</Label>
                    <Input
                      id="extraAdultPrice"
                      name="extraAdultPrice"
                      type="number"
                      min="0"
                      value={formData.extraAdultPrice}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="extraChildPrice">Preço Criança Extra (MT)</Label>
                    <Input
                      id="extraChildPrice"
                      name="extraChildPrice"
                      type="number"
                      min="0"
                      value={formData.extraChildPrice}
                      onChange={handleInputChange}
                      className="h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities do Quarto */}
            <Card>
              <CardHeader>
                <CardTitle>Comodidades do Quarto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ROOM_AMENITIES.map((amenity) => (
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Resumo e Ações */}
          <div className="space-y-8">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{formData.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço Base:</span>
                  <span className="font-medium">{formData.basePrice.toLocaleString()} MT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unidades:</span>
                  <span className="font-medium">{formData.totalUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ocupação:</span>
                  <span className="font-medium">
                    {formData.baseOccupancy}-{formData.maxOccupancy} pessoas
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Comodidades:</span>
                  <span className="font-medium">{selectedAmenities.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Imagens */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Imagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="room-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="room-image-upload">
                    <Button variant="outline" className="w-full" asChild>
                      <span className="cursor-pointer">Adicionar Imagens</span>
                    </Button>
                  </Label>
                  {images.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {images.length} imagem(ns) selecionada(s)
                    </p>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{image.name}</span>
                        <button
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão de Criação */}
            <div className="sticky top-8">
              <Button 
                className="w-full h-12 text-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Criando Quarto...' : 'Criar Tipo de Quarto'}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">
                O quarto ficará disponível para reservas imediatamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}