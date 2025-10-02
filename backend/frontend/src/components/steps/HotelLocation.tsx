import React from 'react';
import { HotelFormData } from '../hotel-wizard/HotelCreationWizard';

interface HotelLocationProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const HotelLocation: React.FC<HotelLocationProps> = ({
  formData,
  updateFormData
}) => {
  const handleChange = (field: keyof HotelFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateFormData({ [field]: event.target.value });
  };

  // Estilos usando React.CSSProperties
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
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem'
    },
    formField: {
      display: 'flex',
      flexDirection: 'column'
    },
    fullWidth: {
      gridColumn: '1 / -1'
    },
    label: {
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: '#333'
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s'
    },
    inputFocus: {
      borderColor: '#1976d2',
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
    }
  };

  // Função para lidar com o foco dos inputs
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = styles.inputFocus.borderColor as string;
    e.target.style.outline = styles.inputFocus.outline as string;
    e.target.style.boxShadow = styles.inputFocus.boxShadow as string;
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#ddd';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Localização do Hotel</h2>
      
      <p style={styles.description}>
        Informe a localização completa do seu estabelecimento
      </p>

      <div style={styles.formGrid}>
        <div style={{ ...styles.formField, ...styles.fullWidth }}>
          <label htmlFor="address" style={styles.label}>Endereço *</label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={handleChange('address')}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Ex: Av. Paulista, 1000"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formField}>
          <label htmlFor="city" style={styles.label}>Cidade *</label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={handleChange('city')}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Ex: São Paulo"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formField}>
          <label htmlFor="state" style={styles.label}>Estado *</label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={handleChange('state')}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Ex: SP"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formField}>
          <label htmlFor="country" style={styles.label}>País *</label>
          <input
            id="country"
            type="text"
            value={formData.country}
            onChange={handleChange('country')}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Ex: Brasil"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formField}>
          <label htmlFor="zipCode" style={styles.label}>CEP</label>
          <input
            id="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={handleChange('zipCode')}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Ex: 01310-100"
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelLocation;