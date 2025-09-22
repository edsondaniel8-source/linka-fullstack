import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/shared/hooks/use-toast';
import { Calendar, MapPin, Users, Search, Bed } from 'lucide-react';
import { HotelSearchParams } from '@/shared/hooks/useModalState';
import apiService from '@/services/api';

interface HotelSearchModalProps {
  initialParams: HotelSearchParams;
  onClose: () => void;
}

export default function HotelSearchModal({ initialParams, onClose }: HotelSearchModalProps) {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    location: initialParams.location || '',
    checkIn: initialParams.checkIn || '',
    checkOut: initialParams.checkOut || '',
    guests: initialParams.guests || 2,
  });

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Query para buscar hotéis
  const { data: hotelsResponse, refetch, isLoading } = useQuery({
    queryKey: ['/api/hotels/search', searchParams],
    queryFn: () => apiService.searchAccommodations({
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests
    }),
    enabled: false, // Só executa quando chamado manualmente
  });
  
  // Extrair os hotéis da resposta
  const hotels = (hotelsResponse as any)?.data?.accommodations || [];

  // Se tem parâmetros iniciais, fazer busca automaticamente
  useEffect(() => {
    if (initialParams.location && initialParams.checkIn && initialParams.checkOut) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!searchParams.location || !searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha localização, check-in e check-out.",
        variant: "destructive",
      });
      return;
    }

    // Validar datas
    const checkInDate = new Date(searchParams.checkIn);
    const checkOutDate = new Date(searchParams.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      toast({
        title: "Data inválida",
        description: "A data de check-in não pode ser anterior a hoje.",
        variant: "destructive",
      });
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast({
        title: "Data inválida",
        description: "A data de check-out deve ser posterior ao check-in.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      await refetch();
      toast({
        title: "Busca realizada",
        description: `Encontramos ${hotels?.length || 0} acomodações disponíveis.`,
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar as acomodações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateNights = () => {
    if (searchParams.checkIn && searchParams.checkOut) {
      const checkIn = new Date(searchParams.checkIn);
      const checkOut = new Date(searchParams.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  return (
    <div className="p-6">
      {/* Formulário de Busca */}
      <div className="space-y-6 mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Localização
            </Label>
            <Input
              id="location"
              value={searchParams.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Cidade ou região em Moçambique"
              data-testid="input-hotel-location"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => handleInputChange('checkIn', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                data-testid="input-hotel-checkin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => handleInputChange('checkOut', e.target.value)}
                min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                data-testid="input-hotel-checkout"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Hóspedes
            </Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max="10"
              value={searchParams.guests}
              onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 1)}
              data-testid="input-hotel-guests"
            />
          </div>

          {/* Resumo da Busca */}
          {searchParams.checkIn && searchParams.checkOut && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm">
                <strong>{calculateNights()}</strong> noite{calculateNights() !== 1 ? 's' : ''} para{' '}
                <strong>{searchParams.guests}</strong> hóspede{searchParams.guests !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearching || isLoading}
          className="w-full"
          data-testid="button-search-hotels"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching || isLoading ? 'Buscando...' : 'Buscar Acomodações'}
        </Button>
      </div>

      {/* Resultados da Busca */}
      {hasSearched && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Resultados da Busca
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Buscando acomodações...</p>
            </div>
          ) : hotels && hotels.length > 0 ? (
            <div className="space-y-4">
              {hotels.map((hotel: any) => (
                <div key={hotel.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{hotel.name}</h4>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {hotel.location}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{hotel.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{hotel.roomType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Até {hotel.capacity} pessoas</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {hotel.pricePerNight} MT
                      </div>
                      <div className="text-sm text-gray-500">por noite</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Total: {(hotel.pricePerNight * calculateNights()).toFixed(2)} MT
                      </div>
                      
                      <Button 
                        className="mt-3"
                        data-testid={`button-book-hotel-${hotel.id}`}
                      >
                        Reservar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                Nenhuma acomodação encontrada para os critérios selecionados.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tente alterar as datas ou localização da busca.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}