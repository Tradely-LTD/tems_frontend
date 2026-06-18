import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/Inputs';
import { Select } from '@/components/Select';
import { Button } from '@/components/Buttons';
import { step1Schema, type Step1FormValues } from '../schema/step1ValidationSchema';
import { useWizard } from './WizardContext';
import { NIGERIAN_COMMODITY_CODES } from '@/constants/nigeria';

const COMMODITY_OPTIONS = NIGERIAN_COMMODITY_CODES.map((c) => ({
  label: `${c.code} — ${c.label}`,
  value: c.code,
}));

export default function Step1Shipper() {
  const { data, updateStep1, goNext } = useWizard();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step1FormValues>({
    resolver: yupResolver(step1Schema),
    defaultValues: {
      shipper_tems_id: data.step1.shipper_tems_id,
      shipper_tin: data.step1.shipper_tin,
      consignee_name: data.step1.consignee_name,
      consignee_phone: data.step1.consignee_phone,
      consignee_tin: data.step1.consignee_tin,
      commodity_code: data.step1.commodity_code,
      commodity_description: data.step1.commodity_description,
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateStep1(values);
    goNext();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="text-[18px] font-semibold text-[#1a1b20] mb-6">
        Shipper & Commodity
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          id="shipper_tems_id"
          label="Shipper TeMS ID (optional)"
          placeholder="TMS-XXXXXXXXXXXXXXXX"
          className="font-mono"
          error={errors.shipper_tems_id?.message}
          {...register('shipper_tems_id')}
        />
        <Input
          id="shipper_tin"
          label="Shipper TIN (optional)"
          placeholder="12345678-0001"
          className="font-mono"
          error={errors.shipper_tin?.message}
          {...register('shipper_tin')}
        />
        <Input
          id="consignee_name"
          label="Consignee Name (optional)"
          placeholder="Full name of recipient"
          error={errors.consignee_name?.message}
          {...register('consignee_name')}
        />
        <Input
          id="consignee_phone"
          label="Consignee Phone (optional)"
          placeholder="+234..."
          error={errors.consignee_phone?.message}
          {...register('consignee_phone')}
        />
        <Input
          id="consignee_tin"
          label="Consignee TIN (optional)"
          placeholder="12345678-0001"
          className="font-mono"
          error={errors.consignee_tin?.message}
          {...register('consignee_tin')}
        />

        <div className="sm:col-span-2">
          <Controller
            name="commodity_code"
            control={control}
            render={({ field }) => (
              <Select
                id="commodity_code"
                label="Commodity Code *"
                options={COMMODITY_OPTIONS}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder="Select commodity..."
                error={errors.commodity_code?.message}
              />
            )}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1">
          <label
            htmlFor="commodity_description"
            className="text-[14px] font-medium text-[#1a1b20]"
          >
            Commodity Description (optional)
          </label>
          <textarea
            id="commodity_description"
            rows={3}
            placeholder="Describe the goods..."
            className="w-full rounded border border-[#c5c6d2] bg-white px-3 py-2 text-[16px] text-[#1a1b20] focus:outline-none focus:ring-2 focus:ring-[#435b9f] resize-none"
            {...register('commodity_description')}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button label="Next: Products" type="submit" variant="primary" />
      </div>
    </form>
  );
}
