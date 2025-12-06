// src/apps/hotels-app/components/shared/HotelSelector.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Building2 } from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
}

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotelId: string | null;
  onHotelChange: (hotelId: string) => void;
  isLoading?: boolean;
}

export default function HotelSelector({
  hotels,
  selectedHotelId,
  onHotelChange,
  isLoading = false
}: HotelSelectorProps) {
  if (isLoading) {
    return (
      <div className="w-64 px-4 py-2 border rounded-lg animate-pulse bg-gray-100">
        <div className="h-6 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="w-64 px-4 py-2 border rounded-lg text-gray-500">
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-2" />
          Nenhum hotel
        </div>
      </div>
    );
  }

  return (
    <Select
      value={selectedHotelId || ''}
      onValueChange={onHotelChange}
    >
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Selecione um hotel">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            {hotels.find(h => h.id === selectedHotelId)?.name || 'Selecione um hotel'}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {hotels.map((hotel) => (
          <SelectItem key={hotel.id} value={hotel.id}>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              {hotel.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}