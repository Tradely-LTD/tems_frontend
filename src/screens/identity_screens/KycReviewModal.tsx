import { Modal } from '@/components/Modal';
import { Button } from '@/components/Buttons';
import { StatusBadge } from '@/components/StatusBadge';
import FormError from '@/components/Text/FormError';
import { useKycReview } from './hooks/useKycReview';
import { kycStatusToBadge, DOC_TYPE_LABELS, maskSensitiveValue } from './utils/kycUtils';
import type { AdminKycSubmission } from './services/types';

interface KycReviewModalProps {
  submission: AdminKycSubmission;
  onClose: () => void;
}

export default function KycReviewModal({ submission, onClose }: KycReviewModalProps) {
  const {
    ninVerified,
    tinVerified,
    setNinVerified,
    setTinVerified,
    handleApprove,
    handleReject,
    isReviewing,
    reviewError,
  } = useKycReview({ submission, onSuccess: onClose });

  const isPending = submission.kyc_status === 'submitted';

  return (
    <Modal
      open
      onClose={onClose}
      title={`KYC Review — ${submission.full_name}`}
      size="lg"
    >
      <div className="overflow-y-auto max-h-[70vh] flex flex-col gap-6">

        {/* Submitter section */}
        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650] mb-2">
            Submitter
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">Full Name</dt>
              <dd className="text-[14px] text-[#1a1b20]">{submission.full_name}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">Email</dt>
              <dd className="text-[14px] text-[#1a1b20]">{submission.email}</dd>
            </div>
          </dl>
        </section>

        {/* Identity details */}
        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650] mb-2">
            Identity Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">NIN</dt>
              <dd className="text-[14px] text-[#1a1b20] font-mono">
                {maskSensitiveValue(submission.nin)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">TIN</dt>
              <dd className="text-[14px] text-[#1a1b20] font-mono">
                {maskSensitiveValue(submission.tin)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">BVN</dt>
              <dd className="text-[14px] text-[#1a1b20] font-mono">
                {maskSensitiveValue(submission.bvn)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-[#444650]">Date of Birth</dt>
              <dd className="text-[14px] text-[#1a1b20]">{submission.date_of_birth ?? '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[11px] font-bold uppercase text-[#444650]">Address</dt>
              <dd className="text-[14px] text-[#1a1b20]">{submission.address ?? '—'}</dd>
            </div>
          </dl>
        </section>

        {/* Documents section */}
        <section>
          <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650] mb-2">
            Documents
          </h3>
          {submission.all_documents.length === 0 ? (
            <p className="text-[14px] text-[#444650]">No documents uploaded.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {submission.all_documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 border-b border-[#f4f3f9] last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#1a1b20]">
                      {DOC_TYPE_LABELS[doc.id_type] ?? doc.id_type}
                    </span>
                    {doc.is_primary && (
                      <span className="text-[11px] font-bold text-[#002366] bg-[#f4f3f9] px-1.5 py-0.5 rounded uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#002366] underline hover:opacity-80 transition-opacity"
                    >
                      View Document
                    </a>
                    {doc.selfie_url && (
                      <a
                        href={doc.selfie_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-[#002366] underline hover:opacity-80 transition-opacity"
                      >
                        View Selfie
                      </a>
                    )}
                    <span className="text-[12px] text-[#444650]">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Review section */}
        {isPending ? (
          <section className="border-t border-[#c5c6d2] pt-4">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650] mb-3">
              Review Decision
            </h3>

            {/* Verification checkboxes */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ninVerified}
                  onChange={(e) => setNinVerified(e.target.checked)}
                  className="w-4 h-4 accent-[#002366] cursor-pointer"
                />
                <span className="text-[14px] text-[#1a1b20]">NIN Verified</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={tinVerified}
                  onChange={(e) => setTinVerified(e.target.checked)}
                  className="w-4 h-4 accent-[#002366] cursor-pointer"
                />
                <span className="text-[14px] text-[#1a1b20]">TIN Verified</span>
              </label>
            </div>

            {/* Error message */}
            {reviewError && <FormError message={reviewError} />}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-4">
              <Button
                label="Reject"
                variant="danger"
                onClick={handleReject}
                loading={isReviewing}
                disabled={isReviewing}
              />
              <Button
                label="Approve"
                variant="primary"
                onClick={handleApprove}
                loading={isReviewing}
                disabled={isReviewing}
              />
            </div>
          </section>
        ) : (
          <section className="border-t border-[#c5c6d2] pt-4">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-[#444650] mb-3">
              Review Outcome
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-semibold text-[#444650] uppercase tracking-wide">
                  Status
                </span>
                <StatusBadge
                  variant={kycStatusToBadge(submission.kyc_status)}
                  label={submission.kyc_status.toUpperCase()}
                />
              </div>
              {submission.tems_id && (
                <div>
                  <dt className="text-[11px] font-bold uppercase text-[#444650]">TeMS ID</dt>
                  <dd className="text-[14px] text-[#1a1b20] font-mono mt-0.5">{submission.tems_id}</dd>
                </div>
              )}
              {submission.reviewed_at && (
                <div>
                  <dt className="text-[11px] font-bold uppercase text-[#444650]">Reviewed At</dt>
                  <dd className="text-[14px] text-[#1a1b20] mt-0.5">
                    {new Date(submission.reviewed_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
