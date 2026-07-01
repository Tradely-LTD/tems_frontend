import { Controller } from 'react-hook-form';
import { Select } from '@/components/Select';
import { Button } from '@/components/Buttons';
import FormError from '@/components/Text/FormError';
import { useDocumentSubmit } from './hooks/useDocumentSubmit';

const DOCUMENT_TYPE_OPTIONS = [
  { label: 'National ID', value: 'national_id' },
  { label: "Driver's Licence", value: 'drivers_licence' },
  { label: "Voter's Card", value: 'voters_card' },
  { label: 'International Passport', value: 'passport' },
];

interface IdentityDocumentUploadProps {
  onSuccess: () => void;
  onBack: () => void;
}

interface FileInputLabelProps {
  id: string;
  label: string;
  accept: string;
  required?: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputRef: React.Ref<any>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  name: string;
}

function FileInputField({ id, label, accept, required, error, inputRef, onChange, onBlur, name }: FileInputLabelProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-[#1a1b20]">
        {label}
        {required && <span className="text-[#ba1a1a] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        onBlur={onBlur}
        className="block w-full text-[13px] text-[#444650]
          file:mr-3 file:py-1.5 file:px-3
          file:rounded file:border file:border-[#c5c6d2]
          file:text-[12px] file:font-medium file:text-[#002366]
          file:bg-white file:cursor-pointer
          hover:file:bg-[#f4f3f9]
          cursor-pointer"
      />
      <p className="text-[11px] text-[#758dd5]">
        {accept.includes('pdf') ? 'JPG, PNG or PDF · max 5 MB' : 'JPG or PNG · max 5 MB'}
      </p>
      {error && <FormError message={error} />}
    </div>
  );
}

export default function IdentityDocumentUpload({
  onSuccess,
  onBack,
}: IdentityDocumentUploadProps) {
  const { control, register, onSubmit, errors, isSubmitting, uploadProgress, apiError, isProfileNotFound } =
    useDocumentSubmit({ onSuccess });

  if (isProfileNotFound) {
    return (
      <div className="bg-white border border-[#c5c6d2] rounded p-6">
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4 text-[13px] text-amber-800">
          Please complete Step 1 first before uploading a document.
        </div>
        <Button label="Back" variant="secondary" type="button" onClick={onBack} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#c5c6d2] rounded p-6">
      <h2 className="text-[16px] font-semibold text-[#002366] mb-1">Document Upload</h2>
      <p className="text-[13px] text-[#444650] mb-5">
        Select your document type and attach a clear photo or scan.
      </p>

      <form onSubmit={onSubmit} noValidate>
        {apiError && <FormError message={apiError} className="mb-4" />}

        <div className="flex flex-col gap-5">
          {/* Document type */}
          <Controller
            name="id_type"
            control={control}
            render={({ field }) => (
              <Select
                id="id_type"
                label="Document Type"
                options={DOCUMENT_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                placeholder="Choose a document type…"
                error={errors.id_type?.message}
              />
            )}
          />

          {/* ID document file */}
          <FileInputField
            id="document_file"
            label="ID Document"
            accept="image/jpeg,image/png,application/pdf"
            required
            error={errors.document_file?.message as string | undefined}
            {...register('document_file')}
            inputRef={register('document_file').ref}
          />

          {/* Selfie (optional) */}
          <FileInputField
            id="selfie_file"
            label="Selfie with Document (optional)"
            accept="image/jpeg,image/png"
            error={errors.selfie_file?.message as string | undefined}
            {...register('selfie_file')}
            inputRef={register('selfie_file').ref}
          />
        </div>

        {/* Upload progress */}
        {uploadProgress && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-[#002366]">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#002366]" />
            {uploadProgress}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            label="Back"
            variant="secondary"
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
          />
          <Controller
            name="id_type"
            control={control}
            render={({ field }) => (
              <Button
                label={isSubmitting ? 'Uploading…' : 'Submit Document'}
                variant="primary"
                type="submit"
                loading={isSubmitting}
                disabled={!field.value || isSubmitting}
              />
            )}
          />
        </div>
      </form>
    </div>
  );
}
