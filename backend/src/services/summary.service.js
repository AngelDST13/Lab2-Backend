import { withSnapshot } from '../db.js';
import * as summaryRepository from '../repositories/summary.repository.js';

const TOP_LIMIT = 5;
const LOW_STOCK_THRESHOLD = 5;

export function getSummary({ days }) {
  // Todas las consultas leen la misma foto de los datos
  return withSnapshot(() => {
    const byStatus = summaryRepository.getOrdersByStatus();
    const allOrders = byStatus.reduce((sum, row) => sum + row.orders, 0);
    const cancelled = byStatus.find((row) => row.status === 'CANCELLED')?.orders ?? 0;

    return {
      generatedAt: new Date().toISOString(),
      sales: {
        ...summaryRepository.getSalesTotals(),
        cancellationRate: allOrders === 0 ? 0 : Math.round((cancelled / allOrders) * 1000) / 10,
      },
      ordersByStatus: byStatus,
      topProducts: summaryRepository.getTopProducts(TOP_LIMIT),
      topCustomers: summaryRepository.getTopCustomers(TOP_LIMIT),
      salesByZone: summaryRepository.getSalesByZone(),
      couponUsage: summaryRepository.getCouponUsage(),
      inventory: { ...summaryRepository.getInventory(LOW_STOCK_THRESHOLD), lowStockThreshold: LOW_STOCK_THRESHOLD },
      dailySales: { days, rows: summaryRepository.getDailySales(days) },
    };
  });
}
