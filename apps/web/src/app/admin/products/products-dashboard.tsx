'use client';

import * as Dialog from '@radix-ui/react-dialog';
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Category, Product, ProductForm } from './product-form';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Products', icon: Package, href: '/', active: true },
  { label: 'Orders', icon: ShoppingCart, href: '/' },
  { label: 'Inventory', icon: Boxes, href: '/' },
  { label: 'Customers', icon: Users, href: '/' },
  { label: 'Analytics', icon: BarChart3, href: '/' },
  { label: 'Settings', icon: Settings, href: '/' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPrice(value: string) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

export function ProductsDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const productsWithDescription = useMemo(
    () => products.filter((product) => product.description).length,
    [products],
  );

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

    async function loadProducts() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/products`),
          fetch(`${apiUrl}/api/categories`),
        ]);

        if (!productsResponse.ok) {
          throw new Error('Products could not be loaded');
        }

        if (!categoriesResponse.ok) {
          throw new Error('Categories could not be loaded');
        }

        const productsData = (await productsResponse.json()) as Product[];
        const categoriesData = (await categoriesResponse.json()) as Category[];

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Products could not be loaded',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  function handleCreated(product: Product) {
    setProducts((currentProducts) => [product, ...currentProducts]);
    setIsCreateDialogOpen(false);
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="brand-mark">M</span>
          <span>MarketOps</span>
        </a>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                className={item.active ? 'sidebar-link active' : 'sidebar-link'}
                href={item.href}
                key={item.label}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <a className="sales-channel" href="/">
          <Store size={18} />
          <span>Online Store</span>
        </a>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="search-box">
            <Search size={18} />
            <input type="search" placeholder="Search products" />
          </div>
          <Dialog.Root
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <Dialog.Trigger asChild>
              <button className="button compact" type="button">
                <Plus size={16} />
                <span>Add product</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="dialog-content">
                <div className="dialog-header">
                  <div>
                    <Dialog.Title className="dialog-title">
                      Create product
                    </Dialog.Title>
                    <Dialog.Description className="dialog-description">
                      Add a product name, price, category and optional
                      description to the catalog.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="icon-button" aria-label="Close">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <ProductForm
                  categories={categories}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  onCreated={handleCreated}
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>

        <section className="admin-page-title">
          <div>
            <p className="eyebrow">Products</p>
            <h1>Product catalog</h1>
          </div>
        </section>

        <section className="metric-grid" aria-label="Product summary">
          <div className="metric-card">
            <span>Total products</span>
            <strong>{products.length}</strong>
          </div>
          <div className="metric-card">
            <span>With description</span>
            <strong>{productsWithDescription}</strong>
          </div>
          <div className="metric-card">
            <span>Draft fields</span>
            <strong>{products.length - productsWithDescription}</strong>
          </div>
        </section>

        <div className="product-workspace">
          <section className="admin-panel product-list-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Products</h2>
              </div>
            </div>

            {isLoading ? <p className="panel-state">Loading products...</p> : null}
            {error ? <p className="field-error">{error}</p> : null}

            {!isLoading && !error && products.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <h3>No products yet</h3>
                <p>Create the first product with the Add product button.</p>
              </div>
            ) : null}

            {products.length > 0 ? (
              <div className="product-table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <span className="product-avatar">
                              {product.name.slice(0, 1).toUpperCase()}
                            </span>
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td className="price-cell">{formatPrice(product.price)}</td>
                        <td className="muted-cell">
                          {product.category?.name ?? 'No category'}
                        </td>
                        <td className="muted-cell">
                          {product.description || 'No description'}
                        </td>
                        <td className="muted-cell">{formatDate(product.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>

        </div>
      </main>
    </div>
  );
}
