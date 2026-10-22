import { useState } from 'react';
import { Button, FormField, inputClassName } from '../../../shared/index.js';

const EMPTY_FORM = { sku: '', name: '', price: '', stock: '', weightKg: '' };

// Validación en cliente solo para UX; el backend vuelve a validar todo.
export function ProductForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    const created = await onSubmit({
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      weightKg: Number(form.weightKg),
    });
    if (created) setForm(EMPTY_FORM);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <FormField id="sku" label="Código (SKU)" hint="Prefijo de categoría + número, ej. AUD-002">
        <input id="sku" required maxLength={30} className={`${inputClassName} font-mono uppercase`} value={form.sku} onChange={updateField('sku')} />
      </FormField>
      <div className="sm:col-span-1 lg:col-span-2">
        <FormField id="name" label="Nombre">
          <input id="name" required maxLength={120} className={inputClassName} value={form.name} onChange={updateField('name')} />
        </FormField>
      </div>
      <FormField id="price" label="Precio (₡)">
        <input id="price" required type="number" min="0" step="0.01" className={`${inputClassName} font-mono`} value={form.price} onChange={updateField('price')} />
      </FormField>
      <FormField id="stock" label="Unidades iniciales">
        <input id="stock" required type="number" min="0" step="1" className={`${inputClassName} font-mono`} value={form.stock} onChange={updateField('stock')} />
      </FormField>
      <FormField id="weightKg" label="Peso (kg)" hint="Se usa para calcular el envío">
        <input id="weightKg" required type="number" min="0.001" step="0.001" className={`${inputClassName} font-mono`} value={form.weightKg} onChange={updateField('weightKg')} />
      </FormField>
      <div className="sm:col-span-2 lg:col-span-3">
        <Button type="submit" loading={submitting}>
          Guardar producto
        </Button>
      </div>
    </form>
  );
}
