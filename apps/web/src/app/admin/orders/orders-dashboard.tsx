'use client';

import {
  BarChart3,
  Boxes,
  CalendarClock,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  Users,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { Product } from '../products/product-form';
import { useEffect, useMemo, useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Products', icon: Package, href: '/' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders', active: true },
  { label: 'Inventory', icon: Boxes, href: '/' },
  { label: 'Customers', icon: Users, href: '/' },
  { label: 'Analytics', icon: BarChart3, href: '/' },
  { label: 'Settings', icon: Settings, href: '/' },
];

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
};

type Order = {
  id: string;
  status: OrderStatus;
  total: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatPrice(value: string | number) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function getOrderItemCount(order: Order) {
  return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders],
  );

  const totalRevenue = useMemo(
    () => orders.reduce((total, order) => total + Number(order.total), 0),
    [orders],
  );

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await apiClient.get<Order[]>('/api/orders');
        setOrders(response.data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Orders could not be loaded',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="brand-mark">M</span>
          <span>MarketOps</span>
        </a>

        <a className="sales-channel" href="/store">
          <Store size={18} />
          <span>Online Store</span>
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
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="search-box">
            <Search size={18} />
            <input type="search" placeholder="Search orders" />
          </div>
        </header>

        <section className="admin-page-title">
          <div>
            <p className="eyebrow">Orders</p>
            <h1>Customer orders</h1>
          </div>
        </section>

        <section className="metric-grid" aria-label="Order summary">
          <div className="metric-card">
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </div>
          <div className="metric-card">
            <span>Pending</span>
            <strong>{pendingOrders}</strong>
          </div>
          <div className="metric-card">
            <span>Revenue</span>
            <strong>{formatPrice(totalRevenue)}</strong>
          </div>
        </section>

        <section className="admin-panel product-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Sales</p>
              <h2>Orders</h2>
            </div>
          </div>

          {isLoading ? <p className="panel-state">Loading orders...</p> : null}
          {error ? <p className="field-error panel-state">{error}</p> : null}

          {!isLoading && !error && orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={32} />
              <h3>No orders yet</h3>
              <p>Orders created from the Online Store will appear here.</p>
            </div>
          ) : null}

          {orders.length > 0 ? (
            <div className="product-table-wrap">
              <table className="product-table orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-avatar">
                            <ShoppingCart size={16} />
                          </span>
                          <span>#{order.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="order-items">
                          <strong>{getOrderItemCount(order)} items</strong>
                          <span>
                            {order.items
                              .map((item) => `${item.quantity} x ${item.product.name}`)
                              .join(', ')}
                          </span>
                        </div>
                      </td>
                      <td className="price-cell">{formatPrice(order.total)}</td>
                      <td className="muted-cell">
                        <span className="order-date">
                          <CalendarClock size={15} />
                          <span>{formatDate(order.createdAt)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
