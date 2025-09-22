import { useState } from 'react';

export interface RideSearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
}

export interface HotelSearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export interface RideCreateParams {
  from?: string;
  to?: string;
  date?: string;
  seats?: number;
  price?: number;
}

export interface ModalState {
  rideSearch: {
    isOpen: boolean;
    params: RideSearchParams;
  };
  rideCreate: {
    isOpen: boolean;
    params: RideCreateParams;
  };
  hotelSearch: {
    isOpen: boolean;
    params: HotelSearchParams;
  };
  hotelBooking: {
    isOpen: boolean;
    params: any;
  };
}

const initialModalState: ModalState = {
  rideSearch: { isOpen: false, params: {} },
  rideCreate: { isOpen: false, params: {} },
  hotelSearch: { isOpen: false, params: {} },
  hotelBooking: { isOpen: false, params: {} },
};

export function useModalState() {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const openRideSearch = (params: RideSearchParams = {}) => {
    console.log('🔍 [useModalState] openRideSearch params:', params); // ← LOG ADICIONADO
    console.log('🔍 [useModalState] Tipo dos params:', typeof params); // ← LOG ADICIONADO
    setModalState(prev => ({
      ...prev,
      rideSearch: { isOpen: true, params }
    }));
  };

  const closeRideSearch = () => {
    setModalState(prev => ({
      ...prev,
      rideSearch: { isOpen: false, params: {} }
    }));
  };

  const openRideCreate = (params: RideCreateParams = {}) => {
    setModalState(prev => ({
      ...prev,
      rideCreate: { isOpen: true, params }
    }));
  };

  const closeRideCreate = () => {
    setModalState(prev => ({
      ...prev,
      rideCreate: { isOpen: false, params: {} }
    }));
  };

  const openHotelSearch = (params: HotelSearchParams = {}) => {
    setModalState(prev => ({
      ...prev,
      hotelSearch: { isOpen: true, params }
    }));
  };

  const closeHotelSearch = () => {
    setModalState(prev => ({
      ...prev,
      hotelSearch: { isOpen: false, params: {} }
    }));
  };

  const openHotelBooking = (params: any = {}) => {
    setModalState(prev => ({
      ...prev,
      hotelBooking: { isOpen: true, params }
    }));
  };

  const closeHotelBooking = () => {
    setModalState(prev => ({
      ...prev,
      hotelBooking: { isOpen: false, params: {} }
    }));
  };

  const closeAllModals = () => {
    setModalState(initialModalState);
  };

  return {
    modalState,
    openRideSearch,
    closeRideSearch,
    openRideCreate,
    closeRideCreate,
    openHotelSearch,
    closeHotelSearch,
    openHotelBooking,
    closeHotelBooking,
    closeAllModals,
  };
}