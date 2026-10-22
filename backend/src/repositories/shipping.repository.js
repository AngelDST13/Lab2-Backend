import { db } from '../db.js';

const ZONE_COLUMNS = `
  id, name,
  base_cost_cents / 100.0          AS baseCost,
  cost_per_kg_cents / 100.0        AS costPerKg,
  free_shipping_from_cents / 100.0 AS freeShippingFrom,
  base_cost_cents                  AS baseCostCents,
  cost_per_kg_cents                AS costPerKgCents,
  free_shipping_from_cents         AS freeShippingFromCents`;

export function findAllZones() {
  return db.prepare(`SELECT ${ZONE_COLUMNS} FROM shipping_zones ORDER BY name`).all();
}

export function findZoneById(id) {
  return db.prepare(`SELECT ${ZONE_COLUMNS} FROM shipping_zones WHERE id = ?`).get(id) ?? null;
}
