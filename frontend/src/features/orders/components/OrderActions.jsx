import { useState } from 'react';
import { Alert, Button, FormField, inputClassName, useAsyncAction } from '../../../shared/index.js';
import { useAuth } from '../../auth/index.js';
import { cancelOrder, updateOrderStatus } from '../services/ordersApi.js';
import { NEXT_STATUS, NEXT_STATUS_ACTION, isCancellable } from '../utils/orderStatus.js';

export function OrderActions({ order, onChanged }) {
  const { isAdmin } = useAuth();
  const [reason, setReason] = useState('');
  const statusAction = useAsyncAction(updateOrderStatus);
  const cancelAction = useAsyncAction(cancelOrder);

  // Avanzar el estado (pagar, enviar, entregar) es tarea de administración
  const nextStatus = isAdmin ? NEXT_STATUS[order.status] : undefined;
  const canCancel = isCancellable(order.status);

  if (!nextStatus && !canCancel) {
    return (
      <aside className="h-fit border border-line p-6 text-sm text-muted">
        {order.status === 'CANCELLED' ? 'Esta orden fue cancelada.' : 'Esta orden ya va en camino y no admite cambios.'}
      </aside>
    );
  }

  async function handleAdvance() {
    if (await statusAction.run(order.id, nextStatus)) onChanged();
  }

  async function handleCancel(event) {
    event.preventDefault();
    if (await cancelAction.run(order.id, reason.trim())) {
      setReason('');
      onChanged();
    }
  }

  return (
    <aside className="h-fit border border-ink bg-card p-6">
      <h2 className="font-display text-xl font-semibold">Gestionar</h2>

      {nextStatus && (
        <div className="mt-5 space-y-3">
          <Button className="w-full" onClick={handleAdvance} loading={statusAction.loading}>
            {NEXT_STATUS_ACTION[nextStatus]}
          </Button>
          {statusAction.error && <Alert tone="error" error={statusAction.error} />}
        </div>
      )}

      {canCancel && (
        <form onSubmit={handleCancel} className={`space-y-3 ${nextStatus ? 'mt-6 border-t border-line pt-5' : 'mt-5'}`}>
          <FormField id="cancel-reason" label="Motivo de cancelación" hint="Se devuelve el stock y el cupón vuelve a quedar disponible.">
            <input
              id="cancel-reason"
              required
              minLength={3}
              maxLength={255}
              className={inputClassName}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </FormField>
          <Button type="submit" variant="danger" className="w-full" loading={cancelAction.loading}>
            Cancelar orden
          </Button>
          {cancelAction.error && <Alert tone="error" error={cancelAction.error} />}
        </form>
      )}
    </aside>
  );
}
