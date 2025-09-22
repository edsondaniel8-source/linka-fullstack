import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Search, Star, MapPin, Wifi, Car, Coffee, Users } from "lucide-react";
import apiService from '@/services/api';
// import { type Accommodation } from "@/shared/lib/accommodationService";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/shared/components/PageHeader";
import MobileNavigation from "@/shared/components/MobileNavigation";

export default function HotelSearchPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    maxPrice: "",
    type: ""
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const location = params.get('location') || '';
    const checkIn = params.get('checkIn') || '';
    const checkOut = params.get('checkOut') || '';
    const guests = parseInt(params.get('guests') || '2');
    const maxPrice = params.get('maxPrice') || '';
    const type = params.get('type') || '';
    
    if (location) {
      setSearchParams({ location, checkIn, checkOut, guests, maxPrice, type });
      setHasSearched(true);
    }
  }, []);

  // Buscar acomodações quando hasSearched muda
  const { data: accommodationsResponse, isLoading, error } = useQuery({
    queryKey: ['accommodations-search', searchParams],
    queryFn: () => apiService.searchAccommodations({
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests
    }),
    enabled: hasSearched && !!searchParams.location
  });
  
  // Extrair as acomodações da resposta da API real
  const accommodations = (accommodationsResponse as any)?.data?.accommodations || (accommodationsResponse as any)?.accommodations || [];

  const handleSearch = () => {
    setHasSearched(true);
    // Atualizar URL com novos parâmetros
    const newParams = new URLSearchParams({
      location: searchParams.location,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests.toString(),
      maxPrice: searchParams.maxPrice,
      type: searchParams.type
    }).toString();
    window.history.pushState({}, '', `/hotels/search?${newParams}`);
  };

  const handleBookAccommodation = (accommodation: any) => {
    console.log('Reservar acomodação:', accommodation);
    // Implementar navegação para página de reserva
    setLocation(`/hotels/${accommodation.id}/book`);
  };

  // const formatPrice = (price: number) => {
  //   return `${price.toFixed(2)} MT`;
  // };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      'WiFi': Wifi,
      'Wi-Fi': Wifi,
      'Estacionamento': Car,
      'Café da manhã': Coffee,
      'Restaurante': Coffee,
      'Piscina': Users,
      'Academia': Users
    };
    const Icon = icons[amenity] || MapPin;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Buscar Acomodações" />
      
      <div className="container mx-auto px-4 max-w-7xl py-6">
        {/* Botão voltar */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>

        {/* Formulário de busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Acomodações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Localização</label>
                <Input
                  placeholder="Onde quer ficar?"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                  data-testid="input-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-in</label>
                <Input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                  data-testid="input-checkin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-out</label>
                <Input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                  data-testid="input-checkout"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hóspedes</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value) || 1})}
                  data-testid="input-guests"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full" data-testid="button-search">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Acomodações Disponíveis</h2>
              {accommodations && (
                <Badge variant="secondary">
                  {accommodations.length} acomodaç{accommodations.length !== 1 ? 'ões' : 'ão'} encontrada{accommodations.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {isLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600">Erro ao buscar acomodações. Tente novamente.</p>
                </CardContent>
              </Card>
            )}

            {accommodations && accommodations.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6 text-center">
                  <p className="text-yellow-800">Nenhuma acomodação encontrada para os critérios especificados.</p>
                  <p className="text-yellow-600 text-sm mt-2">Tente alterar suas opções de busca.</p>
                </CardContent>
              </Card>
            )}

            {accommodations && accommodations.map((accommodation: any) => (
              <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    {/* Informações da acomodação */}
                    <div className="md:col-span-2">
                      <div className="mb-3">
                        <h3 className="text-xl font-semibold mb-1">{accommodation.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{accommodation.type}</Badge>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{accommodation.address || accommodation.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(accommodation.rating || 4)}
                          <span className="text-sm text-gray-600 ml-1">({accommodation.rating || 4.0})</span>
                        </div>
                      </div>
                      
                      {accommodation.description && (
                        <p className="text-gray-600 text-sm mb-3">{accommodation.description}</p>
                      )}
                      
                      {accommodation.amenities && accommodation.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {accommodation.amenities.slice(0, 4).map((amenity: string, index: number) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {accommodation.amenities.length > 4 && (
                            <Badge variant="secondary">+{accommodation.amenities.length - 4} mais</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Disponibilidade */}
                    <div className="text-center">
                      <div className="mb-2">
                        <div className="text-sm text-gray-500">Disponibilidade</div>
                        <div className="text-lg font-bold mb-2">
                          {accommodation.isAvailable ? (
                            <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">Indisponível</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {accommodation.pricePerNight ? `${accommodation.pricePerNight} MT` : 'Sob consulta'}
                      </div>
                      <div className="text-sm text-gray-500">por noite</div>
                    </div>

                    {/* Ação */}
                    <div className="text-center">
                      <Button 
                        onClick={() => handleBookAccommodation(accommodation)}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                        disabled={!accommodation.isAvailable}
                        data-testid={`button-book-accommodation-${accommodation.id}`}
                      >
                        {accommodation.isAvailable ? 'Reservar' : 'Indisponível'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
}