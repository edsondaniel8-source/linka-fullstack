// src/apps/hotels-app/pages/Home.tsx (ou onde está este arquivo)
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { 
  HotelIcon, 
  Plus, 
  Building2, 
  Bed, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  MapPin,
  Edit,
  Home,
  BarChart3,
  Handshake
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export default function HotelsHome() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dados de exemplo para estatísticas
  const stats = {
    totalRooms: 24,
    availableRooms: 18,
    totalBookings: 156,
    monthlyRevenue: 425000,
    averageOccupancy: 85,
    roomTypes: 6,
    activePartnerships: 3
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <HotelIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold">Gestão Hoteleira</span>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              {stats.roomTypes} Tipos de Quarto
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/hotels/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Hotel
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <Home className="w-4 h-4 mr-2" />
                App Principal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Ação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/hotels/create">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="pt-6 text-center">
                <div className="text-blue-600 mb-4">
                  <Plus className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Criar Hotel
                </h3>
                <p className="text-gray-600 text-sm">
                  Adicione um novo hotel à sua rede
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hotels/dashboard">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6 text-center">
                <div className="text-green-600 mb-4">
                  <Building2 className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Dashboard
                </h3>
                <p className="text-gray-600 text-sm">
                  Visualize estatísticas e desempenho
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6 text-center">
              <div className="text-purple-600 mb-4">
                <BarChart3 className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Relatórios
              </h3>
              <p className="text-gray-600 text-sm">
                Acesse relatórios e estatísticas detalhadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Bed className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Quartos Disponíveis</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.availableRooms}/{stats.totalRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Reservas Totais</p>
                  <p className="text-3xl font-bold text-green-900">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Taxa Ocupação</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.averageOccupancy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Receita Mensal</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.monthlyRevenue.toLocaleString()} MT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotéis Recentes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Seus Hotéis</CardTitle>
            <CardDescription>
              Gerencie seus hotéis ou crie um novo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hotel Premium Maputo</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Av. Marginal, Maputo
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/hotels/123/dashboard">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Gerir
                    </Button>
                  </Link>
                  <Link href="/hotels/123/rooms/create">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Quarto
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum hotel cadastrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando seu primeiro hotel para gerenciar quartos e reservas.
                </p>
                <Link href="/hotels/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-5 w-5" />
                    Criar Meu Primeiro Hotel
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/hotels/dashboard">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Dashboard</h3>
                <p className="text-sm text-gray-600">Visão geral e estatísticas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hotels/create">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Novo Hotel</h3>
                <p className="text-sm text-gray-600">Crie um novo hotel</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hotels/123/availability">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Disponibilidade</h3>
                <p className="text-sm text-gray-600">Gerencie preços e datas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/hotels/partnerships">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Handshake className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Parcerias</h3>
                <p className="text-sm text-gray-600">Conecte-se com motoristas</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}