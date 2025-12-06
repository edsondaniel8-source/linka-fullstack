// src/apps/hotels-app/pages/analytics/ReportsPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { 
  Download, Filter, Calendar, BarChart3, PieChart,
  TrendingUp, Users, DollarSign, Building2, FileText,
  Printer, Share2, Eye
} from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [reportType, setReportType] = useState('overview');

  const reports = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'revenue', name: 'Relatório de Receita', icon: DollarSign },
    { id: 'occupancy', name: 'Ocupação e Disponibilidade', icon: Users },
    { id: 'bookings', name: 'Análise de Reservas', icon: Calendar },
    { id: 'rooms', name: 'Desempenho por Quarto', icon: Building2 },
    { id: 'guests', name: 'Perfil dos Hóspedes', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Relatórios detalhados e análises</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Até</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">Relatório detalhado</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conteúdo do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Desempenho</CardTitle>
          <CardDescription>
            {reportType === 'overview' && 'Visão geral do desempenho'}
            {reportType === 'revenue' && 'Análise de receita e lucros'}
            {reportType === 'occupancy' && 'Taxas de ocupação e disponibilidade'}
            {reportType === 'bookings' && 'Análise de reservas e cancelamentos'}
            {reportType === 'rooms' && 'Desempenho por tipo de quarto'}
            {reportType === 'guests' && 'Perfil e comportamento dos hóspedes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecione um relatório
            </h3>
            <p className="text-gray-600">
              Selecione um tipo de relatório e período para visualizar os dados.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Últimos 30 dias
              </Button>
              <Button>
                <TrendingUp className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}