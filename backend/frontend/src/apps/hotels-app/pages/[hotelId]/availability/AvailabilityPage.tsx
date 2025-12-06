// src/apps/hotels-app/pages/[hotelId]/availability/AvailabilityPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Switch } from '@/shared/components/ui/switch';
import { 
  Calendar as CalendarIcon,
  DollarSign,
  Building2,
  Plus,
  Save,
  RefreshCw,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';

// Definir interfaces
interface RoomType {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  totalUnits: number;
  availableUnits: number;
  pricePerNight?: number;
}

interface AvailabilityRecord {
  date: string;
  price: number;
  availableUnits: number;
  stopSell: boolean;
}

// Função utilitária para classes condicionais
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AvailabilityPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });
  const [bulkPrice, setBulkPrice] = useState<number>(0);
  const [bulkUnits, setBulkUnits] = useState<number>(1);
  const [bulkStopSell, setBulkStopSell] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState<Record<string, Partial<AvailabilityRecord>>>({});

  const itemsPerPage = 14; // 2 semanas

  // Buscar tipos de quarto do hotel
  const { data: roomTypes = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['hotel-room-types', hotelId] as const,
    queryFn: async () => {
      if (!hotelId) return [];
      try {
        const response = await apiService.getRoomTypesByHotel(hotelId);
        if (response.success && response.data) {
          // Converter dados para a interface RoomType
          return response.data.map((room: any) => ({
            id: room.id || room.room_type_id || '',
            name: room.name || room.room_type_name || '',
            type: room.type || 'standard',
            basePrice: room.pricePerNight || room.base_price || 0,
            totalUnits: room.totalRooms || room.total_units || 0,
            availableUnits: room.availableRooms || room.available_units || 0,
          }));
        }
        return [];
      } catch (error) {
        console.error('Erro ao buscar tipos de quarto:', error);
        return [];
      }
    },
    enabled: !!hotelId,
  });

  // Buscar disponibilidade
  const { data: availabilityData = [], isLoading: availabilityLoading, refetch } = useQuery({
    queryKey: ['availability', hotelId, selectedRoomTypeId, startDate.toISOString(), endDate.toISOString()] as const,
    queryFn: async () => {
      if (!hotelId || !selectedRoomTypeId) return [];
      
      // Simulação de dados - em produção, chamaria a API
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const data: AvailabilityRecord[] = [];
      
      const selectedRoom = roomTypes.find(r => r.id === selectedRoomTypeId);
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          price: selectedRoom?.basePrice || 0,
          availableUnits: selectedRoom?.availableUnits || 0,
          stopSell: false
        });
      }
      
      return data;
    },
    enabled: !!hotelId && !!selectedRoomTypeId && roomTypes.length > 0,
  });

  // Mutation para atualizar disponibilidade em massa
  const bulkUpdateMutation = useMutation({
    mutationFn: async (data: {
      hotelId: string;
      roomTypeId: string;
      startDate: string;
      endDate: string;
      price?: number;
      availableUnits?: number;
      stopSell?: boolean;
    }) => {
      return await apiService.bulkUpdateAvailability(data.hotelId, {
        roomTypeId: data.roomTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        price: data.price,
        availableUnits: data.availableUnits,
        stopSell: data.stopSell
      });
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso!',
        description: 'Disponibilidade atualizada em massa.',
      });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar disponibilidade',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar registro individual
  const updateRecordMutation = useMutation({
    mutationFn: async (params: {
      hotelId: string;
      roomTypeId: string;
      date: string;
      data: Partial<AvailabilityRecord>;
    }) => {
      // Simulação - em produção, chamaria API específica
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso!',
        description: 'Registro atualizado.',
      });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar registro',
        variant: 'destructive',
      });
    },
  });

  // Calcular páginas
  const totalPages = Math.ceil(availabilityData.length / itemsPerPage);
  const paginatedData = availabilityData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedRoom = roomTypes.find(r => r.id === selectedRoomTypeId);

  const handleBulkUpdate = () => {
    if (!hotelId || !selectedRoomTypeId) {
      toast({
        title: 'Erro',
        description: 'Selecione um tipo de quarto primeiro',
        variant: 'destructive',
      });
      return;
    }

    bulkUpdateMutation.mutate({
      hotelId,
      roomTypeId: selectedRoomTypeId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      price: bulkPrice || undefined,
      availableUnits: bulkUnits || undefined,
      stopSell: bulkStopSell
    });
  };

  const handleSaveEdit = (date: string) => {
    if (!hotelId || !selectedRoomTypeId || !editMode[date]) return;

    updateRecordMutation.mutate({
      hotelId,
      roomTypeId: selectedRoomTypeId,
      date,
      data: editMode[date]
    });

    setEditMode(prev => {
      const newEditMode = { ...prev };
      delete newEditMode[date];
      return newEditMode;
    });
  };

  const handleCancelEdit = (date: string) => {
    setEditMode(prev => {
      const newEditMode = { ...prev };
      delete newEditMode[date];
      return newEditMode;
    });
  };

  const handleEditChange = (date: string, field: keyof AvailabilityRecord, value: any) => {
    setEditMode(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: field === 'price' || field === 'availableUnits' ? Number(value) : value
      }
    }));
  };

  const exportToCSV = () => {
    if (!selectedRoom || availabilityData.length === 0) return;

    const headers = ['Data', 'Preço (MT)', 'Unidades Disponíveis', 'Status'];
    const csvContent = [
      headers.join(','),
      ...availabilityData.map(record => [
        record.date,
        record.price.toFixed(2),
        record.availableUnits,
        record.stopSell ? 'Indisponível' : 'Disponível'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disponibilidade-${selectedRoom.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportado!',
      description: 'Dados exportados para CSV.',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Disponibilidade</h1>
          <p className="text-gray-600">Configure preços e disponibilidade dos quartos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={exportToCSV} 
            disabled={availabilityData.length === 0 || !selectedRoom}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href={`/hotels/${hotelId}/rooms/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Tipo de Quarto
            </Button>
          </Link>
        </div>
      </div>

      {/* Painel de Controle */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações em Massa</CardTitle>
          <CardDescription>
            Aplique alterações a um período de datas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Seletor de Tipo de Quarto */}
            <div className="space-y-2">
              <Label>Tipo de Quarto</Label>
              <Select value={selectedRoomTypeId} onValueChange={setSelectedRoomTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo de quarto">
                    {selectedRoom ? (
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        {selectedRoom.name}
                      </div>
                    ) : 'Selecione um tipo de quarto'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4" />
                        {room.name} ({room.availableUnits}/{room.totalUnits} disponíveis)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período de Datas */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: pt }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: pt }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Configurações em Massa */}
            <div className="space-y-2">
              <Label>Ações em Massa</Label>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  onClick={handleBulkUpdate}
                  disabled={bulkUpdateMutation.isPending || !selectedRoomTypeId}
                >
                  {bulkUpdateMutation.isPending ? 'Aplicando...' : 'Aplicar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Configurações Detalhadas */}
          {selectedRoomTypeId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
              <div className="space-y-2">
                <Label htmlFor="bulkPrice">Preço (MT)</Label>
                <Input
                  id="bulkPrice"
                  type="number"
                  min="0"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(Number(e.target.value))}
                  placeholder={selectedRoom?.basePrice.toString()}
                />
                <p className="text-xs text-gray-500">Deixe em branco para manter o atual</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkUnits">Unidades Disponíveis</Label>
                <Input
                  id="bulkUnits"
                  type="number"
                  min="0"
                  max={selectedRoom?.totalUnits}
                  value={bulkUnits}
                  onChange={(e) => setBulkUnits(Number(e.target.value))}
                  placeholder={selectedRoom?.availableUnits.toString()}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={bulkStopSell}
                    onCheckedChange={setBulkStopSell}
                    id="bulk-stop-sell"
                  />
                  <Label htmlFor="bulk-stop-sell">Parar Vendas</Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBulkPrice(selectedRoom?.basePrice || 0);
                    setBulkUnits(selectedRoom?.availableUnits || 0);
                    setBulkStopSell(false);
                  }}
                >
                  Redefinir
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Disponibilidade */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Disponibilidade Diária</CardTitle>
              <CardDescription>
                {selectedRoom 
                  ? `Mostrando ${availabilityData.length} dias para ${selectedRoom.name}`
                  : 'Selecione um tipo de quarto'
                }
              </CardDescription>
            </div>
            
            {availabilityData.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {availabilityLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando disponibilidade...</p>
            </div>
          ) : !selectedRoomTypeId ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um tipo de quarto
              </h3>
              <p className="text-gray-600">
                Escolha um tipo de quarto para visualizar e editar a disponibilidade.
              </p>
            </div>
          ) : availabilityData.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum dado de disponibilidade
              </h3>
              <p className="text-gray-600">
                Configure as datas e aplique configurações em massa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Dia da Semana</TableHead>
                    <TableHead className="text-right">Preço (MT)</TableHead>
                    <TableHead className="text-right">Disponíveis</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((record) => {
                    const isEditing = !!editMode[record.date];
                    const editData = editMode[record.date] || {};
                    
                    return (
                      <TableRow key={record.date}>
                        <TableCell className="font-medium">
                          {format(new Date(record.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.date), 'EEEE', { locale: pt })}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              className="w-32 ml-auto"
                              value={editData.price !== undefined ? editData.price : record.price}
                              onChange={(e) => handleEditChange(record.date, 'price', e.target.value)}
                            />
                          ) : (
                            <div className="flex items-center justify-end">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                              {record.price.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              max={selectedRoom?.totalUnits}
                              className="w-32 ml-auto"
                              value={editData.availableUnits !== undefined ? editData.availableUnits : record.availableUnits}
                              onChange={(e) => handleEditChange(record.date, 'availableUnits', e.target.value)}
                            />
                          ) : (
                            <div className="flex items-center justify-end">
                              <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                              {record.availableUnits}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editData.stopSell !== undefined ? editData.stopSell.toString() : record.stopSell.toString()}
                              onValueChange={(value) => handleEditChange(record.date, 'stopSell', value === 'true')}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="false">Disponível</SelectItem>
                                <SelectItem value="true">Indisponível</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : record.stopSell ? (
                            <Badge variant="destructive">Indisponível</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEdit(record.date)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(record.date)}
                                disabled={updateRecordMutation.isPending}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Salvar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditMode(prev => ({
                                ...prev,
                                [record.date]: {}
                              }))}
                            >
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo */}
      {selectedRoom && availabilityData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(availabilityData.reduce((sum, r) => sum + r.price, 0) / availabilityData.length).toLocaleString()} MT
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Dias Indisponíveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availabilityData.filter(r => r.stopSell).length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Ocupação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRoom.totalUnits > 0
                    ? Math.round(
                        ((selectedRoom.totalUnits * availabilityData.length - 
                          availabilityData.reduce((sum, r) => sum + r.availableUnits, 0)) / 
                          (selectedRoom.totalUnits * availabilityData.length)) * 100
                      )
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}