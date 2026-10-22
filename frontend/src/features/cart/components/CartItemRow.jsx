import { formatMoney } from '../../../shared/index.js';
import { useCart } from '../context/CartContext.jsx';

const stepperButton =
  'h-9 w-9 text-ink-soft transition-colors hover:bg-ink hover:text-card disabled:text-line disabled:hover:bg-transparent';

export function CartItemRow({ item }) {
  const { setQuantity, removeItem } = useCart();
  const inputId = `qty-${item.productId}`;

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 border-b border-line py-5 sm:grid-cols-[1fr_auto_8rem]">
      <div>
        <p className="font-mono text-xs text-muted">{item.sku}</p>
        <p className="mt-0.5 font-medium">{item.name}</p>
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          className="mt-1 text-xs text-muted underline decoration-line underline-offset-4 hover:text-danger"
        >
          Quitar
        </button>
      </div>

      <div className="flex items-center border border-line bg-card">
        <button
          type="button"
          className={stepperButton}
          aria-label={`Una unidad menos de ${item.name}`}
          disabled={item.quantity <= 1}
          onClick={() => setQuantity(item.productId, item.quantity - 1)}
        >
          −
        </button>
        <label htmlFor={inputId} className="sr-only">
          Cantidad de {item.name}
        </label>
        <input
          id={inputId}
          type="number"
          min={1}
          max={item.stock}
          value={item.quantity}
          onChange={(event) => setQuantity(item.productId, Number(event.target.value) || 1)}
          className="h-9 w-12 border-x border-line bg-transparent text-center font-mono text-sm tabular [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          className={stepperButton}
          aria-label={`Una unidad más de ${item.name}`}
          disabled={item.quantity >= item.stock}
          onClick={() => setQuantity(item.productId, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <p className="col-span-2 text-right font-mono tabular sm:col-span-1">{formatMoney(item.price * item.quantity)}</p>
    </li>
  );
}
