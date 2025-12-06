// src/shared/hooks/useMyHotels.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import type { 
  Hotel, 
  RoomType, 
  HotelCreateRequest,
  RoomTypeCreateRequest,
  HotelOperationResponse,
  HotelListResponse,
  ApiResponse
} from '@/types/index';

export const useMyHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar hotéis do usuário
  const fetchMyHotels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Usar método correto do apiService
      const response: HotelListResponse = await apiService.getAllHotels();
      
      if (response.success) {
        // ✅ O response pode ter 'data' ou 'hotels' dependendo do endpoint
        const hotelsArray = response.data || response.hotels || [];
        setHotels(hotelsArray);
      } else {
        setError(response.error || 'Erro ao carregar hotéis');
      }
    } catch (err: any) {
      console.error('Error fetching my hotels:', err);
      setError(err.message || 'Falha na conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar um novo hotel
  const createHotel = useCallback(async (hotelData: HotelCreateRequest) => {
    try {
      // ✅ Usar tipo correto HotelCreateRequest
      const response: HotelOperationResponse = await apiService.createHotel(hotelData);

      if (response.success) {
        // ✅ Atualizar lista após criação
        await fetchMyHotels();
        return response;
      } else {
        throw new Error(response.error || 'Erro ao criar hotel');
      }
    } catch (err: any) {
      console.error('Error creating hotel:', err);
      throw err;
    }
  }, [fetchMyHotels]);

  // Criar um novo tipo de quarto (room type) para um hotel
  const createRoomType = useCallback(async (hotelId: string, roomTypeData: RoomTypeCreateRequest) => {
    try {
      // ✅ Usar tipo correto RoomTypeCreateRequest
      const response: HotelOperationResponse = await apiService.createRoomType(hotelId, roomTypeData);

      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Erro ao criar tipo de quarto');
      }
    } catch (err: any) {
      console.error('Error creating room type:', err);
      throw err;
    }
  }, []);

  // Atualizar um hotel existente
  const updateHotel = useCallback(async (hotelId: string, hotelData: Partial<Hotel>) => {
    try {
      // ✅ Converter Hotel parcial para HotelUpdateRequest
      const updateData = {
        name: hotelData.name,
        description: hotelData.description,
        address: hotelData.address,
        locality: hotelData.locality,
        province: hotelData.province,
        lat: hotelData.lat ? parseFloat(String(hotelData.lat)) : undefined,
        lng: hotelData.lng ? parseFloat(String(hotelData.lng)) : undefined,
        images: hotelData.images,
        amenities: hotelData.amenities,
        contactEmail: hotelData.contact_email,
        contactPhone: hotelData.contact_phone,
        policies: hotelData.policies,
        checkInTime: hotelData.check_in_time,
        checkOutTime: hotelData.check_out_time,
        isActive: hotelData.is_active
      };

      const response: HotelOperationResponse = await apiService.updateHotel(hotelId, updateData);

      if (response.success) {
        await fetchMyHotels();
        return response;
      } else {
        throw new Error(response.error || 'Erro ao atualizar hotel');
      }
    } catch (err: any) {
      console.error('Error updating hotel:', err);
      throw err;
    }
  }, [fetchMyHotels]);

  // Buscar tipos de quarto de um hotel específico
  const fetchRoomTypes = useCallback(async (hotelId: string) => {
    try {
      const response = await apiService.getRoomTypesByHotel(hotelId);
      
      if (response.success) {
        return response.data || response.roomTypes || [];
      } else {
        throw new Error(response.error || 'Erro ao buscar tipos de quarto');
      }
    } catch (err: any) {
      console.error('Error fetching room types:', err);
      throw err;
    }
  }, []);

  // Deletar/desativar um hotel
  const deleteHotel = useCallback(async (hotelId: string) => {
    try {
      const response: ApiResponse<{ message: string }> = await apiService.deleteHotel(hotelId);

      if (response.success) {
        await fetchMyHotels();
        return response;
      } else {
        throw new Error(response.error || 'Erro ao desativar hotel');
      }
    } catch (err: any) {
      console.error('Error deleting hotel:', err);
      throw err;
    }
  }, [fetchMyHotels]);

  // Auto-fetch ao montar o hook
  useEffect(() => {
    fetchMyHotels();
  }, [fetchMyHotels]);

  return {
    hotels,
    loading,
    error,
    refetch: fetchMyHotels,
    createHotel,
    createRoomType,
    updateHotel,
    fetchRoomTypes,
    deleteHotel
  };
};