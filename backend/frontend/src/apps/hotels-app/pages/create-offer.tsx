import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Hotel, Calendar, DollarSign, Users, Percent, Plus, Info } from "lucide-react";

export default function CreateOffer() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: "",
    roomType: "",
    originalPrice: "",
    discountPrice: "",
    availableRooms: 1,
    driverCommission: 10,
    description: "",
    amenities: [] as string[],
    targetDriverRoutes: [] as string[],
    maxStay: 3,
    cancellationPolicy: "flexible"
  });

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleRouteChange = (route: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      targetDriverRoutes: checked 
        ? [...prev.targetDriverRoutes, route]
        : prev.targetDriverRoutes.filter(r => r !== route)
    }));
  };

  const handleCreateOffer = () => {
    console.log("Criar oferta diária:", formData);
    // TODO: Implementar criação da oferta
    alert("Oferta criada com sucesso!");
  };

  const roomTypes = [
    "Quarto Individual", "Quarto Duplo", "Quarto Twin", "Suite Familiar", 
    "Suite Premium", "Quarto Executivo", "Dormitório Partilhado"
  ];

  const commonAmenities = [
    "Wi-Fi Gratuito", "Pequeno-almoço incluído", "Ar condicionado", 
    "TV por cabo", "Mini-bar", "Casa de banho privada", "Varanda",
    "Estacionamento gratuito", "Piscina", "Ginásio", "Spa", "Restaurante"
  ];

  const popularRoutes = [
    "Maputo → Beira", "Maputo → Xai-Xai", "Maputo → Inhambane",
    "Beira → Chimoio", "Nampula → Nacala", "Nampula → Pemba",
    "Tete → Chimoio", "Quelimane → Beira"
  ];

  const calculateSavings = () => {
    const original = parseFloat(formData.originalPrice) || 0;
    const discount = parseFloat(formData.discountPrice) || 0;
    if (original > 0 && discount > 0) {
      const savings = ((original - discount) / original * 100).toFixed(1);
      return `${savings}% de desconto`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Oferta Diária</h1>
          <p className="text-gray-600">Ofereça quartos com desconto para atrair clientes via motoristas parceiros</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Detalhes da Oferta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data e Tipo de Quarto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Data da Oferta
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType" className="flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-orange-600" />
                  Tipo de Quarto
                </Label>
                <Select onValueChange={(value) => handleInputChange("roomType", value)}>
                  <SelectTrigger data-testid="select-room-type">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  Preço Normal (MZN)
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="ex: 3500"
                  value={formData.originalPrice}
                  onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                  data-testid="input-original-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Preço com Desconto (MZN)
                </Label>
                <Input
                  id="discountPrice"
                  type="number"
                  placeholder="ex: 2800"
                  value={formData.discountPrice}
                  onChange={(e) => handleInputChange("discountPrice", e.target.value)}
                  data-testid="input-discount-price"
                />
                {calculateSavings() && (
                  <p className="text-sm text-green-600 font-medium">
                    💰 {calculateSavings()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission" className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-600" />
                  Comissão Motorista (%)
                </Label>
                <Select onValueChange={(value) => handleInputChange("driverCommission", parseInt(value))}>
                  <SelectTrigger data-testid="select-commission">
                    <SelectValue placeholder={`${formData.driverCommission}%`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="8">8%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Disponibilidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rooms" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Quartos Disponíveis
                </Label>
                <Select onValueChange={(value) => handleInputChange("availableRooms", parseInt(value))}>
                  <SelectTrigger data-testid="select-available-rooms">
                    <SelectValue placeholder={`${formData.availableRooms} quarto`} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} quarto{num !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStay">Estadia Máxima (noites)</Label>
                <Select onValueChange={(value) => handleInputChange("maxStay", parseInt(value))}>
                  <SelectTrigger data-testid="select-max-stay">
                    <SelectValue placeholder={`${formData.maxStay} noites`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 noite</SelectItem>
                    <SelectItem value="2">2 noites</SelectItem>
                    <SelectItem value="3">3 noites</SelectItem>
                    <SelectItem value="5">5 noites</SelectItem>
                    <SelectItem value="7">1 semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comodidades */}
            <div className="space-y-3">
              <Label>Comodidades Incluídas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {commonAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                      data-testid={`checkbox-amenity-${amenity.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Rotas Alvo */}
            <div className="space-y-3">
              <Label>Rotas de Motoristas Alvo (opcional)</Label>
              <p className="text-sm text-gray-600">Selecione rotas para notificar motoristas específicos</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {popularRoutes.map((route) => (
                  <div key={route} className="flex items-center space-x-2">
                    <Checkbox
                      id={route}
                      checked={formData.targetDriverRoutes.includes(route)}
                      onCheckedChange={(checked) => handleRouteChange(route, checked as boolean)}
                      data-testid={`checkbox-route-${route.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <Label htmlFor={route} className="text-sm">{route}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição Adicional (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Ex: Quarto recém renovado com vista para o mar, próximo ao centro comercial..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                data-testid="textarea-description"
              />
            </div>

            {/* Política de Cancelamento */}
            <div className="space-y-2">
              <Label>Política de Cancelamento</Label>
              <Select onValueChange={(value) => handleInputChange("cancellationPolicy", value)}>
                <SelectTrigger data-testid="select-cancellation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexível - Cancelamento até 24h antes</SelectItem>
                  <SelectItem value="moderate">Moderada - Cancelamento até 48h antes</SelectItem>
                  <SelectItem value="strict">Rígida - Cancelamento até 1 semana antes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleCreateOffer}
                className="flex-1"
                size="lg"
                disabled={!formData.date || !formData.roomType || !formData.originalPrice || !formData.discountPrice}
                data-testid="button-create-offer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Oferta Diária
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.history.back()}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Como funciona:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Suas ofertas aparecerão para motoristas das rotas selecionadas</li>
                <li>• Motoristas ganham comissão por cada cliente que trouxerem</li>
                <li>• Você paga a comissão apenas após a estadia confirmada</li>
                <li>• Ofertas expiram às 23:59 da data selecionada</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}