import React from 'react';
import { HotelFormData } from '../hotel-wizard/HotelCreationWizard';

interface HotelAmenitiesProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const availableAmenities = [
  'Wi-Fi Gratuito',
  'Piscina',
  'Academia',
  'Restaurante',
  'Bar',
  'Estacionamento Gratuito',
  'Ar Condicionado',
  'TV a Cabo',
  'Frigobar',
  'Cofre',
  'Serviço de Quarto',
  'Lavanderia',
  'Business Center',
  'Acesso para Deficientes',
  'Pet Friendly'
];

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '2rem'
  },
  title: {
    marginBottom: '0.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  description: {
    color: '#666',
    marginBottom: '2rem'
  },
  amenitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem'
  },
  amenityItem: {
    display: 'flex',
    alignItems: 'center'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    width: '100%'
  },
  checkbox: {
    marginRight: '0.5rem'
  },
  checkmark: {
    marginRight: '0.5rem'
  }
};

const HotelAmenities: React.FC<HotelAmenitiesProps> = ({
  formData,
  updateFormData
}) => {
  const toggleAmenity = (amenity: string) => {
    const currentAmenities = [...formData.amenities];
    const index = currentAmenities.indexOf(amenity);
    
    if (index > -1) {
      currentAmenities.splice(index, 1);
    } else {
      currentAmenities.push(amenity);
    }
    
    updateFormData({ amenities: currentAmenities });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Comodidades do Hotel</h2>
      
      <p style={styles.description}>
        Selecione as comodidades disponíveis no seu estabelecimento
      </p>

      <div style={styles.amenitiesGrid}>
        {availableAmenities.map((amenity) => (
          <div key={amenity} style={styles.amenityItem}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                style={styles.checkbox}
              />
              <span style={styles.checkmark}></span>
              {amenity}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelAmenities;