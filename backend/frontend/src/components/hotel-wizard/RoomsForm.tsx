import React, { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiService } from '@/services/api'; // ✅ Usar apiService

// ✅ Interface corrigida: onRoomCreated agora aceita parâmetro
interface AddRoomFormProps {
  accommodationId: string;
  hotelAddress: string;
  onRoomCreated: (roomData: any) => Promise<void>; // ✅ Corrigido
}

const AddRoomForm: React.FC<AddRoomFormProps> = ({ accommodationId, hotelAddress, onRoomCreated }) => {
  const { token: authToken } = useAuth();
  
  // ⭐⭐ CORREÇÃO: Estados mais organizados
  const [formData, setFormData] = useState({
    name: '', // ✅ Corrigido: usar 'name' em vez de 'roomNumber'
    roomType: 'standard',
    description: '',
    pricePerNight: 0,
    maxOccupancy: 2,
    bedType: 'double',
    bedCount: 1,
    hasPrivateBathroom: true,
    hasAirConditioning: false,
    hasWifi: false,
    hasTV: false,
    hasBalcony: false,
    hasKitchen: false,
    images: [] as string[],
    isAvailable: true,
    status: 'available'
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ⭐⭐ NOVO: Função para resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      roomType: 'standard',
      description: '',
      pricePerNight: 0,
      maxOccupancy: 2,
      bedType: 'double',
      bedCount: 1,
      hasPrivateBathroom: true,
      hasAirConditioning: false,
      hasWifi: false,
      hasTV: false,
      hasBalcony: false,
      hasKitchen: false,
      images: [],
      isAvailable: true,
      status: 'available'
    });
    setError(null);
    setSuccess(null);
  };

  // ⭐⭐ NOVO: Função para gerar amenities do formulário
  const generateAmenities = (): string[] => {
    const amenities: string[] = [];
    
    if (formData.hasPrivateBathroom) amenities.push('Banheiro Privativo');
    if (formData.hasAirConditioning) amenities.push('Ar Condicionado');
    if (formData.hasWifi) amenities.push('Wi-Fi');
    if (formData.hasTV) amenities.push('TV');
    if (formData.hasBalcony) amenities.push('Varanda');
    if (formData.hasKitchen) amenities.push('Cozinha');
    
    // ⭐⭐ CORREÇÃO: Adicionar amenities baseadas no tipo de cama
    switch (formData.bedType) {
      case 'single': amenities.push('Cama Solteiro'); break;
      case 'double': amenities.push('Cama de Casal'); break;
      case 'queen': amenities.push('Cama Queen'); break;
      case 'king': amenities.push('Cama King'); break;
      case 'twin': amenities.push('Camas Gêmeas'); break;
      case 'bunk': amenities.push('Beliche'); break;
    }
    
    return amenities;
  };

  // ⭐⭐ CORREÇÃO: Função para criar payload compatível com apiService
  const createApiServicePayload = () => {
    const amenities = generateAmenities();
    
    // ✅ Payload para apiService.createRoomType()
    return {
      name: formData.name || `Quarto ${formData.roomType}`, // ✅ Nome do quarto
      description: formData.description,
      maxOccupancy: Number(formData.maxOccupancy),
      baseOccupancy: Math.min(2, Number(formData.maxOccupancy)), // ✅ Pelo menos 2
      basePrice: Number(formData.pricePerNight),
      size: '', // Campo opcional
      bedType: formData.bedType,
      bedTypes: [formData.bedType], // ✅ Array de tipos de cama
      bathroomType: formData.hasPrivateBathroom ? 'private' : 'shared',
      amenities: amenities,
      images: formData.images,
      availableUnits: 1, // ✅ Unidades disponíveis
      totalUnits: 1, // ✅ Total de unidades
      extraAdultPrice: 0, // ✅ Preço extra por adulto
      extraChildPrice: 0, // ✅ Preço extra por criança
      childrenPolicy: '' // ✅ Política de crianças
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // ⭐⭐ VERIFICAR SE TOKEN ESTÁ DISPONÍVEL
      if (!authToken) {
        throw new Error('Token de autenticação não disponível. Faça login novamente.');
      }

      console.log('🔑 Token disponível:', authToken ? `SIM (${authToken.length} chars)` : 'NÃO');
      console.log('🏨 Hotel ID:', accommodationId);

      // ⭐⭐ CORREÇÃO: Criar payload compatível com apiService
      const roomPayload = createApiServicePayload();
      
      console.log('📤 Enviando para apiService:', roomPayload);
      
      try {
        // ✅ Usar apiService.createRoomType() - MÉTODO RECOMENDADO
        console.log('🔄 Usando apiService.createRoomType()...');
        
        const response = await apiService.createRoomType(accommodationId, roomPayload);
        
        console.log('✅ Resposta do apiService:', response);
        
        if (response.success) {
          setSuccess(`✅ Tipo de quarto criado com sucesso!`);
          
          // ✅ Resetar formulário
          resetForm();
          
          // ✅ Chamar callback com dados do quarto criado
          if (onRoomCreated) {
            await onRoomCreated({
              ...roomPayload,
              room_type_id: response.roomTypeId,
              room_type_name: roomPayload.name,
              base_price: roomPayload.basePrice,
              total_units: roomPayload.totalUnits,
              available_units: roomPayload.availableUnits,
              max_occupancy: roomPayload.maxOccupancy,
              base_occupancy: roomPayload.baseOccupancy
            });
          }
        } else {
          throw new Error(response.error || 'Erro ao criar tipo de quarto');
        }
        
      } catch (apiServiceError) {
        console.error('❌ Erro no apiService:', apiServiceError);
        
        // ⭐⭐ FALLBACK: Tentar API direta como backup
        console.log('⚠️ apiService falhou, tentando API direta...');
        
        const v2Endpoint = `/api/v2/hotels/${accommodationId}/room-types`;
        const v1Endpoint = `/api/hotels/${accommodationId}/rooms`;
        
        let response;
        let usedV2 = false;
        
        // Criar payload para API direta (formato diferente)
        const directApiPayload = {
          hotel_id: accommodationId,
          name: formData.name || `Quarto ${formData.roomType}`,
          code: `${formData.roomType}-${formData.name || 'NEW'}`,
          description: formData.description,
          base_price: Number(formData.pricePerNight),
          max_occupancy: Number(formData.maxOccupancy),
          base_occupancy: Math.min(1, Number(formData.maxOccupancy)),
          amenities: generateAmenities(),
          images: formData.images,
          total_units: 1,
          is_active: formData.isAvailable,
          min_nights_default: 1,
          extra_adult_price: 0,
          extra_child_price: 0,
          bed_type: formData.bedType,
          bed_count: formData.bedCount,
          room_type: formData.roomType
        };
        
        try {
          console.log('🔄 Tentando API v2 direta...');
          response = await fetch(v2Endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(directApiPayload)
          });
          usedV2 = true;
        } catch (v2Error) {
          console.log('⚠️ API v2 falhou, tentando v1:', v2Error);
          response = await fetch(v1Endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(directApiPayload)
          });
          usedV2 = false;
        }

        console.log('📨 Response status:', response.status, 'API:', usedV2 ? 'v2' : 'v1');

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro da API:', errorText);
          
          if (response.status === 401) {
            throw new Error('Não autorizado - token inválido ou expirado');
          } else if (response.status === 403) {
            throw new Error('Sem permissão para criar quartos neste hotel');
          } else if (response.status === 404) {
            throw new Error('Hotel não encontrado');
          } else {
            const errorMessage = errorText || `Falha ao criar quarto: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
          }
        }

        const result = await response.json();
        
        console.log('✅ Quarto criado via API direta:', result);
        setSuccess(`Quarto criado com sucesso usando API ${usedV2 ? 'v2' : 'v1'}!`);
        
        // ✅ Resetar formulário
        resetForm();

        // ✅ Chamar callback com dados do quarto criado
        if (onRoomCreated) {
          await onRoomCreated({
            ...directApiPayload,
            room_type_id: result.room_type_id || result.id,
            room_type_name: directApiPayload.name
          });
        }
      }
      
    } catch (err) {
      console.error('❌ Erro ao criar quarto:', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar o quarto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
              : type === 'number' ? Number(value) 
              : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Adicionar Novo Quarto</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Sucesso!</p>
          <p>{success}</p>
        </div>
      )}

      {/* Debug info - pode remover depois */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        <p>🔑 Token: {authToken ? `Disponível (${authToken.length} chars)` : 'Indisponível'}</p>
        <p>🏨 Hotel ID: {accommodationId}</p>
        <p>📍 Endereço: {hotelAddress}</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome do Tipo de Quarto *
          <span className="text-xs text-gray-500 ml-1">(ex: "Standard Double", "Suite Presidencial")</span>
        </label>
        <input
          type="text"
          name="name" // ✅ Corrigido: usar 'name'
          value={formData.name}
          onChange={handleChange}
          placeholder="ex: Standard Double, Suite Presidencial"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Categoria do Quarto *</label>
        <select
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="standard">Standard</option>
          <option value="deluxe">Deluxe</option>
          <option value="suite">Suite</option>
          <option value="executive">Executivo</option>
          <option value="family">Família</option>
          <option value="presidential">Presidencial</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva as características do quarto..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preço por Noite (MT) *
          </label>
          <input
            type="number"
            name="pricePerNight"
            value={formData.pricePerNight}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Máx. Ocupação *
          </label>
          <input
            type="number"
            name="maxOccupancy"
            value={formData.maxOccupancy}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            min="1"
            max="10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Cama</label>
          <select
            name="bedType"
            value={formData.bedType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="single">Solteiro</option>
            <option value="double">Casal</option>
            <option value="queen">Queen</option>
            <option value="king">King</option>
            <option value="twin">Gêmeas</option>
            <option value="bunk">Beliche</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nº de Camas</label>
          <input
            type="number"
            name="bedCount"
            value={formData.bedCount}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="5"
          />
        </div>
      </div>

      {/* Comodidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comodidades
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasPrivateBathroom"
              checked={formData.hasPrivateBathroom}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Banheiro Privativo
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasAirConditioning"
              checked={formData.hasAirConditioning}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Ar Condicionado
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasWifi"
              checked={formData.hasWifi}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Wi-Fi
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasTV"
              checked={formData.hasTV}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            TV
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasBalcony"
              checked={formData.hasBalcony}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Varanda
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasKitchen"
              checked={formData.hasKitchen}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            Cozinha
          </label>
        </div>
      </div>

      {/* Informações sobre o payload */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
        <p className="font-semibold mb-1">ℹ️ Payload que será enviado ao apiService:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><code>name</code>: {formData.name || '(preencher)'}</li>
          <li><code>description</code>: {formData.description ? `${formData.description.substring(0, 30)}...` : '(vazio)'}</li>
          <li><code>maxOccupancy</code>: {formData.maxOccupancy}</li>
          <li><code>baseOccupancy</code>: {Math.min(2, formData.maxOccupancy)}</li>
          <li><code>basePrice</code>: {formData.pricePerNight} MT</li>
          <li><code>bedType</code>: {formData.bedType}</li>
          <li><code>bedTypes</code>: [{formData.bedType}]</li>
          <li><code>bathroomType</code>: {formData.hasPrivateBathroom ? 'private' : 'shared'}</li>
          <li><code>amenities</code>: {generateAmenities().join(', ') || '(nenhuma)'}</li>
          <li><code>totalUnits</code>: 1</li>
          <li><code>availableUnits</code>: 1</li>
        </ul>
      </div>

      <div className="flex space-x-2 pt-4">
        <button 
          type="submit" 
          disabled={loading || !authToken}
          className={`px-4 py-2 text-white rounded ${
            loading || !authToken
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Criando...' : 'Criar Tipo de Quarto'}
        </button>
        
        <button
          type="button"
          onClick={resetForm}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Limpar
        </button>
      </div>

      {!authToken && (
        <div className="text-sm text-orange-600 bg-orange-100 p-2 rounded">
          ⚠️ Token de autenticação não disponível. Faça login novamente.
        </div>
      )}
    </form>
  );
};

export default AddRoomForm;