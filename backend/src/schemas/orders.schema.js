import { z } from 'zod';
import { couponCodeSchema } from './coupons.schema.js';

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const orderItemSchema = z
  .object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(1000),
  })
  .strict();

// Se usa para cotizar (/quote) y para crear la orden.
// customerId solo lo toma en cuenta un ADMIN; a un CUSTOMER se le asigna el de su sesión.
export const orderInputSchema = z
  .object({
    customerId: z.number().int().positive().optional(),
    shippingZoneId: z.number().int().positive(),
    // "" desde un formulario vacío se trata como "sin cupón"
    couponCode: z.preprocess((value) => (value === '' ? undefined : value), couponCodeSchema.optional()),
    items: z
      .array(orderItemSchema)
      .min(1, 'La orden debe tener al menos un producto')
      .max(50)
      .refine(
        (items) => new Set(items.map((item) => item.productId)).size === items.length,
        'No repita productos; aumente la cantidad',
      ),
  })
  .strict();

export const listOrdersQuerySchema = z.object({
  customerId: z.coerce.number().int().positive().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
});

export const cancelOrderSchema = z
  .object({
    reason: z.string().trim().min(3).max(255),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(['PAID', 'SHIPPED', 'DELIVERED']),
  })
  .strict();
