import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { AssistantPage } from '../features/assistant/index.js';
import { AuthProvider, LoginPage, RequireAuth } from '../features/auth/index.js';
import { CartPage, CartProvider } from '../features/cart/index.js';
import { OrderDetailPage, OrdersPage } from '../features/orders/index.js';
import { CatalogPage, InventoryPage } from '../features/products/index.js';
import { SummaryPage } from '../features/summary/index.js';
import { EmptyState, ThemeProvider } from '../shared/index.js';
import { Layout } from './Layout.jsx';

function NotFoundPage() {
  return (
    <EmptyState title="Esta página no existe">
      <Link to="/" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
        Volver al catálogo
      </Link>
    </EmptyState>
  );
}

export function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* El login tiene su propio diseño, sin el encabezado de la tienda */}
            <Route path="ingresar" element={<LoginPage />} />

            <Route element={<Layout />}>
              <Route index element={<CatalogPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route
                path="ordenes"
                element={
                  <RequireAuth>
                    <OrdersPage />
                  </RequireAuth>
                }
              />
              <Route
                path="ordenes/:id"
                element={
                  <RequireAuth>
                    <OrderDetailPage />
                  </RequireAuth>
                }
              />
              <Route
                path="inventario"
                element={
                  <RequireAuth roles={['ADMIN']}>
                    <InventoryPage />
                  </RequireAuth>
                }
              />
              <Route
                path="resumen"
                element={
                  <RequireAuth roles={['ADMIN']}>
                    <SummaryPage />
                  </RequireAuth>
                }
              />
              <Route
                path="ayuda"
                element={
                  <RequireAuth>
                    <AssistantPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}
