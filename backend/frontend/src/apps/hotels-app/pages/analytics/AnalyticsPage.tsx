// src/apps/hotels-app/pages/analytics/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Calendar,
  Building2, Bed, PieChart, Download, Filter,
  ChevronUp, ChevronDown, Activity
} from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/shared/hooks/use-toast';

// Componentes para gráficos (simplificados - em produção use Recharts ou similar)
const SimpleBarChart = ({ data }: { data: { label: string; value: number }[] }) => (
  <div className="h-64 flex items-end space-x-2">
    {data.map((item, index) => (
      <div key={index} className="flex flex-col items-center flex-1">
        <div 
          className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
          style={{ height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
          title={`${item.label}: ${item.value}`}
        />
        <span className="text-xs mt-2 text-gray-600">{item.label}</span>
      </div>
    ))}
  </div>
);

const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="relative h-64 w-64 mx-auto">
      {data.map((item, index, arr) => {
        const percentage = (item.value / total) * 100;
        const offset = arr.slice(0, index).reduce((sum, i) => sum + (i.value / total) * 360, 0);
        
        return (
          <div
            key={index}
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${item.color} 0% ${percentage}%, transparent ${percentage}% 100%)`,
              transform: `rotate(${offset}deg)`,
            }}
          />
        );
      })}
      <div className="absolute inset-1/4 bg-white rounded-full" />
    </div>
  );
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('month');
  const [hotels, setHotels] = useState<any[]>([]);

  // Buscar hotéis
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

  // Buscar estatísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', selectedHotelId, timeRange],
    queryFn: async () => {
      try {
        if (selectedHotelId !== 'all') {
          const response = await apiService.getHotelPerformance(selectedHotelId, {
            period: timeRange === 'month' ? 'month' : 'year',
          });
          
          if (response.success && response.data) {
            return response.data;
          }
        }

        // Dados mock para demonstração (em produção viria da API agregada)
        return {
          metrics: {
            total_revenue: 1250000,
            total_bookings: 156,
            occupancy_rate: 78,
            average_daily_rate: 8500,
            revenue_per_available_room: 6630,
            cancellation_rate: 12,
          },
          daily_metrics: [
            { date: 'Seg', revenue: 45000, bookings: 8, occupancy: 72 },
            { date: 'Ter', revenue: 52000, bookings: 9, occupancy: 78 },
            { date: 'Qua', revenue: 48000, bookings: 7, occupancy: 75 },
            { date: 'Qui', revenue: 61000, bookings: 11, occupancy: 85 },
            { date: 'Sex', revenue: 85000, bookings: 14, occupancy: 92 },
            { date: 'Sáb', revenue: 95000, bookings: 16, occupancy: 95 },
            { date: 'Dom', revenue: 68000, bookings: 12, occupancy: 82 },
          ],
          room_type_performance: [
            { room_type_name: 'Standard', revenue: 450000, bookings: 65, occupancy: 75 },
            { room_type_name: 'Deluxe', revenue: 380000, bookings: 42, occupancy: 68 },
            { room_type_name: 'Suite', revenue: 420000, bookings: 32, occupancy: 82 },
            { room_type_name: 'Family', revenue: 280000, bookings: 27, occupancy: 72 },
          ],
          monthly_trend: [
            { month: 'Jan', revenue: 980000, bookings: 132 },
            { month: 'Fev', revenue: 1050000, bookings: 145 },
            { month: 'Mar', revenue: 920000, bookings: 128 },
            { month: 'Abr', revenue: 1100000, bookings: 152 },
            { month: 'Mai', revenue: 1250000, bookings: 168 },
            { month: 'Jun', revenue: 1150000, bookings: 156 },
          ],
        };
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao carregar estatísticas',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!selectedHotelId || selectedHotelId === 'all',
  });

  const selectedHotel = hotels.find(h => (h.id || h.hotel_id) === selectedHotelId);

  // Dados para gráficos
  const revenueData = stats?.daily_metrics?.map(d => ({ label: d.date, value: d.revenue })) || [];
  const occupancyData = stats?.daily_metrics?.map(d => ({ label: d.date, value: d.occupancy })) || [];
  
  const roomTypeData = stats?.room_type_performance?.map((rt, index) => ({
    label: rt.room_type_name,
    value: rt.revenue,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][index % 4]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análises e Relatórios</h1>
          <p className="text-gray-600">Métricas e desempenho do seu hotel</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {selectedHotelId === 'all' ? 'Todos os Hotéis' : selectedHotel?.name || 'Selecionar Hotel'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Hotéis</SelectItem>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id || hotel.hotel_id} value={hotel.id || hotel.hotel_id}>
                  {hotel.name || hotel.hotel_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue>{timeRange === 'month' ? 'Este Mês' : 'Este Ano'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Cartões de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.metrics?.total_revenue?.toLocaleString() || '0'} MT
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">12%</span>
                  <span className="text-sm text-gray-500 ml-2">vs último período</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.metrics?.total_bookings || '0'}
                </p>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">8%</span>
                  <span className="text-sm text-gray-500 ml-2">vs último período</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.metrics?.occupancy_rate || '0'}%
                </p>
                <div className="flex items-center mt-1">
                  {stats?.metrics?.occupancy_rate && stats.metrics.occupancy_rate > 70 ? (
                    <ChevronUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${stats?.metrics?.occupancy_rate && stats.metrics.occupancy_rate > 70 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.metrics?.occupancy_rate && stats.metrics.occupancy_rate > 70 ? '5%' : '-3%'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">vs média</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ADR (Preço Médio)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.metrics?.average_daily_rate?.toLocaleString() || '0'} MT
                </p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-600">Estável</span>
                  <span className="text-sm text-gray-500 ml-2">vs último mês</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bed className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="occupancy">Ocupação</TabsTrigger>
          <TabsTrigger value="room-types">Tipos de Quarto</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita por Dia da Semana</CardTitle>
                <CardDescription>
                  Distribuição da receita nos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={revenueData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ocupação por Dia da Semana</CardTitle>
                <CardDescription>
                  Taxa de ocupação média por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={occupancyData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Desempenho por Tipo de Quarto</CardTitle>
                <CardDescription>
                  Distribuição da receita por categoria de quarto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <SimplePieChart data={roomTypeData} />
                  </div>
                  <div className="space-y-4">
                    {roomTypeData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.value.toLocaleString()} MT</p>
                          <p className="text-sm text-gray-500">
                            {((item.value / roomTypeData.reduce((sum, rt) => sum + rt.value, 0)) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita</CardTitle>
              <CardDescription>
                Tendências e comparações de receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-1">Receita Média Diária</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats?.metrics?.total_revenue 
                        ? ((stats.metrics.total_revenue / 30) | 0).toLocaleString() 
                        : '0'} MT
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">RevPAR</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats?.metrics?.revenue_per_available_room?.toLocaleString() || '0'} MT
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700 mb-1">Taxa de Cancelamento</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats?.metrics?.cancellation_rate || '0'}%
                    </p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Tendência Mensal</h4>
                  <div className="h-64">
                    {stats?.monthly_trend ? (
                      <SimpleBarChart 
                        data={stats.monthly_trend.map(mt => ({ 
                          label: mt.month, 
                          value: mt.revenue 
                        }))} 
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Dados de tendência não disponíveis
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Ocupação</CardTitle>
              <CardDescription>
                Métricas de ocupação e desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Taxa Mínima', value: '62%', period: 'Últimos 30 dias' },
                    { label: 'Taxa Máxima', value: '95%', period: 'Últimos 30 dias' },
                    { label: 'Média Semanal', value: '78%', period: 'Última semana' },
                    { label: 'Dia Mais Ocupado', value: 'Sábado', period: 'Dia da semana' },
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                      <p className="text-xl font-bold text-gray-900">{item.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.period}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Previsão de Ocupação</h4>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Previsões de ocupação em desenvolvimento</p>
                    <p className="text-sm">Em breve: previsões baseadas em IA</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room-types">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Tipo de Quarto</CardTitle>
              <CardDescription>
                Análise detalhada de cada categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.room_type_performance && stats.room_type_performance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo de Quarto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receita</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupação</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ADR</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contribuição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.room_type_performance.map((rt, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{rt.room_type_name}</td>
                          <td className="px-6 py-4">{rt.revenue.toLocaleString()} MT</td>
                          <td className="px-6 py-4">{rt.bookings}</td>
                          <td className="px-6 py-4">{rt.occupancy}%</td>
                          <td className="px-6 py-4">
                            {rt.bookings > 0 ? (rt.revenue / rt.bookings | 0).toLocaleString() : '0'} MT
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(rt.revenue / stats.room_type_performance.reduce((sum, r) => sum + r.revenue, 0)) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {((rt.revenue / stats.room_type_performance.reduce((sum, r) => sum + r.revenue, 0)) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Dados de desempenho por tipo de quarto não disponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Oportunidade</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Sábados têm 95% de ocupação. Considere ajustar preços para maximizar receita.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Building2 className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Desempenho</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Suites têm a maior taxa de ocupação (82%). Promova esta categoria.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start">
                <Filter className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Terças-feiras têm menor ocupação (78%). Considere promoções para estes dias.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}