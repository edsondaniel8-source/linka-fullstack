// src/components/hotel-wizard/components/Stepper.tsx
import React from 'react';
import '../styles/HotelWizard.css';

interface StepperProps {
  steps: string[];
  activeStep: number;
  completedSteps: number[];
  visitedSteps: number[];
  onStepClick?: (step: number) => boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  activeStep, 
  completedSteps,
  visitedSteps,
  onStepClick,
  className = '' 
}) => {
  const handleStepClick = (stepIndex: number) => {
    // Só permitir clicar em passos visitados ou o próximo após o atual
    if (visitedSteps.includes(stepIndex) || stepIndex === activeStep + 1) {
      if (onStepClick) {
        return onStepClick(stepIndex);
      }
    }
    return false;
  };

  return (
    <div className={`hotel-wizard-stepper ${className}`}>
      <div className="stepper-line"></div>
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isCompleted = completedSteps.includes(index);
        const isVisited = visitedSteps.includes(index);
        const isClickable = isVisited || index === activeStep + 1;
        
        const stepClass = `
          step 
          ${isActive ? 'active' : ''} 
          ${isCompleted ? 'completed' : ''}
          ${isClickable ? 'clickable' : 'disabled'}
        `;
        
        const circleClass = `
          step-circle 
          ${isActive ? 'active' : ''} 
          ${isCompleted ? 'completed' : ''}
          ${isVisited && !isActive && !isCompleted ? 'visited' : ''}
        `;
        
        return (
          <div 
            key={`${label}-${index}`} 
            className={stepClass.trim()}
            onClick={() => isClickable && handleStepClick(index)}
            title={!isClickable ? 'Complete as etapas anteriores primeiro' : ''}
          >
            <div className={circleClass.trim()}>
              {isCompleted ? (
                <span className="step-check">✓</span>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-label">{label}</div>
            
            {/* Indicador de erro para etapas visitadas mas não completadas */}
            {isVisited && !isCompleted && index < activeStep && (
              <div className="step-error-indicator" title="Esta etapa precisa de atenção">
                !
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};