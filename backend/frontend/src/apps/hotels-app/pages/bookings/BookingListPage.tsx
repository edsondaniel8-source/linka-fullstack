// src/apps/hotels-app/pages/bookings/BookingListPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Calendar, Search, Filter, Download, Eye, 
  CheckCircle, XCircle, Clock, User, Building2,
  Mail, Phone, Bed, DollarSign, CalendarDays,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { formatDateDisplay, getStatusColor } from '@/apps/hotels-app/utils/hotelHelpers';
import { BookingStatus, HotelBookingData } from '@/types';

export default function BookingListPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [hotels, setHotels] = useState<any[]>([]);
  const itemsPerPage = 10;

  // Buscar hotéis do usuário para filtrar
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await apiService.getAllHotels();
        if (response.success && response.data) {
          setHotels(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Erro ao buscar hotéis:', error);
      }
    };
    fetchHotels();
  }, []);

  // Buscar reservas reais da API
  const { data: bookingsData, isLoading, refetch, error } = useQuery({
    queryKey: ['bookings', statusFilter, selectedHotelId, currentPage, search],
    queryFn: async () => {
      try {
        // Primeiro, obter o email do usuário atual
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userEmail = user.email || 'admin@example.com';

        // Buscar reservas da API
        const response = await apiService.getMyHotelBookings(userEmail, statusFilter !== 'all' ? statusFilter as BookingStatus : undefined);
        
        if (!response.success) {
          throw new Error(response.error || 'Erro ao buscar reservas');
        }

        let bookings = response.bookings || [];

        // Filtrar por hotel se selecionado
        if (selectedHotelId !== 'all') {
          bookings = bookings.filter((booking: HotelBookingData) => 
            booking.hotelId === selectedHotelId || booking.hotel_id === selectedHotelId
          );
        }

        // Filtrar por busca
        if (search) {
          const searchLower = search.toLowerCase();
          bookings = bookings.filter((booking: HotelBookingData) => {
            return (
              booking.guestName?.toLowerCase().includes(searchLower) ||
              booking.guest_name?.toLowerCase().includes(searchLower) ||
              booking.guestEmail?.toLowerCase().includes(searchLower) ||
              booking.guest_email?.toLowerCase().includes(searchLower) ||
              booking.bookingId?.toLowerCase().includes(searchLower) ||
              booking.booking_id?.toLowerCase().includes(searchLower) ||
              booking.confirmationCode?.toLowerCase().includes(searchLower) ||
              booking.confirmation_code?.toLowerCase().includes(searchLower)
            );
          });
        }

        // Paginação
        const total = bookings.length;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedBookings = bookings.slice(startIndex, endIndex);

        return {
          bookings: paginatedBookings,
          total,
          totalPages: Math.ceil(total / itemsPerPage)
        };
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar reservas',
          variant: 'destructive',
        });
        return { bookings: [], total: 0, totalPages: 0 };
      }
    },
  });

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      if (newStatus === 'cancelled') {
        const response = await apiService.cancelBooking(bookingId);
        if (response.success) {
          toast({
            title: 'Sucesso!',
            description: 'Reserva cancelada com sucesso.',
          });
          refetch();
        } else {
          throw new Error(response.error);
        }
      }
      // Aqui você pode adicionar outras ações: confirm, check_in, check_out
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar reserva',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    const colors = getStatusColor(statusLower);
    
    const icons: Record<string, any> = {
      'confirmed': CheckCircle,
      'pending': Clock,
      'cancelled': XCircle,
      'checked_in': CalendarDays,
      'checked_out': Calendar,
    };

    const labels: Record<string, string> = {
      'confirmed': 'Confirmada',
      'pending': 'Pendente',
      'cancelled': 'Cancelada',
      'checked_in': 'Check-in',
      'checked_out': 'Check-out',
    };

    const Icon = icons[statusLower] || Clock;
    const label = labels[statusLower] || status;

    return (
      <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const bookings = bookingsData?.bookings || [];
  const totalPages = bookingsData?.totalPages || 0;
  const totalBookings = bookingsData?.total || 0;

  const formatCurrency = (amount?: number) => {
    if (!amount) return '0 MT';
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600">Gerencie todas as reservas dos seus hotéis</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Link href="/hotels/bookings/create">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Nova Reserva
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, email, booking ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmadas</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Canceladas</option>
                <option value="checked_in">Check-in</option>
                <option value="checked_out">Check-out</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Hotel</Label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">Todos os Hotéis</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id || hotel.hotel_id} value={hotel.id || hotel.hotel_id}>
                    {hotel.name || hotel.hotel_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Ações</Label>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setSelectedHotelId('all');
                    setCurrentPage(1);
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Reservas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Reservas</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>
                  Mostrando {bookings.length} de {totalBookings} reservas
                </span>
              </div>
              {totalBookings > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando reservas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Erro ao carregar reservas
              </h3>
              <p className="text-gray-600 mb-6">
                {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
              </p>
              <Button onClick={() => refetch()}>
                Tentar Novamente
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {search || statusFilter !== 'all' || selectedHotelId !== 'all' 
                  ? 'Nenhuma reserva encontrada com os filtros aplicados'
                  : 'Nenhuma reserva encontrada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {search || statusFilter !== 'all' || selectedHotelId !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Crie sua primeira reserva ou aguarde novas reservas.'}
              </p>
              <div className="flex justify-center space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setSelectedHotelId('all');
                  }}
                >
                  Limpar Filtros
                </Button>
                <Link href="/hotels/bookings/create">
                  <Button>
                    Criar Nova Reserva
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Hóspede</TableHead>
                      <TableHead>Hotel / Quarto</TableHead>
                      <TableHead>Datas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking: HotelBookingData) => {
                      const bookingId = booking.bookingId || booking.booking_id || '';
                      const guestName = booking.guestName || booking.guest_name || '';
                      const guestEmail = booking.guestEmail || booking.guest_email || '';
                      const checkIn = booking.checkIn || booking.check_in || '';
                      const checkOut = booking.checkOut || booking.check_out || '';
                      const status = booking.status || 'pending';
                      const totalPrice = booking.totalPrice || booking.total_price || 0;
                      const confirmationCode = booking.confirmationCode || booking.confirmation_code || bookingId;
                      
                      // Calcular noites
                      const nights = checkIn && checkOut
                        ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                      return (
                        <TableRow key={bookingId} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="font-mono text-sm">{confirmationCode}</div>
                            <div className="text-xs text-gray-500">
                              {booking.createdAt ? formatDateDisplay(booking.createdAt, 'short') : ''}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium">{guestName}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-3 w-3 mr-1" />
                                <span className="truncate">{guestEmail}</span>
                              </div>
                              {booking.guestPhone || booking.guest_phone && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span>{booking.guestPhone || booking.guest_phone}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium">Hotel ID: {booking.hotelId || booking.hotel_id}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Bed className="h-3 w-3 mr-1" />
                                <span>Quarto ID: {booking.roomTypeId || booking.room_type_id}</span>
                              </div>
                              {booking.adults && (
                                <div className="text-xs text-gray-500">
                                  {booking.adults} adulto{booking.adults > 1 ? 's' : ''}
                                  {booking.children ? `, ${booking.children} criança${booking.children > 1 ? 's' : ''}` : ''}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm">Entrada: {checkIn ? formatDateDisplay(checkIn) : '-'}</div>
                                  <div className="text-sm">Saída: {checkOut ? formatDateDisplay(checkOut) : '-'}</div>
                                  {nights > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {nights} noite{nights > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                              <div>
                                <p className="font-semibold">
                                  {formatCurrency(totalPrice)}
                                </p>
                                {booking.units && booking.units > 1 && (
                                  <p className="text-xs text-gray-500">
                                    {booking.units} unidade{booking.units > 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/hotels/bookings/${bookingId}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleStatusChange(bookingId, 'confirmed')}
                                >
                                  Confirmar
                                </Button>
                              )}
                              {status !== 'cancelled' && status !== 'checked_out' && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
                                      handleStatusChange(bookingId, 'cancelled');
                                    }
                                  }}
                                >
                                  Cancelar
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages} • {totalBookings} reservas no total
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}