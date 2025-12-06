import React from 'react';
import { Hotel as HotelType } from '@/types/index';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Home, 
  Bed, 
  Hotel as HotelIcon,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface HotelCardProps {
  hotel: HotelType;
  onSelect?: (hotel: HotelType) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect }) => {
  const handleClick = () => {
    onSelect?.(hotel);
  };

  // ✅ Função de formatação de preço
  const formatPrice = (price?: number) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-MZ', { 
      style: 'currency', 
      currency: 'MZN' 
    }).format(price);
  };

  // ✅ BADGE DE LOCALIZAÇÃO INTELIGENTE (usando min_price_per_night para categorizar)
  const renderLocationBadge = () => {
    // Categorizar baseado no preço mínimo
    const price = hotel.min_price_per_night || 0;
    
    const getBadgeConfig = () => {
      if (price >= 5000) {
        return { label: '⭐ Luxo', color: 'purple', icon: 'star' };
      } else if (price >= 2000) {
        return { label: '🏨 Confortável', color: 'blue', icon: 'hotel' };
      } else {
        return { label: '💰 Económico', color: 'green', icon: 'dollar-sign' };
      }
    };
    
    const badge = getBadgeConfig();
    
    // Mapear cores para classes Tailwind CSS
    const colorClasses = {
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[badge.color as keyof typeof colorClasses] || colorClasses.gray}`}
      >
        {badge.label}
      </span>
    );
  };

  // ✅ DISTÂNCIA FORMATADA (usando distance_km da interface)
  const renderDistance = () => {
    const distance = hotel.distance_km;
    if (!distance) return null;
    
    const distanceKm = Math.round(distance);
    
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Navigation className="w-4 h-4 mr-1" />
        {distanceKm} km do centro
      </div>
    );
  };

  // ✅ Calcular avaliação baseada em preço e amenities (fallback)
  const calculateRating = () => {
    // Se tiver match_score, usar como base
    if (hotel.match_score) {
      return 3 + (hotel.match_score * 2); // Converter 0-10 para 3-5
    }
    
    // Fallback baseado em preço e amenities
    const price = hotel.min_price_per_night || 0;
    const amenitiesCount = hotel.amenities?.length || 0;
    
    if (price >= 5000 && amenitiesCount >= 8) return 4.8;
    if (price >= 2000 && amenitiesCount >= 5) return 4.2;
    if (price >= 1000 && amenitiesCount >= 3) return 3.8;
    return 3.5;
  };

  // ✅ Renderizar "estrelas" baseadas na avaliação calculada
  const renderRatingStars = () => {
    const rating = calculateRating();
    
    return (
      <div className="flex items-center">
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="ml-1 font-medium text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  // ✅ Renderizar ícone de disponibilidade
  const renderAvailabilityIcon = () => {
    const isAvailable = (hotel.total_available_rooms ?? 0) > 0;
    
    return isAvailable ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      {/* Imagem */}
      <div className="relative h-48 bg-gray-200">
        {hotel.images && hotel.images.length > 0 ? (
          <img 
            src={hotel.images[0]} 
            alt={hotel.hotel_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Home className="w-12 h-12" />
          </div>
        )}
        
        {/* Badge de Localização */}
        <div className="absolute top-2 right-2">
          {renderLocationBadge()}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          {/* Nome do Hotel */}
          <h3 className="text-lg font-semibold text-gray-900">{hotel.hotel_name}</h3>
          
          {/* Avaliação com estrelas (calculada) */}
          {renderRatingStars()}
        </div>

        {/* Descrição do hotel */}
        {hotel.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hotel.description}</p>
        )}

        {/* Localização e Distância */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center text-sm text-gray-700">
            <MapPin className="w-4 h-4 mr-1" />
            {/* Mostrar localização completa */}
            <span className="truncate">
              {hotel.address}
              {hotel.locality && `, ${hotel.locality}`}
              {hotel.province && `, ${hotel.province}`}
            </span>
          </div>
          {renderDistance()}
          
          {/* Match Score (se disponível) */}
          {hotel.match_score && (
            <div className="flex items-center text-sm text-blue-600">
              <Star className="w-4 h-4 mr-1" />
              <span>Match: {(hotel.match_score * 10).toFixed(1)}/10</span>
            </div>
          )}
        </div>

        {/* Amenidades */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hotel.amenities.length - 3} mais
              </span>
            )}
          </div>
        )}

        {/* Preço e Disponibilidade */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            <div>
              {/* Preço formatado */}
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(hotel.min_price_per_night)}
              </span>
              <span className="text-sm text-gray-500 ml-1">/noite</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              {renderAvailabilityIcon()}
              <span className={`text-sm font-medium ${
                (hotel.total_available_rooms ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(hotel.total_available_rooms ?? 0) > 0 ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
            {/* Quantidade de quartos disponíveis */}
            <div className="text-xs text-gray-500">
              {hotel.total_available_rooms ?? 0} quarto{(hotel.total_available_rooms ?? 0) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tipo de quarto disponível */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <Bed className="w-4 h-4 mr-1 text-blue-600" />
            {/* Tipo do primeiro quarto disponível */}
            <span>{hotel.available_room_types?.[0]?.room_type_name || 'Hotel'}</span>
            {hotel.available_room_types && hotel.available_room_types.length > 1 && (
              <span className="text-xs text-gray-500 ml-1">
                +{hotel.available_room_types.length - 1} tipo{hotel.available_room_types.length - 1 !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};