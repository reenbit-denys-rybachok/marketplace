import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(120, 'Product name must be 120 characters or less'),
  price: z.preprocess(
    (value) =>
      value === '' || value === undefined || value === null
        ? undefined
        : Number(value),
    z
      .number({
        required_error: 'Product price is required',
        invalid_type_error: 'Product price must be a number',
      })
      .positive('Product price must be greater than 0')
      .max(999999.99, 'Product price is too high'),
  ),
  categoryId: z.string().trim().min(1, 'Product category is required'),
  imageUrl: z.string().trim().url('Product image must be a valid URL').optional().or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
