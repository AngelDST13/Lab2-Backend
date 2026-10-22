import { Link } from 'react-router';
import { EmptyState, PageHeader } from '../../../shared/index.js';
import { CartItemRow } from '../components/CartItemRow.jsx';
import { CheckoutPanel } from '../components/CheckoutPanel.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCheckout } from '../hooks/useCheckout.js';

export function CartPage() {
  const { items, itemCount } = useCart();
  const checkout = useCheckout();

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Carrito" title="Todavía no hay nada aquí" />
        <EmptyState title="Tu carrito está vacío">
          <Link to="/" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
            Ver el catálogo
          </Link>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Carrito · ${itemCount} ${itemCount === 1 ? 'unidad' : 'unidades'}`}
        title="Revisa tu pedido"
        description="El total final lo calcula la tienda con los precios, el stock y los cupones vigentes."
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        <ul className="border-t border-ink">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </ul>
        <CheckoutPanel checkout={checkout} />
      </div>
    </>
  );
}
