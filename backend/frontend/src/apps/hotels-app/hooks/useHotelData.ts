// src/apps/hotels-app/hooks/useHotelData.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

export function useHotelData(hotelId?: string | null) {
  // Buscar detalhes do hotel
  const hotelQuery = useQuery({
    queryKey: ['hotel', hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const response = await apiService.getHotelById(hotelId);
      return response.success ? response.data : null;
    },
    enabled: !!hotelId,
  });

  // Buscar quartos do hotel
  const roomsQuery = useQuery({
    queryKey: ['hotel-rooms', hotelId],
    queryFn: async () => {
      if (!hotelId) return [];
      const response = await apiService.getRoomTypesByHotel(hotelId);
      return response.success ? response.data : [];
    },
    enabled: !!hotelId,
  });

  // Buscar estatísticas
  const statsQuery = useQuery({
    queryKey: ['hotel-stats', hotelId],
    queryFn: async () => {
      if (!hotelId) return null;
      const response = await apiService.getHotelStatsDetailed(hotelId);
      return response.success ? response.data : null;
    },
    enabled: !!hotelId,
  });

  return {
    hotel: hotelQuery.data,
    rooms: roomsQuery.data || [],
    stats: statsQuery.data,
    isLoading: hotelQuery.isLoading || roomsQuery.isLoading,
    isError: hotelQuery.isError || roomsQuery.isError,
    refetch: () => {
      hotelQuery.refetch();
      roomsQuery.refetch();
      statsQuery.refetch();
    },
  };
}