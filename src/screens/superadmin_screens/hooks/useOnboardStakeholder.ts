import { useState } from 'react';
import {
  useCreateAuthorityMutation,
  useAddContactMutation,
  useRemoveContactMutation,
  useVerifyBankMutation,
} from '../services/revenueRulesSlice';
import {
  authorityValidationSchema,
  DEFAULT_AUTHORITY_FORM,
  type AuthorityFormValues,
} from '../schema/revenueAuthorityValidationSchema';
import type { RevenueAuthority, ContactRole } from '../services/types';

const MAX_CONTACTS = 2;

export function useOnboardStakeholder(onCreated?: (authority: RevenueAuthority) => void) {
  const [form, setForm] = useState<AuthorityFormValues>(DEFAULT_AUTHORITY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const [createAuthority, { isLoading: creating }] = useCreateAuthorityMutation();
  const [addContact, { isLoading: addingContact }] = useAddContactMutation();
  const [removeContact] = useRemoveContactMutation();
  const [verifyBank, { isLoading: verifying }] = useVerifyBankMutation();

  const [createdAuthority, setCreatedAuthority] = useState<RevenueAuthority | null>(null);

  // Contact management (only usable once an authority exists)
  const [contactUserId, setContactUserId] = useState('');
  const [contactRole, setContactRole] = useState<ContactRole>('primary');
  const [contactError, setContactError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ userId: string; role: ContactRole }[]>([]);

  function updateField<K extends keyof AuthorityFormValues>(key: K, value: AuthorityFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm(DEFAULT_AUTHORITY_FORM);
    setErrors({});
    setApiError(null);
    setCreatedAuthority(null);
    setContacts([]);
    setContactUserId('');
    setContactError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    try {
      await authorityValidationSchema.validate(form, { abortEarly: false });
      setErrors({});
    } catch (err: unknown) {
      const validationErr = err as { inner?: { path?: string; message: string }[] };
      const errs: Record<string, string> = {};
      validationErr.inner?.forEach((e2) => {
        if (e2.path) errs[e2.path] = e2.message;
      });
      setErrors(errs);
      return;
    }

    try {
      const res = await createAuthority({
        authority_code: form.authority_code.trim(),
        authority_name: form.authority_name.trim(),
        tier: form.tier,
        stakeholder_type: form.stakeholder_type,
        settlement_type: form.settlement_type,
        state: form.state.trim() || undefined,
        lga: form.lga.trim() || undefined,
        bank_name: form.bank_name.trim() || undefined,
        bank_code: form.bank_code.trim() || undefined,
        account_number: form.account_number.trim() || undefined,
      }).unwrap();
      setCreatedAuthority(res.data);
      onCreated?.(res.data);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; status?: number };
      if (e.status === 409) {
        setApiError('Authority code already exists. Please use a different code.');
      } else {
        setApiError(e?.data?.message ?? 'Failed to create authority. Please try again.');
      }
    }
  }

  async function handleAddContact() {
    setContactError(null);
    if (!createdAuthority) return;
    if (contacts.length >= MAX_CONTACTS) {
      setContactError('Maximum of 2 contacts per authority.');
      return;
    }
    if (!contactUserId.trim()) {
      setContactError('User ID is required.');
      return;
    }
    try {
      await addContact({ authorityId: createdAuthority.id, userId: contactUserId.trim(), role: contactRole }).unwrap();
      setContacts((prev) => [...prev, { userId: contactUserId.trim(), role: contactRole }]);
      setContactUserId('');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; status?: number };
      if (e.status === 422) {
        setContactError('Maximum of 2 contacts per authority.');
      } else if (e.status === 409) {
        setContactError('This user is already a contact for this authority.');
      } else {
        setContactError(e?.data?.message ?? 'Failed to add contact.');
      }
    }
  }

  async function handleRemoveContact(userId: string) {
    if (!createdAuthority) return;
    try {
      await removeContact({ authorityId: createdAuthority.id, userId }).unwrap();
      setContacts((prev) => prev.filter((c) => c.userId !== userId));
    } catch {
      setContactError('Failed to remove contact.');
    }
  }

  async function handleVerifyBank() {
    if (!createdAuthority) return;
    try {
      const res = await verifyBank(createdAuthority.id).unwrap();
      setCreatedAuthority(res.data);
    } catch {
      // surfaced via createdAuthority.nibss_verified remaining false; caller can show a generic message
    }
  }

  return {
    form,
    updateField,
    errors,
    apiError,
    creating,
    handleSubmit,
    createdAuthority,
    reset,

    // contacts
    contactUserId,
    setContactUserId,
    contactRole,
    setContactRole,
    contactError,
    contacts,
    addingContact,
    handleAddContact,
    handleRemoveContact,
    contactsAtMax: contacts.length >= MAX_CONTACTS,

    // bank verification
    handleVerifyBank,
    verifying,
  };
}
