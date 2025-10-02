import { useState, useEffect } from "react";
import { accommodationService } from "src/shared/lib/accommodationService";
import { useAuth } from "./useAuth";
import { AppUser } from "./useAuth";

export interface Accommodation {
  id: string;
  hostId: string;
  name: string;
  type: string;
  address: string;
  description: string;
  // ❌ REMOVIDO: pricePerNight - agora fica nos quartos
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  unavailableDates?: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface simplificada para criação - SEM pricePerNight
export interface CreateAccommodationData {
  name: string;
  type: string;
  address: string;
  description: string;
  // ❌ REMOVIDO: pricePerNight
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  images?: string[];
  isAvailable?: boolean;
}

export const useAccommodations = () => {
  const { user } = useAuth();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccommodations = async () => {
    if (!user?.id) {
      setAccommodations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 Carregando acomodações para hostId:", user.id);
      
      let hostAccommodations: Accommodation[] = [];
      
      // Tentar método específico primeiro
      if (accommodationService.getByHost) {
        const accommodationsData = await accommodationService.getByHost(user.id);
        hostAccommodations = accommodationsData.map((acc: any) => ({
          id: acc.id,
          hostId: user.id,
          name: acc.name,
          type: acc.type,
          address: acc.address || acc.location,
          description: acc.description || '',
          // ❌ REMOVIDO: pricePerNight do mapeamento
          maxGuests: acc.maxGuests || acc.availableRooms || 2,
          bedrooms: acc.bedrooms || 1,
          bathrooms: acc.bathrooms || 1,
          amenities: acc.amenities || [],
          images: acc.images || [],
          isAvailable: acc.isAvailable !== false,
          rating: acc.rating || 0,
          reviewCount: acc.reviewCount || 0,
          unavailableDates: acc.unavailableDates || [],
          createdAt: acc.createdAt || new Date().toISOString(),
          updatedAt: acc.updatedAt || new Date().toISOString()
        }));
      } 
      // Fallback: buscar todas acomodações
      else if (accommodationService.getAllAccommodations) {
        console.warn('📝 getByHost não disponível, usando getAllAccommodations como fallback');
        const allAccommodations = await accommodationService.getAllAccommodations();
        
        // Filtrar pelo hostId atual
        hostAccommodations = allAccommodations
          .filter((acc: any) => acc.hostId === user.id)
          .map((acc: any) => ({
            id: acc.id,
            hostId: user.id,
            name: acc.name,
            type: acc.type,
            address: acc.address || acc.location,
            description: acc.description || '',
            // ❌ REMOVIDO: pricePerNight do mapeamento
            maxGuests: acc.maxGuests || acc.availableRooms || 2,
            bedrooms: acc.bedrooms || 1,
            bathrooms: acc.bathrooms || 1,
            amenities: acc.amenities || [],
            images: acc.images || [],
            isAvailable: acc.isAvailable !== false,
            rating: acc.rating || 0,
            reviewCount: acc.reviewCount || 0,
            unavailableDates: acc.unavailableDates || [],
            createdAt: acc.createdAt || new Date().toISOString(),
            updatedAt: acc.updatedAt || new Date().toISOString()
          }));
      }
      // Fallback final: array vazio
      else {
        console.warn('⚠️ Nenhum método de busca disponível no accommodationService');
        hostAccommodations = [];
      }
      
      console.log("✅ Acomodações carregadas:", hostAccommodations.length);
      setAccommodations(hostAccommodations);
      
    } catch (err) {
      console.error("❌ Erro ao carregar acomodações:", err);
      setError("Erro ao carregar propriedades");
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  };

  const createAccommodation = async (accommodationData: CreateAccommodationData) => {
    if (!user?.id) {
      return { success: false, error: "Utilizador não autenticado" };
    }

    try {
      setError(null);
      
      // Validação
      if (!accommodationData.name?.trim()) {
        return { success: false, error: "Nome da propriedade é obrigatório" };
      }
      
      // ✅ CORRIGIDO: Removida validação de pricePerNight
      // O preço agora é definido nos quartos, não na acomodação

      if (!accommodationData.address?.trim()) {
        return { success: false, error: "Endereço é obrigatório" };
      }

      // Preparar dados para envio - SEM pricePerNight
      const dataToSend = {
        name: accommodationData.name.trim(),
        type: accommodationData.type || 'hotel_room',
        address: accommodationData.address.trim(),
        description: accommodationData.description?.trim() || '',
        // ❌ REMOVIDO: pricePerNight do payload
        maxGuests: accommodationData.maxGuests || 2,
        bedrooms: accommodationData.bedrooms || 1,
        bathrooms: accommodationData.bathrooms || 1,
        amenities: accommodationData.amenities || [],
        images: accommodationData.images || [],
        isAvailable: accommodationData.isAvailable !== false,
        hostId: user.id,
        // Campos de compatibilidade
        availableRooms: accommodationData.maxGuests || 2,
        location: accommodationData.address.trim()
      };

      console.log("🔄 Criando acomodação:", dataToSend);

      let newAccommodation: any;
      
      // Tentar diferentes métodos de criação
      if (accommodationService.create) {
        newAccommodation = await accommodationService.create(dataToSend);
      } else if (accommodationService.createAccommodation) {
        newAccommodation = await accommodationService.createAccommodation(dataToSend);
      } else {
        throw new Error('Nenhum método de criação disponível no accommodationService');
      }
      
      console.log("✅ Acomodação criada com sucesso");
      await loadAccommodations(); // Recarregar lista
      
      return { 
        success: true, 
        accommodation: {
          id: newAccommodation.id,
          hostId: user.id,
          name: newAccommodation.name,
          type: newAccommodation.type,
          address: newAccommodation.address,
          description: newAccommodation.description,
          // ❌ REMOVIDO: pricePerNight da resposta
          maxGuests: newAccommodation.maxGuests,
          bedrooms: newAccommodation.bedrooms,
          bathrooms: newAccommodation.bathrooms,
          amenities: newAccommodation.amenities,
          images: newAccommodation.images,
          isAvailable: newAccommodation.isAvailable,
          rating: newAccommodation.rating,
          reviewCount: newAccommodation.reviewCount,
          createdAt: newAccommodation.createdAt,
          updatedAt: newAccommodation.updatedAt
        }
      };
      
    } catch (err: any) {
      console.error("❌ Erro ao criar acomodação:", err);
      const errorMsg = err.response?.data?.error || err.message || "Erro ao criar propriedade";
      return { success: false, error: errorMsg };
    }
  };

  // Função auxiliar para atualizar uma acomodação
  const updateAccommodation = async (id: string, updates: Partial<Accommodation>) => {
    try {
      // ✅ CORRIGIDO: Solução defensiva - criar safeUpdates sem pricePerNight
      const safeUpdates = { ...updates };
      // Remover pricePerNight caso exista (para compatibilidade com código antigo)
      if ('pricePerNight' in safeUpdates) {
        delete (safeUpdates as any).pricePerNight;
      }
      
      let updatedAccommodation: any;
      
      if (accommodationService.update) {
        updatedAccommodation = await accommodationService.update(id, safeUpdates);
      } else if (accommodationService.updateAccommodation) {
        updatedAccommodation = await accommodationService.updateAccommodation(id, safeUpdates);
      } else {
        throw new Error('Nenhum método de atualização disponível');
      }
      
      // Atualizar lista local
      setAccommodations(prev => 
        prev.map(acc => acc.id === id ? { ...acc, ...updatedAccommodation } : acc)
      );
      
      return { success: true, accommodation: updatedAccommodation };
    } catch (err: any) {
      console.error("❌ Erro ao atualizar acomodação:", err);
      return { success: false, error: err.message };
    }
  };

  // Função auxiliar para deletar uma acomodação
  const deleteAccommodation = async (id: string) => {
    try {
      if (accommodationService.delete) {
        await accommodationService.delete(id);
      } else if (accommodationService.deleteAccommodation) {
        await accommodationService.deleteAccommodation(id);
      } else {
        throw new Error('Nenhum método de deleção disponível');
      }
      
      // Atualizar lista local
      setAccommodations(prev => prev.filter(acc => acc.id !== id));
      
      return { success: true };
    } catch (err: any) {
      console.error("❌ Erro ao deletar acomodação:", err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadAccommodations();
    } else {
      setAccommodations([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    accommodations,
    loading,
    error,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    refetch: loadAccommodations
  };
};