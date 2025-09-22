import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/use-toast';
import { Calendar, MapPin, Users, DollarSign, Car } from 'lucide-react';
import { RideCreateParams } from '@/shared/hooks/useModalState';

interface RideCreateModalProps {
  initialParams: RideCreateParams;
  onClose: () => void;
}

export default function RideCreateModal({ initialParams, onClose }: RideCreateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rideData, setRideData] = useState({
    from: initialParams.from || '',
    to: initialParams.to || '',
    date: initialParams.date || '',
    seats: initialParams.seats || 4,
    price: initialParams.price || 100,
    description: '',
    vehicleType: 'sedan',
  });

  const createRideMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/rides-simple/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: 'cdaaee9b-5ef6-4b6e-98bc-79533d795d73', // TODO: Get from auth context
          fromAddress: data.from,
          toAddress: data.to,
          departureDate: new Date(data.date).toISOString(),
          price: data.price.toString(),
          maxPassengers: data.seats,
          type: data.vehicleType,
          description: data.description || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar viagem');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Viagem criada!",
        description: "Sua viagem foi publicada com sucesso e já está disponível para reservas.",
      });
      
      // Invalidar cache de buscas para mostrar a nova viagem
      queryClient.invalidateQueries({ queryKey: ['/api/rides-simple/search'] });
      
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao criar viagem:', error);
      toast({
        title: "Erro ao criar viagem",
        description: "Não foi possível criar sua viagem. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    // Validação
    if (!rideData.from || !rideData.to || !rideData.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha origem, destino e data.",
        variant: "destructive",
      });
      return;
    }

    if (rideData.seats < 1 || rideData.seats > 8) {
      toast({
        title: "Número de assentos inválido",
        description: "O número de assentos deve estar entre 1 e 8.",
        variant: "destructive",
      });
      return;
    }

    if (rideData.price < 10) {
      toast({
        title: "Preço muito baixo",
        description: "O preço mínimo é de 10 MT por pessoa.",
        variant: "destructive",
      });
      return;
    }

    createRideMutation.mutate(rideData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setRideData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Informações da Viagem */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Informações da Viagem
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Origem
              </Label>
              <Input
                id="from"
                value={rideData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                placeholder="De onde você sai?"
                data-testid="input-create-from"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destino
              </Label>
              <Input
                id="to"
                value={rideData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="Para onde você vai?"
                data-testid="input-create-to"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data e Hora
              </Label>
              <Input
                id="date"
                type="datetime-local"
                value={rideData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                data-testid="input-create-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assentos Disponíveis
              </Label>
              <Input
                id="seats"
                type="number"
                min="1"
                max="8"
                value={rideData.seats}
                onChange={(e) => handleInputChange('seats', parseInt(e.target.value) || 1)}
                data-testid="input-create-seats"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preço por Pessoa (MT)
              </Label>
              <Input
                id="price"
                type="number"
                min="10"
                step="5"
                value={rideData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                data-testid="input-create-price"
              />
            </div>
          </div>
        </div>

        {/* Informações do Veículo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            Informações do Veículo
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleType" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Tipo de Veículo
            </Label>
            <select
              id="vehicleType"
              value={rideData.vehicleType}
              onChange={(e) => handleInputChange('vehicleType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-vehicle-type"
            >
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="hatchback">Hatchback</option>
              <option value="pickup">Pickup</option>
              <option value="van">Van</option>
              <option value="minibus">Minibus</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descrição Adicional (Opcional)
            </Label>
            <Textarea
              id="description"
              value={rideData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Informações adicionais sobre a viagem, pontos de parada, etc."
              rows={3}
              data-testid="textarea-create-description"
            />
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Resumo da Viagem</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Rota:</strong> {rideData.from || '...'} → {rideData.to || '...'}</p>
            <p><strong>Data:</strong> {rideData.date ? new Date(rideData.date).toLocaleString('pt-PT') : '...'}</p>
            <p><strong>Assentos:</strong> {rideData.seats} disponíveis</p>
            <p><strong>Preço:</strong> {rideData.price} MT por pessoa</p>
            <p><strong>Receita Total:</strong> {rideData.price * rideData.seats} MT (lotação completa)</p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-create"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createRideMutation.isPending}
            className="flex-1"
            data-testid="button-submit-create"
          >
            {createRideMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Criando...
              </>
            ) : (
              <>
                <Car className="w-4 h-4 mr-2" />
                Publicar Viagem
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}