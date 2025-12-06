/**
 * Hook para busca de hotéis usando apenas API v2 - VERSÃO CORRIGIDA
 */

import { useState, useCallback } from 'react';
import { apiService } from '../../services/api';  // ✅ CORREÇÃO: Caminho correto

// Importar tipos do arquivo centralizado
import type { 
  Hotel as ApiHotel, 
  SearchParams,
  HotelSearchResponse 
} from '../../types/index';  // ✅ Usando os tipos já definidos

// ---------------------------
// Tipos para o Hook
// ---------------------------

// Tipo usado pela app (pode usar diretamente o tipo ApiHotel)
export type Hotel = ApiHotel;

// Parâmetros de busca (usa SearchParams já definido)
export type SearchParamsV2 = SearchParams;

// Resultado do hook
export interface SearchResult {
  success: boolean;
  data: Hotel[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  source: 'v2';
  error?: string;
  filters_applied?: any;
}

// ---------------------------
// Função auxiliar para normalizar dados (se necessário)
// ---------------------------
function normalizeHotelData(apiHotel: ApiHotel): Hotel {
  // ✅ O tipo Hotel já é ApiHotel, então pode retornar diretamente
  // Apenas garante que os campos obrigatórios existam
  return {
    ...apiHotel,
    // Garantir campos obrigatórios
    id: apiHotel.id || apiHotel.hotel_id || '',
    name: apiHotel.name || apiHotel.hotel_name || '',
    address: apiHotel.address || '',
    locality: apiHotel.locality || '',
    province: apiHotel.province || '',
    contact_email: apiHotel.contact_email || ''
  };
}

// ---------------------------
// Hook principal
// ---------------------------
export function useHotelSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParamsV2 | null>(null);

  const search = useCallback(async (params: SearchParamsV2) => {
    setLoading(true);
    setError(null);
    setLastSearchParams(params);

    try {
      console.log('🔍 Buscando hotéis via apiService com params:', params);

      // Usar apiService.searchHotels() para buscar hotéis
      // ✅ Tipagem correta: params é SearchParams
      const result = await apiService.searchHotels(params);

      console.log('✅ Resposta da busca de hotéis:', result);

      // Inicializar variáveis
      let hotelsData: ApiHotel[] = [];
      let success = false;
      let count = 0;
      let total = 0;
      let page = 1;
      let limit = params.limit || 20;
      let filters_applied = null;

      // Processar resposta da API
      if (result.success) {
        // Formato padrão: { success: true, data: Hotel[], count: number, ... }
        hotelsData = result.data || [];
        success = true;
        count = result.count || hotelsData.length;
        total = result.total || count;
        page = result.page || 1;
        limit = result.limit || limit;
        filters_applied = result.filters_applied;
        
        // Se não tem data, tentar hotels
        if (hotelsData.length === 0 && result.hotels) {
          hotelsData = result.hotels;
        }
      } else {
        // API retornou erro
        success = false;
        hotelsData = [];
      }

      // Normalizar dados (garantir estrutura consistente)
      const normalizedData: Hotel[] = hotelsData.map(normalizeHotelData);

      const searchResult: SearchResult = {
        success,
        data: normalizedData,
        count,
        total,
        page,
        limit,
        source: 'v2',
        error: result.error,
        filters_applied
      };

      setResults(searchResult);
      return searchResult;
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro desconhecido na busca de hotéis';
      console.error('❌ Erro na busca de hotéis:', err);

      setError(errorMsg);
      const errorResult: SearchResult = {
        success: false,
        data: [],
        count: 0,
        source: 'v2',
        error: errorMsg
      };
      setResults(errorResult);

      return errorResult;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (lastSearchParams) return search(lastSearchParams);
    return Promise.resolve(null);
  }, [lastSearchParams, search]);

  return { search, refetch, loading, error, results, lastSearchParams };
}

// ---------------------------
// Hook lazy (sem estado)
// ---------------------------
export function useHotelSearchLazy() {
  const search = useCallback(async (params: SearchParamsV2) => {
    console.log('🔍 Busca lazy de hotéis via apiService:', params);
    
    try {
      // ✅ Tipagem correta
      const result = await apiService.searchHotels(params);

      // Inicializar variáveis
      let hotelsData: ApiHotel[] = [];
      let success = false;
      let count = 0;
      let total = 0;
      let page = 1;
      let limit = params.limit || 20;
      let filters_applied = null;

      // Processar resposta da API
      if (result.success) {
        hotelsData = result.data || [];
        success = true;
        count = result.count || hotelsData.length;
        total = result.total || count;
        page = result.page || 1;
        limit = result.limit || limit;
        filters_applied = result.filters_applied;
        
        // Se não tem data, tentar hotels
        if (hotelsData.length === 0 && result.hotels) {
          hotelsData = result.hotels;
        }
      } else {
        success = false;
        hotelsData = [];
      }

      // Normalizar dados
      const normalizedData: Hotel[] = hotelsData.map(normalizeHotelData);

      return {
        success,
        data: normalizedData,
        count,
        total,
        page,
        limit,
        source: 'v2' as const,
        error: result.error,
        filters_applied
      } as SearchResult;
    } catch (err: any) {
      console.error('❌ Erro na busca lazy de hotéis:', err);
      return {
        success: false,
        data: [],
        count: 0,
        source: 'v2' as const,
        error: err?.message || 'Erro na busca de hotéis'
      } as SearchResult;
    }
  }, []);

  return { search };
}

// ---------------------------
// Exportação de tipos úteis
// ---------------------------
export type { 
  ApiHotel, 
  SearchParams,
  HotelSearchResponse 
};