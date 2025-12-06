// src/components/steps/HotelImages.tsx
import React, { useCallback, useState } from 'react';
import { HotelImagesProps } from '../hotel-wizard/types';

const HotelImages: React.FC<HotelImagesProps> = ({ 
  formData, 
  updateFormData,
  onNext,
  onBack,
  mode 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = [...(formData.images || []), ...files];
      updateFormData({ images: newImages });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    updateFormData({ images: newImages });
  };

  const handleRemoveExistingImage = (index: number) => {
    const newExistingImages = [...(formData.existingImages || [])];
    newExistingImages.splice(index, 1);
    updateFormData({ existingImages: newExistingImages });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const newImages = [...(formData.images || []), ...files];
      updateFormData({ images: newImages });
    }
  }, [formData.images, updateFormData]);

  const getImageUrl = (image: File | string) => {
    if (typeof image === 'string') {
      return image;
    }
    return URL.createObjectURL(image);
  };

  const totalImages = (formData.images?.length || 0) + (formData.existingImages?.length || 0);

  return (
    <div className="step-images">
      <h3>Imagens do Hotel</h3>
      <p className="step-description">
        Adicione imagens do seu hotel. Use fotos de alta qualidade que mostrem os quartos, áreas comuns, restaurante, etc.
        Recomendamos pelo menos 5 imagens.
      </p>
      
      {/* Área de upload */}
      <div 
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor="image-upload" className="upload-label">
          <div className="upload-icon">📷</div>
          <div className="upload-text">
            <strong>Clique para selecionar imagens</strong>
            <span>ou arraste e solte aqui</span>
          </div>
          <div className="upload-hint">
            Formatos suportados: JPG, PNG, WebP | Tamanho máximo: 5MB por imagem
          </div>
        </label>
      </div>

      {/* Contador de imagens */}
      <div className="images-counter">
        <strong>Total de Imagens:</strong> {totalImages}
        <span className="counter-breakdown">
          (Novas: {formData.images?.length || 0}, Existentes: {formData.existingImages?.length || 0})
        </span>
      </div>

      {/* Grid de imagens */}
      {totalImages > 0 ? (
        <div className="images-grid">
          {/* Imagens existentes (se estiver editando) */}
          {formData.existingImages?.map((image, index) => (
            <div key={`existing-${index}`} className="image-item">
              <img 
                src={image} 
                alt={`Hotel ${index}`}
                className="image-preview"
              />
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(index)}
                className="image-remove"
                title="Remover imagem"
              >
                ×
              </button>
              <div className="image-status">Existente</div>
            </div>
          ))}

          {/* Novas imagens */}
          {formData.images?.map((image, index) => (
            <div key={`new-${index}`} className="image-item">
              <img 
                src={getImageUrl(image)} 
                alt={`Novo ${index}`}
                className="image-preview"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="image-remove"
                title="Remover imagem"
              >
                ×
              </button>
              <div className="image-status">Novo</div>
              {typeof image !== 'string' && (
                <div className="image-info">
                  {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-images">
          <p>Nenhuma imagem adicionada ainda. Adicione pelo menos uma imagem do hotel.</p>
        </div>
      )}

      {/* Dicas */}
      <div className="images-tips">
        <h4>💡 Dicas para boas imagens:</h4>
        <ul>
          <li>Use boa iluminação natural</li>
          <li>Mostre diferentes áreas do hotel</li>
          <li>Inclua fotos dos quartos, banheiros e áreas comuns</li>
          <li>Use imagens em alta resolução</li>
          <li>Evite imagens borradas ou escuras</li>
        </ul>
      </div>

      {/* Botões de navegação */}
      <div className="step-navigation">
        <button
          type="button"
          onClick={onBack}
          className="nav-button nav-button-secondary"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="nav-button nav-button-primary"
          disabled={totalImages === 0}
        >
          {totalImages >= 5 ? 'Excelente! Próximo' : 'Próximo'}
        </button>
      </div>
    </div>
  );
};

export default HotelImages;