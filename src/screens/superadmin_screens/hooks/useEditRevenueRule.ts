import { useEffect, useState } from 'react';
import { useCreateRuleMutation, useUpdateRuleMutation } from '../services/revenueRulesSlice';
import {
  ruleValidationSchema,
  DEFAULT_RULE_FORM,
  type RuleFormValues,
} from '../schema/revenueRuleValidationSchema';
import type { RevenueRule } from '../services/types';

interface UseEditRevenueRuleArgs {
  rule: RevenueRule | null;
  onSaved?: () => void;
}

function ruleToFormValues(rule: RevenueRule): RuleFormValues {
  return {
    authority_id: rule.authority_id,
    scope: rule.scope,
    state_name: rule.state_name ?? '',
    lga_name: rule.lga_name ?? '',
    market_id: rule.market_id ?? '',
    commodity_code: rule.commodity_code ?? '',
    basis: rule.basis,
    rate: Number(rule.rate),
    effective_from: rule.effective_from ? rule.effective_from.slice(0, 16) : '',
    effective_to: rule.effective_to ? rule.effective_to.slice(0, 16) : '',
    notes: rule.notes ?? '',
    status: rule.status,
  };
}

export function useEditRevenueRule({ rule, onSaved }: UseEditRevenueRuleArgs) {
  const isEditMode = rule !== null;
  const [form, setForm] = useState<RuleFormValues>(rule ? ruleToFormValues(rule) : DEFAULT_RULE_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [createRule, { isLoading: creating }] = useCreateRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateRuleMutation();
  const isSubmitting = creating || updating;

  useEffect(() => {
    setForm(rule ? ruleToFormValues(rule) : DEFAULT_RULE_FORM);
    setErrors({});
    setApiError(null);
  }, [rule]);

  function updateField<K extends keyof RuleFormValues>(key: K, value: RuleFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent): Promise<boolean> {
    e.preventDefault();
    setApiError(null);

    try {
      await ruleValidationSchema.validate(form, { abortEarly: false });
      setErrors({});
    } catch (err: unknown) {
      const validationErr = err as { inner?: { path?: string; message: string }[] };
      const errs: Record<string, string> = {};
      validationErr.inner?.forEach((e2) => {
        if (e2.path) errs[e2.path] = e2.message;
      });
      setErrors(errs);
      return false;
    }

    try {
      if (isEditMode && rule) {
        // scope/authority_id/commodity_code cannot change after creation
        await updateRule({
          id: rule.id,
          body: {
            rate: Number(form.rate),
            effective_from: form.effective_from ? new Date(form.effective_from).toISOString() : undefined,
            effective_to: form.effective_to ? new Date(form.effective_to).toISOString() : undefined,
            status: form.status,
            notes: form.notes || undefined,
          },
        }).unwrap();
      } else {
        await createRule({
          authority_id: form.authority_id,
          scope: form.scope,
          state_name: form.state_name || undefined,
          lga_name: form.lga_name || undefined,
          market_id: form.market_id || undefined,
          commodity_code: form.commodity_code || undefined,
          basis: form.basis,
          rate: Number(form.rate),
          effective_from: form.effective_from ? new Date(form.effective_from).toISOString() : '',
          effective_to: form.effective_to ? new Date(form.effective_to).toISOString() : undefined,
          notes: form.notes || undefined,
        }).unwrap();
      }
      onSaved?.();
      return true;
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setApiError(e?.data?.message ?? 'Failed to save revenue rule. Please try again.');
      return false;
    }
  }

  return {
    form,
    updateField,
    errors,
    apiError,
    isSubmitting,
    isEditMode,
    handleSubmit,
  };
}
