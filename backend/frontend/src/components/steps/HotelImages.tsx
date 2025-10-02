import React from 'react';
import { HotelFormData } from '../hotel-wizard/HotelCreationWizard';

interface HotelImagesProps {
  formData: HotelFormData;
  updateFormData: (data: Partial<HotelFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const HotelImages: React.FC<HotelImagesProps> = ({
  formData,
  updateFormData
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      updateFormData({ images: [...formData.images, ...newImages] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
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
    uploadSection: {
      marginBottom: '2rem'
    },
    uploadLabel: {
      display: 'block',
      border: '2px dashed #ddd',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'border-color 0.3s'
    },
    uploadLabelHover: {
      borderColor: '#1976d2'
    },
    uploadContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    uploadIcon: {
      fontSize: '2rem',
      color: '#1976d2',
      display: 'block',
      marginBottom: '0.5rem'
    },
    uploadText: {
      margin: '0.25rem 0'
    },
    uploadSubtext: {
      fontSize: '0.875rem',
      color: '#666',
      margin: 0
    },
    imagesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    imageItem: {
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    imagePreview: {
      width: '100%',
      height: '150px',
      objectFit: 'cover',
      borderRadius: '8px'
    },
    removeImageButton: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      fontWeight: 'bold'
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
      padding: '2rem'
    },
    hiddenInput: {
      display: 'none'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Imagens do Hotel</h2>
      
      <p style={styles.description}>
        Adicione fotos do seu estabelecimento para atrair mais hóspedes
      </p>

      <div style={styles.uploadSection}>
        <label 
          htmlFor="image-upload" 
          style={styles.uploadLabel}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = styles.uploadLabelHover.borderColor as string;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ddd';
          }}
        >
          <div style={styles.uploadContent}>
            <span style={styles.uploadIcon}>+</span>
            <p style={styles.uploadText}>Clique para adicionar imagens</p>
            <small style={styles.uploadSubtext}>
              Formatos suportados: JPG, PNG, WEBP (Máx. 5MB cada)
            </small>
          </div>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            style={styles.hiddenInput}
          />
        </label>
      </div>

      {formData.images.length > 0 ? (
        <div style={styles.imagesGrid}>
          {formData.images.map((image, index) => (
            <div key={index} style={styles.imageItem}>
              <img
                src={URL.createObjectURL(image)}
                alt={`Hotel image ${index + 1}`}
                style={styles.imagePreview}
              />
              <button
                onClick={() => removeImage(index)}
                style={styles.removeImageButton}
                title="Remover imagem"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>Nenhuma imagem adicionada ainda.</p>
        </div>
      )}
    </div>
  );
};

export default HotelImages;