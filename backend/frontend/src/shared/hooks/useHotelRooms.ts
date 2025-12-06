// src/shared/hooks/useHotelRooms.ts
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
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
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  const loadRooms = async (accommodationIdToLoad?: string) => {
    const targetId = accommodationIdToLoad || accommodationId;
    if (!targetId) {
      setRooms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Carregando quartos:", targetId);

      const roomsData = await apiService.get<HotelRoom[]>(`/hotels/${targetId}/rooms`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      setRooms(roomsData || []);
      console.log("✅ Quartos carregados:", roomsData?.length || 0);
    } catch (err: any) {
      console.error("❌ Erro ao carregar quartos:", err);
      setError(err?.message || "Erro ao carregar quartos");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: CreateHotelRoomData) => {
    if (!user?.id || !token) return { success: false, error: "Usuário não autenticado" };

    try {
      setError(null);

      const payload = {
        ...roomData,
        roomNumber: roomData.roomNumber.trim(),
        pricePerNight: Number(roomData.pricePerNight),
        maxOccupancy: roomData.maxOccupancy || 2,
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

      console.log("🔄 Criando quarto:", payload);

      const newRoom = await apiService.post<HotelRoom>(
        `/hotels/${roomData.accommodationId}/rooms`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRooms(prev => [...prev, newRoom]);

      return { success: true, room: newRoom };
    } catch (err: any) {
      console.error("❌ Erro ao criar quarto:", err);
      return { success: false, error: err?.message || "Erro ao criar quarto" };
    }
  };

  const updateRoom = async (roomId: string, updates: UpdateHotelRoomData) => {
    if (!token) return { success: false, error: "Usuário não autenticado" };

    try {
      const updatedRoom = await apiService.put<HotelRoom>(
        `/rooms/${roomId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRooms(prev => prev.map(r => (r.id === roomId ? updatedRoom : r)));
      if (selectedRoom?.id === roomId) setSelectedRoom(updatedRoom);

      return { success: true, room: updatedRoom };
    } catch (err: any) {
      console.error("❌ Erro ao atualizar quarto:", err);
      return { success: false, error: err?.message || "Erro ao atualizar quarto" };
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!token) return { success: false, error: "Usuário não autenticado" };

    try {
      await apiService.delete(
        `/rooms/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (selectedRoom?.id === roomId) setSelectedRoom(null);

      return { success: true };
    } catch (err: any) {
      console.error("❌ Erro ao deletar quarto:", err);
      return { success: false, error: err?.message || "Erro ao deletar quarto" };
    }
  };

  const getRoomById = async (roomId: string) => {
    try {
      setLoading(true);
      const room = await apiService.get<HotelRoom>(
        `/rooms/${roomId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      setSelectedRoom(room);
      return { success: true, room };
    } catch (err: any) {
      console.error("❌ Erro ao buscar quarto:", err);
      return { success: false, error: err?.message || "Erro ao buscar quarto" };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accommodationId) loadRooms();
    else {
      setRooms([]);
      setLoading(false);
    }
  }, [accommodationId]);

  return {
    rooms,
    loading,
    error,
    selectedRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomById,
    refetch: loadRooms,
    setSelectedRoom
  };
};
