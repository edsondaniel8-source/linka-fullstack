import React, { useState } from 'react'; 
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, MapPin, Users, Star, Car, ArrowRight } from 'lucide-react';
import { LocationAutocomplete } from '@/shared/components/LocationAutocomplete';
import { useToast } from '@/shared/hooks/use-toast';
import { useBookings } from '@/shared/hooks/useBookings';
import type { LocationSuggestion } from '@/shared/components/LocationAutocomplete';

interface RideSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams?: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
  onShowAllResults?: (rides: Ride[], searchParams: any) => void;
}

interface Ride {
  id: string;
  fromAddress: string;
  toAddress: string;
  departureDate: string;
  price: string;
  maxPassengers: number;
  currentPassengers: number;
  type: string;
  driverName: string;
  driverRating: string;
  description: string;
}

export default function RideSearchModal({ 
  isOpen, 
  onClose, 
  initialParams,
  onShowAllResults 
}: RideSearchModalProps) {
  const [searchParams, setSearchParams] = useState({
    from: initialParams?.from || '',
    to: initialParams?.to || '',
    date: initialParams?.date || '',
    passengers: initialParams?.passengers || 1
  });
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { toast } = useToast();
  const { createBooking } = useBookings();

  const { data: rides = [], isLoading, refetch } = useQuery({
    queryKey: ['search-rides', searchParams.from, searchParams.to, searchParams.date, searchParams.passengers],
    queryFn: () => apiService.searchRides({
      from: searchParams.from,
      to: searchParams.to, 
      date: searchParams.date,
      passengers: searchParams.passengers
    }),
    enabled: false
  });

  const handleSearch = () => {
    if (!searchParams.from || !searchParams.to) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha origem e destino.",
        variant: "destructive"
      });
      return;
    }
    refetch();
  };

  const handleShowAllResultsClick = () => {
    if (onShowAllResults && rides.length > 0) {
      onShowAllResults(rides, searchParams);
      onClose();
    }
  };

  const handleBookRide = (ride: Ride) => {
    setSelectedRide(ride);
    setShowBookingModal(true);
  };

  const handleLocationSelect = (field: 'from' | 'to') => (location: LocationSuggestion | string) => {
    const locationName = typeof location === 'string' ? location : location.name;
    setSearchParams(prev => ({ ...prev, [field]: locationName }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Buscar Viagens
            </DialogTitle>
          </DialogHeader>

          {/* Formulário de Busca */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="from">Origem</Label>
              <LocationAutocomplete
                id="from"
                placeholder="De onde?"
                value={searchParams.from}
                onLocationSelect={handleLocationSelect('from')}
                data-testid="input-origin"
              />
            </div>
            
            <div>
              <Label htmlFor="to">Destino</Label>
              <LocationAutocomplete
                id="to"
                placeholder="Para onde?"
                value={searchParams.to}
                onLocationSelect={handleLocationSelect('to')}
                data-testid="input-destination"
              />
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                data-testid="input-date"
              />
            </div>
            
            <div>
              <Label htmlFor="passengers">Passageiros</Label>
              <Input
                id="passengers"
                type="number"
                min="1"
                max="8"
                value={searchParams.passengers}
                onChange={(e) => setSearchParams(prev => ({ 
                  ...prev, 
                  passengers: Math.max(1, Math.min(8, parseInt(e.target.value) || 1))
                }))}
                data-testid="input-passengers"
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full"
            disabled={isLoading}
            data-testid="button-search"
          >
            {isLoading ? "Buscando..." : "Buscar Viagens"}
          </Button>

          {/* Resultados */}
          {rides.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {rides.length} viagens encontradas
                </h3>
                
                {onShowAllResults && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleShowAllResultsClick}
                    className="flex items-center gap-2"
                    data-testid="button-show-all-results"
                  >
                    Ver Todos na Página
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid gap-4">
                {rides.map((ride: Ride) => (
                  <Card key={ride.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{ride.fromAddress}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">{ride.toAddress}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(ride.departureDate).toLocaleDateString('pt-MZ')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {ride.maxPassengers - ride.currentPassengers} lugares disponíveis
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              {ride.driverRating}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{ride.type}</Badge>
                            <span className="text-sm text-gray-600">{ride.driverName}</span>
                          </div>
                          
                          {ride.description && (
                            <p className="text-sm text-gray-600 mt-2">{ride.description}</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {ride.price} MT
                          </div>
                          <Button 
                            onClick={() => handleBookRide(ride)}
                            disabled={ride.maxPassengers - ride.currentPassengers < searchParams.passengers}
                            data-testid={`button-book-${ride.id}`}
                          >
                            {ride.maxPassengers - ride.currentPassengers < searchParams.passengers 
                              ? "Sem lugares" 
                              : "Reservar"
                            }
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {rides.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma viagem encontrada para os critérios selecionados.</p>
              <p className="text-sm">Tente alterar as datas ou locais da busca.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedRide && (
        <BookingModal 
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRide(null);
          }}
          ride={selectedRide}
          passengers={searchParams.passengers}
          onBookingComplete={() => {
            setShowBookingModal(false);
            setSelectedRide(null);
            onClose();
            toast({
              title: "Reserva confirmada!",
              description: "Sua viagem foi reservada com sucesso.",
              variant: "default"
            });
          }}
          createBooking={createBooking}
        />
      )}
    </>
  );
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  passengers: number;
  onBookingComplete: () => void;
  createBooking: ReturnType<typeof useBookings>['createBooking'];
}

function BookingModal({ isOpen, onClose, ride, passengers, onBookingComplete, createBooking }: BookingModalProps) {
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const totalAmount = parseFloat(ride.price) * passengers;

  const handleBooking = async () => {
    if (!guestInfo.name || !guestInfo.email || !guestInfo.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    try {
      const result = await createBooking('ride', { ...ride, passengers, totalAmount, guestInfo });
      if (result.success) onBookingComplete();
    } catch {
      toast({
        title: "Erro na reserva",
        description: "Não foi possível completar a reserva. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Reserva</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detalhes da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Rota:</strong> {ride.fromAddress} → {ride.toAddress}</div>
              <div><strong>Data:</strong> {new Date(ride.departureDate).toLocaleDateString('pt-MZ')}</div>
              <div><strong>Motorista:</strong> {ride.driverName}</div>
              <div><strong>Passageiros:</strong> {passengers}</div>
              <div><strong>Valor total:</strong> <span className="text-green-600 font-bold">{totalAmount} MT</span></div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-medium">Informações do Passageiro</h4>
            <div>
              <Label htmlFor="guest-name">Nome completo</Label>
              <Input
                id="guest-name"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="guest-email">Email</Label>
              <Input
                id="guest-email"
                type="email"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="guest-phone">Telefone</Label>
              <Input
                id="guest-phone"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+258 XX XXX XXXX"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleBooking} disabled={isBooking} className="flex-1">
              {isBooking ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}