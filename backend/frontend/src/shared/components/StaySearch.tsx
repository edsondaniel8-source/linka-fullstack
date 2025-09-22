import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import DateInput from "@/components/DateInput";
import { getTodayHTML, formatDateToHTML } from "@/shared/lib/dateUtils";

const staySearchSchema = z.object({
  location: z.string().min(1, "Local é obrigatório"),
  checkIn: z.string().min(1, "Data de entrada é obrigatória"),
  checkOut: z.string().min(1, "Data de saída é obrigatória"),
  guests: z.number().min(1, "Número de hóspedes é obrigatório").max(16, "Máximo 16 hóspedes"),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: "Data de saída deve ser posterior à data de entrada",
  path: ["checkOut"],
});

type StaySearchForm = z.infer<typeof staySearchSchema>;

interface StaySearchProps {
  onSearch: (params: StaySearchForm & { accommodationType?: string }) => void;
}

export default function StaySearch({ onSearch }: StaySearchProps) {
  const [selectedAccommodationType, setSelectedAccommodationType] = useState("todos");
  
  const form = useForm<StaySearchForm>({
    resolver: zodResolver(staySearchSchema),
    defaultValues: {
      location: "",
      checkIn: getTodayHTML(),
      checkOut: formatDateToHTML(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
      guests: 2,
    },
  });

  const handleSubmit = (data: StaySearchForm) => {
    onSearch({ ...data, accommodationType: selectedAccommodationType });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-dark mb-8 text-center">Encontre sua próxima hospedagem</h2>
      
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-medium mb-2">
              Onde
            </Label>
            <LocationAutocomplete
              id="location"
              placeholder="Pesquisar destinos"
              value={form.watch("location")}
              onChange={(value) => form.setValue("location", value)}
              className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              data-testid="input-search-location"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Label htmlFor="checkIn" className="block text-sm font-medium text-gray-medium mb-2">
              Entrada
            </Label>
            <DateInput
              id="checkIn"
              data-testid="input-checkin-date"
              value={form.watch("checkIn")}
              onChange={(value) => form.setValue("checkIn", value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {form.formState.errors.checkIn && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.checkIn.message}</p>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Label htmlFor="checkOut" className="block text-sm font-medium text-gray-medium mb-2">
              Saída
            </Label>
            <DateInput
              id="checkOut"
              data-testid="input-checkout-date"
              value={form.watch("checkOut")}
              onChange={(value) => form.setValue("checkOut", value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {form.formState.errors.checkOut && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.checkOut.message}</p>
            )}
          </div>
          
          <div className="md:col-span-1">
            <Label htmlFor="guests" className="block text-sm font-medium text-gray-medium mb-2">
              Hóspedes
            </Label>
            <Select
              value={String(form.watch("guests"))}
              onValueChange={(value) => form.setValue("guests", parseInt(value))}
            >
              <SelectTrigger data-testid="select-guests">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} {num === 1 ? 'hóspede' : 'hóspedes'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.guests && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.guests.message}</p>
            )}
          </div>
          
          <div className="md:col-span-1 flex items-end">
            <Button
              type="submit"
              data-testid="button-search-stays"
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              disabled={form.formState.isSubmitting}
            >
              <i className="fas fa-search mr-2"></i>Pesquisar
            </Button>
          </div>
        </form>

        {/* Accommodation Categories */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-dark mb-4 text-center">Tipo de Hospedagem</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setSelectedAccommodationType("todos")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedAccommodationType === "todos" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="accommodation-todos"
            >
              <div className="text-center">
                <i className={`fas fa-list text-3xl mb-3 ${
                  selectedAccommodationType === "todos" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedAccommodationType === "todos" ? "text-white" : "text-dark"
                }`}>Todos</h4>
                <p className={`text-sm mt-2 ${
                  selectedAccommodationType === "todos" ? "text-white/80" : "text-gray-medium"
                }`}>Todas as opções</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedAccommodationType("hoteis")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedAccommodationType === "hoteis" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="accommodation-hoteis"
            >
              <div className="text-center">
                <i className={`fas fa-hotel text-3xl mb-3 ${
                  selectedAccommodationType === "hoteis" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedAccommodationType === "hoteis" ? "text-white" : "text-dark"
                }`}>Hotéis</h4>
                <p className={`text-sm mt-2 ${
                  selectedAccommodationType === "hoteis" ? "text-white/80" : "text-gray-medium"
                }`}>Hotéis e resorts</p>
              </div>
            </div>

            <div 
              onClick={() => setSelectedAccommodationType("particulares")}
              className={`cursor-pointer rounded-xl p-6 transition-all duration-200 ${
                selectedAccommodationType === "particulares" 
                  ? "bg-primary text-white shadow-lg transform scale-105" 
                  : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/30"
              }`}
              data-testid="accommodation-particulares"
            >
              <div className="text-center">
                <i className={`fas fa-home text-3xl mb-3 ${
                  selectedAccommodationType === "particulares" ? "text-white" : "text-primary"
                }`}></i>
                <h4 className={`font-semibold text-lg ${
                  selectedAccommodationType === "particulares" ? "text-white" : "text-dark"
                }`}>Acomodações Particulares</h4>
                <p className={`text-sm mt-2 ${
                  selectedAccommodationType === "particulares" ? "text-white/80" : "text-gray-medium"
                }`}>Casas e apartamentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}