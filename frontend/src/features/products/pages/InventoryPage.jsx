import { useState } from 'react';
import { Alert, LoadingState, PageHeader, useAsyncAction, useFetch } from '../../../shared/index.js';
import { InventoryTable } from '../components/InventoryTable.jsx';
import { ProductForm } from '../components/ProductForm.jsx';
import { createProduct, getProducts } from '../services/productsApi.js';

export function InventoryPage() {
  const products = useFetch((signal) => getProducts({}, signal), []);
  const createAction = useAsyncAction(createProduct);
  const [created, setCreated] = useState(null);

  async function handleCreate(product) {
    setCreated(null);
    const result = await createAction.run(product);
    if (result) {
      setCreated(result);
      products.refetch();
    }
    return result;
  }

  return (
    <>
      <PageHeader
        eyebrow="Bodega"
        title="Inventario"
        description="Cada reposición queda registrada como movimiento de inventario. El stock solo baja con ventas y sube con reposiciones o cancelaciones."
      />

      <section aria-labelledby="stock-title" className="mb-16">
        <h2 id="stock-title" className="mb-4 font-display text-2xl font-semibold">
          Existencias
        </h2>
        {products.loading && !products.data && <LoadingState label="Cargando inventario" />}
        {products.error && <Alert tone="error" error={products.error} />}
        {products.data && <InventoryTable products={products.data} onChanged={products.refetch} />}
      </section>

      <section aria-labelledby="new-product-title" className="border-t border-ink pt-8">
        <h2 id="new-product-title" className="mb-6 font-display text-2xl font-semibold">
          Agregar producto
        </h2>
        <div className="space-y-5">
          {created && (
            <Alert tone="success">
              {created.sku} · {created.name} ya está en el catálogo.
            </Alert>
          )}
          {createAction.error && <Alert tone="error" title="No se guardó el producto" error={createAction.error} />}
          <ProductForm onSubmit={handleCreate} submitting={createAction.loading} />
        </div>
      </section>
    </>
  );
}
