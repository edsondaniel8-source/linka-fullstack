// src/components/hotel-wizard/utils/priceUtils.ts
import { HotelFormData, RoomFormData } from '../types';
import { formatMetical } from '@/shared/utils/currency';

export const calculateAveragePrice = (rooms: RoomFormData[]): string => {
  if (rooms.length === 0) return formatMetical(0);
  
  const total = rooms.reduce((sum, room) => sum + (room.pricePerNight || 0), 0);
  const average = total / rooms.length;
  return formatMetical(Math.round(average));
};

export const calculatePriceRange = (rooms: RoomFormData[]): { min: string; max: string } => {
  if (rooms.length === 0) {
    return { min: formatMetical(0), max: formatMetical(0) };
  }
  
  const prices = rooms.map(room => room.pricePerNight).filter(price => price > 0);
  
  if (prices.length === 0) {
    return { min: formatMetical(0), max: formatMetical(0) };
  }
  
  return {
    min: formatMetical(Math.min(...prices)),
    max: formatMetical(Math.max(...prices))
  };
};

// 🆕 Calcular receita diária potencial
export const calculateDailyRevenue = (rooms: RoomFormData[]): string => {
  if (rooms.length === 0) return formatMetical(0);
  
  const totalRevenue = rooms.reduce((sum, room) => {
    return sum + (room.pricePerNight * room.quantity);
  }, 0);
  
  return formatMetical(Math.round(totalRevenue));
};

// 🆕 Calcular receita mensal estimada (considerando 70% de ocupação)
export const calculateMonthlyRevenue = (rooms: RoomFormData[], occupancyRate = 0.7): string => {
  const dailyRevenue = rooms.reduce((sum, room) => {
    return sum + (room.pricePerNight * room.quantity);
  }, 0);
  
  const monthlyRevenue = dailyRevenue * occupancyRate * 30;
  return formatMetical(Math.round(monthlyRevenue));
};

// 🆕 Obter estatísticas completas de preço
export const getPriceStatistics = (rooms: RoomFormData[]) => {
  const average = calculateAveragePrice(rooms);
  const range = calculatePriceRange(rooms);
  const dailyRevenue = calculateDailyRevenue(rooms);
  const monthlyRevenue = calculateMonthlyRevenue(rooms);
  const totalRooms = rooms.reduce((sum, room) => sum + room.quantity, 0);
  const roomTypes = rooms.length;
  
  return {
    average,
    range,
    dailyRevenue,
    monthlyRevenue,
    totalRooms,
    roomTypes,
    hasRooms: rooms.length > 0
  };
};