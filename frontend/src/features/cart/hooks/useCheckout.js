import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { getCustomers, getShippingZones, useAsyncAction, useFetch } from '../../../shared/index.js';
import { useAuth } from '../../auth/index.js';
import { useCart } from '../context/CartContext.jsx';
import { createOrder, quoteOrder } from '../services/checkoutApi.js';

/**
 * Toda la lógica del checkout: zona, cupón, cotización automática con el backend
 * y confirmación. Un cliente compra para sí mismo (la API toma su id de la sesión);
 * solo administración elige para qué cliente es la orden.
 */
export function useCheckout() {
  const { items, clear } = useCart();
  const { status, isAdmin } = useAuth();
  const navigate = useNavigate();
  const signedIn = status === 'authenticated';

  const [customerId, setCustomerId] = useState('');
  const [shippingZoneId, setShippingZoneId] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const customers = useFetch((signal) => (isAdmin ? getCustomers(signal) : Promise.resolve([])), [isAdmin]);
  const zones = useFetch((signal) => getShippingZones(signal), []);

  const orderInput = useMemo(() => {
    const missingCustomer = isAdmin && !customerId;
    if (!signedIn || missingCustomer || !shippingZoneId || items.length === 0) return null;
    return {
      ...(isAdmin && { customerId: Number(customerId) }),
      shippingZoneId: Number(shippingZoneId),
      ...(appliedCoupon && { couponCode: appliedCoupon }),
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    };
  }, [signedIn, isAdmin, customerId, shippingZoneId, appliedCoupon, items]);

  // El backend calcula los montos: el frontend nunca decide precios ni descuentos.
  const quote = useFetch(
    (signal) => (orderInput ? quoteOrder(orderInput, signal) : Promise.resolve(null)),
    [JSON.stringify(orderInput)],
  );

  const placeOrderAction = useAsyncAction(createOrder);

  async function placeOrder() {
    if (!orderInput) return;
    const order = await placeOrderAction.run(orderInput);
    if (order) {
      clear();
      navigate(`/ordenes/${order.id}`);
    }
  }

  return {
    signedIn,
    isAdmin,
    customers,
    zones,
    quote,
    customerId,
    setCustomerId,
    shippingZoneId,
    setShippingZoneId,
    couponInput,
    setCouponInput,
    appliedCoupon,
    applyCoupon: () => setAppliedCoupon(couponInput.trim().toUpperCase()),
    removeCoupon: () => {
      setAppliedCoupon('');
      setCouponInput('');
    },
    canPlaceOrder: Boolean(orderInput && quote.data && !quote.loading),
    placeOrder,
    placingOrder: placeOrderAction.loading,
    placeOrderError: placeOrderAction.error,
  };
}
