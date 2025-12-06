import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/useAuth';
import AddRoomForm from '../../../components/hotel-wizard/RoomsForm';

// ✅✅✅ PRODUTO FINAL: Usar apenas apiService
import { apiService } from '../../../services/api';

// ✅✅✅ INTERFACES CENTRALIZADAS
import { Hotel, RoomType, HotelOperationResponse, RoomTypeListResponse } from '@/types/index';

// ✅✅✅ TIPO PARA ADICIONAR STATUS (não existe na interface original)
interface HotelWithStatus extends Hotel {
  status?: 'active' | 'inactive';
}

// ✅✅✅ HELPER: Garantir valores padrão para RoomType
const ensureRoomTypeDefaults = (room: RoomType): RoomType & {
  price_per_night: number;
  amenities: string[];
  available_units: number;
  max_occupancy: number;
} => ({
  ...room,
  price_per_night: room.price_per_night || room.base_price || 0,
  amenities: room.amenities || [],
  available_units: room.available_units || room.total_units || 0,
  max_occupancy: room.max_occupancy || room.base_occupancy || 2
});

// ✅✅✅ HELPER: Converter HotelOperationResponse para Hotel
const extractHotelFromResponse = (response: any): HotelWithStatus | null => {
  if (!response) return null;
  
  // Se response já tem os campos de Hotel
  if ('id' in response || 'hotel_id' in response) {
    const hotel = response as Hotel;
    return {
      ...hotel,
      status: 'active'
    };
  }
  
  // Se response é do tipo { success: boolean, data: Hotel, ... }
  if (response.success && response.data) {
    return {
      ...response.data,
      status: 'active'
    };
  }
  
  // Se response é do tipo { data: Hotel }
  if (response.data) {
    return {
      ...response.data,
      status: 'active'
    };
  }
  
  return null;
};

// ✅✅✅ HELPER: Converter RoomTypeListResponse para RoomType[]
const extractRoomsFromResponse = (response: any): RoomType[] => {
  if (!response) return [];
  
  // Se response já é um array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Se response tem data que é um array
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Se response tem roomTypes que é um array
  if (response.roomTypes && Array.isArray(response.roomTypes)) {
    return response.roomTypes;
  }
  
  // Se response tem success e data que é um array
  if (response.success && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};

// ✅✅✅ CUSTOM HOOK: Gestão de hotel (lógica separada)
const useHotelManagement = (hotelId: string | undefined, authToken: string | null) => {
  const [hotel, setHotel] = useState<HotelWithStatus | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [migrationSource, setMigrationSource] = useState<'v2'>('v2');

  const loadHotelData = async () => {
    if (!hotelId || !authToken) {
      setError('Hotel ID ou token não disponível');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log("🔍 Buscando hotel via apiService:", hotelId);

      // ✅✅✅ Buscar hotel usando apiService.getHotelById()
      const hotelResponse = await apiService.getHotelById(hotelId);
      
      console.log("📦 Resposta do apiService:", hotelResponse);
      
      // ✅✅✅ CORREÇÃO: Extrair dados usando helper
      const hotelData = extractHotelFromResponse(hotelResponse);
      
      if (hotelData) {
        // ✅✅✅ GARANTIR CAMPOS OBRIGATÓRIOS SEM DUPLICAÇÃO
        const safeHotelData: HotelWithStatus = {
          // Campos base do Hotel (garantir valores padrão)
          id: hotelData.id || hotelData.hotel_id || hotelId,
          hotel_id: hotelData.hotel_id || hotelData.id || hotelId,
          name: hotelData.name || hotelData.hotel_name || 'Hotel',
          hotel_name: hotelData.hotel_name || hotelData.name || 'Hotel',
          address: hotelData.address || '',
          locality: hotelData.locality || '',
          province: hotelData.province || '',
          contact_email: hotelData.contact_email || '',
          // Resto dos campos (evitar duplicação)
          description: hotelData.description,
          slug: hotelData.slug,
          hotel_slug: hotelData.hotel_slug,
          country: hotelData.country,
          location: hotelData.location,
          lat: hotelData.lat,
          lng: hotelData.lng,
          images: hotelData.images,
          amenities: hotelData.amenities,
          distance_km: hotelData.distance_km,
          min_price_per_night: hotelData.min_price_per_night,
          max_price_per_night: hotelData.max_price_per_night,
          rating: hotelData.rating,
          total_reviews: hotelData.total_reviews,
          contact_phone: hotelData.contact_phone,
          check_in_time: hotelData.check_in_time,
          check_out_time: hotelData.check_out_time,
          policies: hotelData.policies,
          host_id: hotelData.host_id,
          created_by: hotelData.created_by,
          updated_by: hotelData.updated_by,
          is_active: hotelData.is_active,
          created_at: hotelData.created_at,
          updated_at: hotelData.updated_at,
          available_room_types: hotelData.available_room_types,
          match_score: hotelData.match_score,
          total_available_rooms: hotelData.total_available_rooms,
          price_range: hotelData.price_range,
          // Campo adicional
          status: 'active'
        };
        
        setHotel(safeHotelData);
        console.log("✅ Hotel carregado:", safeHotelData);
      } else {
        throw new Error('Hotel não encontrado ou formato inválido');
      }

      // ✅✅✅ CORREÇÃO: Usar apiService.getRoomTypesByHotel() em vez de getRoomTypes()
      const roomsResponse = await apiService.getRoomTypesByHotel(hotelId);
      console.log("📦 Resposta dos quartos:", roomsResponse);
      
      // ✅✅✅ CORREÇÃO: Extrair dados usando helper
      const roomsData = extractRoomsFromResponse(roomsResponse);
      
      // ✅✅✅ CORREÇÃO: Aplicar valores padrão
      const roomsWithDefaults = roomsData.map(ensureRoomTypeDefaults);
      setRooms(roomsWithDefaults);
      console.log("✅ Quartos carregados:", roomsWithDefaults.length);

      setMigrationSource('v2');
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados do hotel:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCreated = async (roomData: Partial<RoomType>) => {
    try {
      console.log('Criando novo quarto via apiService:', roomData);
      
      if (!hotelId || !authToken) {
        throw new Error('Hotel ID ou token não disponível');
      }

      // ✅✅✅ Preparar dados do quarto para apiService.createRoomType()
      const roomTypeData = {
        name: roomData.room_type_name || `Quarto ${roomData.room_type_id || 'Novo'}`,
        description: roomData.description || '',
        basePrice: roomData.base_price || 0,
        totalUnits: roomData.total_units || 1,
        baseOccupancy: roomData.base_occupancy || 2,
        maxOccupancy: roomData.max_occupancy || 2,
        amenities: roomData.amenities || [],
        images: roomData.images || [],
        availableUnits: roomData.total_units || 1,
        extraAdultPrice: roomData.extra_adult_price || 0,
        extraChildPrice: roomData.extra_child_price || 0,
        childrenPolicy: roomData.children_policy || '',
        size: roomData.size || '',
        bedType: roomData.bed_type || '',
        bedTypes: roomData.bed_types || [],
        bathroomType: roomData.bathroom_type || ''
      };

      // ✅✅✅ Usar apiService.createRoomType() corretamente
      const response: HotelOperationResponse = await apiService.createRoomType(hotelId, roomTypeData);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar tipo de quarto');
      }

      console.log('✅ Quarto criado com sucesso:', response);
      
      // ✅✅✅ Recarregar dados atualizados
      await loadHotelData();
      
    } catch (error) {
      console.error('❌ Erro ao criar quarto:', error);
      throw error;
    }
  };

  return {
    hotel,
    rooms,
    loading,
    error,
    migrationSource,
    loadHotelData,
    handleRoomCreated
  };
};

// ✅✅✅ COMPONENTE: Lista de quartos (separado para reutilização)
const RoomsList: React.FC<{ rooms: RoomType[] }> = ({ rooms }) => {
  return (
    <div className="space-y-4">
      {rooms.map(room => {
        // ✅✅✅ CORREÇÃO: Usar valores garantidos com tipo estendido
        const safeRoom = ensureRoomTypeDefaults(room);
        
        return (
          <div key={safeRoom.room_type_id || safeRoom.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {safeRoom.room_type_name || safeRoom.name || 'Quarto sem nome'}
                  </h3>
                </div>
                {safeRoom.description && (
                  <p className="text-gray-600">{safeRoom.description}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-gray-500">Preço</p>
                    <p className="text-green-600 font-bold">
                      {/* ✅✅✅ CORREÇÃO: safeRoom.price_per_night agora é garantido */}
                      {safeRoom.price_per_night.toLocaleString()} MT/noite
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unidades</p>
                    <p className="text-gray-800 font-semibold">
                      {/* ✅✅✅ CORREÇÃO: safeRoom.available_units agora é garantido */}
                      {safeRoom.available_units} disponíveis
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Capacidade</p>
                    <p className="text-gray-800">
                      Até {safeRoom.max_occupancy} hóspedes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Comodidades</p>
                    <div className="flex flex-wrap gap-1">
                      {/* ✅✅✅ CORREÇÃO: safeRoom.amenities agora é garantido */}
                      {safeRoom.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {amenity}
                        </span>
                      ))}
                      {safeRoom.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{safeRoom.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                  onClick={() => console.log('Editar quarto:', safeRoom.room_type_id)}
                >
                  Editar
                </button>
                <button 
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  onClick={() => console.log('Excluir quarto:', safeRoom.room_type_id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ✅✅✅ INTERFACE para o AddRoomForm
interface AddRoomFormProps {
  accommodationId: string;
  hotelAddress: string;
  onRoomCreated: (roomData: any) => Promise<void>; // ✅ CORRIGIDO: Aceita parâmetro
}

// ✅✅✅ COMPONENTE: Formulário wrapper (simplificado)
const AddRoomFormWrapper: React.FC<{ 
  accommodationId: string; 
  hotelAddress: string; 
  onRoomCreated: (roomData: Partial<RoomType>) => Promise<void>;
  migrationSource: 'v2';
}> = ({ accommodationId, hotelAddress, onRoomCreated, migrationSource }) => {
  
  const handleRoomCreatedInternal = async (roomData: any) => {
    try {
      // ✅✅✅ Converter dados do formulário para RoomType
      const roomTypeData: Partial<RoomType> = {
        room_type_name: roomData.name || `Quarto ${roomData.roomType || 'Standard'}`,
        description: roomData.description,
        base_price: roomData.pricePerNight || 0,
        total_units: roomData.totalRooms || 1,
        base_occupancy: 2,
        max_occupancy: roomData.maxGuests || 2,
        amenities: roomData.amenities || [],
        images: roomData.images || [],
        price_per_night: roomData.pricePerNight || 0,
        available_units: roomData.totalRooms || 1,
        size: roomData.size || '',
        bed_type: roomData.bedType || '',
        bed_types: roomData.bedTypes || [],
        bathroom_type: roomData.bathroomType || ''
      };
      
      await onRoomCreated(roomTypeData);
      
    } catch (error) {
      console.error('❌ Erro ao criar quarto:', error);
      alert('Erro ao criar quarto: ' + (error as Error).message);
    }
  };

  // ✅✅✅ CORREÇÃO: Cast do componente AddRoomForm para a interface correta
  const TypedAddRoomForm = AddRoomForm as React.FC<AddRoomFormProps>;

  return (
    <div>
      <TypedAddRoomForm 
        accommodationId={accommodationId}
        hotelAddress={hotelAddress}
        onRoomCreated={handleRoomCreatedInternal} // ✅✅✅ AGORA ESTÁ CORRETO
      />
      {migrationSource && (
        <div className="mt-2 text-xs text-gray-500">
          Usando API: <span className="font-semibold text-green-600">
            v2 (Nova)
          </span>
        </div>
      )}
    </div>
  );
};

// ✅✅✅ COMPONENTE PRINCIPAL: HotelManagementPage (SIMPLIFICADO)
const HotelManagementPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [, setLocation] = useLocation();
  const { user, token: authToken, loading: authLoading } = useAuth();

  const effectiveToken = authToken || localStorage.getItem('token');
  
  // ✅✅✅ USAR HOOK CUSTOMIZADO
  const {
    hotel,
    rooms,
    loading,
    error,
    migrationSource,
    loadHotelData,
    handleRoomCreated
  } = useHotelManagement(hotelId, effectiveToken);

  // ✅ Carregar dados quando hotelId ou token mudar
  useEffect(() => {
    if (hotelId && effectiveToken && !authLoading) {
      console.log("🎯 Carregando dados do hotel:", hotelId);
      loadHotelData();
    }
  }, [hotelId, effectiveToken, authLoading, loadHotelData]);

  const navigateTo = (path: string) => {
    setLocation(path);
  };

  // ✅ Renderização condicional - AUTH
  if (authLoading || !effectiveToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Aguardando autenticação...</p>
        </div>
      </div>
    );
  }

  // ✅ Renderização condicional - LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do hotel...</p>
          <p className="text-sm text-gray-500">Usando API: v2</p>
        </div>
      </div>
    );
  }

  // ✅ Renderização condicional - ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
            <div className="mt-4 flex gap-2 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Recarregar
              </button>
              <button 
                onClick={() => navigateTo('/hotels')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Voltar aos Hotéis
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Renderização condicional - HOTEL NÃO ENCONTRADO
  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Hotel não encontrado</h2>
          <button 
            onClick={() => navigateTo('/hotels')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Voltar aos Hotéis
          </button>
        </div>
      </div>
    );
  }

  // ✅✅✅ CORREÇÃO: Calcular preço médio de forma segura
  const calculateAveragePrice = () => {
    if (rooms.length === 0) return 0;
    const total = rooms.reduce((sum, room) => {
      const safeRoom = ensureRoomTypeDefaults(room);
      return sum + safeRoom.price_per_night;
    }, 0);
    return Math.round(total / rooms.length);
  };

  // ✅✅✅ CORREÇÃO: Calcular unidades totais de forma segura
  const calculateTotalUnits = () => {
    return rooms.reduce((sum, room) => {
      const safeRoom = ensureRoomTypeDefaults(room);
      return sum + safeRoom.available_units;
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Indicador de API */}
      {migrationSource && (
        <div className="mb-2 px-3 py-1 rounded text-sm inline-flex items-center gap-2 bg-green-100 text-green-800 border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Usando API v2 (Nova)
        </div>
      )}

      {/* Cabeçalho do Hotel */}
      <div className="mb-8">
        {/* ✅✅✅ CORREÇÃO: Usar hotel.hotel_name ou hotel.name */}
        <h1 className="text-3xl font-bold">Gestão de Quartos - {hotel.hotel_name || hotel.name}</h1>
        <p className="text-gray-600">{hotel.address || 'Endereço não disponível'}</p>
        
        <div className="mt-4 flex gap-4">
          <button 
            onClick={() => navigateTo('/hotels')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Voltar aos Hotéis
          </button>
          <button 
            onClick={() => navigateTo(`/hotels/${hotelId}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Editar Hotel
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700">Tipos de Quarto</h3>
          <p className="text-2xl font-bold text-green-600">{rooms.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700">Unidades Disponíveis</h3>
          <p className="text-2xl font-bold text-blue-600">
            {calculateTotalUnits()}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700">Preço Médio</h3>
          <p className="text-2xl font-bold text-purple-600">
            {rooms.length > 0 
              ? `${calculateAveragePrice().toLocaleString()} MT` 
              : '0 MT'}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-gray-700">Status</h3>
          <p className={`text-2xl font-bold ${hotel.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
            {hotel.status === 'active' ? 'Ativo' : 'Inativo'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adicionar Quarto */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Adicionar Novo Quarto</h2>
            <AddRoomFormWrapper 
              accommodationId={hotelId!}
              hotelAddress={hotel.address || ''}
              onRoomCreated={handleRoomCreated}
              migrationSource={migrationSource}
            />
          </div>
        </div>

        {/* Lista de Quartos Existentes */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Tipos de Quarto</h2>
              <span className="text-sm text-gray-500">
                {rooms.length} {rooms.length === 1 ? 'tipo' : 'tipos'} cadastrados
              </span>
            </div>
            
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏨</span>
                </div>
                <p className="text-lg font-medium mb-2">Nenhum tipo de quarto cadastrado ainda.</p>
                <p className="text-sm">Use o formulário ao lado para adicionar o primeiro tipo de quarto.</p>
              </div>
            ) : (
              <RoomsList rooms={rooms} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelManagementPage;