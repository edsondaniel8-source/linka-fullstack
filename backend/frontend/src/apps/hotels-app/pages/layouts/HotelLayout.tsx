// src/apps/hotels-app/pages/layouts/HotelLayout.tsx
import React from 'react';
import { Link, Switch, Route } from 'wouter';
import { HotelIcon, Home, Settings, HelpCircle } from 'lucide-react';

// Importar as páginas
import HotelsDashboard from '../dashboard/HotelDashboard';
import HotelCreatePage from '../create/HotelCreatePage';
import RoomCreatePage from '../[hotelId]/rooms/create/RoomCreatePage';
import AvailabilityPage from '../[hotelId]/availability/AvailabilityPage';

// Componente para renderizar o conteúdo baseado na rota
function HotelContent() {
  return (
    <Switch>
      <Route path="/hotels/dashboard" component={HotelsDashboard} />
      <Route path="/hotels/create" component={HotelCreatePage} />
      <Route path="/hotels/:hotelId/rooms/create" component={RoomCreatePage} />
      <Route path="/hotels/:hotelId/availability" component={AvailabilityPage} />
      <Route path="/hotels" component={HotelsDashboard} />
      
      {/* Fallback para páginas não encontradas */}
      <Route>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
          <p className="text-gray-600">Esta página não existe no sistema de gestão hoteleira.</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function HotelLayout() {
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
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <li>
                    <Link href="/hotels/dashboard">
                      <a className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                        Dashboard
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/hotels/create">
                      <a className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                        Criar Hotel
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/hotels/bookings">
                      <a className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                        Reservas
                      </a>
                    </Link>
                  </li>
                  <li>
                    <Link href="/hotels/settings">
                      <a className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                        Configurações
                      </a>
                    </Link>
                  </li>
                </ul>
              </li>
              <li className="mt-auto">
                <Link href="/">
                  <a className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                    <Home className="h-5 w-5 shrink-0" />
                    Voltar ao Site
                  </a>
                </Link>
                <Link href="/hotels/help">
                  <a className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                    <HelpCircle className="h-5 w-5 shrink-0" />
                    Ajuda
                  </a>
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
                <HotelIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-gray-900">
                Sistema de Gestão Hoteleira
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo da Página */}
        <main className="py-6 sm:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <HotelContent />
          </div>
        </main>
      </div>
    </div>
  );
}