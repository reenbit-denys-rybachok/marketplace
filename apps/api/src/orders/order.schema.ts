import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Product id must be a valid UUID'),
        quantity: z
          .number({
            required_error: 'Quantity is required',
            invalid_type_error: 'Quantity must be a number',
          })
          .int('Quantity must be a whole number')
          .positive('Quantity must be greater than 0')
          .max(999, 'Quantity is too high'),
      }),
    )
    .min(1, 'Order must include at least one product'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
