// src/components/hotel-wizard/hooks/useStepNavigation.ts
import { useState, useCallback } from 'react';

interface UseStepNavigationProps {
  totalSteps: number;
  onStepChange?: (step: number, previousStep: number, isValid?: boolean) => void;
  validateStep?: (step: number) => boolean;
}

export const useStepNavigation = ({ 
  totalSteps, 
  onStepChange,
  validateStep 
}: UseStepNavigationProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<number[]>([0]);

  const handleNext = useCallback(() => {
    if (activeStep < totalSteps - 1) {
      const nextStep = activeStep + 1;
      
      // Validar etapa atual se necessário
      let isValid = true;
      if (validateStep) {
        isValid = validateStep(activeStep);
      }
      
      setActiveStep(nextStep);
      setVisitedSteps(prev => {
        if (!prev.includes(nextStep)) {
          return [...prev, nextStep];
        }
        return prev;
      });
      
      onStepChange?.(nextStep, activeStep, isValid);
    }
  }, [activeStep, totalSteps, onStepChange, validateStep]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      onStepChange?.(prevStep, activeStep, true);
    }
  }, [activeStep, onStepChange]);

  const goToStep = useCallback((step: number, shouldValidate = false) => {
    if (step >= 0 && step < totalSteps) {
      // Se for um passo que já foi visitado ou é o próximo
      if (visitedSteps.includes(step) || step === activeStep + 1) {
        let isValid = true;
        
        // Validar se necessário
        if (shouldValidate && validateStep) {
          isValid = validateStep(activeStep);
        }
        
        // Se não for válido e for validação obrigatória, não permitir navegação
        if (shouldValidate && !isValid) {
          return false;
        }
        
        setActiveStep(step);
        setVisitedSteps(prev => {
          if (!prev.includes(step)) {
            return [...prev, step];
          }
          return prev;
        });
        
        onStepChange?.(step, activeStep, isValid);
        return true;
      }
    }
    return false;
  }, [totalSteps, visitedSteps, activeStep, onStepChange, validateStep]);

  const jumpToStep = useCallback((step: number, validateCurrent = true) => {
    if (step >= 0 && step < totalSteps) {
      let canJump = true;
      
      // Se precisa validar a etapa atual
      if (validateCurrent && validateStep) {
        canJump = validateStep(activeStep);
      }
      
      if (canJump) {
        setActiveStep(step);
        setVisitedSteps(prev => {
          const newVisited = [...prev];
          if (!newVisited.includes(step)) {
            newVisited.push(step);
          }
          return newVisited;
        });
        
        onStepChange?.(step, activeStep, true);
        return true;
      }
    }
    return false;
  }, [totalSteps, activeStep, validateStep, onStepChange]);

  const reset = useCallback(() => {
    setActiveStep(0);
    setVisitedSteps([0]);
    onStepChange?.(0, activeStep, true);
  }, [activeStep, onStepChange]);

  const isStepVisited = useCallback((step: number) => {
    return visitedSteps.includes(step);
  }, [visitedSteps]);

  const canGoToStep = useCallback((step: number) => {
    // Pode ir para o passo se já foi visitado ou é o próximo imediato
    return visitedSteps.includes(step) || step === activeStep + 1;
  }, [visitedSteps, activeStep]);

  return {
    activeStep,
    visitedSteps,
    handleNext,
    handleBack,
    goToStep,
    jumpToStep,
    reset,
    isStepVisited,
    canGoToStep,
    isFirstStep: activeStep === 0,
    isLastStep: activeStep === totalSteps - 1,
    canGoNext: activeStep < totalSteps - 1,
    canGoBack: activeStep > 0,
    totalSteps
  };
};