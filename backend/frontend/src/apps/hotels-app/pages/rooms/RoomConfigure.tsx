import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { apiService } from "@/services/api";
import type { RoomType, RoomTypeCreateRequest, RoomTypeUpdateRequest } from "@/types/index";

const RoomConfigure: React.FC = () => {
  const [, setLocation] = useLocation();
  const params = useParams();

  // ⭐ OBTER hotelId DINAMICAMENTE
  const getHotelId = (): string | null => {
    if (params.hotelId) return params.hotelId;
    if (params.id) return params.id;
    return null;
  };

  const hotelId = getHotelId();
  const roomTypeId = params.roomId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ⭐ DADOS DO TIPO DE QUARTO
  const [roomTypeData, setRoomTypeData] = useState<Partial<RoomType>>({
    name: "",
    description: "",
    max_occupancy: 2,
    base_occupancy: 1,
    base_price: 0,
    size: "",
    bed_type: "",
    bed_types: [],
    bathroom_type: "",
    amenities: [],
    images: [],
    total_units: 1,
    available_units: 1,
    extra_adult_price: 0,
    extra_child_price: 0,
    children_policy: "",
    is_active: true
  });

  // Carrega dados se estiver editando
  useEffect(() => {
    if (!roomTypeId || !hotelId) {
      setLoading(false);
      return;
    }

    const fetchRoomType = async () => {
      try {
        // ✅ USAR apiService.getRoomTypeDetails
        const response = await apiService.getRoomTypeDetails(hotelId, roomTypeId);
        
        if (response.success && response.data) {
          setRoomTypeData(response.data);
        } else {
          setError(response.error || "Não foi possível carregar os dados do tipo de quarto.");
        }
      } catch (err) {
        console.error("Erro ao carregar tipo de quarto:", err);
        setError("Erro ao carregar os dados do tipo de quarto.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomType();
  }, [roomTypeId, hotelId]);

  const handleChange = (key: keyof RoomType, value: any) => {
    setRoomTypeData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!hotelId) {
      alert("Erro: Nenhum hotel selecionado. Volte para a lista de hotéis.");
      setLocation("/hotels");
      return;
    }

    // ⭐ VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS
    if (!roomTypeData.name?.trim()) {
      alert("Por favor, preencha o nome do tipo de quarto.");
      return;
    }

    if (!roomTypeData.base_price || roomTypeData.base_price <= 0) {
      alert("Por favor, insira um preço base válido.");
      return;
    }

    if (!roomTypeData.max_occupancy || roomTypeData.max_occupancy <= 0) {
      alert("Por favor, insira uma ocupação máxima válida.");
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // ⭐ PREPARAR DADOS PARA ENVIO
      const roomToSave: RoomTypeCreateRequest | RoomTypeUpdateRequest = {
        name: roomTypeData.name || "",
        description: roomTypeData.description || "",
        maxOccupancy: roomTypeData.max_occupancy || 2,
        baseOccupancy: roomTypeData.base_occupancy || 1,
        basePrice: roomTypeData.base_price || 0,
        size: roomTypeData.size,
        bedType: roomTypeData.bed_type,
        bedTypes: roomTypeData.bed_types || [],
        bathroomType: roomTypeData.bathroom_type,
        amenities: roomTypeData.amenities || [],
        images: roomTypeData.images || [],
        totalUnits: roomTypeData.total_units || 1,
        availableUnits: roomTypeData.available_units || 1,
        extraAdultPrice: roomTypeData.extra_adult_price,
        extraChildPrice: roomTypeData.extra_child_price,
        childrenPolicy: roomTypeData.children_policy,
        isActive: roomTypeData.is_active !== false
      };

      if (roomTypeId) {
        // ✅ EDITAR: Usar apiService.updateRoomType
        const response = await apiService.updateRoomType(hotelId, roomTypeId, roomToSave);
        
        if (response.success) {
          alert("✅ Tipo de quarto atualizado com sucesso!");
        } else {
          throw new Error(response.error || "Erro ao atualizar tipo de quarto");
        }
      } else {
        // ✅ CRIAR: Usar apiService.createRoomType
        const response = await apiService.createRoomType(hotelId, roomToSave);
        
        if (response.success) {
          alert("✅ Tipo de quarto criado com sucesso!");
        } else {
          throw new Error(response.error || "Erro ao criar tipo de quarto");
        }
      }
      
      // ⭐ NAVEGAR DE VOLTA
      setLocation(`/hotels/${hotelId}/room-types`);
      
    } catch (err: any) {
      console.error("Erro ao salvar tipo de quarto:", err);
      setError(err.message || "Erro ao salvar o tipo de quarto. Verifique os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types`);
    } else {
      setLocation("/hotels");
    }
  };

  // ⭐ ESTADO DE SEM HOTEL SELECIONADO
  if (!hotelId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum Hotel Selecionado</h2>
            <p className="text-gray-600">
              Para {roomTypeId ? 'editar' : 'criar'} um tipo de quarto, você precisa acessar através de um hotel específico.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => setLocation("/hotels")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ir para Meus Hotéis
            </button>
            <button 
              onClick={() => setLocation("/")}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando dados do tipo de quarto...</p>
        <small className="text-gray-400 block mt-2">Hotel ID: {hotelId}</small>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Erro</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => hotelId ? setLocation(`/hotels/${hotelId}/room-types`) : setLocation("/hotels")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Voltar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {roomTypeId ? "✏️ Editar Tipo de Quarto" : "➕ Criar Novo Tipo de Quarto"}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Hotel ID: {hotelId}
                </span>
                {roomTypeId && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    Tipo de Quarto ID: {roomTypeId}
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600">
            Preencha os detalhes do tipo de quarto. Campos marcados com * são obrigatórios.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-6">
            {/* Seção: Informações Básicas */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Informações Básicas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Tipo de Quarto *
                  </label>
                  <input
                    type="text"
                    value={roomTypeData.name || roomTypeData.room_type_name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Quarto Standard, Suíte Premium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Base (MZN) *
                  </label>
                  <input
                    type="number"
                    value={roomTypeData.base_price || roomTypeData.price_per_night || 0}
                    onChange={(e) => handleChange("base_price", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção: Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={roomTypeData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Descreva as características deste tipo de quarto..."
              />
            </div>

            {/* Seção: Capacidade */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Capacidade</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupação Máxima *
                  </label>
                  <input
                    type="number"
                    value={roomTypeData.max_occupancy || 2}
                    onChange={(e) => handleChange("max_occupancy", parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ocupação Base
                  </label>
                  <input
                    type="number"
                    value={roomTypeData.base_occupancy || 1}
                    onChange={(e) => handleChange("base_occupancy", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max={roomTypeData.max_occupancy || 2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho (m²)
                  </label>
                  <input
                    type="text"
                    value={roomTypeData.size || ""}
                    onChange={(e) => handleChange("size", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 25"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Unidades */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Disponibilidade</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total de Unidades *
                  </label>
                  <input
                    type="number"
                    value={roomTypeData.total_units || 1}
                    onChange={(e) => handleChange("total_units", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidades Disponíveis *
                  </label>
                  <input
                    type="number"
                    value={roomTypeData.available_units || roomTypeData.total_units || 1}
                    onChange={(e) => handleChange("available_units", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max={roomTypeData.total_units || 1}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seção: Detalhes do Quarto */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Detalhes do Quarto</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cama
                  </label>
                  <input
                    type="text"
                    value={roomTypeData.bed_type || ""}
                    onChange={(e) => handleChange("bed_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Casal King, 2 Solteiros"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Banheiro
                  </label>
                  <input
                    type="text"
                    value={roomTypeData.bathroom_type || ""}
                    onChange={(e) => handleChange("bathroom_type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Privativo, Compartilhado"
                  />
                </div>
              </div>
            </div>

            {/* Seção: Comodidades */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comodidades (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(roomTypeData.amenities || []).join(", ")}
                onChange={(e) => handleChange("amenities", e.target.value.split(",").map((a) => a.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Wi-Fi, TV, Ar condicionado, Frigobar, Cafeteira"
              />
            </div>

            {/* Seção: URLs das Imagens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs das Imagens (separadas por vírgula)
              </label>
              <input
                type="text"
                value={(roomTypeData.images || []).join(", ")}
                onChange={(e) => handleChange("images", e.target.value.split(",").map((a) => a.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://exemplo.com/foto1.jpg, https://exemplo.com/foto2.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Insira URLs completas de imagens. O sistema aceita formatos JPG, PNG, WebP.
              </p>
            </div>

            {/* Seção: Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status do Tipo de Quarto
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={roomTypeData.is_active !== false}
                    onChange={() => handleChange("is_active", true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-green-600 font-medium">Ativo (Disponível para reservas)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    checked={roomTypeData.is_active === false}
                    onChange={() => handleChange("is_active", false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-red-600 font-medium">Inativo (Indisponível)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-between items-center bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm text-gray-500">
            * Campos obrigatórios
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Salvando...
                </>
              ) : (
                roomTypeId ? "Atualizar Tipo de Quarto" : "Criar Tipo de Quarto"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomConfigure;