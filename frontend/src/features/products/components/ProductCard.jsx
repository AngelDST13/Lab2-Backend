import { Button, formatMoney } from '../../../shared/index.js';
import { ProductIllustration } from './ProductIllustration.jsx';
import { StockIndicator } from './StockIndicator.jsx';

export function ProductCard({ product, position, quantityInCart, onAdd }) {
  const soldOut = product.stock === 0;
  const reachedStock = quantityInCart >= product.stock;

  return (
    <article
      style={{ '--i': Math.min(position, 12) }}
      className="group stagger animate-rise flex flex-col border-r border-b border-line bg-card/40 p-6 transition-colors duration-300 hover:bg-card"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs text-muted tabular">{String(position).padStart(2, '0')}</span>
        <span className="font-mono text-xs text-muted">{product.sku}</span>
      </div>

      <ProductIllustration
        sku={product.sku}
        className={`mx-auto my-8 h-24 w-36 transition duration-500 ease-out-soft ${soldOut ? 'text-line' : 'text-ink-soft group-hover:-translate-y-1 group-hover:text-accent'}`}
      />

      <h2 className="font-display text-xl leading-tight font-semibold">{product.name}</h2>
      <p className="mt-1 text-sm text-muted">
        <StockIndicator stock={product.stock} /> · {product.weightKg} kg
      </p>

      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <p className="font-mono text-lg tabular">{formatMoney(product.price)}</p>
        <Button variant="secondary" size="sm" onClick={() => onAdd(product)} disabled={soldOut || reachedStock}>
          {quantityInCart > 0 ? `En carrito · ${quantityInCart}` : 'Agregar'}
        </Button>
      </div>
    </article>
  );
}
