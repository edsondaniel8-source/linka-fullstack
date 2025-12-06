// src/components/hotel-wizard/utils/imageUtils.ts
import { HotelFormData, HotelRoomType, RoomFormData } from '../types';

export const mapRoomsForService = (rooms: RoomFormData[]): HotelRoomType[] => {
  return rooms.map(room => ({
    id: room.id || '',
    name: room.name,
    type: room.type,
    price: room.pricePerNight,
    capacity: room.maxOccupancy,
    quantity: room.quantity,
    description: room.description,
    amenities: room.amenities || [],
    images: Array.isArray(room.images) 
      ? room.images.filter(img => typeof img === 'string')
      : [],
    size: room.size,
    bedType: room.bedType,
    hasBalcony: room.hasBalcony ?? false,
    hasSeaView: room.hasSeaView ?? false
  }));
};

export const separateImages = (formData: HotelFormData) => {
  const fileImages = formData.images?.filter((img: any): img is File => img instanceof File) || [];
  const stringImages = [
    ...(formData.images?.filter((img: any): img is string => typeof img === 'string') || []),
    ...(formData.existingImages || [])
  ];
  
  return {
    fileImages,
    stringImages
  };
};

// 🆕 Preparar FormData para upload (VERSÃO SIMPLIFICADA)
export const prepareImagesForUpload = (formData: HotelFormData): FormData => {
  const formDataToSend = new FormData();
  
  // Separar imagens
  const { fileImages, stringImages } = separateImages(formData);
  
  // Adicionar imagens como arquivos
  fileImages.forEach((file, index) => {
    formDataToSend.append(`images[${index}]`, file);
  });
  
  // Adicionar URLs de imagens existentes
  formDataToSend.append('existingImages', JSON.stringify(stringImages));
  
  return formDataToSend;
};

// 🆕 Converter File para Base64 (para preview no localStorage)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// 🆕 Validar tipo e tamanho da imagem
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato inválido. Use apenas JPG, PNG ou WebP'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Imagem muito grande. Tamanho máximo: 5MB'
    };
  }
  
  return { isValid: true };
};

// ⚠️ REMOVA AS LINHAS ABAIXO - NÃO SÃO NECESSÁRIAS:
// export {
//   mapRoomsForService,
//   separateImages,
//   prepareImagesForUpload,
//   fileToBase64,
//   validateImageFile
// };