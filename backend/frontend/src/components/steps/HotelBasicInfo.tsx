import React from 'react';
import { HotelFormData } from '../hotel-wizard/HotelCreationWizard';

interface HotelBasicInfoProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const categories = [
  { value: 'budget', label: 'Econômico' },
  { value: 'standard', label: 'Standard' },
  { value: 'luxury', label: 'Luxo' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'resort', label: 'Resort' }
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
    fontWeight: 'bold'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit'
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white'
  }
};

const HotelBasicInfo: React.FC<HotelBasicInfoProps> = ({
  formData,
  updateFormData
}) => {
  const handleChange = (field: keyof HotelFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    updateFormData({ [field]: event.target.value });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Informações Básicas do Hotel</h2>
      
      <p style={styles.description}>
        Forneça as informações fundamentais do seu estabelecimento
      </p>

      <div style={styles.formGrid}>
        <div style={styles.formField}>
          <label htmlFor="name" style={styles.label}>Nome do Hotel *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="Ex: Hotel Praia Dourada"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.formField, ...styles.fullWidth }}>
          <label htmlFor="description" style={styles.label}>Descrição</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Descreva as características e serviços do seu hotel..."
            style={styles.textarea}
          />
        </div>

        <div style={styles.formField}>
          <label htmlFor="category" style={styles.label}>Categoria *</label>
          <select
            id="category"
            value={formData.category}
            onChange={handleChange('category')}
            style={styles.select}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formField}>
          <label htmlFor="phone" style={styles.label}>Telefone</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="(11) 99999-9999"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.formField, ...styles.fullWidth }}>
          <label htmlFor="email" style={styles.label}>Email *</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="contato@hotel.com"
            style={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelBasicInfo;