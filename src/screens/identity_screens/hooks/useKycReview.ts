import { useState } from 'react';
import { useReviewIdentityMutation } from '../services/identitySlice';
import type { AdminKycSubmission } from '../services/types';

interface UseKycReviewOptions {
  submission: AdminKycSubmission;
  onSuccess: () => void;
}

export function useKycReview({ submission, onSuccess }: UseKycReviewOptions) {
  const [ninVerified, setNinVerified] = useState(submission.nin_verified);
  const [tinVerified, setTinVerified] = useState(submission.tin_verified);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewIdentity, { isLoading: isReviewing }] = useReviewIdentityMutation();

  async function handleApprove() {
    setReviewError(null);
    try {
      await reviewIdentity({
        id: submission.id,
        body: { decision: 'verified', nin_verified: ninVerified, tin_verified: tinVerified },
      }).unwrap();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } };
      setReviewError(
        e.status === 409
          ? 'This submission has already been reviewed by another admin.'
          : (e.data?.message ?? 'Review failed. Please try again.')
      );
    }
  }

  async function handleReject() {
    setReviewError(null);
    try {
      await reviewIdentity({
        id: submission.id,
        body: { decision: 'rejected' },
      }).unwrap();
      onSuccess();
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string } };
      setReviewError(
        e.status === 409
          ? 'This submission has already been reviewed by another admin.'
          : (e.data?.message ?? 'Review failed. Please try again.')
      );
    }
  }

  return {
    ninVerified,
    tinVerified,
    setNinVerified,
    setTinVerified,
    handleApprove,
    handleReject,
    isReviewing,
    reviewError,
  };
}
