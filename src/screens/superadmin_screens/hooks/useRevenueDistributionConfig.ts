import { useMemo, useState } from 'react';
import {
  useListAuthoritiesQuery,
  useListRulesQuery,
  useDeactivateAuthorityMutation,
  usePreviewRulesMutation,
} from '../services/revenueRulesSlice';
import type { RevenueAuthority, RevenueRule, RuleScope, RuleStatus, PreviewRulesResult } from '../services/types';
import {
  previewValidationSchema,
  DEFAULT_PREVIEW_FORM,
  type PreviewFormValues,
} from '../schema/revenueRuleValidationSchema';
import { useRevenuePermissions } from './useRevenuePermissions';

type Tab = 'authorities' | 'rules' | 'preview';

export function useRevenueDistributionConfig() {
  const { canManageRevenue, canReadRevenue } = useRevenuePermissions();

  const [tab, setTab] = useState<Tab>('authorities');

  // Authorities tab state
  const { data: authoritiesData, isFetching: authoritiesFetching, isError: authoritiesError } =
    useListAuthoritiesQuery({ page: 1, limit: 100 }, { skip: !canReadRevenue });
  const [deactivateAuthority, { isLoading: deactivating }] = useDeactivateAuthorityMutation();
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<RevenueAuthority | null>(null);

  const authorities: RevenueAuthority[] = authoritiesData?.data?.data ?? [];

  // Rules tab state
  const [ruleScopeFilter, setRuleScopeFilter] = useState<RuleScope | ''>('');
  const [ruleStatusFilter, setRuleStatusFilter] = useState<RuleStatus | ''>('');
  const [ruleAuthorityFilter, setRuleAuthorityFilter] = useState<string>('');
  const { data: rulesData, isFetching: rulesFetching, isError: rulesError } = useListRulesQuery(
    {
      page: 1,
      limit: 100,
      scope: ruleScopeFilter || undefined,
      status: ruleStatusFilter || undefined,
      authority_id: ruleAuthorityFilter || undefined,
    },
    { skip: !canReadRevenue || tab !== 'rules' }
  );
  const rules: RevenueRule[] = rulesData?.data?.data ?? [];
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RevenueRule | null>(null);

  const authorityNameById = useMemo(() => {
    const map = new Map<string, string>();
    authorities.forEach((a) => map.set(a.id, `${a.authority_name} (${a.authority_code})`));
    return map;
  }, [authorities]);

  // Preview tab state
  const [previewForm, setPreviewForm] = useState<PreviewFormValues>(DEFAULT_PREVIEW_FORM);
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState<PreviewRulesResult | null>(null);
  const [previewApiError, setPreviewApiError] = useState<string | null>(null);
  const [previewRules, { isLoading: previewLoading }] = usePreviewRulesMutation();

  function updatePreviewField<K extends keyof PreviewFormValues>(key: K, value: PreviewFormValues[K]) {
    setPreviewForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePreviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPreviewApiError(null);
    setPreviewResult(null);
    try {
      await previewValidationSchema.validate(previewForm, { abortEarly: false });
      setPreviewErrors({});
    } catch (err: unknown) {
      const validationErr = err as { inner?: { path?: string; message: string }[] };
      const errs: Record<string, string> = {};
      validationErr.inner?.forEach((e2) => {
        if (e2.path) errs[e2.path] = e2.message;
      });
      setPreviewErrors(errs);
      return;
    }

    try {
      const res = await previewRules({
        commodity_code: previewForm.commodity_code,
        state_name: previewForm.state_name,
        lga_name: previewForm.lga_name || undefined,
        market_id: previewForm.market_id || undefined,
        quantity: Number(previewForm.quantity),
        unit: previewForm.unit,
        declared_value: previewForm.declared_value ? Number(previewForm.declared_value) : undefined,
      }).unwrap();
      setPreviewResult(res.data);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setPreviewApiError(e?.data?.message ?? 'Failed to generate preview. Please try again.');
    }
  }

  async function handleDeactivate(authority: RevenueAuthority) {
    setDeactivateError(null);
    try {
      await deactivateAuthority(authority.id).unwrap();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setDeactivateError(e?.data?.message ?? 'Failed to deactivate authority.');
    }
  }

  function openOnboard() {
    setOnboardOpen(true);
  }

  function closeOnboard() {
    setOnboardOpen(false);
  }

  function openRuleModal(rule: RevenueRule | null) {
    setEditingRule(rule);
    setRuleModalOpen(true);
  }

  function closeRuleModal() {
    setRuleModalOpen(false);
    setEditingRule(null);
  }

  return {
    canManageRevenue,
    canReadRevenue,
    tab,
    setTab,

    // authorities
    authorities,
    authoritiesFetching,
    authoritiesError,
    deactivating,
    deactivateError,
    handleDeactivate,
    onboardOpen,
    openOnboard,
    closeOnboard,
    selectedAuthority,
    setSelectedAuthority,

    // rules
    rules,
    rulesFetching,
    rulesError,
    ruleScopeFilter,
    setRuleScopeFilter,
    ruleStatusFilter,
    setRuleStatusFilter,
    ruleAuthorityFilter,
    setRuleAuthorityFilter,
    authorityNameById,
    ruleModalOpen,
    editingRule,
    openRuleModal,
    closeRuleModal,

    // preview
    previewForm,
    updatePreviewField,
    previewErrors,
    previewResult,
    previewApiError,
    previewLoading,
    handlePreviewSubmit,
  };
}
