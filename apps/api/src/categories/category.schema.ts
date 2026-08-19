import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(120, 'Category name must be 120 characters or less'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
