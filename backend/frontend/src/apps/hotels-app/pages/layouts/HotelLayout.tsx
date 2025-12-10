// src/apps/hotels-app/pages/layouts/HotelLayout.tsx
import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  HotelIcon, Home, Settings, HelpCircle, 
  Calendar, BarChart3, Users, Building2,
  FileText, CreditCard, TrendingUp,
  Plus, Bell, Eye, Layers,
  Menu, X, User, LogOut
} from 'lucide-react';

// Componente para renderizar o conteúdo
export default function HotelLayout({ children }: { children?: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Verificar se estamos em uma página específica
  const currentPath = window.location.pathname;
  const isHotelSelected = currentPath.includes('/hotels/') && 
                         !currentPath.includes('/hotels/dashboard') &&
                         !currentPath.includes('/hotels/create');

  // Extrair hotelId se estiver em uma página de hotel
  const getHotelId = () => {
    if (!isHotelSelected) return null;
    const parts = currentPath.split('/');
    const hotelIndex = parts.indexOf('hotels') + 1;
    return hotelIndex < parts.length ? parts[hotelIndex] : null;
  };

  const hotelId = getHotelId();

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
                      href="/hotels"
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    >
                      <Building2 className="h-5 w-5" />
                      Meus Hotéis
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
              
              {/* Gestão - Apenas se hotel estiver selecionado */}
              {isHotelSelected && hotelId && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-gray-400">Gestão do Hotel</div>
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
                        href={`/hotels/${hotelId}/room-types`}
                        className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Layers className="h-5 w-5" />
                        Tipos de Quarto
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/hotels/${hotelId}/availability`}
                        className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Calendar className="h-5 w-5" />
                        Disponibilidade
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
              
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
                      <User className="h-5 w-5" />
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
                <button
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    setLocation('/auth/login');
                  }}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-red-600 w-full text-left"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sair
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
              <div className="flex items-center space-x-3">
                <HotelIcon className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Menu</span>
              </div>
              <button
                type="button"
                className="rounded-md text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-6">
              <ul className="space-y-6">
                <li>
                  <Link 
                    href="/hotels/dashboard"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/hotels"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Building2 className="h-5 w-5" />
                    <span>Meus Hotéis</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/hotels/create"
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Criar Hotel</span>
                  </Link>
                </li>
                {isHotelSelected && hotelId && (
                  <>
                    <li className="pt-4 border-t">
                      <span className="text-xs font-semibold text-gray-400">Gestão do Hotel</span>
                    </li>
                    <li>
                      <Link 
                        href="/hotels/bookings"
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Reservas</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/hotels/${hotelId}/room-types`}
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Layers className="h-5 w-5" />
                        <span>Tipos de Quarto</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/hotels/${hotelId}/availability`}
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Disponibilidade</span>
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="lg:pl-64">
        {/* Header Mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button 
                className="lg:hidden p-2 -ml-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Sistema de Gestão Hoteleira
                </div>
                <div className="text-xs text-gray-500">
                  {isHotelSelected ? 'Gerenciando hotel selecionado' : 'Gerencie seus hotéis em um só lugar'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <div className="hidden sm:flex items-center space-x-4">
                <Link href="/hotels">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                    <Building2 className="h-4 w-4 mr-1" />
                    Hotéis
                  </button>
                </Link>
                <Link href="/hotels/bookings">
                  <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reservas
                  </button>
                </Link>
                {isHotelSelected && hotelId && (
                  <Link href={`/hotels/${hotelId}/room-types`}>
                    <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                      <Layers className="h-4 w-4 mr-1" />
                      Tipos de Quarto
                    </button>
                  </Link>
                )}
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
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-600 hover:text-gray-900">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Perfil</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo da Página */}
        <main className="py-6 sm:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children || (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Sistema Hoteleiro</h2>
                  <p className="text-gray-600 mb-6">
                    Gerencie seus hotéis, tipos de quarto e reservas de forma eficiente.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/hotels/dashboard">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Ver Dashboard
                      </button>
                    </Link>
                    <Link href="/hotels/create">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Hotel
                      </button>
                    </Link>
                  </div>
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
                © {new Date().getFullYear()} Sistema de Gestão Hoteleira. Todos os direitos reservados.
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