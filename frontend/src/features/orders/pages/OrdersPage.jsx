import { useState } from 'react';
import {
  Alert,
  EmptyState,
  FormField,
  LoadingState,
  PageHeader,
  getCustomers,
  inputClassName,
  useFetch,
} from '../../../shared/index.js';
import { useAuth } from '../../auth/index.js';
import { OrdersTable } from '../components/OrdersTable.jsx';
import { getOrders } from '../services/ordersApi.js';
import { STATUS_LABELS } from '../utils/orderStatus.js';

export function OrdersPage() {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');

  // Un cliente solo recibe sus órdenes: el filtro lo aplica la API, no este componente
  const customers = useFetch((signal) => (isAdmin ? getCustomers(signal) : Promise.resolve([])), [isAdmin]);
  const orders = useFetch((signal) => getOrders({ status, customerId }, signal), [status, customerId]);

  return (
    <>
      <PageHeader
        eyebrow={isAdmin ? 'Ventas' : 'Tu cuenta'}
        title={isAdmin ? 'Órdenes' : 'Mis órdenes'}
        description="Las órdenes pendientes o pagadas se pueden cancelar; el stock vuelve al inventario."
        actions={
          <div className={`grid w-full gap-3 ${isAdmin ? 'grid-cols-2 sm:w-md' : 'sm:w-56'}`}>
            <FormField id="status-filter" label="Estado">
              <select id="status-filter" className={inputClassName} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            {isAdmin && (
              <FormField id="customer-filter" label="Cliente">
                <select
                  id="customer-filter"
                  className={inputClassName}
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                >
                  <option value="">Todos</option>
                  {customers.data?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
          </div>
        }
      />

      {orders.loading && !orders.data && <LoadingState label="Cargando órdenes" />}
      {orders.error && <Alert tone="error" error={orders.error} />}
      {orders.data?.length === 0 && (
        <EmptyState title={status ? 'No hay órdenes con ese estado' : 'Todavía no hay órdenes'} />
      )}
      {orders.data?.length > 0 && <OrdersTable orders={orders.data} showCustomer={isAdmin} />}
    </>
  );
}
