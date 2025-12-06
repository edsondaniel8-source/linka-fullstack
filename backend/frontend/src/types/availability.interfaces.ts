// src/types/availability.interfaces.ts

export interface NightlyPrice {
  date: string;                // Data da noite
  base_price: number;          // Preço base por noite
  season_multiplier: number;   // Multiplicador de acordo com a época
  promotion_discount: number;  // Desconto aplicado
  final_price: number;         // Preço final após ajustes
  min_nights: number;          // Número mínimo de noites para esta tarifa
}

export interface AvailabilityCheck {
  available: boolean;                // Disponibilidade geral
  total_price?: number;              // Preço total da reserva
  available_units?: number;          // Número de unidades disponíveis
  min_nights_required?: number;      // Número mínimo de noites exigido
  nightly_prices?: NightlyPrice[];   // Preços detalhados por noite
  room_type?: string | null;         // Tipo de quarto, se aplicável
  check_in?: string;                 // Data de check-in
  check_out?: string;                // Data de check-out
  units?: number;                    // Quantidade de unidades solicitadas
  details?: any;                     // Informações adicionais (opcional)
  message?: string;                  // Mensagem de status ou erro
}
