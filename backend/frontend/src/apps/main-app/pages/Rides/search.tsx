import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { ArrowLeft, Phone, Mail, CreditCard, User, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import PageHeader from "@/shared/components/PageHeader";
import MobileNavigation from "@/shared/components/MobileNavigation";
import useAuth from "@/shared/hooks/useAuth"; // ✅ Importação do hook de autenticação

interface Ride {
  id: string;
  driverName: string;
  fromAddress: string;
  toAddress: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  maxPassengers: number;
  pricePerSeat: string;   // ✅ alinhado com backend
  vehicleType: string;
  additionalInfo?: string;
  status: string;
  driverRating?: number | string;
  vehiclePhoto?: string | null;
}

interface LocationState {
  rides: Ride[];
  searchParams: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
  timestamp?: number;
}

export default function RideSearchPage() {
  const [location, setLocation] = useLocation();
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    passengers: 1,
    phone: "",
    email: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const { user } = useAuth(); // ✅ Obter informações do usuário logado

  // ✅ OBTER DADOS DA NAVIGATION STATE CORRETAMENTE
  const [rides, setRides] = useState<Ride[]>([]);
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1
  });

  // ✅ USAR useEffect PARA CAPTURAR OS DADOS DO STATE
  useEffect(() => {
    // Obter o state da navegação atual
    const currentState = history.state as LocationState;
    
    console.log('🚗 RideSearchPage - State recebido:', currentState);
    console.log('🚗 Current location:', location);
    
    if (currentState) {
      if (currentState.rides) {
        setRides(currentState.rides);
        console.log('✅ Viagens recebidas:', currentState.rides.length);
      }
      if (currentState.searchParams) {
        setSearchParams(currentState.searchParams);
        console.log('✅ Parámetros recebidos:', currentState.searchParams);
      }
    } else {
      console.log('❌ Nenhum state recebido na navegação');
      // Se não há state, tentar obter de sessionStorage ou voltar para a página inicial
      const savedSearch = sessionStorage.getItem('lastSearchResults');
      if (savedSearch) {
        try {
          const parsedData = JSON.parse(savedSearch);
          setRides(parsedData.rides || []);
          setSearchParams(parsedData.searchParams || {
            from: "",
            to: "",
            date: "",
            passengers: 1
          });
          console.log('✅ Dados recuperados do sessionStorage');
        } catch (error) {
          console.error('❌ Erro ao parsear dados do sessionStorage:', error);
          redirectToHome();
        }
      } else {
        redirectToHome();
      }
    }
  }, [location]);

  const redirectToHome = () => {
    toast({
      title: "Dados não encontrados",
      description: "Por favor, realize uma nova busca.",
      variant: "destructive",
    });
    setLocation('/');
  };

  const handleBookRide = (ride: Ride) => {
    // ✅ VERIFICAR SE USUÁRIO ESTÁ LOGADO
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para reservar uma viagem.",
        variant: "destructive",
      });
      return;
    }
    
    // ✅ VERIFICAR DISPONIBILIDADE ANTES DE ABRIR MODAL
    if (ride.availableSeats < bookingData.passengers) {
      toast({
        title: "Lugares insuficientes",
        description: `Apenas ${ride.availableSeats} lugar(es) disponível(is)`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedRide(ride);
    setBookingModal(true);
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/rides-simple/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rideId: data.rideId,
          passengerId: user?.id, // ✅ agora pega o ID do usuário logado
          seatsBooked: data.passengers,
          phone: data.phone,
          email: data.email,
          notes: data.notes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book ride');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva confirmada!",
        description: "Sua reserva foi criada com sucesso. Você receberá mais detalhes por email.",
      });
      setBookingModal(false);
      setSelectedRide(null);
      setBookingData({
        passengers: 1,
        phone: "",
        email: "",
        notes: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na reserva",
        description: error.message || "Não foi possível processar sua reserva. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleConfirmBooking = () => {
    if (!selectedRide) return;
    
    // ✅ VERIFICAR SE USUÁRIO ESTÁ LOGADO
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Por favor, faça login para confirmar a reserva.",
        variant: "destructive",
      });
      return;
    }
    
    // ✅ VERIFICAÇÃO FINAL DE DISPONIBILIDADE
    if (selectedRide.availableSeats < bookingData.passengers) {
      toast({
        title: "Lugares insuficientes",
        description: `Apenas ${selectedRide.availableSeats} lugar(es) disponível(is)`,
        variant: "destructive",
      });
      return;
    }
    
    if (!bookingData.phone || !bookingData.email) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha telefone e email.",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      rideId: selectedRide.id,
      passengers: bookingData.passengers,
      phone: bookingData.phone,
      email: bookingData.email,
      notes: bookingData.notes
    });
  };

  // ✅ FUNÇÃO FORMATPRICE SEGURA - CORRIGIDA
  const formatPrice = (price?: number | string | null) => {
    if (price == null || price === "" || isNaN(Number(price))) {
      return "0.00 MT";
    }
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `${numPrice.toFixed(2)} MT`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Resultados da Busca" />
      
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>

        {/* ✅ RESUMO DA BUSCA */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label>Saindo de</Label>
                <p className="font-semibold">{searchParams.from || "Não especificado"}</p>
              </div>
              <div>
                <Label>Indo para</Label>
                <p className="font-semibold">{searchParams.to || "Não especificado"}</p>
              </div>
              <div>
                <Label>Data</Label>
                <p className="font-semibold">{searchParams.date || "Não especificada"}</p>
              </div>
              <div>
                <Label>Passageiros</Label>
                <p className="font-semibold">{searchParams.passengers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ RESULTADOS */}
        <Card>
          <CardHeader>
            <CardTitle>
              {rides.length} viagem(s) encontrada(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rides.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">Nenhuma viagem encontrada</p>
                <p className="text-sm text-gray-500 mt-2">
                  Tente alterar os critérios de busca na página principal
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  variant="outline"
                  className="mt-4"
                >
                  Voltar à Página Principal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {rides.map((ride) => {
                  // ✅ VERIFICAR DISPONIBILIDADE
                  const canBook = ride.availableSeats >= bookingData.passengers;
                  const isFullyBooked = ride.availableSeats === 0;
                  
                  return (
                    <div key={ride.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {ride.fromAddress} → {ride.toAddress}
                          </h3>
                          <p className="text-gray-600">{formatDate(ride.departureDate)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{ride.driverName}</span>
                            {ride.driverRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{ride.driverRating}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* ✅ EXIBIR DISPONIBILIDADE */}
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${
                              isFullyBooked ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {isFullyBooked ? 'LOTADO' : `${ride.availableSeats} lugar(es) disponível(is)`}
                            </span>
                          </div>
                          
                          {ride.vehiclePhoto && (
                            <img 
                              src={ride.vehiclePhoto} 
                              alt="Veículo" 
                              className="w-20 h-20 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {/* ✅ CORREÇÃO APLICADA AQUI - usar pricePerSeat em vez de price */}
                          <span className="text-2xl font-bold text-green-600">
                            {formatPrice(Number(ride.pricePerSeat))}
                          </span>
                          <Button 
                            onClick={() => handleBookRide(ride)}
                            disabled={!canBook || isFullyBooked || !user}
                            className={`${
                              canBook && !isFullyBooked && user
                                ? 'bg-primary hover:bg-red-600' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {!user ? 'Faça login para reservar' : 
                             isFullyBooked ? 'LOTADO' : 
                             canBook ? 'Reservar Agora' : 
                             'Lugares insuficientes'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ MODAL DE RESERVA */}
      <Dialog open={bookingModal} onOpenChange={setBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Complete os dados para confirmar sua reserva
            </DialogDescription>
          </DialogHeader>
          
          {selectedRide && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-sm">
                    <span className="font-semibold">{selectedRide.fromAddress}</span>
                    <span className="mx-2">→</span>
                    <span className="font-semibold">{selectedRide.toAddress}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(selectedRide.departureDate)}
                </div>
                <div className="text-sm text-gray-600">
                  Motorista: {selectedRide.driverName}
                </div>
                {/* ✅ CORREÇÃO APLICADA AQUI - usar pricePerSeat em vez de price */}
                <div className="text-sm font-semibold mt-2">
                  Preço: {formatPrice(Number(selectedRide.pricePerSeat))}
                </div>
                
                {/* ✅ EXIBIR DISPONIBILIDADE NO MODAL */}
                <div className={`text-sm font-medium mt-2 ${
                  selectedRide.availableSeats === 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {selectedRide.availableSeats === 0 
                    ? 'LOTADO' 
                    : `${selectedRide.availableSeats} lugar(es) disponível(is)`
                  }
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="passengers">Número de Passageiros</Label>
                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max={selectedRide.availableSeats}
                    value={bookingData.passengers}
                    onChange={(e) => setBookingData({...bookingData, passengers: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {selectedRide.availableSeats} lugares disponíveis
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="84 123 4567"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação especial..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Total ({bookingData.passengers} passageiro{bookingData.passengers > 1 ? 's' : ''})</span>
                    {/* ✅ CORREÇÃO APLICADA AQUI - usar pricePerSeat em vez de price */}
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(Number(selectedRide.pricePerSeat) * bookingData.passengers)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setBookingModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmBooking}
                  disabled={bookingMutation.isPending || selectedRide.availableSeats < bookingData.passengers || !user}
                  className="flex-1"
                >
                  {bookingMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Confirmar Reserva
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNavigation />
    </div>
  );
}