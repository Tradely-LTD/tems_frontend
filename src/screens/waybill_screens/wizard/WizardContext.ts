import { createContext, useContext } from 'react';
import type { WizardFormData } from '../services/types';

interface WizardContextValue {
  data: WizardFormData;
  updateStep1: (d: Partial<WizardFormData['step1']>) => void;
  updateStep2: (d: Partial<WizardFormData['step2']>) => void;
  updateStep3: (d: Partial<WizardFormData['step3']>) => void;
  currentStep: number;
  goNext: () => void;
  goBack: () => void;
}

export const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WaybillWizard');
  return ctx;
}
