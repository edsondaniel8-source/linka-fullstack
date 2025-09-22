import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import DateInput from "@/components/DateInput";
import { getTodayHTML } from "@/shared/lib/dateUtils";

const rideSearchSchema = z.object({
  from: z.string().min(1, "Local de recolha é obrigatório"),
  to: z.string().min(1, "Destino é obrigatório"),
  when: z.string().min(1, "Data e hora são obrigatórias"),
  passengers: z.number().min(1, "Número de passageiros é obrigatório").max(8, "Máximo 8 passageiros"),
});

type RideSearchForm = z.infer<typeof rideSearchSchema>;

interface RideSearchProps {
  onSearch: (params: RideSearchForm & { transportType?: string }) => void;
}

export default function RideSearch({ onSearch }: RideSearchProps) {
  const [selectedTransportType, setSelectedTransportType] = useState("todos");
  
  const form = useForm<RideSearchForm>({
    resolver: zodResolver(rideSearchSchema),
    defaultValues: {
      from: "",
      to: "",
      when: getTodayHTML(),
      passengers: 1,
    },
  });

  const handleSubmit = (data: RideSearchForm) => {
    onSearch({ ...data, transportType: selectedTransportType });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-dark mb-8 text-center">Para onde você quer ir?</h2>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <Label htmlFor="from" className="block text-sm font-medium text-gray-medium mb-2">
              Saindo de
            </Label>
            <LocationAutocomplete
              id="from"
              placeholder="Local de recolha"
              value={form.watch("from")}
              onChange={(value) => form.setValue("from", value)}
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-pickup-location"
            />
            {form.formState.errors.from && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.from.message}</p>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Label htmlFor="to" className="block text-sm font-medium text-gray-medium mb-2">
              Indo para
            </Label>
            <LocationAutocomplete
              id="to"
              placeholder="Destino"
              value={form.watch("to")}
              onChange={(value) => form.setValue("to", value)}
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-destination"
            />
            {form.formState.errors.to && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.to.message}</p>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Label htmlFor="when" className="block text-sm font-medium text-gray-medium mb-2">
              Quando
            </Label>
            <div className="relative">
              <i className="fas fa-calendar absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <DateInput
                id="when"
                data-testid="input-pickup-date"
                value={form.watch("when")}
                onChange={(value) => form.setValue("when", value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {form.formState.errors.when && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.when.message}</p>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Label htmlFor="passengers" className="block text-sm font-medium text-gray-medium mb-2">
              Passageiros
            </Label>
            <Select
              value={String(form.watch("passengers"))}
              onValueChange={(value) => form.setValue("passengers", parseInt(value))}
            >
              <SelectTrigger data-testid="select-passengers">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} {num === 1 ? 'passageiro' : 'passageiros'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.passengers && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.passengers.message}</p>
            )}
          </div>
          
          <div className="lg:col-span-1 flex items-end">
            <Button
              type="submit"
              data-testid="button-search-rides"
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              disabled={form.formState.isSubmitting}
            >
              <i className="fas fa-search mr-2"></i>Procurar Viagens
            </Button>
          </div>
        </form>

        {/* Transportation Categories */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-dark mb-4 text-center">Tipo de Transporte</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div 
              onClick={() => setSelectedTransportType("todos")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedTransportType === "todos" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="transport-todos"
            >
              <div className="text-center">
                <i className={`fas fa-list text-3xl mb-3 ${
                  selectedTransportType === "todos" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedTransportType === "todos" ? "text-white" : "text-dark"
                }`}>Todos</h4>
                <p className={`text-sm mt-2 ${
                  selectedTransportType === "todos" ? "text-white/80" : "text-gray-medium"
                }`}>Todas as opções</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedTransportType("aereo")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedTransportType === "aereo" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="transport-aereo"
            >
              <div className="text-center">
                <i className={`fas fa-plane text-3xl mb-3 ${
                  selectedTransportType === "aereo" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedTransportType === "aereo" ? "text-white" : "text-dark"
                }`}>Transporte Aéreo</h4>
                <p className={`text-sm mt-2 ${
                  selectedTransportType === "aereo" ? "text-white/80" : "text-gray-medium"
                }`}>Voos domésticos</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedTransportType("ferroviario")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedTransportType === "ferroviario" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="transport-ferroviario"
            >
              <div className="text-center">
                <i className={`fas fa-train text-3xl mb-3 ${
                  selectedTransportType === "ferroviario" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedTransportType === "ferroviario" ? "text-white" : "text-dark"
                }`}>Transporte Ferroviário</h4>
                <p className={`text-sm mt-2 ${
                  selectedTransportType === "ferroviario" ? "text-white/80" : "text-gray-medium"
                }`}>Comboios</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedTransportType("carros")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedTransportType === "carros" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="transport-carros"
            >
              <div className="text-center">
                <i className={`fas fa-car text-3xl mb-3 ${
                  selectedTransportType === "carros" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedTransportType === "carros" ? "text-white" : "text-dark"
                }`}>Carros Particulares</h4>
                <p className={`text-sm mt-2 ${
                  selectedTransportType === "carros" ? "text-white/80" : "text-gray-medium"
                }`}>Carros particulares</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}