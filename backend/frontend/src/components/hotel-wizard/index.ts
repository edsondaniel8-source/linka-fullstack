// src/components/hotel-wizard/index.ts
export { default } from './HotelCreationWizard';
export type {
  HotelFormData,
  HotelRoomType,
  RoomFormData,
  HotelCreationWizardProps,
  HotelBasicInfoProps,
  HotelLocationProps,
  HotelAmenitiesProps,
  HotelRoomsProps,
  HotelImagesProps,
  ReviewAndSubmitProps
} from './types';

export { useHotelForm } from './hooks/useHotelForm';
export { useStepNavigation } from './hooks/useStepNavigation';