import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft, Car, MapPin, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/shared/components/PageHeader";
import { useAuth } from "@/shared/hooks/useAuth";

interface LocationSuggestion {
  id: string;
  name: string;
  province: string;
  fullName: string;
  coordinates: { lat: number; lng: number };
}

export default function CreateRidePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
const [rideData, setRideData] = useState({
    fromLocation: "",
    toLocation: "",
    departureDate: "",
    departureTime: "",
    availableSeats: 4,
    pricePerSeat: "",
    vehicleType: "",
    additionalInfo: ""
  });
  const [fromCoordinates, setFromCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [toCoordinates, setToCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<number | null>(null);

  // Calculate distance when both locations are selected
  const calculateRouteDistance = async () => {
    if (rideData.fromLocation && rideData.toLocation) {
      try {
        const response = await fetch(
          `/api/geo/distance?from=${encodeURIComponent(rideData.fromLocation)}&to=${encodeURIComponent(rideData.toLocation)}`
        );
        const data = await response.json();
        if (data.distance) {
          setEstimatedDistance(data.distance);
        }
      } catch (error) {
        console.error('Failed to calculate distance:', error);
      }
    }
  };

  // Handle location selection with coordinates
  const handleFromLocationChange = (value: string, location?: LocationSuggestion) => {
    setRideData(prev => ({ ...prev, fromLocation: value }));
    if (location) {
      setFromCoordinates(location.coordinates);
      calculateRouteDistance();
    }
  };

  const handleToLocationChange = (value: string, location?: LocationSuggestion) => {
    setRideData(prev => ({ ...prev, toLocation: value }));
    if (location) {
      setToCoordinates(location.coordinates);
      calculateRouteDistance();
    }
  };

  // Create ride mutation usando API simplificada que funciona
  const createRideMutation = useMutation({
    mutationFn: async (newRide: typeof rideData) => {
      const response = await fetch('/api/rides-simple/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: user?.uid || 'temp-driver-id',
          fromAddress: newRide.fromLocation,
          toAddress: newRide.toLocation,
          departureDate: new Date(`${newRide.departureDate}T${newRide.departureTime}`),
          price: parseFloat(newRide.pricePerSeat),
          availableSeats: newRide.availableSeats,
          vehicleInfo: newRide.vehicleType,
          additionalInfo: newRide.additionalInfo,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ride');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Viagem criada com sucesso!",
        description: "Sua viagem está agora disponível para reservas.",
      });
      
      // Reset form
      setRideData({
        fromLocation: "",
        toLocation: "",
        departureDate: "",
        departureTime: "",
        availableSeats: 4,
        pricePerSeat: "",
        vehicleType: "",
        additionalInfo: ""
      });
      
      // Invalidate rides cache
      queryClient.invalidateQueries({ queryKey: ['rides-simple-search'] });
      
      // Redirect to driver dashboard or rides list
      setLocation('/rides/driver');
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar viagem",
        description: "Não foi possível criar sua viagem. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
      console.error('Create ride error:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!rideData.fromLocation || !rideData.toLocation) {
      toast({
        title: "Localizações obrigatórias",
        description: "Selecione de onde está saindo e para onde está indo.",
        variant: "destructive",
      });
      return;
    }
    
    if (!rideData.departureDate || !rideData.departureTime) {
      toast({
        title: "Data e hora obrigatórias",
        description: "Defina a data e hora de partida.",
        variant: "destructive",
      });
      return;
    }
    
    if (!rideData.pricePerSeat || parseFloat(rideData.pricePerSeat) <= 0) {
      toast({
        title: "Preço inválido",
        description: "Digite um preço válido por lugar.",
        variant: "destructive",
      });
      return;
    }

    createRideMutation.mutate(rideData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Criar Viagem" />
      
      <div className="container mx-auto px-4 max-w-2xl py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Criar Nova Viagem
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Partilhe a sua viagem e ganhe dinheiro
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Detalhes da Viagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Route Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Rota da Viagem
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from">Saindo de</Label>
                    <LocationAutocomplete
                      value={rideData.fromLocation}
                      onChange={handleFromLocationChange}
                      placeholder="Saindo de... (Moçambique)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="to">Indo para</Label>
                    <LocationAutocomplete
                      value={rideData.toLocation}
                      onChange={handleToLocationChange}
                      placeholder="Indo para... (Moçambique)"
                    />
                  </div>
                </div>
                
                {estimatedDistance && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      <strong>Distância estimada:</strong> {estimatedDistance} km
                      <br />
                      <strong>Tempo estimado:</strong> {Math.round(estimatedDistance / 60)} horas
                    </p>
                  </div>
                )}
              </div>

              {/* DateTime Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data e Hora
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data de Partida</Label>
                    <Input
                      id="date"
                      type="date"
                      value={rideData.departureDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRideData(prev => ({ ...prev, departureDate: e.target.value }))}
                      data-testid="input-departure-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora de Partida</Label>
                    <Input
                      id="time"
                      type="time"
                      value={rideData.departureTime}
                      onChange={(e) => setRideData(prev => ({ ...prev, departureTime: e.target.value }))}
                      data-testid="input-departure-time"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle and Capacity */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Veículo e Capacidade
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seats">Lugares Disponíveis</Label>
                    <Select
                      value={rideData.availableSeats.toString()}
                      onValueChange={(value) => setRideData(prev => ({ ...prev, availableSeats: parseInt(value) }))}
                    >
                      <SelectTrigger data-testid="select-available-seats">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 lugar</SelectItem>
                        <SelectItem value="2">2 lugares</SelectItem>
                        <SelectItem value="3">3 lugares</SelectItem>
                        <SelectItem value="4">4 lugares</SelectItem>
                        <SelectItem value="5">5 lugares</SelectItem>
                        <SelectItem value="6">6 lugares</SelectItem>
                        <SelectItem value="7">7 lugares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicle">Tipo de Veículo</Label>
                    <Select
                      value={rideData.vehicleType}
                      onValueChange={(value) => setRideData(prev => ({ ...prev, vehicleType: value }))}
                    >
                      <SelectTrigger data-testid="select-vehicle-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="van">Van/Minibus</SelectItem>
                        <SelectItem value="microbus">Microbus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Preço
                </h3>
                
                <div>
                  <Label htmlFor="price">Preço por Lugar (MZN)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rideData.pricePerSeat}
                    onChange={(e) => setRideData(prev => ({ ...prev, pricePerSeat: e.target.value }))}
                    placeholder="Ex: 500.00"
                    data-testid="input-price-per-seat"
                  />
                  {estimatedDistance && rideData.pricePerSeat && (
                    <p className="text-sm text-gray-500 mt-1">
                      Preço por km: {(parseFloat(rideData.pricePerSeat) / estimatedDistance).toFixed(2)} MZN/km
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Informações Adicionais</h3>
                
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Ar condicionado, música, paradas permitidas..."
                    value={rideData.additionalInfo}
                    onChange={(e) => setRideData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    data-testid="textarea-additional-info"
                  />
                </div>
              </div>

              {/* Summary */}
              {estimatedDistance && rideData.pricePerSeat && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                    Resumo da Viagem
                  </h4>
                  <div className="space-y-1 text-sm text-green-600 dark:text-green-400">
                    <p><strong>Rota:</strong> {rideData.fromLocation} → {rideData.toLocation}</p>
                    <p><strong>Distância:</strong> {estimatedDistance} km</p>
                    <p><strong>Receita potencial:</strong> {(parseFloat(rideData.pricePerSeat) * rideData.availableSeats).toFixed(2)} MZN</p>
                    <p><strong>Tempo estimado:</strong> {Math.round(estimatedDistance / 60)} horas</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={createRideMutation.isPending}
                  data-testid="button-create-ride"
                >
                  {createRideMutation.isPending ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Criando viagem...
                    </>
                  ) : (
                    <>
                      <Car className="w-5 h-5 mr-2" />
                      Criar Viagem
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}