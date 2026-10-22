-- =====================================================================
-- Circuito · Laboratorio #2 (Caso 5): tienda online
-- Motor: SQLite 3.37+ (tablas STRICT). Se ejecuta con: npm run db:init
--
-- Decisiones de diseño:
--  * Dinero en céntimos (INTEGER): SQLite no tiene un tipo decimal exacto y
--    REAL produce errores de redondeo. ₡15 000,00 se guarda como 1500000.
--  * Peso en gramos (INTEGER) por la misma razón.
--  * STRICT: SQLite rechaza un texto en una columna INTEGER (por defecto lo aceptaría).
--  * Fechas en TEXT ISO-8601 UTC ('2026-10-22T14:00:00.000Z'): se ordenan y comparan como texto.
--  * Booleanos como INTEGER con CHECK (valor IN (0, 1)).
--  * Restricciones con nombre (CONSTRAINT chk_...): el nombre aparece en el error
--    y el backend lo traduce a un mensaje claro.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- Script re-ejecutable: borra en orden inverso a las dependencias.
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS shipping_zones;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

-- ---------------------------------------------------------------------
-- Clientes (datos de facturación y envío)
-- ---------------------------------------------------------------------
CREATE TABLE customers (
    id          INTEGER PRIMARY KEY,
    full_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CONSTRAINT chk_customers_name  CHECK (length(trim(full_name)) BETWEEN 1 AND 120),
    CONSTRAINT chk_customers_email CHECK (email LIKE '%_@_%._%' AND length(email) <= 160)
) STRICT;

-- ---------------------------------------------------------------------
-- Usuarios (credenciales). Un CUSTOMER siempre está ligado a un cliente;
-- un ADMIN nunca lo está.
-- ---------------------------------------------------------------------
CREATE TABLE users (
    id             INTEGER PRIMARY KEY,
    email          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    display_name   TEXT    NOT NULL,
    password_hash  TEXT    NOT NULL,
    role           TEXT    NOT NULL,
    customer_id    INTEGER UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    is_active      INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CONSTRAINT chk_users_email     CHECK (email LIKE '%_@_%._%' AND length(email) <= 160),
    CONSTRAINT chk_users_name      CHECK (length(trim(display_name)) BETWEEN 1 AND 120),
    CONSTRAINT chk_users_hash      CHECK (password_hash LIKE 'scrypt$%'),
    CONSTRAINT chk_users_role      CHECK (role IN ('ADMIN', 'CUSTOMER')),
    CONSTRAINT chk_users_active    CHECK (is_active IN (0, 1)),
    CONSTRAINT chk_users_customer  CHECK ((role = 'CUSTOMER') = (customer_id IS NOT NULL))
) STRICT;

-- ---------------------------------------------------------------------
-- Sesiones: se guarda el SHA-256 del token, nunca el token.
-- Si alguien roba la base de datos, no puede usar las sesiones.
-- ---------------------------------------------------------------------
CREATE TABLE sessions (
    token_hash  TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    expires_at  TEXT    NOT NULL,

    CONSTRAINT chk_sessions_hash    CHECK (length(token_hash) = 64),
    CONSTRAINT chk_sessions_expiry  CHECK (expires_at > created_at)
) STRICT;

-- ---------------------------------------------------------------------
-- Productos (el stock nunca puede quedar negativo: lo garantiza la BD)
-- ---------------------------------------------------------------------
CREATE TABLE products (
    id            INTEGER PRIMARY KEY,
    sku           TEXT    NOT NULL UNIQUE,
    name          TEXT    NOT NULL,
    price_cents   INTEGER NOT NULL,
    stock         INTEGER NOT NULL DEFAULT 0,
    weight_grams  INTEGER NOT NULL,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CONSTRAINT chk_products_sku     CHECK (sku = upper(sku) AND length(sku) BETWEEN 1 AND 30),
    CONSTRAINT chk_products_name    CHECK (length(trim(name)) BETWEEN 1 AND 120),
    CONSTRAINT chk_products_price   CHECK (price_cents >= 0),
    CONSTRAINT chk_products_stock   CHECK (stock >= 0),
    CONSTRAINT chk_products_weight  CHECK (weight_grams > 0),
    CONSTRAINT chk_products_active  CHECK (is_active IN (0, 1))
) STRICT;

-- ---------------------------------------------------------------------
-- Zonas de envío: costo = base + costo_por_kg × peso.
-- Gratis si el subtotal con descuento alcanza free_shipping_from_cents.
-- ---------------------------------------------------------------------
CREATE TABLE shipping_zones (
    id                        INTEGER PRIMARY KEY,
    name                      TEXT    NOT NULL UNIQUE,
    base_cost_cents           INTEGER NOT NULL,
    cost_per_kg_cents         INTEGER NOT NULL,
    free_shipping_from_cents  INTEGER,

    CONSTRAINT chk_zones_base  CHECK (base_cost_cents >= 0),
    CONSTRAINT chk_zones_kg    CHECK (cost_per_kg_cents >= 0),
    CONSTRAINT chk_zones_free  CHECK (free_shipping_from_cents IS NULL OR free_shipping_from_cents > 0)
) STRICT;

-- ---------------------------------------------------------------------
-- Cupones: PERCENT usa discount_percent; FIXED usa discount_amount_cents.
-- El CHECK obliga a que solo exista el campo que corresponde al tipo.
-- ---------------------------------------------------------------------
CREATE TABLE coupons (
    id                     INTEGER PRIMARY KEY,
    code                   TEXT    NOT NULL UNIQUE,
    discount_type          TEXT    NOT NULL,
    discount_percent       INTEGER,
    discount_amount_cents  INTEGER,
    min_subtotal_cents     INTEGER NOT NULL DEFAULT 0,
    max_uses               INTEGER,
    times_used             INTEGER NOT NULL DEFAULT 0,
    valid_from             TEXT    NOT NULL,
    valid_until            TEXT    NOT NULL,
    is_active              INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_coupons_code   CHECK (code = upper(code) AND length(code) BETWEEN 1 AND 30),
    CONSTRAINT chk_coupons_value  CHECK (
        (discount_type = 'PERCENT' AND discount_percent BETWEEN 1 AND 100 AND discount_amount_cents IS NULL) OR
        (discount_type = 'FIXED'   AND discount_amount_cents > 0          AND discount_percent IS NULL)
    ),
    CONSTRAINT chk_coupons_min    CHECK (min_subtotal_cents >= 0),
    CONSTRAINT chk_coupons_usage  CHECK (times_used >= 0 AND (max_uses IS NULL OR (max_uses > 0 AND times_used <= max_uses))),
    CONSTRAINT chk_coupons_dates  CHECK (valid_until > valid_from),
    CONSTRAINT chk_coupons_active CHECK (is_active IN (0, 1))
) STRICT;

-- ---------------------------------------------------------------------
-- Órdenes (los montos son una "foto" del momento de la compra)
-- ---------------------------------------------------------------------
CREATE TABLE orders (
    id                INTEGER PRIMARY KEY,
    customer_id       INTEGER NOT NULL REFERENCES customers(id)      ON DELETE RESTRICT,
    shipping_zone_id  INTEGER NOT NULL REFERENCES shipping_zones(id) ON DELETE RESTRICT,
    coupon_id         INTEGER          REFERENCES coupons(id)        ON DELETE RESTRICT,
    status            TEXT    NOT NULL DEFAULT 'PENDING',
    subtotal_cents    INTEGER NOT NULL,
    discount_cents    INTEGER NOT NULL DEFAULT 0,
    shipping_cents    INTEGER NOT NULL DEFAULT 0,
    total_cents       INTEGER NOT NULL,
    created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    cancelled_at      TEXT,
    cancel_reason     TEXT,

    CONSTRAINT chk_orders_status    CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    CONSTRAINT chk_orders_amounts   CHECK (subtotal_cents >= 0 AND discount_cents >= 0 AND shipping_cents >= 0),
    CONSTRAINT chk_orders_discount  CHECK (discount_cents <= subtotal_cents),
    CONSTRAINT chk_orders_total     CHECK (total_cents = subtotal_cents - discount_cents + shipping_cents),
    CONSTRAINT chk_orders_coupon    CHECK (coupon_id IS NOT NULL OR discount_cents = 0),
    CONSTRAINT chk_orders_cancelled CHECK (
        (status = 'CANCELLED') = (cancelled_at IS NOT NULL) AND
        (cancelled_at IS NULL OR length(trim(cancel_reason)) >= 3)
    )
) STRICT;

-- Índice parcial: un cliente usa cada cupón una sola vez en órdenes vigentes.
-- Las órdenes CANCELLED no cuentan, así que cancelar libera el cupón.
CREATE UNIQUE INDEX uq_orders_customer_coupon_active
    ON orders (customer_id, coupon_id)
    WHERE coupon_id IS NOT NULL AND status <> 'CANCELLED';

-- Máquina de estados en la propia BD: aunque alguien ejecute un UPDATE a mano,
-- solo se permiten PENDING→PAID→SHIPPED→DELIVERED y cancelar desde PENDING o PAID.
CREATE TRIGGER trg_orders_status_transition
BEFORE UPDATE OF status ON orders
WHEN NOT (
    OLD.status = NEW.status OR
    (OLD.status = 'PENDING' AND NEW.status IN ('PAID', 'CANCELLED')) OR
    (OLD.status = 'PAID'    AND NEW.status IN ('SHIPPED', 'CANCELLED')) OR
    (OLD.status = 'SHIPPED' AND NEW.status = 'DELIVERED')
)
BEGIN
    SELECT RAISE(ABORT, 'INVALID_STATUS_TRANSITION');
END;

-- Los montos de una orden no se reescriben después de creada.
CREATE TRIGGER trg_orders_amounts_immutable
BEFORE UPDATE OF subtotal_cents, discount_cents, shipping_cents, total_cents, customer_id, coupon_id ON orders
BEGIN
    SELECT RAISE(ABORT, 'ORDER_AMOUNTS_IMMUTABLE');
END;

-- ---------------------------------------------------------------------
-- Detalle de la orden (unit_price_cents es una copia del precio al comprar)
-- ---------------------------------------------------------------------
CREATE TABLE order_items (
    id                INTEGER PRIMARY KEY,
    order_id          INTEGER NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id        INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity          INTEGER NOT NULL,
    unit_price_cents  INTEGER NOT NULL,
    line_total_cents  INTEGER GENERATED ALWAYS AS (quantity * unit_price_cents) STORED,

    CONSTRAINT chk_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_items_price    CHECK (unit_price_cents >= 0),
    CONSTRAINT uq_items_product   UNIQUE (order_id, product_id)
) STRICT;

-- ---------------------------------------------------------------------
-- Movimientos de inventario (auditoría: por qué cambió el stock)
-- ---------------------------------------------------------------------
CREATE TABLE stock_movements (
    id               INTEGER PRIMARY KEY,
    product_id       INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    order_id         INTEGER          REFERENCES orders(id)   ON DELETE RESTRICT,
    quantity_change  INTEGER NOT NULL,
    reason           TEXT    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

    CONSTRAINT chk_movements_reason CHECK (reason IN ('SALE', 'CANCELLATION', 'RESTOCK')),
    CONSTRAINT chk_movements_sign   CHECK (
        (reason = 'SALE' AND quantity_change < 0) OR
        (reason IN ('CANCELLATION', 'RESTOCK') AND quantity_change > 0)
    ),
    CONSTRAINT chk_movements_order  CHECK (reason = 'RESTOCK' OR order_id IS NOT NULL)
) STRICT;

-- Índices sobre llaves foráneas y filtros frecuentes
CREATE INDEX idx_sessions_user         ON sessions (user_id);
CREATE INDEX idx_orders_customer       ON orders (customer_id, created_at DESC);
CREATE INDEX idx_orders_status         ON orders (status);
CREATE INDEX idx_order_items_order     ON order_items (order_id);
CREATE INDEX idx_order_items_product   ON order_items (product_id);
CREATE INDEX idx_stock_movements_prod  ON stock_movements (product_id, created_at DESC);
CREATE INDEX idx_stock_movements_order ON stock_movements (order_id);

-- =====================================================================
-- DATOS DE PRUEBA (contraseñas en README.md → "Usuarios de prueba")
-- =====================================================================

INSERT INTO customers (full_name, email) VALUES
    ('Ana Rodríguez',   'ana@example.com'),
    ('Carlos Méndez',   'carlos@example.com'),
    ('Lucía Fernández', 'lucia@example.com');

INSERT INTO users (email, display_name, role, customer_id, password_hash) VALUES
    ('admin@circuito.cr', 'Administración', 'ADMIN', NULL,
     'scrypt$16384$8$1$+G/l2p/QfhfQ10zzxXDctw==$JeezbZzWwXcn6UvaeVHqMotWcAs5hzf7mMHsEwVBUNmUalHq7bOXU/Azn+ulqIN0y2plQeAElt0+OBXJW/YNxg=='),
    ('ana@example.com', 'Ana Rodríguez', 'CUSTOMER', (SELECT id FROM customers WHERE email = 'ana@example.com'),
     'scrypt$16384$8$1$3F6xqN17MhOrbupjTDZQog==$f7bCkECsIatPtGePAt3lhuPYLLOhwyugE8/VNLdF6AKs0fBDU84qy/CT+gHCaUOoLBWvQRN0/0ZMUCc7G7y1+Q=='),
    ('carlos@example.com', 'Carlos Méndez', 'CUSTOMER', (SELECT id FROM customers WHERE email = 'carlos@example.com'),
     'scrypt$16384$8$1$3F6xqN17MhOrbupjTDZQog==$f7bCkECsIatPtGePAt3lhuPYLLOhwyugE8/VNLdF6AKs0fBDU84qy/CT+gHCaUOoLBWvQRN0/0ZMUCc7G7y1+Q=='),
    ('lucia@example.com', 'Lucía Fernández', 'CUSTOMER', (SELECT id FROM customers WHERE email = 'lucia@example.com'),
     'scrypt$16384$8$1$3F6xqN17MhOrbupjTDZQog==$f7bCkECsIatPtGePAt3lhuPYLLOhwyugE8/VNLdF6AKs0fBDU84qy/CT+gHCaUOoLBWvQRN0/0ZMUCc7G7y1+Q==');

INSERT INTO products (sku, name, price_cents, stock, weight_grams) VALUES
    ('AUD-001', 'Audífonos Bluetooth',  1500000,  27,  300),
    ('TEC-001', 'Teclado mecánico',     3200000,  10, 1200),
    ('MOU-001', 'Mouse inalámbrico',     950000,  40,  150),
    ('MON-001', 'Monitor 24 pulgadas',  9500000,   5, 4500),
    ('CAB-001', 'Cable USB-C 1m',        250000, 100,   50),
    ('WEB-001', 'Webcam HD',            2100000,   0,  250);  -- agotado: sirve para probar 409

-- El stock inicial también queda auditado: suma(movimientos) = stock actual
INSERT INTO stock_movements (product_id, quantity_change, reason)
SELECT id, stock, 'RESTOCK' FROM products WHERE stock > 0;

INSERT INTO shipping_zones (name, base_cost_cents, cost_per_kg_cents, free_shipping_from_cents) VALUES
    ('Zona Metropolitana', 250000,  50000, 5000000),
    ('Zona Rural',         400000,  80000, 8000000),
    ('Zona Costera',       500000, 100000, NULL);       -- nunca tiene envío gratis

INSERT INTO coupons (code, discount_type, discount_percent, discount_amount_cents, min_subtotal_cents, max_uses, times_used, valid_from, valid_until) VALUES
    ('BIENVENIDA10', 'PERCENT', 10,   NULL, 1000000,  100, 0, '2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z'),
    ('AHORRA5000',   'FIXED',   NULL, 500000, 3000000, 50, 0, '2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z'),
    ('VENCIDO20',    'PERCENT', 20,   NULL,       0, NULL, 0, '2025-01-01T00:00:00.000Z', '2025-12-31T23:59:59.000Z'), -- vencido
    ('AGOTADO15',    'PERCENT', 15,   NULL,       0,    3, 3, '2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z'); -- sin usos

-- Orden de ejemplo, registrada igual que lo haría el backend:
-- 2 × Audífonos = ₡30 000 | peso 600 g | envío = 2500 + 500 × 0,6 = ₡2 800 | total ₡32 800
BEGIN;

INSERT INTO orders (customer_id, shipping_zone_id, status, subtotal_cents, discount_cents, shipping_cents, total_cents)
VALUES (
    (SELECT id FROM customers      WHERE email = 'ana@example.com'),
    (SELECT id FROM shipping_zones WHERE name  = 'Zona Metropolitana'),
    'PAID', 3000000, 0, 280000, 3280000
);

INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
VALUES ((SELECT max(id) FROM orders), (SELECT id FROM products WHERE sku = 'AUD-001'), 2, 1500000);

UPDATE products SET stock = stock - 2 WHERE sku = 'AUD-001';

INSERT INTO stock_movements (product_id, order_id, quantity_change, reason)
VALUES ((SELECT id FROM products WHERE sku = 'AUD-001'), (SELECT max(id) FROM orders), -2, 'SALE');

COMMIT;
