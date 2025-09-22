import { Route, Switch } from "wouter";
import { Toaster } from "@/shared/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HotelsHeader from "./components/HotelsHeader";
import HotelsMobileNav from "./components/HotelsMobileNav";
import Home from "./pages/home";

const queryClient = new QueryClient();

export default function HotelsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <HotelsHeader />
        <main className="pb-20 md:pb-0">
          <Switch>
            <Route path="/hotels" component={Home} />
            <Route path="/hotels/*" component={Home} />
            <Route component={Home} />
          </Switch>
        </main>
        
        <HotelsMobileNav />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}