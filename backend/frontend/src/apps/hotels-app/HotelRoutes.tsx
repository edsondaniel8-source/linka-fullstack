// src/apps/hotels-app/HotelRoutes.tsx
import { Route, Switch } from 'wouter';
import HotelLayout from './pages/layouts/HotelLayout';

// Importar todas as páginas
import HotelsDashboard from './pages/dashboard/HotelDashboard';
import HotelsHome from './pages/home';
import HotelCreatePage from './pages/create/HotelCreatePage';
import HotelEditPage from './pages/[hotelId]/edit/HotelEditPage';
import RoomListPage from './pages/[hotelId]/rooms/RoomListPage';
import RoomCreatePage from './pages/[hotelId]/rooms/create/RoomCreatePage';
import RoomEditPage from './pages/[hotelId]/rooms/edit/RoomEditPage';
import RoomDetailsPage from './pages/[hotelId]/rooms/[roomId]/RoomDetailsPage';
import AvailabilityPage from './pages/[hotelId]/availability/AvailabilityPage';
import BookingListPage from './pages/bookings/BookingListPage';
import BookingDetailsPage from './pages/bookings/[bookingId]/BookingDetailsPage';
import BookingCreatePage from './pages/bookings/create/BookingCreatePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import ReportsPage from './pages/analytics/ReportsPage';
import HotelSettingsPage from './pages/settings/HotelSettingsPage';
import AccountSettingsPage from './pages/settings/AccountSettingsPage';
import BillingPage from './pages/settings/BillingPage';

// Componente wrapper que combina layout + conteúdo
function HotelPageWrapper({ children }: { children: React.ReactNode }) {
  return <HotelLayout>{children}</HotelLayout>;
}

export default function HotelRoutes() {
  return (
    <Switch>
      {/* Rotas Principais */}
      <Route path="/hotels/dashboard">
        <HotelPageWrapper>
          <HotelsDashboard />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/create">
        <HotelPageWrapper>
          <HotelCreatePage />
        </HotelPageWrapper>
      </Route>
      
      {/* Gestão de Reservas */}
      <Route path="/hotels/bookings">
        <HotelPageWrapper>
          <BookingListPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/bookings/create">
        <HotelPageWrapper>
          <BookingCreatePage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/bookings/:bookingId">
        {(params) => (
          <HotelPageWrapper>
            <BookingDetailsPage />
          </HotelPageWrapper>
        )}
      </Route>
      
      {/* Análises e Relatórios */}
      <Route path="/hotels/analytics">
        <HotelPageWrapper>
          <AnalyticsPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/reports">
        <HotelPageWrapper>
          <ReportsPage />
        </HotelPageWrapper>
      </Route>
      
      {/* Configurações */}
      <Route path="/hotels/settings">
        <HotelPageWrapper>
          <HotelSettingsPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/settings/account">
        <HotelPageWrapper>
          <AccountSettingsPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/settings/billing">
        <HotelPageWrapper>
          <BillingPage />
        </HotelPageWrapper>
      </Route>
      
      {/* Rotas com hotelId */}
      <Route path="/hotels/:hotelId/edit">
        <HotelPageWrapper>
          <HotelEditPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/:hotelId/rooms">
        <HotelPageWrapper>
          <RoomListPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/:hotelId/rooms/create">
        <HotelPageWrapper>
          <RoomCreatePage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/:hotelId/rooms/:roomId/edit">
        <HotelPageWrapper>
          <RoomEditPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/:hotelId/rooms/:roomId">
        <HotelPageWrapper>
          <RoomDetailsPage />
        </HotelPageWrapper>
      </Route>
      
      <Route path="/hotels/:hotelId/availability">
        <HotelPageWrapper>
          <AvailabilityPage />
        </HotelPageWrapper>
      </Route>
      
      {/* Rota padrão - Página inicial */}
      <Route path="/hotels">
        <HotelPageWrapper>
          <HotelsHome />
        </HotelPageWrapper>
      </Route>
      
      {/* Fallback - qualquer outra rota dentro de /hotels */}
      <Route path="/hotels/:rest*">
        <HotelPageWrapper>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
            <p className="text-gray-600">Esta rota não existe no sistema de gestão hoteleira.</p>
          </div>
        </HotelPageWrapper>
      </Route>
    </Switch>
  );
}