import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { agentOnboardingSchema, type AgentOnboardingFormValues } from '../schema/agentValidationSchema';
import { useInviteAgentMutation, useGetMarketsQuery } from '../services/agentSlice';
import type { InviteAgentRequest } from '../services/types';
import { ROUTES } from '@/constants/routes';

export function useAgentOnboarding() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [inviteAgent, { isLoading }] = useInviteAgentMutation();
  const { data: marketsData } = useGetMarketsQuery();
  const marketOptions = marketsData?.data?.map((m) => ({ value: m.id, label: m.name })) ?? [];

  const form = useForm<AgentOnboardingFormValues>({
    resolver: yupResolver(agentOnboardingSchema),
    defaultValues: {
      email: '',
      phone: '',
      password: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      address: '',
      state: '',
      lga: '',
      dob: '',
      bank_account: '',
      bank_name: '',
      bank_code: '',
      tier: 2,
      market_id: null,
      device_imei: '',
    },
  });

  const onSubmit = async (values: AgentOnboardingFormValues) => {
    setApiError(null);

    const payload: InviteAgentRequest = {
      email: values.email,
      phone: values.phone,
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
      bank_account: values.bank_account,
      bank_name: values.bank_name,
      bank_code: values.bank_code,
      ...(values.middle_name ? { middle_name: values.middle_name } : {}),
      ...(values.address ? { address: values.address } : {}),
      ...(values.state ? { state: values.state } : {}),
      ...(values.lga ? { lga: values.lga } : {}),
      ...(values.dob ? { dob: values.dob } : {}),
      ...(values.tier !== undefined ? { tier: values.tier } : {}),
      ...(values.market_id ? { market_id: values.market_id } : {}),
      ...(values.device_imei ? { device_imei: values.device_imei } : {}),
    };

    try {
      const result = await inviteAgent(payload).unwrap();
      // Redirect to the newly created agent's detail page
      navigate(ROUTES.AGENT_DETAIL.replace(':agentId', result.data.id));
    } catch (err: unknown) {
      const error = err as { status?: number; data?: { message?: string } };
      const msg = error?.data?.message;
      if (error?.status === 409) {
        setApiError(msg ?? 'An account with these credentials already exists.');
      } else if (error?.status === 400) {
        setApiError(msg ?? 'Validation failed. Please check your inputs.');
      } else {
        setApiError(msg ?? 'Something went wrong. Please try again.');
      }
    }
  };

  return {
    form,
    isLoading,
    apiError,
    marketOptions,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
