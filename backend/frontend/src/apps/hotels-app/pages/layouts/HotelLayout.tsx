// src/apps/hotels-app/pages/layouts/HotelLayout.tsx
import React from 'react';
import { Link } from 'wouter';
import { 
  HotelIcon, Home, Settings, HelpCircle, 
  Calendar, BarChart3, Users, Building2,
  Bed, FileText, CreditCard, TrendingUp,
  Plus, Shield, Bell, Eye
} from 'lucide-react';

// REMOVA as importações das páginas específicas - elas serão renderizadas via children
// import HotelsDashboard from '../dashboard/HotelDashboard';
// import HotelCreatePage from '../create/HotelCreatePage';
// etc...

// Componente para renderizar o conteúdo - AGORA RECEBE children
export default function HotelLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <HotelIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Gestão Hoteleira</span>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              {/* Seção Principal */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Principal</div>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link 
                      href="/hotels/dashboard"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <TrendingUp className="h-5 w-5" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/hotels/create"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Plus className="h-5 w-5" />
                      Criar Hotel
                    </Link>
                  </li>
                </ul>
              </li>
              
              {/* Gestão */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Gestão</div>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link 
                      href="/hotels/bookings"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Calendar className="h-5 w-5" />
                      Reservas
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Para gerenciar quartos, selecione um hotel primeiro');
                      }}
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Bed className="h-5 w-5" />
                      Quartos
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Users className="h-5 w-5" />
                      Hóspedes
                    </Link>
                  </li>
                </ul>
              </li>
              
              {/* Análises */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Análises</div>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link 
                      href="/hotels/analytics"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/hotels/reports"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <FileText className="h-5 w-5" />
                      Relatórios
                    </Link>
                  </li>
                </ul>
              </li>
              
              {/* Configurações */}
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Configurações</div>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link 
                      href="/hotels/settings"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Settings className="h-5 w-5" />
                      Configurações do Hotel
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/hotels/settings/account"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Users className="h-5 w-5" />
                      Minha Conta
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/hotels/settings/billing"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <CreditCard className="h-5 w-5" />
                      Faturação
                    </Link>
                  </li>
                </ul>
              </li>
              
              {/* Links Externos */}
              <li className="mt-auto">
                <Link 
                  href="/"
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  <Home className="h-5 w-5 shrink-0" />
                  Voltar ao Site Principal
                </Link>
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Central de Ajuda em desenvolvimento');
                  }}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                >
                  <HelpCircle className="h-5 w-5 shrink-0" />
                  Ajuda & Suporte
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="lg:pl-64">
        {/* Header Mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="lg:hidden">
                <button className="p-2 -ml-2">
                  <HotelIcon className="h-8 w-8 text-blue-600" />
                </button>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Sistema de Gestão Hoteleira
                </div>
                <div className="text-xs text-gray-500">
                  Gerencie seus hotéis em um só lugar
                </div>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <div className="hidden sm:flex items-center space-x-4">
                <Link href="/hotels/bookings">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reservas
                  </button>
                </Link>
                <Link href="/hotels/analytics">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </button>
                </Link>
                <Link href="/hotels/create">
                  <button className="flex items-center text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg">
                    <Plus className="h-4 w-4 mr-1" />
                    Novo Hotel
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo da Página - AGORA USA children */}
        <main className="py-6 sm:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children || (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
                    <Eye className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
                  <p className="text-gray-600 mb-6">
                    A página que você está procurando não existe no sistema de gestão hoteleira.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="lg:ml-64 border-t bg-white mt-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Gestão Hoteleira. Todos os direitos reservados.
              </div>
              <div className="flex space-x-4 text-sm text-gray-500">
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Central de Ajuda em desenvolvimento');
                  }}
                  className="hover:text-blue-600"
                >
                  Ajuda
                </Link>
                <Link href="/hotels/settings" className="hover:text-blue-600">
                  Configurações
                </Link>
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Política de Privacidade em desenvolvimento');
                  }}
                  className="hover:text-blue-600"
                >
                  Privacidade
                </Link>
                <Link 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Termos de Uso em desenvolvimento');
                  }}
                  className="hover:text-blue-600"
                >
                  Termos
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}