import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { apiService } from "@/services/api";
import type { RoomType, RoomTypeUpdateRequest } from "@/types/index";

export default function RoomEdit() {
  const { roomId, hotelId } = useParams<{ roomId?: string; hotelId?: string }>();
  const [, setLocation] = useLocation();

  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !hotelId) {
      setLoading(false);
      setError("ID do hotel ou tipo de quarto não fornecido");
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ✅ USAR apiService.getRoomTypeDetails que já existe
        const response = await apiService.getRoomTypeDetails(hotelId, roomId);
        
        if (response.success && response.data) {
          setRoom(response.data);
        } else {
          setError(response.error || "Tipo de quarto não encontrado");
        }
      } catch (err: any) {
        console.error("Erro ao carregar tipo de quarto:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, hotelId]);

  const handleSave = async () => {
    if (!room || !hotelId || !roomId) {
      setError("Dados insuficientes para salvar");
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      // ✅ Preparar dados no formato RoomTypeUpdateRequest
      const payload: RoomTypeUpdateRequest = {
        name: room.name || room.room_type_name || "",
        description: room.description || "",
        maxOccupancy: room.max_occupancy || 2,
        baseOccupancy: room.base_occupancy || 1,
        basePrice: room.base_price || 0,
        size: room.size,
        bedType: room.bed_type,
        bedTypes: room.bed_types || [],
        bathroomType: room.bathroom_type,
        amenities: room.amenities || [],
        images: room.images || [],
        availableUnits: room.available_units || 0,
        totalUnits: room.total_units || 0,
        extraAdultPrice: room.extra_adult_price,
        extraChildPrice: room.extra_child_price,
        childrenPolicy: room.children_policy,
        isActive: room.is_active !== false
      };

      // ✅ USAR apiService.updateRoomType que já existe
      const response = await apiService.updateRoomType(hotelId, roomId, payload);

      if (response.success) {
        alert("✅ Tipo de quarto atualizado com sucesso!");
        // Redirecionar para a página de gestão de hotéis ou tipos de quarto
        setLocation(`/hotels/${hotelId}/room-types`);
      } else {
        setError(response.error || "Erro ao salvar tipo de quarto");
      }
    } catch (err: any) {
      console.error("Erro ao atualizar tipo de quarto:", err);
      setError(err.message || "Erro ao salvar tipo de quarto.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types`);
    } else {
      setLocation(-1 as any);
    }
  };

  const handleDelete = async () => {
    if (!hotelId || !roomId || !confirm("Tem certeza que deseja excluir este tipo de quarto?")) {
      return;
    }

    try {
      setSaving(true);
      // ✅ Usar apiService.delete para remover tipo de quarto
      const response = await apiService.delete<{ message: string }>(
        `/api/v2/hotels/${hotelId}/room-types/${roomId}`
      );

      if (response.success) {
        alert("✅ Tipo de quarto excluído com sucesso!");
        setLocation(`/hotels/${hotelId}/room-types`);
      } else {
        setError(response.error || "Erro ao excluir tipo de quarto");
      }
    } catch (err: any) {
      console.error("Erro ao excluir tipo de quarto:", err);
      setError(err.message || "Erro ao excluir tipo de quarto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipo de quarto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => hotelId ? setLocation(`/hotels/${hotelId}/room-types`) : setLocation("/")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Tipo de quarto não encontrado</h2>
          <button
            onClick={() => hotelId ? setLocation(`/hotels/${hotelId}/room-types`) : setLocation("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editando: {room.name || room.room_type_name || "Tipo de Quarto"}
          </h1>
          <p className="text-gray-600">
            Hotel ID: {hotelId} • Tipo de Quarto ID: {roomId}
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Tipo de Quarto *
                </label>
                <input
                  type="text"
                  value={room.name || room.room_type_name || ""}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev
                        ? {
                            ...prev,
                            name: e.target.value,
                            room_type_name: e.target.value,
                          }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Quarto Standard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Base (MZN) *
                </label>
                <input
                  type="number"
                  value={room.base_price || 0}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, base_price: Number(e.target.value) } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={room.description || ""}
                onChange={(e) =>
                  setRoom((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descreva as características do quarto..."
              />
            </div>

            {/* Capacidade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupação Máxima *
                </label>
                <input
                  type="number"
                  value={room.max_occupancy || 2}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, max_occupancy: Number(e.target.value) } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupação Base
                </label>
                <input
                  type="number"
                  value={room.base_occupancy || 1}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, base_occupancy: Number(e.target.value) } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max={room.max_occupancy || 2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho (m²)
                </label>
                <input
                  type="text"
                  value={room.size || ""}
                  onChange={(e) =>
                    setRoom((prev) => (prev ? { ...prev, size: e.target.value } : prev))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 25"
                />
              </div>
            </div>

            {/* Unidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de Unidades *
                </label>
                <input
                  type="number"
                  value={room.total_units || 1}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, total_units: Number(e.target.value) } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidades Disponíveis *
                </label>
                <input
                  type="number"
                  value={room.available_units || room.total_units || 1}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, available_units: Number(e.target.value) } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max={room.total_units || 1}
                />
              </div>
            </div>

            {/* Cama e Banheiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cama
                </label>
                <input
                  type="text"
                  value={room.bed_type || ""}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, bed_type: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Casal King"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Banheiro
                </label>
                <input
                  type="text"
                  value={room.bathroom_type || ""}
                  onChange={(e) =>
                    setRoom((prev) =>
                      prev ? { ...prev, bathroom_type: e.target.value } : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Privativo"
                />
              </div>
            </div>

            {/* Comodidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comodidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(room.amenities || []).join(", ")}
                onChange={(e) =>
                  setRoom((prev) =>
                    prev
                      ? {
                          ...prev,
                          amenities: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }
                      : prev
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wi-Fi, TV, Ar condicionado, Frigobar"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={room.is_active !== false}
                    onChange={() =>
                      setRoom((prev) =>
                        prev ? { ...prev, is_active: true } : prev
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-green-600 font-medium">Ativo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={room.is_active === false}
                    onChange={() =>
                      setRoom((prev) =>
                        prev ? { ...prev, is_active: false } : prev
                      )
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-red-600 font-medium">Inativo</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-6">
          <div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Excluir
            </button>
          </div>
        </div>

        {/* Informações de Debug (apenas desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-gray-700 mb-2">Debug Info:</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(
                {
                  hotelId,
                  roomId,
                  roomData: room,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}