// src/AppRouter.tsx
import { Route, Switch } from 'wouter';
import SearchRides from './apps/main-app/pages/Rides/search';

// Importar componentes das aplicações
import MainApp from './apps/main-app/App';
import DriversApp from './apps/drivers-app/App';
import AdminApp from './apps/admin-app/App';

// Importar o HotelLayout diretamente
import HotelLayout from './apps/hotels-app/routes'; // Agora exporta default

// Importar páginas individuais
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import NotFoundPage from './pages/not-found';

function AppRouter() {
  return (
    <Switch>
      {/* Rotas de autenticação */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Nova rota para pesquisa de viagens */}
      <Route path="/rides/search" component={SearchRides} />
      
      {/* ⭐⭐ Rotas do HotelsApp - Agora usa HotelLayout diretamente */}
      <Route path="/hotels/:rest*">
        <HotelLayout />
      </Route>
      <Route path="/hotels">
        <HotelLayout />
      </Route>
      
      {/* Rotas das outras aplicações */}
      <Route path="/drivers" component={DriversApp} />
      <Route path="/drivers/:rest*" component={DriversApp} />
      
      <Route path="/admin" component={AdminApp} />
      <Route path="/admin/:rest*" component={AdminApp} />
      
      {/* Todas as outras rotas vão para a aplicação principal */}
      <Route path="/:rest*" component={MainApp} />
      <Route path="/" component={MainApp} />
      
      {/* Rota 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default AppRouter;