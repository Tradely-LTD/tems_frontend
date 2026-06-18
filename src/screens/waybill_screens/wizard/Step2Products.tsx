import { useState } from 'react';
import { Input } from '@/components/Inputs';
import { Select } from '@/components/Select';
import { Button } from '@/components/Buttons';
import { useWizard } from './WizardContext';
import type { WizardStep2Product } from '../services/types';

const UNIT_OPTIONS = [
  { label: 'kg', value: 'kg' },
  { label: 'Tonnes', value: 'tonnes' },
  { label: 'Bags', value: 'bags' },
  { label: 'Units', value: 'units' },
  { label: 'Litres', value: 'litres' },
  { label: 'Crates', value: 'crates' },
];

const emptyProduct = (): WizardStep2Product => ({
  description: '',
  commodity_code: '',
  quantity: 0,
  unit: 'kg',
  weight_kg: 0,
  declared_unit_value: 0,
  declared_total_value: 0,
});

interface FieldErrors {
  description?: string;
  commodity_code?: string;
  quantity?: string;
  unit?: string;
  declared_unit_value?: string;
}

function validateProducts(products: WizardStep2Product[]): Record<number, FieldErrors> {
  const errors: Record<number, FieldErrors> = {};
  products.forEach((p, i) => {
    const fieldErrors: FieldErrors = {};
    if (!p.description.trim()) fieldErrors.description = 'Description is required';
    if (!p.commodity_code.trim()) fieldErrors.commodity_code = 'Commodity code is required';
    if (!p.quantity || p.quantity <= 0) fieldErrors.quantity = 'Quantity must be greater than 0';
    if (!p.unit) fieldErrors.unit = 'Unit is required';
    if (p.declared_unit_value < 0) fieldErrors.declared_unit_value = 'Value cannot be negative';
    if (Object.keys(fieldErrors).length > 0) errors[i] = fieldErrors;
  });
  return errors;
}

export default function Step2Products() {
  const { data, updateStep2, goNext, goBack } = useWizard();

  const [products, setProducts] = useState<WizardStep2Product[]>(
    data.step2.products.length > 0 ? data.step2.products : [emptyProduct()]
  );
  const [errors, setErrors] = useState<Record<number, FieldErrors>>({});

  function updateProduct(idx: number, field: keyof WizardStep2Product, value: string | number) {
    setProducts((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addProduct() {
    setProducts((prev) => [...prev, emptyProduct()]);
  }

  function removeProduct(idx: number) {
    setProducts((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => {
      const next: Record<number, FieldErrors> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) next[ki] = v;
        else if (ki > idx) next[ki - 1] = v;
      });
      return next;
    });
  }

  function handleNext() {
    const fieldErrors = validateProducts(products);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateStep2({ products });
    goNext();
  }

  return (
    <div>
      <h2 className="text-[18px] font-semibold text-[#1a1b20] mb-6">
        Commodity Details
      </h2>

      <div className="flex flex-col gap-6">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="border border-[#c5c6d2] rounded p-4 bg-[#faf8ff]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-[#444650] uppercase tracking-wide">
                Product {idx + 1}
              </span>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(idx)}
                  className="text-[12px] text-[#D83B01] font-medium hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id={`description_${idx}`}
                label="Description *"
                placeholder="e.g. Dried Beans"
                value={product.description}
                onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                error={errors[idx]?.description}
              />
              <Input
                id={`commodity_code_${idx}`}
                label="Commodity Code *"
                placeholder="e.g. AGR-002"
                className="font-mono"
                value={product.commodity_code}
                onChange={(e) => updateProduct(idx, 'commodity_code', e.target.value)}
                error={errors[idx]?.commodity_code}
              />
              <Input
                id={`quantity_${idx}`}
                label="Quantity *"
                type="number"
                min={0}
                value={product.quantity || ''}
                onChange={(e) => updateProduct(idx, 'quantity', parseFloat(e.target.value) || 0)}
                error={errors[idx]?.quantity}
              />
              <Select
                id={`unit_${idx}`}
                label="Unit *"
                options={UNIT_OPTIONS}
                value={product.unit}
                onChange={(v) => updateProduct(idx, 'unit', v)}
                error={errors[idx]?.unit}
              />
              <Input
                id={`weight_kg_${idx}`}
                label="Weight (kg) *"
                type="number"
                min={0}
                value={product.weight_kg || ''}
                onChange={(e) => updateProduct(idx, 'weight_kg', parseFloat(e.target.value) || 0)}
              />
              <Input
                id={`declared_unit_value_${idx}`}
                label="Unit Value (₦) *"
                type="number"
                min={0}
                value={product.declared_unit_value || ''}
                onChange={(e) =>
                  updateProduct(idx, 'declared_unit_value', parseFloat(e.target.value) || 0)
                }
                error={errors[idx]?.declared_unit_value}
              />
              <Input
                id={`declared_total_value_${idx}`}
                label="Total Value (₦) *"
                type="number"
                min={0}
                value={product.declared_total_value || ''}
                onChange={(e) =>
                  updateProduct(idx, 'declared_total_value', parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addProduct}
          className="flex items-center gap-2 text-[14px] font-medium text-[#002366] hover:underline self-start"
        >
          <span className="text-[18px] leading-none">+</span>
          Add Product
        </button>
      </div>

      <div className="mt-8 flex justify-between">
        <Button label="Back" variant="ghost" onClick={goBack} />
        <Button label="Next: Route & Vehicle" variant="primary" onClick={handleNext} />
      </div>
    </div>
  );
}
