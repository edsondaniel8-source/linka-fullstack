import { Route, Switch } from "wouter";  
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/components/ui/toaster";
import HotelsHeader from "./components/HotelsHeader";
import HotelsMobileNav from "./components/HotelsMobileNav";
import Home from "./pages/home";
import HotelCreationWizardPage from "./pages/hotel-creation-wizard";
import RoomEdit from "./pages/rooms/RoomEdit";
import RoomDetails from "./pages/rooms/RoomDetails";
import RoomConfigure from "./pages/rooms/RoomConfigure";
import RoomList from "./pages/rooms/RoomList"; // Importação da lista de quartos

const queryClient = new QueryClient();

export default function HotelsApp() {
  // TODO: substituir "123" pelo ID real do hotel selecionado dinamicamente
  const accommodationId = "123"; 

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <HotelsHeader />
        <main className="pb-20 md:pb-0">
          <Switch>
            {/* Rota de criação de hotel */}
            <Route path="/hotels/create" component={HotelCreationWizardPage} />

            {/* Rotas de quartos */}
            <Route path="/rooms" component={() => <RoomList accommodationId={accommodationId} />} />
            <Route path="/rooms/edit/:roomId" component={RoomEdit} />
            <Route path="/rooms/details/:roomId" component={RoomDetails} />
            <Route
              path="/rooms/configure/:roomId?"
              component={() => <RoomConfigure accommodationId={accommodationId} />}
            />

            {/* Rotas principais de hotéis */}
            <Route path="/hotels" component={Home} />
            <Route path="/hotels/*" component={Home} />

            {/* Rota fallback */}
            <Route component={Home} />
          </Switch>
        </main>

        <HotelsMobileNav />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}