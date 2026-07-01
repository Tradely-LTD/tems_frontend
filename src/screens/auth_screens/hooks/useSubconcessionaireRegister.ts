import { useState } from 'react';
import { useRegisterSubconcessionaireMutation } from '../services/authSlice';
import type { OrgFormValues, AdminFormValues } from '../schema/subconcessionaireRegisterSchema';

type OrgCategory = 'private_company' | 'government_body' | 'trade_union';

export function useSubconcessionaireRegister() {
  const [registerSubconcessionaire, { isLoading }] = useRegisterSubconcessionaireMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [orgCategory, setOrgCategory] = useState<OrgCategory | null>(null);
  const [orgValues, setOrgValues] = useState<OrgFormValues | null>(null);
  const [adminValues, setAdminValues] = useState<AdminFormValues | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const goBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    setApiError(null);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setApiError(null);
  };

  const submitOrgValues = (values: OrgFormValues) => {
    setOrgValues(values);
    setCurrentStep(2);
  };

  const submitAdminValues = (values: AdminFormValues) => {
    setAdminValues(values);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async () => {
    if (!orgCategory || !orgValues || !adminValues) return;

    setApiError(null);

    // Strip confirm_password before sending to API
    const { confirm_password: _confirm, ...adminPayload } = adminValues;

    try {
      await registerSubconcessionaire({
        org_category: orgCategory,
        org: {
          name: orgValues.name,
          registration_number: orgValues.registration_number,
          state_id: orgValues.state_id,
          lga_id: orgValues.lga_id,
          contact_email: orgValues.contact_email,
          contact_phone: orgValues.contact_phone,
        },
        admin: {
          full_name: adminPayload.full_name,
          email: adminPayload.email,
          phone: adminPayload.phone,
          password: adminPayload.password,
        },
      }).unwrap();
      setIsSubmitted(true);
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      const msg = error?.data?.message;
      if (error?.status === 409 || error?.status === 400) {
        setApiError(msg ?? 'Submission failed. Please check your details and try again.');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  };

  return {
    currentStep,
    orgCategory,
    orgValues,
    adminValues,
    isSubmitted,
    apiError,
    isLoading,
    setOrgCategory,
    submitOrgValues,
    submitAdminValues,
    goBack,
    goToStep,
    handleFinalSubmit,
  };
}
