import React, { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { apiService } from "@/services/api";
import type { RoomType } from "@/types/index";

export default function RoomDetails() {
  // Conecta a rota "/hotels/:hotelId/room-types/:roomId"
  const [match, params] = useRoute("/hotels/:hotelId/room-types/:roomId");
  const hotelId = params?.hotelId;
  const roomId = params?.roomId;
  
  const [, setLocation] = useLocation();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!roomId || !hotelId) {
      setError("ID do hotel ou tipo de quarto não encontrado na URL.");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      setLoading(true);
      try {
        // ✅ USAR apiService.getRoomTypeDetails que já existe
        const response = await apiService.getRoomTypeDetails(hotelId, roomId);
        
        if (response.success && response.data) {
          setRoom(response.data);
        } else {
          setError(response.error || "Não foi possível carregar os detalhes do tipo de quarto.");
        }
      } catch (err) {
        console.error("Erro ao buscar tipo de quarto:", err);
        setError("Erro ao carregar os detalhes do tipo de quarto.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, hotelId]);

  const handleBack = () => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types`);
    } else {
      setLocation("/hotels");
    }
  };

  const handleEdit = () => {
    if (room && hotelId) {
      setLocation(`/hotels/${hotelId}/room-types/edit/${room.id || room.room_type_id}`);
    }
  };

  const handleDelete = async () => {
    if (!room || !hotelId) return;
    
    const roomTypeId = room.id || room.room_type_id;
    if (!roomTypeId) return;
    
    if (!confirm("Tem certeza que deseja excluir este tipo de quarto?")) return;

    try {
      // ✅ USAR apiService.delete para remover tipo de quarto
      const response = await apiService.delete<{ message: string }>(
        `/api/v2/hotels/${hotelId}/room-types/${roomTypeId}`
      );

      if (response.success) {
        alert("✅ Tipo de quarto excluído com sucesso!");
        setLocation(`/hotels/${hotelId}/room-types`);
      } else {
        alert(response.error || "Erro ao excluir tipo de quarto.");
      }
    } catch (err: any) {
      console.error("Erro ao excluir tipo de quarto:", err);
      alert("Erro ao excluir tipo de quarto.");
    }
  };

  const handlePrevImage = () => {
    if (!room?.images) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!room?.images) return;
    setCurrentImageIndex((prev) => 
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do tipo de quarto...</p>
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
            onClick={handleBack}
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
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Função para formatar preço
  const formatPrice = (price?: number) => {
    if (!price) return "Sob consulta";
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Obter informações do quarto
  const roomName = room.name || room.room_type_name || "Tipo de Quarto";
  const roomDescription = room.description || "Sem descrição disponível";
  const basePrice = room.base_price || room.price_per_night || 0;
  const amenities = room.amenities || [];
  const images = room.images || [];
  const maxOccupancy = room.max_occupancy || 2;
  const baseOccupancy = room.base_occupancy || 1;
  const totalUnits = room.total_units || 0;
  const availableUnits = room.available_units || 0;
  const bedType = room.bed_type || "Não especificado";
  const bathroomType = room.bathroom_type || "Não especificado";
  const size = room.size || "Não especificado";
  const isActive = room.is_active !== false;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{roomName}</h1>
              <p className="text-gray-600 mt-1">ID: {room.id || room.room_type_id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isActive ? '✅ Ativo' : '⛔ Inativo'}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Hotel ID: {hotelId} • Tipo de Quarto ID: {roomId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Imagens */}
          <div className="lg:col-span-2">
            {images.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative">
                  {/* Imagem Principal */}
                  <img
                    src={images[currentImageIndex]}
                    alt={`${roomName} - Imagem ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover cursor-pointer"
                    onClick={() => openModal(currentImageIndex)}
                  />
                  
                  {/* Controles de Navegação */}
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button
                      onClick={handlePrevImage}
                      className="bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Indicador */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </div>
                </div>
                
                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="p-4 grid grid-cols-5 gap-2">
                    {images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Miniatura ${index + 1}`}
                        className={`h-20 w-full object-cover rounded cursor-pointer ${
                          index === currentImageIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow h-96 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">Nenhuma imagem disponível</p>
                </div>
              </div>
            )}
            
            {/* Descrição */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Descrição</h2>
              <p className="text-gray-600 whitespace-pre-line">{roomDescription}</p>
            </div>
          </div>

          {/* Coluna Direita - Informações */}
          <div>
            {/* Informações Principais */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Informações do Quarto</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Preço Base</span>
                  <span className="text-2xl font-bold text-blue-600">{formatPrice(basePrice)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Ocupação Máxima</div>
                    <div className="text-lg font-semibold">{maxOccupancy} pessoas</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Ocupação Base</div>
                    <div className="text-lg font-semibold">{baseOccupancy} pessoa(s)</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Total de Unidades</div>
                    <div className="text-lg font-semibold">{totalUnits}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">Disponíveis</div>
                    <div className="text-lg font-semibold">{availableUnits}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Tipo de Cama</span>
                    <span className="font-medium">{bedType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Tipo de Banheiro</span>
                    <span className="font-medium">{bathroomType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Tamanho</span>
                    <span className="font-medium">{size}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comodidades */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comodidades</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ações</h2>
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Tipo de Quarto
                </button>
                
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir Tipo de Quarto
                </button>
                
                <button
                  onClick={handleBack}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Voltar para Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagem Grande */}
      {isModalOpen && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={images[currentImageIndex]}
              alt={`${roomName} - Imagem ampliada`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Controles no modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}