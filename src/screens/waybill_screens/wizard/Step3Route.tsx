import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '@/components/Inputs';
import { Select } from '@/components/Select';
import { Button } from '@/components/Buttons';
import { step3Schema, type Step3FormValues } from '../schema/step3ValidationSchema';
import { useWizard } from './WizardContext';
import { NIGERIAN_STATES } from '@/constants/nigeria';

const STATE_OPTIONS = NIGERIAN_STATES.map((s) => ({ label: s.name, value: s.name }));

function getLGAOptions(stateName: string) {
  const state = NIGERIAN_STATES.find((s) => s.name === stateName);
  return state ? state.lgas.map((l) => ({ label: l.name, value: l.name })) : [];
}

export default function Step3Route() {
  const { data, updateStep3, goNext, goBack } = useWizard();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3FormValues>({
    resolver: yupResolver(step3Schema),
    defaultValues: {
      origin_state: data.step3.origin_state,
      origin_lga: data.step3.origin_lga,
      origin_market: data.step3.origin_market,
      destination_state: data.step3.destination_state,
      destination_lga: data.step3.destination_lga,
      destination_market: data.step3.destination_market,
      departure_date: data.step3.departure_date,
      departure_time: data.step3.departure_time,
      vehicle_reg: data.step3.vehicle_reg,
      driver_name: data.step3.driver_name,
      driver_phone: data.step3.driver_phone,
    },
  });

  const originState = watch('origin_state');
  const destinationState = watch('destination_state');

  const originLGAOptions = getLGAOptions(originState ?? '');
  const destinationLGAOptions = getLGAOptions(destinationState ?? '');

  const onSubmit = handleSubmit((values) => {
    updateStep3(values);
    goNext();
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2 className="text-[18px] font-semibold text-[#1a1b20] mb-6">
        Route & Vehicle
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Origin */}
        <Controller
          name="origin_state"
          control={control}
          render={({ field }) => (
            <Select
              id="origin_state"
              label="Origin State *"
              options={STATE_OPTIONS}
              value={field.value ?? ''}
              onChange={(v) => {
                field.onChange(v);
                setValue('origin_lga', '');
              }}
              placeholder="Select state..."
              error={errors.origin_state?.message}
            />
          )}
        />
        <Controller
          name="origin_lga"
          control={control}
          render={({ field }) => (
            <Select
              id="origin_lga"
              label="Origin LGA *"
              options={originLGAOptions}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={originState ? 'Select LGA...' : 'Select state first'}
              disabled={!originState || originLGAOptions.length === 0}
              error={errors.origin_lga?.message}
            />
          )}
        />
        <Input
          id="origin_market"
          label="Origin Market (optional)"
          placeholder="e.g. Mile 12 Market"
          error={errors.origin_market?.message}
          {...register('origin_market')}
        />

        {/* Destination */}
        <Controller
          name="destination_state"
          control={control}
          render={({ field }) => (
            <Select
              id="destination_state"
              label="Destination State *"
              options={STATE_OPTIONS}
              value={field.value ?? ''}
              onChange={(v) => {
                field.onChange(v);
                setValue('destination_lga', '');
              }}
              placeholder="Select state..."
              error={errors.destination_state?.message}
            />
          )}
        />
        <Controller
          name="destination_lga"
          control={control}
          render={({ field }) => (
            <Select
              id="destination_lga"
              label="Destination LGA *"
              options={destinationLGAOptions}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={destinationState ? 'Select LGA...' : 'Select state first'}
              disabled={!destinationState || destinationLGAOptions.length === 0}
              error={errors.destination_lga?.message}
            />
          )}
        />
        <Input
          id="destination_market"
          label="Destination Market (optional)"
          placeholder="e.g. Kano Central Market"
          error={errors.destination_market?.message}
          {...register('destination_market')}
        />

        {/* Schedule */}
        <Input
          id="departure_date"
          label="Departure Date *"
          type="date"
          error={errors.departure_date?.message}
          {...register('departure_date')}
        />
        <Input
          id="departure_time"
          label="Departure Time (optional)"
          type="time"
          error={errors.departure_time?.message}
          {...register('departure_time')}
        />

        {/* Vehicle */}
        <Input
          id="vehicle_reg"
          label="Vehicle Reg No *"
          placeholder="e.g. ABC-123-XY"
          className="font-mono uppercase"
          error={errors.vehicle_reg?.message}
          {...register('vehicle_reg')}
        />
        <Input
          id="driver_name"
          label="Driver Name (optional)"
          placeholder="Full name"
          error={errors.driver_name?.message}
          {...register('driver_name')}
        />
        <Input
          id="driver_phone"
          label="Driver Phone (optional)"
          placeholder="+234..."
          error={errors.driver_phone?.message}
          {...register('driver_phone')}
        />
      </div>

      <div className="mt-8 flex justify-between">
        <Button label="Back" variant="ghost" onClick={goBack} />
        <Button label="Next: Payment & Review" type="submit" variant="primary" />
      </div>
    </form>
  );
}
