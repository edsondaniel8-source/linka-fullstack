// src/components/hotel-wizard/HotelCreationWizard.tsx
import React, { useState, useEffect } from 'react';

// Importar hooks
import { useHotelForm } from './hooks/useHotelForm';
import { useStepNavigation } from './hooks/useStepNavigation';

// Importar componentes das etapas
import HotelBasicInfo from '../steps/HotelBasicInfo';
import HotelLocation from '../steps/HotelLocation';
import HotelAmenities from '../steps/HotelAmenities';
import HotelRooms from '../steps/HotelRooms';
import HotelImages from '../steps/HotelImages';
import ReviewAndSubmit from '../steps/ReviewAndSubmit';

// Importar componentes do wizard
import { Stepper } from './components/Stepper';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ModeBadge } from './components/ModeBadge';
import { PriceStatistics } from './components/PriceStatistics';

// Importar tipos
import { HotelCreationWizardProps } from './types';

// Importar estilos
import './styles/HotelWizard.css';

const steps = [
  'Informações Básicas',
  'Localização',
  'Comodidades',
  'Quartos',
  'Imagens',
  'Revisão'
];

const HotelCreationWizard: React.FC<HotelCreationWizardProps> = ({
  open,
  onSuccess,
  onCancel,
  mode = 'create',
  initialData,
  hotelId,
  autoSave = true
}) => {
  // Estado para notificações de auto-save
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Hooks
  const {
    formData,
    updateFormData,
    isSubmitting,
    isLoading,
    error,
    success,
    isDirty,
    completedSteps,
    validateCurrentStep,
    validateAllSteps,
    submitForm,
    saveDraft,
    clearDraft,
    markStepAsCompleted,
    unmarkStepAsCompleted,
    reset: resetForm
  } = useHotelForm({ 
    mode, 
    initialData, 
    hotelId,
    autoSave 
  });

  const {
    activeStep,
    visitedSteps,
    handleNext,
    handleBack,
    goToStep,
    jumpToStep,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoBack,
    totalSteps
  } = useStepNavigation({ 
    totalSteps: steps.length,
    onStepChange: (newStep, oldStep, isValid) => {
      // Marcar/desmarcar etapa como completa baseada na validação
      if (isValid) {
        markStepAsCompleted(oldStep);
      } else {
        unmarkStepAsCompleted(oldStep);
      }
    },
    validateStep: (step) => validateCurrentStep(step, false)
  });

  // Efeito para mostrar notificação de auto-save
  useEffect(() => {
    if (isDirty && autoSave && mode === 'create') {
      setShowAutoSave(true);
      const timer = setTimeout(() => setShowAutoSave(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, autoSave, mode]);

  // Manipular salvamento manual
  const handleManualSave = () => {
    saveDraft();
    setLastSaveTime(new Date());
    setShowAutoSave(true);
    setTimeout(() => setShowAutoSave(false), 2000);
  };

  // Funções auxiliares
  const getTitle = (): string => {
    return mode === 'edit' ? 'Editar Hotel' : 'Cadastro de Hotel';
  };

  const getSubtitle = (): string => {
    const baseText = `Preencha as informações do seu hotel em ${steps.length} etapas`;
    return mode === 'edit' 
      ? `Edite as informações do hotel em ${steps.length} etapas`
      : `${baseText} - Seus dados são salvos automaticamente`;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(activeStep)) {
      handleNext();
    }
  };

  const handleBackStep = () => {
    if (activeStep === 0 && onCancel) {
      // Perguntar antes de cancelar se houver alterações
      if (isDirty && mode === 'create') {
        if (window.confirm('Tem alterações não salvas. Deseja salvar como rascunho antes de sair?')) {
          saveDraft();
        }
      }
      onCancel();
    } else {
      handleBack();
    }
  };

  const handleStepClick = (step: number): boolean => {
    // Se clicar na etapa atual, não fazer nada
    if (step === activeStep) return false;
    
    // Se tentar ir para uma etapa não visitada, validar a atual primeiro
    if (!visitedSteps.includes(step) && step > activeStep) {
      if (!validateCurrentStep(activeStep)) {
        return false;
      }
    }
    
    // Navegar para a etapa
    return goToStep(step, true);
  };

  const handleSubmit = async () => {
    try {
      // Validar todas as etapas antes de submeter
      const allValid = validateAllSteps();
      if (!allValid) {
        throw new Error('Por favor, complete todas as etapas obrigatórias antes de submeter.');
      }

      await submitForm(onSuccess);
      
      // Limpar rascunho após sucesso
      if (mode === 'create') {
        clearDraft();
      }
    } catch (err) {
      // Erro já tratado no hook
      console.error('Erro no submit:', err);
    }
  };

  // Renderizar etapa atual usando switch case
  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      mode
    };

    switch (activeStep) {
      case 0:
        return (
          <HotelBasicInfo
            {...commonProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      
      case 1:
        return (
          <HotelLocation
            {...commonProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      
      case 2:
        return (
          <HotelAmenities
            {...commonProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      
      case 3:
        return (
          <HotelRooms
            {...commonProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      
      case 4:
        return (
          <HotelImages
            {...commonProps}
            onNext={handleNextStep}
            onBack={handleBackStep}
          />
        );
      
      case 5:
        return (
          <ReviewAndSubmit
            {...commonProps}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      
      default:
        return <div className="step-error">Etapa não encontrada</div>;
    }
  };

  // Estatísticas para a etapa de revisão ou quartos
  const renderPriceStatistics = () => {
    if (activeStep === 5 || activeStep === 3) {
      return <PriceStatistics rooms={formData.rooms} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="hotel-wizard-container">
        <div className="hotel-wizard-paper">
          <LoadingOverlay 
            message={mode === 'edit' ? 'Carregando dados do hotel...' : 'Preparando formulário...'} 
            show={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-wizard-container">
      {/* Notificação de auto-save */}
      {showAutoSave && mode === 'create' && (
        <div className="auto-save-notification">
          <span className="draft-saved">✓</span>
          {lastSaveTime 
            ? `Rascunho salvo às ${lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Rascunho salvo automaticamente'
          }
        </div>
      )}

      <div className="hotel-wizard-paper">
        {/* Loading durante submissão */}
        <LoadingOverlay 
          message={mode === 'edit' ? 'Atualizando hotel...' : 'Criando hotel...'} 
          show={isSubmitting}
        />

        <h1 className="hotel-wizard-title">{getTitle()}</h1>
        <ModeBadge mode={mode} />
        
        <p className="hotel-wizard-subtitle">
          {getSubtitle()}
        </p>

        {/* Indicador de rascunho */}
        {mode === 'create' && isDirty && (
          <div className="draft-indicator">
            <span className="draft-saving">●</span>
            <span>Rascunho não salvo</span>
            <button 
              onClick={handleManualSave}
              className="nav-button nav-button-secondary"
              style={{ marginLeft: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
            >
              Salvar Agora
            </button>
          </div>
        )}

        {/* Stepper melhorado */}
        <Stepper 
          steps={steps} 
          activeStep={activeStep}
          completedSteps={completedSteps}
          visitedSteps={visitedSteps}
          onStepClick={handleStepClick}
        />

        {/* Mensagens de feedback */}
        {success && (
          <div className="alert alert-success">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* Estatísticas de preço */}
        {renderPriceStatistics()}

        {/* Conteúdo da etapa */}
        <div className="step-content">
          {renderStep()}
        </div>

        {/* Navegação aprimorada */}
        {!isLastStep ? (
          <div className="navigation-buttons">
            <div className="nav-left-group">
              <button
                onClick={handleBackStep}
                disabled={(isFirstStep && !onCancel) || isSubmitting}
                className={`nav-button nav-button-secondary ${(isFirstStep && !onCancel) ? 'disabled' : ''}`}
              >
                {isFirstStep && onCancel ? 'Cancelar' : 'Voltar'}
              </button>
              
              {/* Botão de salvar rascunho */}
              {mode === 'create' && isDirty && (
                <button
                  onClick={handleManualSave}
                  className="nav-button nav-button-secondary"
                  style={{ marginLeft: '0.5rem' }}
                >
                  Salvar Rascunho
                </button>
              )}
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="nav-button nav-button-primary"
            >
              {activeStep === steps.length - 2 ? 'Revisar' : 'Próximo'}
              <span style={{ marginLeft: '0.5rem' }}>→</span>
            </button>
          </div>
        ) : (
          // Botão de submit destacado na última etapa
          <div className="review-actions">
            <button
              onClick={handleBackStep}
              disabled={isSubmitting}
              className="nav-button nav-button-secondary"
            >
              ← Voltar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isDirty}
              className="review-submit-button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner mini"></span>
                  Processando...
                </>
              ) : (
                <>
                  <span>🏨</span>
                  {mode === 'edit' ? 'ATUALIZAR HOTEL' : 'CRIAR HOTEL'}
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Contador de progresso */}
        <div className="progress-indicator" style={{ marginTop: '1rem', textAlign: 'center', color: '#6b7280' }}>
          Etapa {activeStep + 1} de {steps.length} • 
          {completedSteps.length === steps.length - 1 
            ? ' 🎉 Todas as etapas completas!' 
            : ` ${completedSteps.length} de ${steps.length - 1} etapas completas`
          }
        </div>
      </div>
    </div>
  );
};

export default HotelCreationWizard;