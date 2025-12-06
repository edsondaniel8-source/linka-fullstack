import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { Calendar, MapPin, Users, Search, Bed, Star, Map, CheckCircle, AlertCircle } from 'lucide-react';

// ✅ IMPORTAÇÕES CORRETAS DOS TIPOS
import { SearchParams, Hotel } from '@/types/index';
import { HotelBookingRequest, HotelBookingResponse } from '@/types/index';
import { HotelSearchParams } from '@/shared/hooks/useModalState';

// ✅ IMPORTAR O APISERVICE
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
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // ✅ CORREÇÃO: Tipar corretamente o estado do bookingInProgress
  const handleSetBookingInProgress = (value: string | null) => {
    setBookingInProgress(value);
  };

  // ✅ QUERY ATUALIZADA: usa apiService.searchHotels() com tipos corretos
  const { data: hotelsResponse, refetch, isLoading } = useQuery({
    queryKey: ['/api/hotels', searchParams],
    queryFn: async () => {
      if (!searchParams.location) {
        return {
          success: false,
          data: [],
          count: 0,
        };
      }

      // ✅ Usar apiService em vez de fetch manual
      // ✅ Converter number para string quando necessário
      const params: SearchParams = {
        location: searchParams.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: Number(searchParams.guests), // ✅ Converter para número
      };
      
      return apiService.searchHotels(params);
    },
    enabled: false, // executa somente quando chamado
  });

  // ✅ CORREÇÃO: Acesso direto aos hotéis (data é Hotel[])
  const hotels = hotelsResponse?.data || [];

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
      
      // ✅ FEEDBACK MELHORADO baseado nos resultados
      if (hotelsResponse?.success) {
        const hotelsCount = hotels.length;
        toast({
          title: hotelsCount > 0 ? "Busca realizada!" : "Nenhum resultado",
          description: hotelsCount > 0 
            ? `Encontramos ${hotelsCount} acomodações disponíveis.`
            : "Não encontramos acomodações para os critérios selecionados.",
          variant: hotelsCount > 0 ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Erro na busca",
          description: "Não foi possível buscar as acomodações. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ FUNÇÃO DE RESERVA
  const handleBookHotel = async (hotel: Hotel) => {
    if (!hotel || !searchParams.checkIn || !searchParams.checkOut) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, selecione datas de check-in e check-out.",
        variant: "destructive",
      });
      return;
    }

    // Verificar disponibilidade
    if ((hotel.total_available_rooms ?? 0) <= 0) {
      toast({
        title: "Indisponível",
        description: "Este hotel não tem quartos disponíveis para as datas selecionadas.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se temos room_type_id
    const firstRoomType = hotel.available_room_types?.[0];
    if (!firstRoomType?.room_type_id) {
      toast({
        title: "Erro na reserva",
        description: "Não foi possível identificar o tipo de quarto. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // ✅ CORREÇÃO: Usar hotel.id ou hotel.hotel_id
    const hotelId = hotel.id || hotel.hotel_id || '';
    handleSetBookingInProgress(hotelId);

    // ✅ Criar objeto de reserva com tipos corretos
    const bookingRequest: HotelBookingRequest = {
      hotelId: hotelId,
      roomTypeId: firstRoomType.room_type_id,
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guestName: guestInfo.name || 'Nome do hóspede', // Aqui você pode pegar do usuário logado
      guestEmail: guestInfo.email || 'cliente@exemplo.com', // Idem acima
      guestPhone: guestInfo.phone || '',
      adults: Number(searchParams.guests), // ✅ Converter para número
      children: 0, // Ajuste conforme seu app
      units: 1, // Normalmente 1 quarto
      specialRequests: '', // Opcional
      promoCode: '', // Opcional
    };

    console.log('📝 Criando reserva:', bookingRequest);

    try {
      // ✅ Chamar API de reserva
      const response: HotelBookingResponse = await apiService.createHotelBooking(bookingRequest);

      if (response.success && (response.bookingId || response.booking_id)) {
        const bookingId = response.bookingId || response.booking_id;
        toast({
          title: '🎉 Reserva realizada!',
          description: `Sua reserva no ${hotel.name || hotel.hotel_name} foi confirmada. ID: ${bookingId}`,
          variant: 'default',
          duration: 5000,
        });
        
        // Pode redirecionar para página de confirmação ou histórico
        // window.location.href = `/bookings/${response.bookingId}`;
        
        // Fechar modal após sucesso (opcional)
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast({
          title: '❌ Falha na reserva',
          description: response.message || response.error || 'Não foi possível concluir a reserva.',
          variant: 'destructive',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na reserva:', error);
      toast({
        title: '❌ Erro',
        description: error.message || 'Não foi possível conectar ao servidor.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      handleSetBookingInProgress(null);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    // ✅ CORREÇÃO: Garantir que o valor seja string para os campos de string
    setSearchParams(prev => ({
      ...prev,
      [field]: field === 'guests' ? Number(value) : String(value) // ✅ guests é número, outros são string
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

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return 'Sob consulta';
    
    // ✅ CORREÇÃO: Garantir que price seja número
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(priceNum)) return 'Sob consulta';
    
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(priceNum);
  };

  const renderStars = (rating: number | string | undefined = 4) => {
    // ✅ CORREÇÃO: Converter rating para número
    const ratingNum = typeof rating === 'string' ? parseFloat(rating) : (rating || 4);
    const starsCount = Math.floor(ratingNum);
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < starsCount ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // ✅ Componente para capturar informações do hóspede
  const GuestInfoForm = ({ onSave }: { onSave: (info: typeof guestInfo) => void }) => {
    const [localInfo, setLocalInfo] = useState(guestInfo);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(localInfo);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="guest-name">Nome completo *</Label>
          <Input
            id="guest-name"
            value={localInfo.name}
            onChange={(e) => setLocalInfo({...localInfo, name: e.target.value})}
            placeholder="Nome do hóspede"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guest-email">Email *</Label>
          <Input
            id="guest-email"
            type="email"
            value={localInfo.email}
            onChange={(e) => setLocalInfo({...localInfo, email: e.target.value})}
            placeholder="email@exemplo.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="guest-phone">Telefone</Label>
          <Input
            id="guest-phone"
            type="tel"
            value={localInfo.phone}
            onChange={(e) => setLocalInfo({...localInfo, phone: e.target.value})}
            placeholder="+258 84 000 0000"
          />
        </div>
        
        <Button type="submit" className="w-full">
          Salvar informações
        </Button>
      </form>
    );
  };

  return (
    <div className="p-6">
      {/* ✅ DEBUG INFO */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><strong>🔍 Buscando:</strong> {searchParams.location}</div>
          <div><strong>🏨 Encontrados:</strong> {hotels.length} hotéis</div>
          <div><strong>📅 Noites:</strong> {calculateNights()}</div>
          <div><strong>👥 Hóspedes:</strong> {searchParams.guests}</div>
        </div>
      </div>

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
              placeholder="Digite Tofo, Maputo, Costa do Sol..."
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

          {/* ✅ Informações do Hóspede */}
          {!guestInfo.name && hotels.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Informações do hóspede
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Preencha seus dados para facilitar a reserva
                  </p>
                  <GuestInfoForm onSave={(info) => {
                    setGuestInfo(info);
                    toast({
                      title: "Informações salvas",
                      description: "Seus dados foram guardados para a reserva.",
                      variant: "default",
                    });
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* Resumo da Busca */}
          {searchParams.checkIn && searchParams.checkOut && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm">
                <strong>{calculateNights()}</strong> noite{calculateNights() !== 1 ? 's' : ''} para{' '}
                <strong>{searchParams.guests}</strong> hóspede{searchParams.guests !== 1 ? 's' : ''}
              </p>
              {guestInfo.name && (
                <p className="text-sm mt-1">
                  <strong>Hóspede:</strong> {guestInfo.name}
                </p>
              )}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearching || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          data-testid="button-search-hotels"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching || isLoading ? 'Buscando...' : 'Buscar Acomodações'}
        </Button>
      </div>

      {/* Resultados da Busca */}
      {hasSearched && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Resultados da Busca
            </h3>
            {hotels.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {hotels.length} resultado{hotels.length !== 1 ? 's' : ''}
                </span>
                {guestInfo.name && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Dados prontos
                  </span>
                )}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Buscando acomodações...</p>
            </div>
          ) : hotels.length > 0 ? (
            <div className="space-y-4">
              {hotels.map((hotel: Hotel) => {
                // ✅ CORREÇÃO: Usar hotel.hotel_id ou hotel.id
                const hotelId = hotel.hotel_id || hotel.id || '';
                // ✅ CORREÇÃO: Usar hotel.hotel_name ou hotel.name
                const hotelName = hotel.hotel_name || hotel.name || '';
                // ✅ CORREÇÃO: Garantir que rating seja número
                const hotelRating = typeof hotel.rating === 'string' ? parseFloat(hotel.rating) : (hotel.rating || 4);
                
                return (
                  <div key={hotelId} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900">{hotelName}</h4>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                              {hotel.address}
                              {hotel.locality && `, ${hotel.locality}`}
                              {hotel.province && `, ${hotel.province}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          {renderStars(hotelRating)}
                          <span className="text-sm text-gray-600 ml-1">
                            ({hotelRating.toFixed(1)})
                          </span>
                        </div>

                        {hotel.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {hotel.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Bed className="w-4 h-4 text-blue-600" />
                            {/* ✅ CORREÇÃO: Mostrar tipo do primeiro quarto disponível */}
                            <span>
                              {hotel.available_room_types?.[0]?.room_type_name || hotel.available_room_types?.[0]?.name || 'Hotel'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-green-600" />
                            <span>Até {searchParams.guests} pessoas</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4 min-w-[140px]">
                        {/* ✅ CORREÇÃO: Usar min_price_per_night ou calcular preço */}
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(hotel.min_price_per_night)}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">por noite</div>
                        
                        {calculateNights() > 0 && hotel.min_price_per_night && (
                          <div className="text-xs text-gray-400 mb-3 p-2 bg-gray-50 rounded">
                            Total: {formatPrice(
                              (typeof hotel.min_price_per_night === 'string' 
                                ? parseFloat(hotel.min_price_per_night) 
                                : hotel.min_price_per_night) * calculateNights()
                            )}
                          </div>
                        )}
                        
                        <div className="mb-3">
                          {/* ✅ CORREÇÃO: Verificar total_available_rooms > 0 em vez de isAvailable */}
                          {(hotel.total_available_rooms ?? 0) > 0 ? (
                            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              ✅ Disponível ({hotel.total_available_rooms} quarto{hotel.total_available_rooms !== 1 ? 's' : ''})
                            </span>
                          ) : (
                            <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                              ❌ Indisponível
                            </span>
                          )}
                        </div>
                        
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          data-testid={`button-book-hotel-${hotelId}`}
                          disabled={(hotel.total_available_rooms ?? 0) <= 0 || bookingInProgress === hotelId}
                          onClick={() => handleBookHotel(hotel)}
                        >
                          {bookingInProgress === hotelId ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processando...
                            </>
                          ) : (
                            <>
                              {(hotel.total_available_rooms ?? 0) > 0 ? 'Reservar Agora' : 'Indisponível'}
                            </>
                          )}
                        </Button>
                        
                        {!guestInfo.name && (hotel.total_available_rooms ?? 0) > 0 && (
                          <p className="text-xs text-amber-600 mt-2">
                            * Preencha seus dados acima para reservar
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhuma acomodação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Não encontramos acomodações para "{searchParams.location}" nas datas selecionadas.
              </p>
              <p className="text-sm text-gray-500">
                Tente buscar por: <strong>Tofo</strong>, <strong>Maputo</strong>, <strong>Costa do Sol</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}