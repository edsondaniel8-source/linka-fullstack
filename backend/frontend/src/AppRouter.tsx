// src/AppRouter.tsx - VERSÃO CORRIGIDA
import { Route, Switch } from 'wouter';
import SearchRides from './apps/main-app/pages/Rides/search';
import MainApp from './apps/main-app/App';
import DriversApp from './apps/drivers-app/App';
import AdminApp from './apps/admin-app/App';
import HotelRoutes from './apps/hotels-app/HotelRoutes';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import NotFoundPage from './pages/not-found';

function AppRouter() {
  console.log('🔀 AppRouter - Path:', window.location.pathname);
  console.log('🏨 AppRouter - Verificando rota /hotels...');
  
  return (
    <Switch>
      {/* 1. Rotas específicas */}
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/rides/search" component={SearchRides} />
      
      {/* 2. APLICAÇÃO HOTELS - CORRIGIDO! */}
      {/* Rota para /hotels exato */}
      <Route path="/hotels">
        {() => {
          console.log('✅ Rota /hotels capturada no AppRouter');
          return <HotelRoutes />;
        }}
      </Route>
      
      {/* Rota para /hotels/* (todas as sub-rotas) */}
      <Route path="/hotels/*">
        {() => {
          console.log('✅ Hotels app capturou tudo sob /hotels/*');
          return <HotelRoutes />;
        }}
      </Route>
      
      {/* 3. Outras aplicações */}
      <Route path="/drivers/*" component={DriversApp} />
      <Route path="/drivers" component={DriversApp} />
      
      <Route path="/admin/*" component={AdminApp} />
      <Route path="/admin" component={AdminApp} />
      
      {/* 4. Aplicação principal */}
      <Route path="/:rest*" component={MainApp} />
      <Route path="/" component={MainApp} />
      
      {/* 5. 404 */}
      <Route component={NotFoundPage} />
    </Switch>
  );
}

export default AppRouter;