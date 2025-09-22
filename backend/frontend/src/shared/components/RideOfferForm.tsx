import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CalendarDays, MapPin, Users, DollarSign, Car as CarIcon, Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface RideOfferFormProps {
  onSubmit?: (rideData: any) => void;
  onCancel?: () => void;
}

export default function RideOfferForm({ onSubmit, onCancel }: RideOfferFormProps) {
  const { user } = useAuth();
 const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    departureDate: "",
    departureTime: "",
    availableSeats: 1,
    pricePerSeat: "",
    vehicleType: "",
    additionalInfo: "",
    allowSmoking: false, // opcional
    allowPets: false,    // opcional
    allowMusic: true     // opcional
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const rideOffer = {
        ...formData,
        driverId: user?.uid,
        driverName: user?.displayName || user?.email,
        status: "available",
        createdAt: new Date().toISOString(),
        totalSeats: formData.availableSeats,
        bookedSeats: 0
      };

      console.log("Nova oferta de boleia:", rideOffer);
      
      // TODO: Integrar com API real
      // await apiRequest("POST", "/api/rides-simple/create", rideOffer);
      
      if (onSubmit) {
        onSubmit(rideOffer);
      }

      // Reset form
      setFormData({
        from: "",
        to: "",
        date: "",
        time: "",
        availableSeats: 1,
        pricePerSeat: "",
        vehicleType: "",
        description: "",
        allowSmoking: false,
        allowPets: false,
        allowMusic: true
      });

    } catch (error) {
      console.error("Erro ao criar oferta de boleia:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CarIcon className="w-5 h-5 mr-2 text-orange-600" />
          Oferecer Boleia
        </CardTitle>
        <p className="text-sm text-gray-600">Ganhe dinheiro compartilhando sua viagem</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origem e Destino */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                De onde
              </Label>
              <Input
                id="from"
                placeholder="Cidade de origem"
                value={formData.from}
                onChange={(e) => updateFormData("from", e.target.value)}
                required
                data-testid="ride-offer-from"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Para onde
              </Label>
              <Input
                id="to"
                placeholder="Cidade de destino"
                value={formData.to}
                onChange={(e) => updateFormData("to", e.target.value)}
                required
                data-testid="ride-offer-to"
              />
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-1" />
                Data da viagem
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData("date", e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                data-testid="ride-offer-date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Hora de partida
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => updateFormData("time", e.target.value)}
                required
                data-testid="ride-offer-time"
              />
            </div>
          </div>

          {/* Lugares e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seats" className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Lugares disponíveis
              </Label>
              <Select onValueChange={(value) => updateFormData("availableSeats", parseInt(value))}>
                <SelectTrigger data-testid="ride-offer-seats">
                  <SelectValue placeholder="Quantos lugares?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 lugar</SelectItem>
                  <SelectItem value="2">2 lugares</SelectItem>
                  <SelectItem value="3">3 lugares</SelectItem>
                  <SelectItem value="4">4 lugares</SelectItem>
                  <SelectItem value="5">5 lugares</SelectItem>
                  <SelectItem value="6">6 lugares</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Preço por lugar (MT)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="ex: 500"
                value={formData.pricePerSeat}
                onChange={(e) => updateFormData("pricePerSeat", e.target.value)}
                required
                min="50"
                data-testid="ride-offer-price"
              />
            </div>
          </div>

          {/* Tipo de Veículo */}
          <div className="space-y-2">
            <Label>Tipo de veículo</Label>
            <Select onValueChange={(value) => updateFormData("vehicleType", value)}>
              <SelectTrigger data-testid="ride-offer-vehicle">
                <SelectValue placeholder="Selecione o tipo do veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="van">Van/Mini-bus</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Informações adicionais</Label>
            <Textarea
              id="description"
              placeholder="Pontos de parada, preferências, etc."
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              rows={3}
              data-testid="ride-offer-description"
            />
          </div>

          {/* Preferências */}
          <div className="space-y-3">
            <Label>Preferências da viagem</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowSmoking}
                  onChange={(e) => updateFormData("allowSmoking", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Permitir fumar</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowPets}
                  onChange={(e) => updateFormData("allowPets", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Permitir animais</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowMusic}
                  onChange={(e) => updateFormData("allowMusic", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Música permitida</span>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              data-testid="ride-offer-submit"
            >
              {isSubmitting ? "Publicando..." : "Publicar Oferta"}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                data-testid="ride-offer-cancel"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}