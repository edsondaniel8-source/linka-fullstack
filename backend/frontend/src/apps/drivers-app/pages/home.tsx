import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { 
  Car, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  DollarSign,
  UserCheck,
  Route,
  MessageCircle,
  Handshake,
  Star,
  Edit,
  Clock
} from 'lucide-react';
import LocationAutocomplete from '@/shared/components/LocationAutocomplete';
import apiService from '@/services/api';

interface DriverRide {
  id: string;
  fromAddress: string;
  toAddress: string;
  departureDate: string;
  departureTime: string;
  price: string;
  maxPassengers: number;
  availableSeats: number;
  status: 'active' | 'completed' | 'cancelled';
  bookings: number;
  revenue: number;
  vehicleType?: string;
  description?: string;
}

interface PartnershipOffer {
  id: string;
  hotelName: string;
  offerTitle: string;
  description: string;
  payment: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'accepted' | 'declined';
  benefits: string[];
}

export default function DriversHome() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form state para criar viagem
  const [rideForm, setRideForm] = useState({
    fromAddress: '',
    toAddress: '',
    departureDate: '',
    departureTime: '',
    price: '',
    maxPassengers: 4,
    vehicleType: 'sedan',
    description: ''
  });

  // Buscar viagens do motorista
  const { data: driverRides, isLoading } = useQuery({
    queryKey: ['driver-rides', user?.uid],
    queryFn: () => apiService.searchRides({ driverId: user?.uid }),
    enabled: !!user?.uid,
    initialData: [
      {
        id: '1',
        fromAddress: 'Maputo',
        toAddress: 'Beira',
        departureDate: '2025-09-15',
        departureTime: '07:00',
        price: '1500',
        maxPassengers: 4,
        availableSeats: 2,
        status: 'active' as const,
        bookings: 2,
        revenue: 3000,
        vehicleType: 'sedan',
        description: 'Viagem confortável com ar condicionado'
      },
      {
        id: '2', 
        fromAddress: 'Maputo',
        toAddress: 'Inhambane',
        departureDate: '2025-09-18',
        departureTime: '06:30',
        price: '800',
        maxPassengers: 4,
        availableSeats: 4,
        status: 'active' as const,
        bookings: 0,
        revenue: 0,
        vehicleType: 'suv',
        description: 'SUV espaçoso para viagens longas'
      }
    ]
  });

  // Buscar ofertas de parceria
  const { data: partnershipOffers } = useQuery({
    queryKey: ['partnership-offers', user?.uid],
    queryFn: () => apiService.getPartnershipRequests?.(),
    enabled: !!user?.uid,
    initialData: [
      {
        id: '1',
        hotelName: 'Hotel Costa do Sol',
        offerTitle: 'Transfer VIP Fins de Semana',
        description: 'Procuramos motoristas para transfers de hóspedes VIP aos fins de semana',
        payment: '500-800 MT/dia',
        location: 'Costa do Sol, Maputo',
        startDate: '2025-09-20',
        endDate: '2025-12-31',
        status: 'pending' as const,
        benefits: ['Pagamento premium', 'Gorjetas generosas', 'Combustível oferecido']
      }
    ]
  });

  // Mutation para criar viagem
  const createRideMutation = useMutation({
    mutationFn: (data: any) => apiService.createRide(data),
    onSuccess: () => {
      setShowCreateRide(false);
      setRideForm({ fromAddress: '', toAddress: '', departureDate: '', departureTime: '', price: '', maxPassengers: 4, vehicleType: 'sedan', description: '' });
      queryClient.invalidateQueries({ queryKey: ['driver-rides'] });
    }
  });

  // Estatísticas do motorista
  const stats = {
    totalRides: driverRides?.length || 0,
    activeRides: driverRides?.filter((r: DriverRide) => r.status === 'active').length || 0,
    totalBookings: driverRides?.reduce((sum: number, r: DriverRide) => sum + r.bookings, 0) || 0,
    totalRevenue: driverRides?.reduce((sum: number, r: DriverRide) => sum + r.revenue, 0) || 0,
    rating: 4.8,
    completedTrips: 25,
    pendingOffers: partnershipOffers?.filter((o: PartnershipOffer) => o.status === 'pending').length || 0
  };

  // Handler para criar viagem
  const handleCreateRide = () => {
    const rideData = {
      ...rideForm,
      price: parseFloat(rideForm.price),
      driverId: user?.uid
    };
    createRideMutation.mutate(rideData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">
              Esta área é exclusiva para motoristas registados.
            </p>
            <Link href="/login">
              <Button className="w-full">Fazer Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Link-A Motoristas
            </h1>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              Centro de Viagens
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" data-testid="link-main-app">
              <Button variant="outline">
                🏠 App Principal
              </Button>
            </Link>
            <Button variant="ghost" data-testid="button-user-menu">
              <UserCheck className="w-4 h-4 mr-2" />
              {user.email?.split('@')[0]}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estatísticas de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Viagens Ativas</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.activeRides}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Total Reservas</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Ofertas Parceria</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.pendingOffers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Receita Total</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.totalRevenue} MT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Centro de Controlo Simplificado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Centro de Controlo do Motorista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Dialog open={showCreateRide} onOpenChange={setShowCreateRide}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 h-16 flex-col" data-testid="button-create-ride">
                    <Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs">Publicar Viagem</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
              
              <Button variant="outline" className="h-16 flex-col" onClick={() => setActiveTab('bookings')} data-testid="button-view-bookings">
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-xs">Minhas Reservas</span>
              </Button>
              
              <Button variant="outline" className="h-16 flex-col" onClick={() => setActiveTab('partnerships')} data-testid="button-partnerships">
                <Handshake className="w-6 h-6 mb-1" />
                <span className="text-xs">Parcerias ({stats.pendingOffers})</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gestão por abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="rides">Minhas Viagens</TabsTrigger>
            <TabsTrigger value="partnerships">Parcerias</TabsTrigger>
            <TabsTrigger value="bookings">Reservas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Resumo da Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Performance do motorista */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Perfil do Motorista</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-bold text-lg">{stats.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600">Avaliação</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.completedTrips}</p>
                      <p className="text-sm text-gray-600">Viagens Completas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.totalRevenue} MT</p>
                      <p className="text-sm text-gray-600">Receita Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.activeRides}</p>
                      <p className="text-sm text-gray-600">Viagens Ativas</p>
                    </div>
                  </div>
                </div>

                {/* Próximas viagens */}
                {driverRides && driverRides.filter((r: DriverRide) => r.status === 'active').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Próximas Viagens</h3>
                    <div className="space-y-3">
                      {driverRides.filter((r: DriverRide) => r.status === 'active').slice(0, 2).map((ride: DriverRide) => (
                        <div key={ride.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Car className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{ride.fromAddress} → {ride.toAddress}</p>
                              <p className="text-sm text-gray-600">{ride.departureDate} às {ride.departureTime}</p>
                            </div>
                          </div>
                          <Badge variant={ride.availableSeats > 0 ? "default" : "secondary"}>
                            {ride.availableSeats > 0 ? `${ride.availableSeats} lugares` : 'Lotado'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Gestão de Viagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="active">
                  <TabsList>
                    <TabsTrigger value="active">Ativas ({stats.activeRides})</TabsTrigger>
                    <TabsTrigger value="completed">Concluídas</TabsTrigger>
                    <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-4">
                    {driverRides?.filter((ride: DriverRide) => ride.status === 'active').length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma viagem ativa</h3>
                        <p className="text-sm mb-4">Publique sua primeira viagem para começar a receber passageiros.</p>
                        <Button 
                          onClick={() => setShowCreateRide(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                          data-testid="button-create-first-ride"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Publicar Primeira Viagem
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {driverRides?.filter((ride: DriverRide) => ride.status === 'active').map((ride: DriverRide) => (
                          <Card key={ride.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Car className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">{ride.fromAddress}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="font-semibold">{ride.toAddress}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{ride.description}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{new Date(ride.departureDate).toLocaleDateString('pt-MZ')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>{ride.departureTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      <span>{ride.availableSeats}/{ride.maxPassengers} lugares</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Car className="h-4 w-4" />
                                      <span className="capitalize">{ride.vehicleType}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Badge 
                                        variant={ride.availableSeats > 0 ? "default" : "secondary"}
                                        className={ride.availableSeats > 0 ? "bg-green-100 text-green-700" : ""}
                                      >
                                        {ride.availableSeats > 0 ? "Disponível" : "Lotado"}
                                      </Badge>
                                      <span className="text-sm text-gray-600">
                                        {ride.bookings} reserva(s) • {ride.revenue} MT recebido
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-right ml-6">
                                  <div className="text-2xl font-bold text-green-600 mb-3">
                                    {ride.price} MT
                                    <span className="text-sm text-gray-500 font-normal">/pessoa</span>
                                  </div>
                                  <div className="space-y-2">
                                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-edit-ride-${ride.id}`}>
                                      <Edit className="w-3 h-3 mr-1" />
                                      Editar
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full" data-testid={`button-cancel-ride-${ride.id}`}>
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="completed">
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Viagens Concluídas</h3>
                      <p className="text-sm">Histórico das suas viagens completadas aparecerá aqui.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="cancelled">
                    <div className="text-center py-12 text-gray-500">
                      <XCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Viagens Canceladas</h3>
                      <p className="text-sm">Viagens canceladas aparecerão aqui para referência.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partnerships">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5" />
                  Ofertas de Parceria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {partnershipOffers?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Handshake className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhuma oferta de parceria</h3>
                    <p className="text-sm mb-4">Ofertas de hotéis para parcerias aparecerão aqui.</p>
                    <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Dica:</strong> Hotéis podem oferecer parcerias lucrativas para transfers e serviços especiais.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {partnershipOffers?.map((offer: PartnershipOffer) => (
                      <Card key={offer.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                  <Handshake className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{offer.offerTitle}</h3>
                                  <p className="text-sm text-gray-600">{offer.hotelName}</p>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 mb-3">{offer.description}</p>
                              
                              <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{offer.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>{offer.startDate} - {offer.endDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">{offer.payment}</span>
                                </div>
                              </div>
                              
                              {offer.benefits && offer.benefits.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-2">Benefícios Incluídos:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {offer.benefits.map((benefit, index) => (
                                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                                        {benefit}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <Badge className={`${
                                offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {offer.status === 'pending' ? 'Pendente' :
                                 offer.status === 'accepted' ? 'Aceite' : 'Recusada'}
                              </Badge>
                            </div>
                            
                            <div className="ml-6">
                              {offer.status === 'pending' && (
                                <div className="space-y-2">
                                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Aceitar
                                  </Button>
                                  <Button size="sm" variant="outline" className="w-full">
                                    <MessageCircle className="w-3 h-3 mr-1" />
                                    Negociar
                                  </Button>
                                  <Button size="sm" variant="outline" className="w-full">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Recusar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservas das Minhas Viagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma reserva ativa</h3>
                  <p className="text-sm">Quando passageiros reservarem suas viagens, as informações aparecerão aqui.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para criar viagem */}
      <Dialog open={showCreateRide} onOpenChange={setShowCreateRide}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Publicar Nova Viagem
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-location">Saindo de</Label>
                <LocationAutocomplete
                  id="from-location"
                  value={rideForm.fromAddress}
                  onChange={(value) => setRideForm(prev => ({ ...prev, fromAddress: value }))}
                  placeholder="Cidade de origem (Moçambique)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-location">Indo para</Label>
                <LocationAutocomplete
                  id="to-location"
                  value={rideForm.toAddress}
                  onChange={(value) => setRideForm(prev => ({ ...prev, toAddress: value }))}
                  placeholder="Cidade de destino (Moçambique)"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure-date">Data de Partida</Label>
                <Input 
                  id="departure-date" 
                  type="date"
                  value={rideForm.departureDate}
                  onChange={(e) => setRideForm(prev => ({ ...prev, departureDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-departure-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure-time">Hora de Partida</Label>
                <Input 
                  id="departure-time" 
                  type="time"
                  value={rideForm.departureTime}
                  onChange={(e) => setRideForm(prev => ({ ...prev, departureTime: e.target.value }))}
                  data-testid="input-departure-time"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ride-price">Preço por Pessoa (MT)</Label>
                <Input 
                  id="ride-price" 
                  type="number"
                  value={rideForm.price}
                  onChange={(e) => setRideForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ex: 1500"
                  data-testid="input-ride-price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-passengers">Máximo de Passageiros</Label>
                <Select value={rideForm.maxPassengers.toString()} onValueChange={(value) => setRideForm(prev => ({ ...prev, maxPassengers: parseInt(value) }))}>
                  <SelectTrigger data-testid="select-max-passengers">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 passageiro</SelectItem>
                    <SelectItem value="2">2 passageiros</SelectItem>
                    <SelectItem value="3">3 passageiros</SelectItem>
                    <SelectItem value="4">4 passageiros</SelectItem>
                    <SelectItem value="6">6 passageiros</SelectItem>
                    <SelectItem value="8">8 passageiros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Tipo de Veículo</Label>
                <Select value={rideForm.vehicleType} onValueChange={(value) => setRideForm(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger data-testid="select-vehicle-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="minivan">Minivan</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="hatchback">Hatchback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ride-description">Descrição da Viagem</Label>
              <Textarea 
                id="ride-description" 
                value={rideForm.description}
                onChange={(e) => setRideForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva detalhes da viagem: conforto do veículo, paradas, regras, etc."
                rows={3}
                data-testid="textarea-ride-description"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateRide(false)} data-testid="button-cancel-ride">
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRide}
                disabled={createRideMutation.isPending || !rideForm.fromAddress || !rideForm.toAddress || !rideForm.price}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-save-ride"
              >
                {createRideMutation.isPending ? 'Publicando...' : 'Publicar Viagem'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}