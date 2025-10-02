// src/shared/hooks/useHotelRooms.ts
import { useState, useEffect } from "react";
import { apiService } from "../lib/api";
import { useAuth } from "./useAuth";

export interface HotelRoom {
  id: string;
  accommodationId: string;
  roomNumber: string;
  roomType: string;
  description?: string;
  images: string[];
  pricePerNight: number;
  weekendPrice?: number;
  holidayPrice?: number;
  maxOccupancy: number;
  status: string;
  bedType?: string;
  bedCount: number;
  hasPrivateBathroom: boolean;
  hasAirConditioning: boolean;
  hasWifi: boolean;
  hasTV: boolean;
  hasBalcony: boolean;
  hasKitchen: boolean;
  roomAmenities: string[];
  isAvailable: boolean;
  maintenanceUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHotelRoomData {
  accommodationId: string;
  roomNumber: string;
  roomType: string;
  description?: string;
  images?: string[];
  pricePerNight: number;
  weekendPrice?: number;
  holidayPrice?: number;
  maxOccupancy: number;
  bedType?: string;
  bedCount?: number;
  hasPrivateBathroom?: boolean;
  hasAirConditioning?: boolean;
  hasWifi?: boolean;
  hasTV?: boolean;
  hasBalcony?: boolean;
  hasKitchen?: boolean;
  roomAmenities?: string[];
  isAvailable?: boolean;
}

export interface UpdateHotelRoomData {
  roomNumber?: string;
  roomType?: string;
  description?: string;
  images?: string[];
  pricePerNight?: number;
  weekendPrice?: number;
  holidayPrice?: number;
  maxOccupancy?: number;
  status?: string;
  bedType?: string;
  bedCount?: number;
  hasPrivateBathroom?: boolean;
  hasAirConditioning?: boolean;
  hasWifi?: boolean;
  hasTV?: boolean;
  hasBalcony?: boolean;
  hasKitchen?: boolean;
  roomAmenities?: string[];
  isAvailable?: boolean;
  maintenanceUntil?: string;
}

export const useHotelRooms = (accommodationId?: string) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  const loadRooms = async (accommodationIdToLoad?: string) => {
    const targetAccommodationId = accommodationIdToLoad || accommodationId;
    
    if (!targetAccommodationId) {
      setRooms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Carregando quartos para accommodationId:", targetAccommodationId);
      
      // Buscar quartos da acomodação específica
      const roomsData = await apiService.getRoomsByHotel(targetAccommodationId);
      
      const formattedRooms: HotelRoom[] = roomsData.map((room: any) => ({
        id: room.id,
        accommodationId: room.accommodationId,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        description: room.description,
        images: room.images || [],
        pricePerNight: room.pricePerNight || room.basePrice || 0,
        weekendPrice: room.weekendPrice,
        holidayPrice: room.holidayPrice,
        maxOccupancy: room.maxOccupancy || 2,
        status: room.status || 'available',
        bedType: room.bedType,
        bedCount: room.bedCount || 1,
        hasPrivateBathroom: room.hasPrivateBathroom !== false,
        hasAirConditioning: room.hasAirConditioning || false,
        hasWifi: room.hasWifi || false,
        hasTV: room.hasTV || false,
        hasBalcony: room.hasBalcony || false,
        hasKitchen: room.hasKitchen || false,
        roomAmenities: room.roomAmenities || room.amenities || [],
        isAvailable: room.isAvailable !== false,
        maintenanceUntil: room.maintenanceUntil,
        createdAt: room.createdAt || new Date().toISOString(),
        updatedAt: room.updatedAt || new Date().toISOString()
      }));
      
      console.log("✅ Quartos carregados:", formattedRooms.length);
      setRooms(formattedRooms);
      
    } catch (err) {
      console.error("❌ Erro ao carregar quartos:", err);
      setError("Erro ao carregar quartos");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: CreateHotelRoomData) => {
    if (!user?.id) {
      return { success: false, error: "Utilizador não autenticado" };
    }

    try {
      setError(null);
      
      // Validação
      if (!roomData.roomNumber?.trim()) {
        return { success: false, error: "Número do quarto é obrigatório" };
      }
      
      if (!roomData.pricePerNight || roomData.pricePerNight <= 0) {
        return { success: false, error: "Preço por noite deve ser maior que zero" };
      }

      if (!roomData.maxOccupancy || roomData.maxOccupancy <= 0) {
        return { success: false, error: "Ocupação máxima deve ser maior que zero" };
      }

      // Preparar dados para envio
      const dataToSend = {
        accommodationId: roomData.accommodationId,
        roomNumber: roomData.roomNumber.trim(),
        roomType: roomData.roomType || 'standard',
        description: roomData.description?.trim() || '',
        images: roomData.images || [],
        pricePerNight: Number(roomData.pricePerNight),
        weekendPrice: roomData.weekendPrice ? Number(roomData.weekendPrice) : undefined,
        holidayPrice: roomData.holidayPrice ? Number(roomData.holidayPrice) : undefined,
        maxOccupancy: roomData.maxOccupancy || 2,
        bedType: roomData.bedType,
        bedCount: roomData.bedCount || 1,
        hasPrivateBathroom: roomData.hasPrivateBathroom !== false,
        hasAirConditioning: roomData.hasAirConditioning || false,
        hasWifi: roomData.hasWifi || false,
        hasTV: roomData.hasTV || false,
        hasBalcony: roomData.hasBalcony || false,
        hasKitchen: roomData.hasKitchen || false,
        roomAmenities: roomData.roomAmenities || [],
        isAvailable: roomData.isAvailable !== false
      };

      console.log("🔄 Criando quarto:", dataToSend);

      const newRoom = await apiService.createRoom(dataToSend);
      
      console.log("✅ Quarto criado com sucesso");
      
      // Atualizar lista local se for a mesma acomodação
      if (roomData.accommodationId === accommodationId) {
        setRooms(prev => [...prev, {
          id: newRoom.id,
          accommodationId: newRoom.accommodationId,
          roomNumber: newRoom.roomNumber,
          roomType: newRoom.roomType,
          description: newRoom.description,
          images: newRoom.images || [],
          pricePerNight: newRoom.pricePerNight,
          weekendPrice: newRoom.weekendPrice,
          holidayPrice: newRoom.holidayPrice,
          maxOccupancy: newRoom.maxOccupancy,
          status: newRoom.status || 'available',
          bedType: newRoom.bedType,
          bedCount: newRoom.bedCount || 1,
          hasPrivateBathroom: newRoom.hasPrivateBathroom !== false,
          hasAirConditioning: newRoom.hasAirConditioning || false,
          hasWifi: newRoom.hasWifi || false,
          hasTV: newRoom.hasTV || false,
          hasBalcony: newRoom.hasBalcony || false,
          hasKitchen: newRoom.hasKitchen || false,
          roomAmenities: newRoom.roomAmenities || [],
          isAvailable: newRoom.isAvailable !== false,
          maintenanceUntil: newRoom.maintenanceUntil,
          createdAt: newRoom.createdAt,
          updatedAt: newRoom.updatedAt
        }]);
      }
      
      return { 
        success: true, 
        room: newRoom 
      };
      
    } catch (err: any) {
      console.error("❌ Erro ao criar quarto:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao criar quarto";
      return { success: false, error: errorMsg };
    }
  };

  const updateRoom = async (roomId: string, updates: UpdateHotelRoomData) => {
    try {
      setError(null);
      
      const updatedRoom = await apiService.updateRoom(roomId, updates);
      
      // Atualizar lista local
      setRooms(prev => 
        prev.map(room => 
          room.id === roomId ? { ...room, ...updatedRoom } : room
        )
      );
      
      // Atualizar room selecionado se for o mesmo
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => prev ? { ...prev, ...updatedRoom } : null);
      }
      
      return { success: true, room: updatedRoom };
    } catch (err: any) {
      console.error("❌ Erro ao atualizar quarto:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await apiService.deleteRoom(roomId);
      
      // Atualizar lista local
      setRooms(prev => prev.filter(room => room.id !== roomId));
      
      // Limpar room selecionado se for o mesmo
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("❌ Erro ao deletar quarto:", err);
      return { success: false, error: err.message };
    }
  };

  const getRoomById = async (roomId: string) => {
    try {
      setLoading(true);
      const room = await apiService.getRoomById(roomId);
      setSelectedRoom(room);
      return { success: true, room };
    } catch (err: any) {
      console.error("❌ Erro ao buscar quarto:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const setRoomAvailability = async (roomId: string, isAvailable: boolean) => {
    return updateRoom(roomId, { isAvailable });
  };

  const setRoomMaintenance = async (roomId: string, maintenanceUntil?: string) => {
    return updateRoom(roomId, { 
      maintenanceUntil,
      status: maintenanceUntil ? 'maintenance' : 'available'
    });
  };

  // Carregar quartos quando accommodationId mudar
  useEffect(() => {
    if (accommodationId) {
      loadRooms();
    } else {
      setRooms([]);
      setLoading(false);
    }
  }, [accommodationId]);

  return {
    // Estado
    rooms,
    loading,
    error,
    selectedRoom,
    
    // Ações
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomById,
    setRoomAvailability,
    setRoomMaintenance,
    refetch: loadRooms,
    
    // Utilitários
    setSelectedRoom
  };
};