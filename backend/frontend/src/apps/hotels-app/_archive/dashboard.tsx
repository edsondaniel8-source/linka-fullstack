import { useState, useEffect } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Hotel, Calendar, Users, DollarSign, Plus, MessageSquare, TrendingUp, Handshake, Star, Loader2 } from "lucide-react";
import apiService from '@/shared/lib/api';
import { DashboardStats, Offer, HotelPartner } from '@/shared/types/dashboard';
import { Booking } from '@/shared/types/booking';
import CreateOffer from './create-offer';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hotelProfile, setHotelProfile] = useState<HotelPartner | null>(null);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [driverPartnerships, setDriverPartnerships] = useState<HotelPartner[]>([]);
  const [driverChats, setDriverChats] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateOffer, setShowCreateOffer] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [offers, bookingsData] = await Promise.all([
          apiService.getOffers(),
          apiService.getUserBookings()
        ]);
        setActiveOffers(offers);
        setBookings(bookingsData);
        setStats({
          occupancy: { today: 0, currentRooms: 0, totalRooms: 0 },
          revenue: { today: 0, changePercent: '0%' },
          checkins: { today: 0, pending: 0 },
          rating: { average: 0, totalReviews: 0 },
          todayCheckins: [],
          weeklyOccupancy: [],
          pendingTasks: []
        });
        setHotelProfile(null);
        setDriverPartnerships([]);
        setDriverChats([]);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setStats({
          occupancy: { today: 0, currentRooms: 0, totalRooms: 0 },
          revenue: { today: 0, changePercent: '0%' },
          checkins: { today: 0, pending: 0 },
          rating: { average: 0, totalReviews: 0 },
          todayCheckins: [],
          weeklyOccupancy: [],
          pendingTasks: []
        });
        setHotelProfile(null);
        setActiveOffers([]);
        setDriverPartnerships([]);
        setDriverChats([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateAccommodation = async (newAccommodation: Offer) => {
    try {
      const created = await apiService.createOffer(newAccommodation);
      setActiveOffers(prev => [...prev, created]);
    } catch (err) {
      console.error('Erro ao criar oferta:', err);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const created = await apiService.createEvent(eventData);
      console.log('Evento criado:', created);
    } catch (err) {
      console.error('Erro ao criar evento:', err);
    }
  };

  const handleSendMessage = async (chatId: string, message: string) => {
    try {
      const updatedChat = await apiService.sendMessage(chatId, message);
      setDriverChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleCreateOffer = () => {
    setShowCreateOffer(true);
  };

  const handleManageOffer = async (offerId: string) => {
    try {
      const offer = await apiService.getOfferById(offerId);
      console.log('Oferta carregada:', offer);
    } catch (err) {
      console.error('Erro ao carregar oferta:', err);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      await apiService.deleteOffer(offerId);
      setActiveOffers(prev => prev.filter(o => o.id !== offerId));
    } catch (err) {
      console.error('Erro ao remover oferta:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar dashboard: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    occupancy: { today: 0, currentRooms: 0, totalRooms: 0 },
    revenue: { today: 0, changePercent: '0%' },
    checkins: { today: 0, pending: 0 },
    rating: { average: 0, totalReviews: 0 },
    todayCheckins: [],
    weeklyOccupancy: [],
    pendingTasks: []
  };

  const activeOffersCount = activeOffers.length;
  const monthlyEarnings = activeOffers.reduce((sum, offer: Offer) => sum + offer.discountPrice, 0);
  const totalEarnings = monthlyEarnings * 3;
  const completedBookings = bookings.filter(b => b.status === 'completed').length || 0;
  const occupancyRate = displayStats.occupancy.today;
  const averageRating = displayStats.rating.average;
  const activePartnerships = driverPartnerships.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Alojamentos</h1>
          <p className="text-gray-600">Gerir ofertas diárias e parcerias com motoristas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ofertas Ativas</p>
                  <p className="text-2xl font-bold">{activeOffersCount}</p>
                </div>
                <Hotel className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold">{monthlyEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">MZN</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ganho</p>
                  <p className="text-2xl font-bold">{totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">MZN</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reservas</p>
                  <p className="text-2xl font-bold">{completedBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ocupação</p>
                  <p className="text-2xl font-bold">{occupancyRate}%</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avaliação</p>
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">⭐ de 5</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="text-yellow-600 w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Parcerias</p>
                  <p className="text-2xl font-bold">{activePartnerships}</p>
                </div>
                <Handshake className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ofertas Diárias Ativas</CardTitle>
              <Button onClick={handleCreateOffer} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Oferta
              </Button>
            </CardHeader>
            <CardContent>
              {showCreateOffer && (
                <CreateOffer 
                  onCreate={(data) => {
                    handleCreateAccommodation(data);
                    setShowCreateOffer(false);
                  }}
                  onCancel={() => setShowCreateOffer(false)}
                />
              )}
              <div className="space-y-4">
                {activeOffers.map((offer: Offer) => (
                  <Card key={offer.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{offer.roomType}</h3>
                          <p className="text-sm text-gray-600">📅 {offer.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">
                              {offer.originalPrice} MZN
                            </span>
                            <Badge className="bg-green-100 text-green-800">
                              {offer.discountPrice} MZN
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {offer.driverCommission}% comissão
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                        <span>🛏️ {offer.availableRooms} quarto{offer.availableRooms !== 1 ? "s" : ""} disponível{offer.availableRooms !== 1 ? "eis" : ""}</span>
                        <span>📝 {offer.requests} solicitaç{offer.requests !== 1 ? "ões" : "ão"}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleManageOffer(offer.id)}
                        >
                          Gerir
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteOffer(offer.id)}
                        >
                          Excluir
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activeOffers.length === 0 && (
                  <div className="text-center py-6">
                    <Hotel className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhuma oferta ativa</p>
                    <Button onClick={handleCreateOffer} className="mt-2">
                      Criar primeira oferta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parceiros Motoristas</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/hotels/partnerships">
                  <Handshake className="w-4 h-4 mr-2" />
                  Gerir Parcerias
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driverPartnerships.map((partner: HotelPartner) => (
                  <Card key={partner.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {partner.name}
                          </h3>
                          <p className="text-sm text-gray-600">{partner.route}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{partner.rating}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{partner.commission}% comissão</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p>👥 {partner.clientsBrought} clientes trazidos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {partner.lastMonth.toLocaleString()} MZN
                          </p>
                          <p className="text-xs">último mês</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat Privado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {driverPartnerships.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">Nenhum parceiro motorista</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/hotels/partnerships">
                        Procurar Parceiros
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">⚡ Acções Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleCreateOffer} variant="outline" className="h-auto py-4">
                <div className="text-center">
                  <Plus className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium">Criar Oferta Diária</p>
                  <p className="text-xs text-gray-600">Oferecer quartos com desconto</p>
                </div>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/hotels/driver-chat">
                  <div className="text-center">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Chat com Motoristas</p>
                    <p className="text-xs text-gray-600">Negociar novas parcerias</p>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/hotels/partnerships">
                  <div className="text-center">
                    <Handshake className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Publicar Parceria</p>
                    <p className="text-xs text-gray-600">Atrair novos motoristas</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}