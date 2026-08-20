'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api-client';
import { isAxiosError } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const productSchema = z.object({
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
  imageUrl: z.string().trim().url('Product image must be a valid URL').optional(),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or less')
    .optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export type Category = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  category: Category;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductFormProps = {
  categories: Category[];
  onCreated?: (product: Product) => void;
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

  return 'Product was not created';
}

export function ProductForm({
  categories,
  onCancel,
  onCreated,
}: ProductFormProps) {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: undefined,
      categoryId: '',
      imageUrl: undefined,
      description: '',
    },
  });

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setServerError(null);

    if (!file) {
      setSelectedImage(null);
      setImagePreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setServerError('Only image files are allowed');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setServerError('Product image must be 5MB or less');
      event.target.value = '';
      return;
    }

    setSelectedImage(file);
    setImagePreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }

      return URL.createObjectURL(file);
    });
  }

  async function onSubmit(values: ProductFormValues) {
    setServerMessage(null);
    setServerError(null);

    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const uploadResponse = await apiClient.post<{ url: string }>(
          '/api/uploads/product-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        imageUrl = uploadResponse.data.url;
      }

      const response = await apiClient.post<Product>('/api/products', {
        ...values,
        imageUrl,
      });
      const product = response.data;

      setServerMessage(`Created product: ${product.name}`);
      onCreated?.(product);
      setSelectedImage(null);
      setImagePreviewUrl(null);
      reset();
    } catch (requestError) {
      setServerError(getErrorMessage(requestError));
      return;
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="field">
        <label htmlFor="name">Product name</label>
        <input
          id="name"
          type="text"
          placeholder="Handmade Ceramic Mug"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="price">Price</label>
        <input
          id="price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="28.00"
          aria-invalid={Boolean(errors.price)}
          {...register('price')}
        />
        {errors.price ? (
          <p className="field-error">{errors.price.message}</p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="categoryId">Category</label>
        <select
          id="categoryId"
          aria-invalid={Boolean(errors.categoryId)}
          disabled={categories.length === 0}
          {...register('categoryId')}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <p className="field-error">{errors.categoryId.message}</p>
        ) : null}
        {categories.length === 0 ? (
          <p className="field-error">Create a category before adding products.</p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="image">Product image</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imagePreviewUrl ? (
          <div className="image-preview">
            <img src={imagePreviewUrl} alt="Selected product preview" />
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={5}
          placeholder="Short product description"
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        {errors.description ? (
          <p className="field-error">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="dialog-actions">
        <button className="button" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create product'}
        </button>
      </div>

      {serverMessage ? <p className="form-success">{serverMessage}</p> : null}
      {serverError ? <p className="field-error">{serverError}</p> : null}
    </form>
  );
}
