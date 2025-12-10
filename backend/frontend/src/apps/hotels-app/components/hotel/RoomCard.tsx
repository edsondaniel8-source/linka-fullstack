// src/apps/hotels-app/components/hotel/RoomCard.tsx - VERSÃO CORRIGIDA
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Bed, Users, DollarSign, Building2, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';

// ✅ CORREÇÃO: Interface que corresponde aos dados reais da API
interface RoomType {
  id: string;
  hotel_id?: string;
  name: string;
  description?: string;
  base_price: number | string;
  base_price_low?: number;
  base_price_high?: number;
  total_units: number;
  available_units?: number;
  base_occupancy: number;
  max_occupancy: number;
  min_nights_default?: number;
  extra_adult_price?: number;
  extra_child_price?: number;
  amenities?: string[];
  images?: string[];
  is_active: boolean;
  bed_type?: string;
  bathroom_type?: string;
  size?: string;
  created_at?: string;
  updated_at?: string;
  
  // Campos compatibilidade (do sistema antigo)
  room_type_id?: string;
  room_type_name?: string;
  pricePerNight?: number;
  totalRooms?: number;
  availableRooms?: number;
  maxGuests?: number;
  type?: string;
}

interface RoomCardProps {
  room: RoomType;
  hotelId?: string;
  onDelete?: (roomId: string) => void;
  onEdit?: (roomId: string) => void;
  onView?: (roomId: string) => void;
  showActions?: boolean;
}

export default function RoomCard({ 
  room, 
  hotelId, 
  onDelete, 
  onEdit, 
  onView,
  showActions = true 
}: RoomCardProps) {
  
  // ✅ CORREÇÃO: Funções auxiliares para obter dados corretamente
  const getRoomId = () => {
    return room.id || room.room_type_id || '';
  };
  
  const getRoomName = () => {
    return room.name || room.room_type_name || 'Tipo de Quarto';
  };
  
  const getDescription = () => {
    return room.description || 'Sem descrição';
  };
  
  const getPricePerNight = () => {
    if (room.pricePerNight !== undefined) return room.pricePerNight;
    const basePrice = typeof room.base_price === 'string' 
      ? parseFloat(room.base_price) 
      : room.base_price;
    return basePrice || 0;
  };
  
  const getTotalRooms = () => {
    if (room.totalRooms !== undefined) return room.totalRooms;
    return room.total_units || 1;
  };
  
  const getAvailableRooms = () => {
    if (room.availableRooms !== undefined) return room.availableRooms;
    return room.available_units || room.total_units || 0;
  };
  
  const getMaxGuests = () => {
    if (room.maxGuests !== undefined) return room.maxGuests;
    return room.max_occupancy || room.base_occupancy || 2;
  };
  
  const getRoomType = () => {
    if (room.type) return room.type;
    return room.bed_type ? `Quarto ${room.bed_type}` : 'Standard';
  };
  
  const getIsActive = () => {
    return room.is_active !== false;
  };
  
  // ✅ CORREÇÃO: Função para formatar preço
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };
  
  // ✅ CORREÇÃO: Função para lidar com delete
  const handleDelete = () => {
    console.log('🗑️ RoomCard: Botão delete clicado para room:', getRoomId());
    
    const roomId = getRoomId();
    if (!roomId || roomId === 'undefined' || roomId === 'null') {
      console.error('❌ RoomCard: ID inválido para deletar:', roomId);
      alert('Erro: ID do tipo de quarto inválido. Não é possível deletar.');
      return;
    }
    
    if (!getIsActive()) {
      alert('Este tipo de quarto já está inativo e não pode ser deletado novamente.');
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja deletar "${getRoomName()}"? Esta ação não pode ser desfeita.`)) {
      onDelete?.(roomId);
    }
  };
  
  // ✅ CORREÇÃO: Função para lidar com edit
  const handleEdit = () => {
    const roomId = getRoomId();
    if (!roomId || roomId === 'undefined') {
      console.error('❌ RoomCard: ID inválido para editar:', roomId);
      return;
    }
    
    if (!getIsActive()) {
      alert('Não é possível editar um tipo de quarto inativo. Ative-o primeiro.');
      return;
    }
    
    onEdit?.(roomId);
  };
  
  // ✅ CORREÇÃO: Função para lidar com view
  const handleView = () => {
    const roomId = getRoomId();
    if (!roomId || roomId === 'undefined') {
      console.error('❌ RoomCard: ID inválido para visualizar:', roomId);
      return;
    }
    
    onView?.(roomId);
  };
  
  // Dados formatados
  const roomName = getRoomName();
  const description = getDescription();
  const pricePerNight = getPricePerNight();
  const totalRooms = getTotalRooms();
  const availableRooms = getAvailableRooms();
  const maxGuests = getMaxGuests();
  const roomType = getRoomType();
  const bedType = room.bed_type || 'Não especificado';
  const isActive = getIsActive();
  const occupancyRate = totalRooms > 0 
    ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) 
    : 0;
  
  return (
    <Card className={`hover:shadow-lg transition-shadow ${!isActive ? 'opacity-70' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{roomName}</h3>
                <Badge variant="outline" className="text-xs">
                  {roomType}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {description}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="flex flex-col items-end gap-2">
              {isActive ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  Inativo
                </Badge>
              )}
              
              {/* Ocupação */}
              <div className="text-xs">
                <span className={occupancyRate > 80 ? "text-red-600" : occupancyRate > 50 ? "text-yellow-600" : "text-green-600"}>
                  {occupancyRate}% ocupado
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <span className="font-semibold">{formatPrice(pricePerNight)} MT</span>
                <p className="text-xs text-gray-500">por noite</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <span>Até {maxGuests} pessoas</span>
                <p className="text-xs text-gray-500">{room.base_occupancy || 2} base</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <span>{availableRooms}/{totalRooms}</span>
                <p className="text-xs text-gray-500">disponíveis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Bed className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <span className="truncate max-w-[100px]">{bedType}</span>
                {room.size && (
                  <p className="text-xs text-gray-500">{room.size} m²</p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-1">Comodidades:</p>
              <div className="flex flex-wrap gap-1">
                {room.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                  >
                    {amenity}
                  </Badge>
                ))}
                {room.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{room.amenities.length - 3} mais
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Extra info for inactive rooms */}
          {!isActive && (
            <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0" />
              <span className="text-yellow-700">Este tipo de quarto está inativo e não está disponível para reservas.</span>
            </div>
          )}

          {/* Actions - Só mostra se showActions = true */}
          {showActions && (
            <div className="flex justify-between pt-4 border-t">
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleView}
                  title="Ver detalhes"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleEdit}
                  disabled={!isActive}
                  title={isActive ? "Editar" : "Não é possível editar (inativo)"}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isActive && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    Já deletado
                  </Badge>
                )}
                
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={!isActive}
                  title={isActive ? "Deletar" : "Já deletado"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* ID para debugging (opcional) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400 font-mono truncate">
                ID: {getRoomId()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}