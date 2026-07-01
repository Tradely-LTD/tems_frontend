import { useGetKycStatusQuery } from '../services/identitySlice';
import type { KycStatus, KycDocument } from '../services/types';

interface UseIdentityStatusResult {
  isLoading: boolean;
  hasProfile: boolean;
  kycStatus: KycStatus | null;
  ninVerified: boolean;
  tinVerified: boolean;
  temsId: string | null;
  documents: KycDocument[];
  canSubmit: boolean;
  refetch: () => void;
}

export function useIdentityStatus(): UseIdentityStatusResult {
  const { data, isLoading, error, refetch } = useGetKycStatusQuery();

  // A 404 means no profile exists yet — not an actual error state
  const is404 =
    error !== undefined &&
    'status' in error &&
    error.status === 404;

  if (isLoading) {
    return {
      isLoading: true,
      hasProfile: false,
      kycStatus: null,
      ninVerified: false,
      tinVerified: false,
      temsId: null,
      documents: [],
      canSubmit: false,
      refetch,
    };
  }

  if (is404 || !data) {
    return {
      isLoading: false,
      hasProfile: false,
      kycStatus: null,
      ninVerified: false,
      tinVerified: false,
      temsId: null,
      documents: [],
      canSubmit: false,
      refetch,
    };
  }

  const { kyc_status, nin_verified, tin_verified, tems_id, documents } = data.data;
  const canSubmit = kyc_status === 'pending' || kyc_status === 'rejected';

  return {
    isLoading: false,
    hasProfile: true,
    kycStatus: kyc_status,
    ninVerified: nin_verified,
    tinVerified: tin_verified,
    temsId: tems_id,
    documents,
    canSubmit,
    refetch,
  };
}
