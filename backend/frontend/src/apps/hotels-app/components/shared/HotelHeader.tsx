// src/apps/hotels-app/components/shared/HotelHeader.tsx - NOVO COMPONENTE
import { Link } from 'wouter';
import { Building2, MapPin, Star, ArrowLeft, Edit, Home } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

interface HotelHeaderProps {
  hotel: {
    id: string;
    name: string;
    locality?: string;
    province?: string;
    rating?: number;
    is_active?: boolean;
  };
  showBackButton?: boolean;
}

export default function HotelHeader({ hotel, showBackButton = true }: HotelHeaderProps) {
  const hotelName = hotel.name || 'Hotel';
  const isHotelActive = hotel.is_active !== false;

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Lado esquerdo: Informações do hotel */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href="/hotels">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Hotéis
                </Button>
              </Link>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{hotelName}</h1>
                  <Badge variant={isHotelActive ? 'default' : 'secondary'}>
                    {isHotelActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {hotel.rating && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      <Star className="h-3 w-3 mr-1" />
                      {parseFloat(hotel.rating.toString()).toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {hotel.locality || 'Local não especificado'}
                    {hotel.province ? `, ${hotel.province}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito: Ações */}
          <div className="flex flex-wrap gap-2">
            <Link href={`/hotels/${hotel.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Hotel
              </Button>
            </Link>
            <Link href={`/hotels/${hotel.id}/room-types/create`}>
              <Button size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Novo Tipo de Quarto
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}