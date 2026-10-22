import { Link } from 'react-router';
import { Alert, Button, FormField, TotalsSummary, inputClassName } from '../../../shared/index.js';

function CouponField({ checkout }) {
  return (
    <FormField id="coupon" label="Cupón" hint={checkout.appliedCoupon ? `Aplicado: ${checkout.appliedCoupon}` : undefined}>
      <div className="flex">
        <input
          id="coupon"
          className={`${inputClassName} font-mono uppercase`}
          value={checkout.couponInput}
          onChange={(event) => checkout.setCouponInput(event.target.value)}
          placeholder="Código"
          disabled={Boolean(checkout.appliedCoupon)}
        />
        {checkout.appliedCoupon ? (
          <Button variant="secondary" className="-ml-px" onClick={checkout.removeCoupon}>
            Quitar
          </Button>
        ) : (
          <Button variant="secondary" className="-ml-px" onClick={checkout.applyCoupon} disabled={!checkout.couponInput.trim()}>
            Aplicar
          </Button>
        )}
      </div>
    </FormField>
  );
}

function SignInPrompt() {
  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm text-ink-soft">Ingresa para calcular el envío, aplicar cupones y confirmar tu compra.</p>
      <Link
        to="/ingresar"
        state={{ from: '/carrito' }}
        className="flex h-11 w-full items-center justify-center bg-ink text-sm font-medium text-card transition-colors duration-200 hover:bg-accent"
      >
        Ingresar para comprar
      </Link>
    </div>
  );
}

export function CheckoutPanel({ checkout }) {
  const { customers, zones, quote } = checkout;

  return (
    <aside className="h-fit border border-ink bg-card p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-2xl font-semibold">Resumen</h2>

      {!checkout.signedIn ? (
        <SignInPrompt />
      ) : (
        <>
          <div className="mt-6 space-y-5">
            {checkout.isAdmin && (
              <FormField id="customer" label="Cliente">
                <select
                  id="customer"
                  className={inputClassName}
                  value={checkout.customerId}
                  onChange={(event) => checkout.setCustomerId(event.target.value)}
                  disabled={customers.loading}
                >
                  <option value="">Elegir cliente</option>
                  {customers.data?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.fullName}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField id="zone" label="Envío a">
              <select
                id="zone"
                className={inputClassName}
                value={checkout.shippingZoneId}
                onChange={(event) => checkout.setShippingZoneId(event.target.value)}
                disabled={zones.loading}
              >
                <option value="">Elegir zona</option>
                {zones.data?.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </FormField>

            <CouponField checkout={checkout} />
          </div>

          <div className="mt-8 border-t border-line pt-4">
            {(customers.error || zones.error) && <Alert tone="error" error={customers.error ?? zones.error} />}
            {quote.error && <Alert tone="error" title="No pudimos calcular el total" error={quote.error} />}
            {quote.data && (
              <div key={JSON.stringify(quote.data)} className="animate-page-in">
                <TotalsSummary {...quote.data} />
              </div>
            )}
            {!quote.data && !quote.error && (
              <p className="text-sm text-muted">Elige la zona de envío para calcular el total.</p>
            )}
          </div>

          {checkout.placeOrderError && (
            <div className="mt-4">
              <Alert tone="error" title="No se pudo completar la compra" error={checkout.placeOrderError} />
            </div>
          )}

          <Button
            className="mt-6 w-full"
            onClick={checkout.placeOrder}
            loading={checkout.placingOrder}
            disabled={!checkout.canPlaceOrder}
          >
            Confirmar compra
          </Button>
        </>
      )}
    </aside>
  );
}
