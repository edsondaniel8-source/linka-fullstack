// src/apps/hotels-app/pages/bookings/[bookingId]/BookingDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  ArrowLeft, Calendar, User, Mail, Phone, Building2, 
  Bed, DollarSign, Clock, CheckCircle, XCircle, 
  Printer, Mail as MailIcon, Download, MapPin,
  Users, CreditCard, FileText, AlertCircle
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';
import { formatDateDisplay, formatPrice, getStatusColor } from '@/apps/hotels-app/utils/hotelHelpers';
import { HotelBookingData, BookingStatus } from '@/types';

export default function BookingDetailsPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();
  const [booking, setBooking] = useState<HotelBookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [roomDetails, setRoomDetails] = useState<any>(null);

  // Buscar detalhes da reserva
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;
      
      setLoading(true);
      try {
        const response = await apiService.getBookingDetails(bookingId);
        
        if (response.success && response.data) {
          const bookingData = response.data;
          setBooking(bookingData);
          
          // Buscar detalhes do hotel
          if (bookingData.hotelId || bookingData.hotel_id) {
            const hotelId = bookingData.hotelId || bookingData.hotel_id;
            const hotelResponse = await apiService.getHotelById(hotelId);
            if (hotelResponse.success && hotelResponse.data) {
              setHotelDetails(hotelResponse.data);
            }
          }
          
          // Buscar detalhes do quarto
          if (bookingData.hotelId && bookingData.roomTypeId) {
            const roomResponse = await apiService.getRoomTypeDetails(
              bookingData.hotelId,
              bookingData.roomTypeId
            );
            if (roomResponse.success && roomResponse.data) {
              setRoomDetails(roomResponse.data);
            }
          }
        } else {
          throw new Error(response.error || 'Reserva não encontrada');
        }
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar detalhes da reserva',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, toast]);

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!bookingId) return;
    
    try {
      let response;
      switch (newStatus) {
        case 'cancelled':
          response = await apiService.cancelBooking(bookingId);
          break;
        case 'checked_in':
          response = await apiService.checkInHotelBooking(bookingId);
          break;
        case 'checked_out':
          response = await apiService.checkOutHotelBooking(bookingId);
          break;
        default:
          throw new Error('Ação não suportada');
      }

      if (response.success) {
        toast({
          title: 'Sucesso!',
          description: `Reserva ${getStatusLabel(newStatus)} com sucesso.`,
        });
        // Recarregar dados
        window.location.reload();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar status',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      'confirmed': 'Confirmada',
      'pending': 'Pendente',
      'cancelled': 'Cancelada',
      'checked_in': 'Check-in Realizado',
      'checked_out': 'Check-out Realizado',
    };
    return status ? labels[status] || status : 'Desconhecido';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      case 'checked_in': return Calendar;
      case 'checked_out': return Calendar;
      default: return AlertCircle;
    }
  };

  const printBooking = () => {
    window.print();
  };

  const sendConfirmationEmail = async () => {
    if (!booking) return;
    
    try {
      // Em produção, integrar com serviço de email
      toast({
        title: 'Email enviado!',
        description: 'Email de confirmação enviado para o hóspede.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar email',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes da reserva...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reserva não encontrada</h2>
          <p className="text-gray-600 mb-6">
            A reserva que você está procurando não existe ou foi removida.
          </p>
          <Link href="/hotels/bookings">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Reservas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(booking.status);
  const statusColors = getStatusColor(booking.status || 'pending');
  const nights = booking.checkIn && booking.checkOut 
    ? Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/hotels/bookings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes da Reserva</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {getStatusLabel(booking.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Código: {booking.confirmationCode || booking.confirmation_code || booking.bookingId || booking.booking_id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={printBooking}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" onClick={sendConfirmationEmail}>
              <MailIcon className="mr-2 h-4 w-4" />
              Reenviar Email
            </Button>
            {booking.status === 'pending' && (
              <Button onClick={() => handleStatusChange('confirmed')}>
                Confirmar Reserva
              </Button>
            )}
            {booking.status === 'confirmed' && (
              <Button onClick={() => handleStatusChange('checked_in')}>
                Registrar Check-in
              </Button>
            )}
            {booking.status === 'checked_in' && (
              <Button onClick={() => handleStatusChange('checked_out')}>
                Registrar Check-out
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Informações da Reserva */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Hóspede */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informações do Hóspede
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
                    <p className="font-medium">{booking.guestName || booking.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="font-medium">{booking.guestEmail || booking.guest_email}</p>
                    </div>
                  </div>
                  {booking.guestPhone || booking.guest_phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Telefone</p>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="font-medium">{booking.guestPhone || booking.guest_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pedidos Especiais</p>
                  <p className="text-gray-700">
                    {booking.specialRequests || booking.special_requests || 'Nenhum pedido especial.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Estadia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Detalhes da Estadia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Check-in</p>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">
                            {booking.checkIn ? formatDateDisplay(booking.checkIn, 'long') : '-'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {hotelDetails?.check_in_time || '14:00'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ocupação</p>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">
                            {booking.adults || 2} adulto{booking.adults && booking.adults > 1 ? 's' : ''}
                            {booking.children ? `, ${booking.children} criança${booking.children > 1 ? 's' : ''}` : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.units || 1} unidade{booking.units && booking.units > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Check-out</p>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">
                            {booking.checkOut ? formatDateDisplay(booking.checkOut, 'long') : '-'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {hotelDetails?.check_out_time || '12:00'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duração</p>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">{nights} noite{nights > 1 ? 's' : ''}</p>
                          <p className="text-sm text-gray-500">
                            {booking.checkIn && booking.checkOut 
                              ? `${formatDateDisplay(booking.checkIn, 'short')} - ${formatDateDisplay(booking.checkOut, 'short')}`
                              : ''
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Hotel e Quarto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  Hotel e Quarto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hotelDetails ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hotel</p>
                      <div className="flex items-start">
                        <Building2 className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{hotelDetails.name}</p>
                          <p className="text-sm text-gray-600">{hotelDetails.address}</p>
                          <p className="text-sm text-gray-500">
                            {hotelDetails.locality}, {hotelDetails.province}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hotel</p>
                      <p className="text-gray-700">Hotel ID: {booking.hotelId || booking.hotel_id}</p>
                    </div>
                  )}
                  
                  {roomDetails ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tipo de Quarto</p>
                      <div className="flex items-start">
                        <Bed className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{roomDetails.name}</p>
                          <p className="text-sm text-gray-600">{roomDetails.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {roomDetails.amenities?.slice(0, 3).map((amenity: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tipo de Quarto</p>
                      <p className="text-gray-700">Quarto ID: {booking.roomTypeId || booking.room_type_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Resumo e Ações */}
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preço por noite</span>
                    <span>{formatPrice(booking.basePrice || booking.base_price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{nights} noite{nights > 1 ? 's' : ''}</span>
                    <span>{formatPrice((booking.basePrice || booking.base_price || 0) * nights)}</span>
                  </div>
                  {booking.extraCharges && booking.extraCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxas extras</span>
                      <span>{formatPrice(booking.extraCharges)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">{formatPrice(booking.totalPrice || booking.total_price || 0)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Status do Pagamento</p>
                  <Badge variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    <CreditCard className="h-3 w-3 mr-1" />
                    {booking.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Código Promocional */}
            {booking.promoCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Código Promocional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-mono text-center">{booking.promoCode}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline da Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-1 rounded-full mr-3">
                      <Calendar className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reserva criada</p>
                      <p className="text-xs text-gray-500">
                        {booking.createdAt ? formatDateDisplay(booking.createdAt, 'long') : 'Data desconhecida'}
                      </p>
                    </div>
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <div className="flex items-start">
                      <div className="bg-green-100 p-1 rounded-full mr-3">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Reserva confirmada</p>
                        <p className="text-xs text-gray-500">Confirmada pelo sistema</p>
                      </div>
                    </div>
                  )}
                  
                  {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-1 rounded-full mr-3">
                        <FileText className="h-3 w-3 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Última atualização</p>
                        <p className="text-xs text-gray-500">
                          {formatDateDisplay(booking.updatedAt, 'long')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open(`mailto:${booking.guestEmail || booking.guest_email}`, '_blank')}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Reserva ${booking.confirmationCode || booking.confirmation_code}\n` +
                      `Hóspede: ${booking.guestName || booking.guest_name}\n` +
                      `Check-in: ${booking.checkIn}\n` +
                      `Check-out: ${booking.checkOut}`
                    );
                    toast({
                      title: 'Copiado!',
                      description: 'Informações da reserva copiadas.',
                    });
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copiar Detalhes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    // Abrir Google Maps com localização do hotel
                    if (hotelDetails?.address) {
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(hotelDetails.address)}`, '_blank');
                    }
                  }}
                  disabled={!hotelDetails?.address}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver Localização
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}