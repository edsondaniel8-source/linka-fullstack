// src/shared/lib/accommodationService.ts
import api from './api';

export const accommodationService = {
  // Criar hotel - aceita qualquer tipo de dados
  async createHotel(data: any): Promise<any> {
    try {
      if (data instanceof FormData) {
        // Enviar como FormData
        const response = await api.post('/hotels', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        // Enviar como JSON
        const response = await api.post('/hotels', data);
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao criar hotel:', error);
      throw error;
    }
  },

  // Atualizar hotel - aceita qualquer tipo de dados
  async updateHotel(id: string, data: any): Promise<any> {
    try {
      if (data instanceof FormData) {
        // Adicionar método PUT ao FormData
        data.append('_method', 'PUT');
        const response = await api.post(`/hotels/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } else {
        const response = await api.put(`/hotels/${id}`, data);
        return response.data;
      }
    } catch (error) {
      console.error('Erro ao atualizar hotel:', error);
      throw error;
    }
  },

  // Outros métodos do serviço...
  async getHotelById(id: string): Promise<any> {
    try {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar hotel:', error);
      throw error;
    }
  },

  async deleteHotel(id: string): Promise<void> {
    try {
      await api.delete(`/hotels/${id}`);
    } catch (error) {
      console.error('Erro ao deletar hotel:', error);
      throw error;
    }
  },

  // 🆕 Método para fazer upload de imagens separadamente
  async uploadHotelImages(hotelId: string, images: File[]): Promise<any> {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
      
      const response = await api.post(`/hotels/${hotelId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload de imagens:', error);
      throw error;
    }
  }
};