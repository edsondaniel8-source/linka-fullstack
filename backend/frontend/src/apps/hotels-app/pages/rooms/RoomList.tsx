import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { apiService } from "@/services/api";
import type { RoomType } from "@/types/index";

const RoomList: React.FC = () => {
  const [, setLocation] = useLocation();
  const params = useParams();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ⭐ OBTER hotelId DINAMICAMENTE
  const getHotelId = (): string | null => {
    if (params.hotelId) return params.hotelId;
    if (params.id) return params.id;
    return null;
  };

  const hotelId = getHotelId();

  const fetchRoomTypes = async () => {
    if (!hotelId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ✅ USAR apiService.getRoomTypesByHotel
      const response = await apiService.getRoomTypesByHotel(hotelId);
      
      if (response.success) {
        const roomTypesArray = response.data || response.roomTypes || [];
        setRoomTypes(roomTypesArray);
      } else {
        setError(response.error || "Erro ao carregar tipos de quarto.");
        setRoomTypes([]);
      }
    } catch (err: any) {
      console.error("Erro ao buscar tipos de quarto:", err);
      setError(err.message || "Erro ao carregar tipos de quarto.");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [hotelId]);

  const handleEdit = (roomTypeId: string) => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types/edit/${roomTypeId}`);
    }
  };

  const handleViewDetails = (roomTypeId: string) => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types/${roomTypeId}`);
    }
  };

  const handleDelete = async (roomTypeId: string) => {
    if (!hotelId || !confirm("Tem certeza que deseja excluir este tipo de quarto?")) return;

    setDeleting(roomTypeId);
    try {
      // ✅ USAR apiService.delete para remover tipo de quarto
      const response = await apiService.delete<{ message: string }>(
        `/api/v2/hotels/${hotelId}/room-types/${roomTypeId}`
      );

      if (response.success) {
        // Atualiza a lista após exclusão
        setRoomTypes((prev) => prev.filter((r) => r.id !== roomTypeId && r.room_type_id !== roomTypeId));
        alert("✅ Tipo de quarto excluído com sucesso!");
      } else {
        alert(response.error || "Erro ao excluir tipo de quarto.");
      }
    } catch (err: any) {
      console.error("Erro ao excluir tipo de quarto:", err);
      alert(err.message || "Erro ao excluir tipo de quarto.");
    } finally {
      setDeleting(null);
    }
  };

  const handleAddRoomType = () => {
    if (hotelId) {
      setLocation(`/hotels/${hotelId}/room-types/create`);
    } else {
      setLocation("/hotels");
    }
  };

  const handleBackToHotels = () => {
    setLocation("/hotels");
  };

  const handleRefresh = () => {
    fetchRoomTypes();
  };

  // ⭐ ESTADO DE SEM HOTEL ID
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
              Para visualizar e gerenciar tipos de quarto, você precisa acessar através de um hotel específico.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleBackToHotels}
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipos de quarto...</p>
          <small className="text-gray-400 block mt-2">Hotel ID: {hotelId}</small>
        </div>
      </div>
    );
  }

  // Função auxiliar para formatar preço
  const formatPrice = (price?: number) => {
    if (!price) return "Sob consulta";
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Função para obter nome do quarto
  const getRoomName = (room: RoomType) => {
    return room.name || room.room_type_name || "Tipo de Quarto";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tipos de Quarto</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Hotel ID:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                  {hotelId}
                </span>
                <span className="text-sm text-gray-600 ml-4">
                  {roomTypes.length} tipo(s) encontrado(s)
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
              
              <button 
                onClick={handleAddRoomType}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Tipo de Quarto
              </button>
            </div>
          </div>

          {/* Botão Voltar */}
          <button
            onClick={handleBackToHotels}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para Meus Hotéis
          </button>
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

        {/* Lista de Tipos de Quarto */}
        {roomTypes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum Tipo de Quarto Encontrado</h3>
            <p className="text-gray-600 mb-6">
              Este hotel ainda não possui tipos de quarto cadastrados.
            </p>
            <button 
              onClick={handleAddRoomType}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Adicionar Primeiro Tipo de Quarto
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Base
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Disponibilidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomTypes.map((room) => {
                    const roomId = room.id || room.room_type_id;
                    const isActive = room.is_active !== false;
                    const availableUnits = room.available_units || 0;
                    const totalUnits = room.total_units || 0;
                    const occupancy = `${room.base_occupancy || 1}/${room.max_occupancy || 2}`;
                    
                    return (
                      <tr key={roomId} className="hover:bg-gray-50">
                        <td 
                          className="px-6 py-4 whitespace-nowrap cursor-pointer group"
                          onClick={() => handleViewDetails(roomId)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                {getRoomName(room)}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {room.description || "Sem descrição"}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            {formatPrice(room.base_price || room.price_per_night)}
                          </div>
                          <div className="text-xs text-gray-500">por noite</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {occupancy} pessoas
                          </div>
                          <div className="text-xs text-gray-500">
                            {room.bed_type ? `Cama: ${room.bed_type}` : 'Cama não especificada'}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ 
                                  width: totalUnits > 0 ? `${(availableUnits / totalUnits) * 100}%` : '0%' 
                                }}
                              ></div>
                            </div>
                            <div className="text-sm text-gray-900">
                              {availableUnits}/{totalUnits}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            unidades disponíveis
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isActive ? '✅ Ativo' : '⛔ Inativo'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(roomId)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>
                            
                            <button
                              onClick={() => handleEdit(roomId)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            
                            <button
                              onClick={() => handleDelete(roomId)}
                              disabled={deleting === roomId}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                            >
                              {deleting === roomId ? (
                                <>
                                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Excluindo...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Excluir
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapio da Tabela */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{roomTypes.length}</span> tipo(s) de quarto
                </div>
                <div className="text-sm text-gray-500">
                  Hotel: {hotelId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações Úteis */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-medium text-blue-800">Tipos de Quarto</h3>
            </div>
            <p className="text-sm text-blue-700">
              Cada tipo define um conjunto de características como preço, capacidade e comodidades.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-medium text-green-800">Disponibilidade</h3>
            </div>
            <p className="text-sm text-green-700">
              A disponibilidade é gerenciada por unidades. Quando chegar a zero, o tipo estará esgotado.
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-medium text-purple-800">Segurança</h3>
            </div>
            <p className="text-sm text-purple-700">
              Tipos inativos não aparecem para os clientes. Use esta opção para manutenção temporária.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomList;