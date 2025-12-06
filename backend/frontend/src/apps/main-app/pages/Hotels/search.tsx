import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { ArrowLeft, Search, Star, MapPin } from "lucide-react";
import PageHeader from "@/shared/components/PageHeader";
import MobileNavigation from "@/shared/components/MobileNavigation";
import { useHotelSearch } from "@/shared/hooks/useHotelSearch";
import { formatPrice } from "@/shared/lib/api-utils"; // ✅ CORREÇÃO: Importar do lugar correto

export default function HotelSearchPage() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  
  // 🔥 USANDO NOSSO NOVO HOOK COM MIGRAÇÃO v1 → v2
  const { search, loading, error, results } = useHotelSearch();
  const isLoading = loading;

  // ✅ FUNÇÃO MIGRADA - usando nosso serviço com fallback automático
  const handleSearch = async () => {
    if (!searchParams.location.trim()) {
      alert('Por favor, informe uma localização para buscar');
      return;
    }

    console.log('🎯 [FRONTEND MIGRADO] Iniciando busca por:', searchParams.location);
    
    setHasSearched(true);
    setAccommodations([]); // Limpar resultados anteriores

    try {
      // 🔥 CHAMANDO NOSSO SERVIÇO UNIFICADO (v2 com fallback para v1)
      const result = await search({
        location: searchParams.location,
        checkIn: searchParams.checkIn || undefined,
        checkOut: searchParams.checkOut || undefined,
        guests: searchParams.guests
      });

      console.log('✅ [MIGRADO] Resultado da busca:', {
        source: result.source,  // 'v2' ou 'v1' ou 'error'
        count: result.count,
        success: result.success
      });

      if (result.success && result.data) {
        // 🔄 ADAPTAR DADOS DO V2 PARA O FORMATO ESPERADO PELO COMPONENTE
        const hotels = result.data.map((hotel: any) => {
          if (result.source === 'v2') {
            // Adaptar schema v2 para v1 (compatibilidade)
            return {
              id: hotel.hotel_id || hotel.id,
              name: hotel.hotel_name || hotel.name,
              description: hotel.description || '',
              address: hotel.address || '',
              locality: hotel.locality || '',
              province: hotel.province || '',
              // Converter preço de string para number
              pricePerNight: hotel.min_price_per_night ? parseFloat(hotel.min_price_per_night) : 
                            hotel.price_per_night ? parseFloat(hotel.price_per_night) : 0,
              price: hotel.min_price_per_night ? parseFloat(hotel.min_price_per_night) : 
                     hotel.price || 0,
              rating: 4.0, // Rating não existe no v2, usar default
              type: hotel.available_room_types?.[0]?.room_type_name || 'Hotel',
              isAvailable: true, // Assumir disponível se retornou na busca
              amenities: hotel.amenities || [],
              images: hotel.images || []
            };
          }
          // Se for v1, usar como está (compatibilidade)
          return {
            ...hotel,
            pricePerNight: hotel.pricePerNight || hotel.price || 0,
            price: hotel.price || hotel.pricePerNight || 0,
            rating: hotel.rating || 4.0,
            isAvailable: hotel.isAvailable !== false
          };
        });
        
        setAccommodations(hotels);
        console.log(`🏨 [MIGRADO] ${hotels.length} hotéis encontrados (fonte: ${result.source})`);
      } else {
        // Se a busca falhou
        console.warn('⚠️ Busca falhou:', result.error);
      }
    } catch (err) {
      console.error('❌ [MIGRADO] Erro inesperado:', err);
      // O erro já é tratado pelo hook, mas podemos mostrar uma mensagem adicional
    }
  };

  const handleBookAccommodation = (accommodation: any) => {
    console.log('Reservar acomodação:', accommodation);
    setLocation(`/hotels/${accommodation.id}/book`);
  };

  // ❌ REMOVER: A função formatPrice local está duplicada com a importada
  // const formatPrice = (price: number) => {
  //   return new Intl.NumberFormat('pt-MZ', {
  //     style: 'currency',
  //     currency: 'MZN'
  //   }).format(price);
  // };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // ✅ Teste manual ATUALIZADO
  const testManualSearch = async () => {
    console.log('🧪 [MIGRADO] Teste manual...');
    try {
      const result = await search({ location: 'Tofo', guests: 2 });
      const hotelCount = result.data?.length || 0;
      const source = result.source || 'desconhecido';
      console.log('🎯 Teste manual - Resultado:', { count: hotelCount, source, success: result.success });
      
      if (result.success) {
        alert(`✅ Teste manual: ${hotelCount} hotéis encontrados!\nFonte: ${source.toUpperCase()}\nAPI: ${source === 'v2' ? '/api/v2/hotels' : '/api/hotels'}`);
      } else {
        alert(`❌ Teste manual falhou: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error('❌ Teste manual - Erro:', err);
      alert('❌ Erro no teste manual. Verifique o console.');
    }
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
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>

        {/* Botões de teste com INFO de migração */}
        <div className="mb-4 flex gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={testManualSearch}
            size="sm"
            disabled={loading}
          >
            {loading ? '🔍 Testando...' : '🧪 Testar API Migrada'}
          </Button>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Status:</span>
            <Badge variant={
              results?.source === 'v2' ? "default" : 
              results?.source === 'v1' ? "secondary" : "outline"
            }>
              {results?.source === 'v2' ? '✅ Usando API v2' : 
               results?.source === 'v1' ? '🔄 Usando v1 (fallback)' : 
               '⚪ Não testado'}
            </Badge>
            {results?.source && (
              <span className="text-xs text-gray-400">
                {results.count || 0} hotéis
              </span>
            )}
          </div>
        </div>

        {/* Formulário de busca */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Acomodações 
              {results?.source && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {results.source.toUpperCase()}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Localização</label>
                <Input
                  placeholder="Digite Tofo, Maputo, Costa do Sol..."
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Exemplos: Tofo, Maputo, Costa do Sol
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-in</label>
                <Input
                  type="date"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Check-out</label>
                <Input
                  type="date"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
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
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  className="w-full" 
                  disabled={!searchParams.location.trim() || loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Info da migração */}
            {results?.source && (
              <div className="mt-4 p-3 rounded-lg border text-sm" style={{
                backgroundColor: results.source === 'v2' ? '#f0f9ff' : '#fefce8',
                borderColor: results.source === 'v2' ? '#bae6fd' : '#fef08a'
              }}>
                <div className="flex items-center gap-2 mb-1">
                  {results.source === 'v2' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="font-medium text-green-700">✅ Usando API v2 (Nova)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="font-medium text-yellow-700">🔄 Usando API v1 (Fallback)</span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 text-xs">
                  {results.source === 'v2' 
                    ? 'Sistema novo com busca inteligente e geolocalização' 
                    : 'Sistema legado (v2 indisponível ou falhou)'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug info */}
        {hasSearched && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>🔍 Buscando:</strong> {searchParams.location}
                  {results?.source && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                      {results.source.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span className={loading ? 'text-orange-600' : 'text-green-600'}>
                    {loading ? ' 🔄 Buscando...' : ' ✅ Completo'}
                  </span>
                </div>
                <div>
                  <strong>Hotéis:</strong> 
                  <span className={accommodations.length > 0 ? 'text-green-600 font-bold' : 'text-gray-600'}>
                    {accommodations.length}
                  </span>
                </div>
                <div>
                  <strong>Erro:</strong> 
                  <span className={error ? 'text-red-600' : 'text-green-600'}>
                    {error ? ' ❌ Sim' : ' ✅ Não'}
                  </span>
                </div>
                {results?.source === 'v2' && accommodations.length > 0 && (
                  <div className="md:col-span-3">
                    <strong>🎯 Features v2:</strong>
                    <span className="text-xs text-blue-600 ml-2">
                      Geolocalização • Preços dinâmicos • Quartos disponíveis
                    </span>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
                  <strong className="text-red-700">❌ Erro:</strong>
                  <div className="text-red-600 mt-1">{error}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {loading ? 'Buscando...' : `Acomodações Disponíveis (${accommodations.length})`}
                {results?.source && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    via {results.source.toUpperCase()}
                  </span>
                )}
              </h2>
              {accommodations.length > 0 && (
                <Badge variant="secondary">
                  {accommodations.length} encontrada{accommodations.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
                <span className="ml-3 text-gray-600">
                  Buscando para "{searchParams.location}"...
                  {results?.source && ` (${results.source})`}
                </span>
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-600 font-semibold">❌ Erro na busca</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <Button 
                    onClick={handleSearch} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                  >
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && accommodations.length === 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6 text-center">
                  <p className="text-yellow-800 font-semibold">🏨 Nenhuma acomodação encontrada</p>
                  <p className="text-yellow-600 text-sm mt-2">
                    Para "{searchParams.location}"
                    {results?.source && ` usando ${results.source.toUpperCase()}`}
                  </p>
                  <p className="text-yellow-500 text-xs mt-2">
                    💡 Tente: Maputo, Tofo, Vilankulo, Inhambane
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && accommodations.length > 0 && (
              <div className="space-y-4">
                {accommodations.map((accommodation: any) => (
                  <Card key={accommodation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                        {/* Informações */}
                        <div className="md:col-span-2">
                          <div className="mb-3">
                            <h3 className="text-xl font-semibold mb-1">{accommodation.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{accommodation.type}</Badge>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {accommodation.address} 
                                  {accommodation.locality && `, ${accommodation.locality}`}
                                  {accommodation.province && `, ${accommodation.province}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {renderStars(accommodation.rating || 4)}
                              <span className="text-sm text-gray-600 ml-1">({accommodation.rating || 4.0})</span>
                            </div>
                          </div>
                          
                          {accommodation.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{accommodation.description}</p>
                          )}
                          
                          {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {accommodation.amenities.slice(0, 5).map((amenity: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {accommodation.amenities.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{accommodation.amenities.length - 5}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Disponibilidade e Preço */}
                        <div className="text-center">
                          <div className="mb-2">
                            <div className="text-sm text-gray-500">Disponibilidade</div>
                            <div className="text-lg font-bold mb-2">
                              {accommodation.isAvailable ? (
                                <Badge className="bg-green-100 text-green-700">✅ Disponível</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700">⛔ Indisponível</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {accommodation.pricePerNight > 0 ? formatPrice(accommodation.pricePerNight) : 'Sob consulta'}
                          </div>
                          <div className="text-sm text-gray-500">por noite</div>
                          {results?.source === 'v2' && accommodation.pricePerNight && (
                            <div className="text-xs text-green-600 mt-1">
                              💰 Preço dinâmico v2
                            </div>
                          )}
                        </div>

                        {/* Ação */}
                        <div className="text-center">
                          <Button 
                            onClick={() => handleBookAccommodation(accommodation)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={!accommodation.isAvailable}
                          >
                            {accommodation.isAvailable ? (
                              <>
                                <span>Reservar</span>
                                {results?.source === 'v2' && (
                                  <span className="ml-1 text-xs">(v2)</span>
                                )}
                              </>
                            ) : (
                              'Indisponível'
                            )}
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            {results?.source === 'v2' 
                              ? 'Reserva com validação em tempo real' 
                              : 'Reserva básica'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Encontre a acomodação perfeita</h3>
              <p className="text-gray-500 mb-4">Sistema migrado para nova API v2 com fallback automático</p>
              <div className="flex gap-2 justify-center">
                <Badge variant="outline" className="text-xs">
                  ✅ API v2: Busca inteligente
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🔄 Fallback: API v1 automático
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🎯 Preços dinâmicos
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
}