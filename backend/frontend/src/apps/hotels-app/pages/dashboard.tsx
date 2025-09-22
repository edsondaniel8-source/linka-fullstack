import { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Hotel, Calendar, Users, DollarSign, Plus, MessageSquare, TrendingUp, Handshake, Star } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Mock data para o dashboard do hotel
  const hotelStats = {
    activeOffers: 5,
    totalEarnings: 125800,
    monthlyEarnings: 32400,
    completedBookings: 156,
    rating: 4.6,
    occupancyRate: 78,
    activePartnerships: 12
  };

  const dailyOffers = [
    {
      id: 1,
      date: "2024-01-20",
      roomType: "Quarto Duplo",
      originalPrice: 3500,
      discountPrice: 2800,
      availableRooms: 2,
      requests: 3,
      driverCommission: 10,
      status: "active"
    },
    {
      id: 2,
      date: "2024-01-21",
      roomType: "Suite Familiar",
      originalPrice: 5500,
      discountPrice: 4400,
      availableRooms: 1,
      requests: 5,
      driverCommission: 15,
      status: "active"
    }
  ];

  const driverPartners = [
    {
      id: 1,
      name: "João M.",
      route: "Maputo → Beira",
      commission: 10,
      clientsBrought: 8,
      lastMonth: 4200,
      rating: 4.8,
      status: "active"
    },
    {
      id: 2,
      name: "Maria S.",
      route: "Nampula → Nacala",
      commission: 12,
      clientsBrought: 12,
      lastMonth: 6800,
      rating: 4.9,
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Alojamentos</h1>
          <p className="text-gray-600">Gerir ofertas diárias e parcerias com motoristas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ofertas Ativas</p>
                  <p className="text-2xl font-bold">{hotelStats.activeOffers}</p>
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
                  <p className="text-2xl font-bold">{hotelStats.monthlyEarnings.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{hotelStats.totalEarnings.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{hotelStats.completedBookings}</p>
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
                  <p className="text-2xl font-bold">{hotelStats.occupancyRate}%</p>
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
                  <p className="text-2xl font-bold">{hotelStats.rating}</p>
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
                  <p className="text-2xl font-bold">{hotelStats.activePartnerships}</p>
                </div>
                <Handshake className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ofertas Diárias Ativas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ofertas Diárias Ativas</CardTitle>
              <Button asChild size="sm">
                <Link href="/hotels/create-offer" data-testid="button-create-offer">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Oferta
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyOffers.map((offer) => (
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
                        <Button size="sm" variant="outline" data-testid={`button-manage-offer-${offer.id}`}>
                          Gerir
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-chat-offer-${offer.id}`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {dailyOffers.length === 0 && (
                  <div className="text-center py-6">
                    <Hotel className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Nenhuma oferta ativa</p>
                    <Button asChild className="mt-2">
                      <Link href="/hotels/create-offer">Criar primeira oferta</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parceiros Motoristas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Parceiros Motoristas</CardTitle>
              <Button asChild size="sm" variant="outline">
                <Link href="/hotels/partnerships" data-testid="button-manage-partnerships">
                  <Handshake className="w-4 h-4 mr-2" />
                  Gerir Parcerias
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {driverPartners.map((partner) => (
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
                        <Button size="sm" variant="outline" data-testid={`button-chat-partner-${partner.id}`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat Privado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="text-center">
                  <Button asChild variant="outline">
                    <Link href="/hotels/partnerships" data-testid="button-view-all-partnerships">
                      Ver Todas as Parcerias
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">⚡ Acções Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/hotels/create-offer" data-testid="button-quick-create-offer">
                  <div className="text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Criar Oferta Diária</p>
                    <p className="text-xs text-gray-600">Oferecer quartos com desconto</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/hotels/driver-chat" data-testid="button-quick-chat">
                  <div className="text-center">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Chat com Motoristas</p>
                    <p className="text-xs text-gray-600">Negociar novas parcerias</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/hotels/partnerships" data-testid="button-quick-partnerships">
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