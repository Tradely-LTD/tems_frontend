import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '@/components/Stepper';
import { Button } from '@/components/Buttons';
import { WizardContext } from './WizardContext';
import Step1Shipper from './Step1Shipper';
import Step2Products from './Step2Products';
import Step3Route from './Step3Route';
import Step4Payment from './Step4Payment';
import type { WizardFormData } from '../services/types';

const STEPS = [
  { label: 'Shipper & Commodity' },
  { label: 'Commodity Details' },
  { label: 'Route & Vehicle' },
  { label: 'Payment & Review' },
];

const EMPTY_DATA: WizardFormData = {
  step1: {
    shipper_tems_id: '',
    shipper_tin: '',
    consignee_name: '',
    consignee_phone: '',
    consignee_tin: '',
    commodity_code: '',
    commodity_description: '',
  },
  step2: {
    products: [],
  },
  step3: {
    origin_state: '',
    origin_lga: '',
    origin_market: '',
    destination_state: '',
    destination_lga: '',
    destination_market: '',
    departure_date: '',
    departure_time: '',
    vehicle_reg: '',
    driver_name: '',
    driver_phone: '',
  },
};

const STEP_COMPONENTS = [Step1Shipper, Step2Products, Step3Route, Step4Payment];

export default function WaybillWizard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WizardFormData>(EMPTY_DATA);
  const [currentStep, setCurrentStep] = useState(0);

  function updateStep1(d: Partial<WizardFormData['step1']>) {
    setFormData((prev) => ({ ...prev, step1: { ...prev.step1, ...d } }));
  }

  function updateStep2(d: Partial<WizardFormData['step2']>) {
    setFormData((prev) => ({ ...prev, step2: { ...prev.step2, ...d } }));
  }

  function updateStep3(d: Partial<WizardFormData['step3']>) {
    setFormData((prev) => ({ ...prev, step3: { ...prev.step3, ...d } }));
  }

  function goNext() {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    if (currentStep === 0) {
      navigate(-1);
    } else {
      setCurrentStep((s) => Math.max(s - 1, 0));
    }
  }

  const ActiveStep = STEP_COMPONENTS[currentStep];

  return (
    <WizardContext.Provider
      value={{ data: formData, updateStep1, updateStep2, updateStep3, currentStep, goNext, goBack }}
    >
      <div>
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <Button label="Cancel" variant="ghost" onClick={() => navigate(-1)} />
          <div className="flex-1">
            <h1 className="text-[24px] font-bold text-[#1a1b20]">Issue eWaybill</h1>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Card */}
        <div className="bg-white border border-[#c5c6d2] rounded p-8 max-w-3xl mx-auto">
          <ActiveStep />
        </div>
      </div>
    </WizardContext.Provider>
  );
}
