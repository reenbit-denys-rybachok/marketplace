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
  Tag,
  Users,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useEffect, useMemo, useState } from 'react';
import { Category, CategoryForm } from './category-form';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Products', icon: Package, href: '/' },
  { label: 'Categories', icon: Tag, href: '/admin/categories', active: true },
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

export function CategoriesDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const recentlyUpdated = useMemo(
    () =>
      categories.filter((category) => category.updatedAt !== category.createdAt)
        .length,
    [categories],
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await apiClient.get<Category[]>('/api/categories');
        setCategories(response.data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Categories could not be loaded',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategories();
  }, []);

  function handleCreated(category: Category) {
    setCategories((currentCategories) =>
      [category, ...currentCategories].sort((first, second) =>
        first.name.localeCompare(second.name),
      ),
    );
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
            <input type="search" placeholder="Search categories" />
          </div>
          <Dialog.Root
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <Dialog.Trigger asChild>
              <button className="button compact" type="button">
                <Plus size={16} />
                <span>Add category</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay" />
              <Dialog.Content className="dialog-content">
                <div className="dialog-header">
                  <div>
                    <Dialog.Title className="dialog-title">
                      Create category
                    </Dialog.Title>
                    <Dialog.Description className="dialog-description">
                      Add a category name to organize products in the catalog.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close className="icon-button" aria-label="Close">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <CategoryForm
                  onCancel={() => setIsCreateDialogOpen(false)}
                  onCreated={handleCreated}
                />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>

        <section className="admin-page-title">
          <div>
            <p className="eyebrow">Categories</p>
            <h1>Category catalog</h1>
          </div>
        </section>

        <section className="metric-grid" aria-label="Category summary">
          <div className="metric-card">
            <span>Total categories</span>
            <strong>{categories.length}</strong>
          </div>
          <div className="metric-card">
            <span>Updated categories</span>
            <strong>{recentlyUpdated}</strong>
          </div>
          <div className="metric-card">
            <span>New categories</span>
            <strong>{categories.length - recentlyUpdated}</strong>
          </div>
        </section>

        <div className="product-workspace">
          <section className="admin-panel product-list-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Categories</h2>
              </div>
            </div>

            {isLoading ? (
              <p className="panel-state">Loading categories...</p>
            ) : null}
            {error ? <p className="field-error panel-state">{error}</p> : null}

            {!isLoading && !error && categories.length === 0 ? (
              <div className="empty-state">
                <Tag size={32} />
                <h3>No categories yet</h3>
                <p>Create the first category with the Add category button.</p>
              </div>
            ) : null}

            {categories.length > 0 ? (
              <div className="product-table-wrap">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Created</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="product-cell">
                            <span className="product-avatar">
                              {category.name.slice(0, 1).toUpperCase()}
                            </span>
                            <span>{category.name}</span>
                          </div>
                        </td>
                        <td className="muted-cell">
                          {formatDate(category.createdAt)}
                        </td>
                        <td className="muted-cell">
                          {formatDate(category.updatedAt)}
                        </td>
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
