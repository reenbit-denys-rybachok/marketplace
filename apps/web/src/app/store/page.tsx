'use client';

import {
  BarChart3,
  Boxes,
  ImageIcon,
  LayoutDashboard,
  Minus,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  Users,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import type { Product } from '../admin/products/product-form';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Products', icon: Package, href: '/' },
  { label: 'Categories', icon: Tag, href: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { label: 'Inventory', icon: Boxes, href: '/' },
  { label: 'Customers', icon: Users, href: '/' },
  { label: 'Analytics', icon: BarChart3, href: '/' },
  { label: 'Settings', icon: Settings, href: '/' },
];

type Cart = Record<string, number>;

function formatPrice(value: number | string) {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function getProductPrice(product: Product) {
  return Number(product.price);
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await apiClient.get<Product[]>('/api/products');
        setProducts(response.data);
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

  const cartItems = useMemo(
    () =>
      products
        .map((product) => ({
          product,
          quantity: cart[product.id] ?? 0,
        }))
        .filter((item) => item.quantity > 0),
    [cart, products],
  );

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + getProductPrice(item.product) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  function setQuantity(product: Product, quantity: number) {
    const nextQuantity = Math.max(0, Math.min(product.stock, quantity));

    setCart((currentCart) => {
      if (nextQuantity === 0) {
        const { [product.id]: _removed, ...nextCart } = currentCart;
        return nextCart;
      }

      return {
        ...currentCart,
        [product.id]: nextQuantity,
      };
    });
  }

  async function handleCheckout() {
    if (cartItems.length === 0) {
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const response = await apiClient.post<{ id: string; total: string }>(
        '/api/orders',
        {
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
      );

      toast.success('Order created', {
        description: `Order ${response.data.id.slice(0, 8)} created for ${formatPrice(
          response.data.total,
        )}`,
      });
      setCart({});
      const productsResponse = await apiClient.get<Product[]>('/api/products');
      setProducts(productsResponse.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Order could not be created',
      );
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="brand-mark">M</span>
          <span>MarketOps</span>
        </a>

        <a className="sales-channel active" href="/store">
          <Store size={18} />
          <span>Online Store</span>
        </a>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a className="sidebar-link" href={item.href} key={item.label}>
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="admin-main">
        <section className="store-header">
          <div>
            <p className="eyebrow">Online Store</p>
            <h1>Shop products</h1>
          </div>
          <div className="cart-summary-pill">
            <ShoppingBag size={18} />
            <span>{cartCount} items</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>
        </section>

        {error ? <p className="field-error store-message">{error}</p> : null}

        <div className="store-workspace">
          <section className="store-products" aria-label="Products">
            {isLoading ? <p className="panel-state">Loading products...</p> : null}

            {!isLoading && products.length === 0 ? (
              <div className="empty-state">
                <Package size={32} />
                <h3>No products yet</h3>
                <p>Add products in the admin catalog before opening the store.</p>
              </div>
            ) : null}

            {products.map((product) => {
              const quantity = cart[product.id] ?? 0;
              const isOutOfStock = product.stock <= 0;

              return (
                <article className="store-product-card" key={product.id}>
                  <div className="store-product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <ImageIcon size={34} />
                    )}
                  </div>

                  <div className="store-product-body">
                    <div>
                      <p className="store-product-category">
                        {product.category?.name ?? 'Product'}
                      </p>
                      <h2>{product.name}</h2>
                    </div>
                    {product.description ? <p>{product.description}</p> : null}
                  </div>

                  <div className="store-product-footer">
                    <div>
                      <strong>{formatPrice(product.price)}</strong>
                      <span>{isOutOfStock ? 'Out of stock' : `${product.stock} in stock`}</span>
                    </div>
                    {quantity > 0 ? (
                      <div className="quantity-control" aria-label={`${product.name} quantity`}>
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => setQuantity(product, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          min={0}
                          max={product.stock}
                          type="number"
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(product, Number(event.target.value))
                          }
                          aria-label="Product quantity"
                        />
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => setQuantity(product, quantity + 1)}
                          disabled={quantity >= product.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="button compact"
                        type="button"
                        onClick={() => setQuantity(product, 1)}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart size={16} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="store-cart" aria-label="Cart">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Cart</p>
                <h2>Your order</h2>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={28} />
                <p>No products selected</p>
              </div>
            ) : (
              <div className="cart-lines">
                {cartItems.map(({ product, quantity }) => (
                  <div className="cart-line" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>
                        {quantity} x {formatPrice(product.price)}
                      </span>
                    </div>
                    <div className="cart-line-actions">
                      <strong>{formatPrice(getProductPrice(product) * quantity)}</strong>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => setQuantity(product, 0)}
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cart-total">
              <span>Total</span>
              <strong>{formatPrice(cartTotal)}</strong>
            </div>

            <button
              className="button primary checkout-button"
              type="button"
              onClick={handleCheckout}
              disabled={cartItems.length === 0 || isCheckingOut}
            >
              <ShoppingBag size={17} />
              <span>{isCheckingOut ? 'Creating order...' : 'Buy products'}</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
