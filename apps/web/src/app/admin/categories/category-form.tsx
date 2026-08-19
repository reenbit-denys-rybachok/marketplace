'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api-client';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(120, 'Category name must be 120 characters or less'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type CategoryFormProps = {
  onCreated?: (category: Category) => void;
  onCancel?: () => void;
};

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return getErrorMessage(error.response?.data);
  }

  if (
    error &&
    typeof error === 'object' &&
    'errors' in error &&
    error.errors &&
    typeof error.errors === 'object'
  ) {
    const fieldErrors = Object.values(error.errors).flat();
    const firstError = fieldErrors.find((item) => typeof item === 'string');

    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Category was not created';
}

export function CategoryForm({ onCancel, onCreated }: CategoryFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: CategoryFormValues) {
    setServerMessage(null);
    setServerError(null);

    try {
      const response = await apiClient.post<Category>('/api/categories', values);
      const category = response.data;

      setServerMessage(`Created category: ${category.name}`);
      onCreated?.(category);
      reset();
    } catch (requestError) {
      setServerError(getErrorMessage(requestError));
      return;
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="name">Category name</label>
        <input
          id="name"
          type="text"
          placeholder="Home goods"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="dialog-actions">
        <button className="button" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create category'}
        </button>
      </div>

      {serverMessage ? <p className="form-success">{serverMessage}</p> : null}
      {serverError ? <p className="field-error">{serverError}</p> : null}
    </form>
  );
}
