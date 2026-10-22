import { useState } from 'react';
import { Button, formatMoney, useAsyncAction } from '../../../shared/index.js';
import { restockProduct } from '../services/productsApi.js';
import { StockIndicator } from './StockIndicator.jsx';

function RestockControl({ product, onRestocked }) {
  const [quantity, setQuantity] = useState('');
  const { run, loading, error } = useAsyncAction(restockProduct);
  const inputId = `restock-${product.id}`;

  async function handleSubmit(event) {
    event.preventDefault();
    if (await run(product.id, Number(quantity))) {
      setQuantity('');
      onRestocked();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">
          Unidades a reponer de {product.name}
        </label>
        <input
          id={inputId}
          type="number"
          min="1"
          required
          placeholder="uds."
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="h-8 w-20 border border-line bg-card px-2 text-right font-mono text-sm focus:border-ink focus:outline-none"
        />
        <Button type="submit" variant="secondary" size="sm" loading={loading}>
          Reponer
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error.message}</p>}
    </form>
  );
}

export function InventoryTable({ products, onChanged }) {
  return (
    <div className="overflow-x-auto border-t border-ink">
      <table className="w-full min-w-160 text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Código</th>
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Producto</th>
            <th scope="col" className="label-caps py-3 pr-4 text-right font-normal">Precio</th>
            <th scope="col" className="label-caps py-3 pr-4 font-normal">Existencias</th>
            <th scope="col" className="label-caps py-3 text-right font-normal">Reposición</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-line align-top">
              <td className="py-3 pr-4 font-mono text-xs leading-8 text-muted">{product.sku}</td>
              <td className="py-3 pr-4 leading-8 font-medium">{product.name}</td>
              <td className="py-3 pr-4 text-right font-mono leading-8 tabular">{formatMoney(product.price)}</td>
              <td className="py-3 pr-4 leading-8">
                <StockIndicator stock={product.stock} />
              </td>
              <td className="py-3">
                <RestockControl product={product} onRestocked={onChanged} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
