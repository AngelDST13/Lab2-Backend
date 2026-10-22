import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'tienda-lab2:cart';
const CartContext = createContext(null);

// localStorage puede fallar (modo privado, almacenamiento bloqueado): el carrito
// sigue funcionando en memoria aunque no se pueda guardar.
function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const clampQuantity = (quantity, stock) => Math.max(1, Math.min(quantity, stock));

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sin persistencia; no es crítico
    }
  }, [items]);

  const addItem = useCallback((product) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, stock: product.stock, quantity: clampQuantity(item.quantity + 1, product.stock) }
            : item,
        );
      }
      const { id, sku, name, price, stock } = product;
      return [...current, { productId: id, sku, name, price, stock, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: clampQuantity(quantity, item.stock) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return context;
}
