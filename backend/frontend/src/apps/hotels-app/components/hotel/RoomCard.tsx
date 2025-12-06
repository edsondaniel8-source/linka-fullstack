// src/apps/hotels-app/components/hotel/RoomCard.tsx
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Bed, Users, DollarSign, Building2, Edit, Trash2, Eye } from 'lucide-react';

interface RoomType {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  totalRooms: number;
  availableRooms: number;
  maxGuests: number;
  isActive: boolean;
  description?: string;
  amenities?: string[];
  bedType?: string;
}

interface RoomCardProps {
  room: RoomType;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                <Badge variant="outline">{room.type}</Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {room.description || 'Sem descrição'}
              </p>
            </div>
            {room.isActive ? (
              <Badge className="bg-green-100 text-green-800">Ativo</Badge>
            ) : (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-semibold">{room.pricePerNight.toLocaleString()} MT</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Até {room.maxGuests}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span>{room.availableRooms}/{room.totalRooms}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Bed className="h-4 w-4 text-gray-400" />
              <span>{room.bedType || 'Cama'}</span>
            </div>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{room.amenities.length - 3} mais
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}