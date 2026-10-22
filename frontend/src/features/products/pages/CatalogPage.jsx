import { useState } from 'react';
import {
  Alert,
  EmptyState,
  LoadingState,
  PageHeader,
  inputClassName,
  useDebouncedValue,
  useFetch,
} from '../../../shared/index.js';
import { useCart } from '../../cart/index.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { getProducts } from '../services/productsApi.js';

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const { items, addItem } = useCart();

  const products = useFetch(
    (signal) => getProducts({ search: debouncedSearch, active: true }, signal),
    [debouncedSearch],
  );

  const quantityInCart = (productId) => items.find((item) => item.productId === productId)?.quantity ?? 0;
  const count = products.data?.length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={products.data ? `${count} ${count === 1 ? 'artículo' : 'artículos'}` : 'Catálogo'}
        title="Lo que tenemos hoy"
        description="Precios con impuestos incluidos. El stock se actualiza con cada compra."
        actions={
          <div className="w-full sm:w-72">
            <label htmlFor="search" className="label-caps mb-1.5 block">
              Buscar
            </label>
            <input
              id="search"
              type="search"
              className={inputClassName}
              placeholder="Nombre o código"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      />

      {products.loading && !products.data && <LoadingState label="Cargando catálogo" />}
      {products.error && <Alert tone="error" error={products.error} />}
      {products.data?.length === 0 && (
        <EmptyState title="Nada con ese nombre">Prueba con otra palabra o con el código del producto.</EmptyState>
      )}

      {count > 0 && (
        <div className="grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
          {products.data.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              position={index + 1}
              quantityInCart={quantityInCart(product.id)}
              onAdd={addItem}
            />
          ))}
        </div>
      )}
    </>
  );
}
