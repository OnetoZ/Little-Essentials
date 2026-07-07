import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Clock,
  IndianRupee,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  Truck,
  Undo2,
  User,
} from 'lucide-react'
import { useAdminAuth, getAdminToken } from '../hooks/useAdminAuth'
import { useShopifyAuth } from '../hooks/useShopifyAuth'
import SEO from '../components/SEO/SEO'

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

function financialTone(status) {
  const s = String(status).toLowerCase()
  if (s.includes('paid') && !s.includes('partially')) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  if (s.includes('pending')) return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  if (s.includes('refunded') || s.includes('voided')) return 'bg-rose-50 text-rose-700 ring-rose-600/20'
  return 'bg-cappuccino/25 text-espresso ring-cappuccino/40'
}

function fulfillmentTone(status) {
  const s = String(status).toLowerCase()
  if (s === 'fulfilled') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  if (s.includes('partial')) return 'bg-sky-50 text-sky-700 ring-sky-600/20'
  return 'bg-caramel/15 text-mocha ring-caramel/30'
}

function Badge({ label, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-dm text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${tone}`}>
      {label || '—'}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, hint, accent }) {
  return (
    <div className="rounded-[14px] border border-cappuccino/30 bg-cream-light p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">{label}</p>
          <p className="mt-1.5 truncate font-playfair text-[24px] font-bold leading-none text-espresso sm:text-[28px]">
            {value}
          </p>
          {hint ? <p className="mt-1.5 font-dm text-[11px] text-caramel">{hint}</p> : null}
        </div>
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] ${accent}`}>
          <Icon size={16} />
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order, onShip, onRevoke }) {
  const [open, setOpen] = useState(false)
  const [shipping, setShipping] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const addr = order.shippingAddress
  const itemCount = order.items.reduce((s, it) => s + (it.quantity || 0), 0)

  const isShipped = String(order.fulfillmentStatus).toLowerCase() === 'fulfilled' || (order.tags && order.tags.includes('shipped'))
  const displayFulfillment = isShipped ? 'FULFILLED' : order.fulfillmentStatus

  return (
    <div className="overflow-hidden rounded-[14px] border border-cappuccino/30 bg-cream-light transition-shadow hover:shadow-[0_8px_30px_rgba(59,42,34,0.08)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
        type="button"
      >
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-espresso/5 ring-1 ring-inset ring-cappuccino/30">
          <ShoppingBag size={17} className="text-mocha" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-playfair text-[16px] font-bold text-espresso">{order.name}</span>
            <Badge label={order.financialStatus} tone={financialTone(order.financialStatus)} />
            <Badge label={displayFulfillment} tone={fulfillmentTone(displayFulfillment)} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-dm text-[12px] text-caramel">
            <span className="font-medium text-espresso/80">{order.customer?.name || 'Guest'}</span>
            <span className="text-cappuccino">·</span>
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            <span className="text-cappuccino">·</span>
            <span>{new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <span className="font-playfair text-[17px] font-bold text-espresso">{money(order.total)}</span>
          <ChevronDown size={16} className={`text-caramel transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="border-t border-cappuccino/30 p-4 sm:p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-[12px] bg-cream/60 p-4">
                <p className="mb-2.5 flex items-center gap-1.5 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
                  <User size={12} /> Customer
                </p>
                <p className="font-dm text-[13px] font-medium text-espresso">{order.customer?.name || '—'}</p>
                <p className="mt-1.5 flex items-center gap-1.5 font-dm text-[12px] text-caramel">
                  <Mail size={11} /> {order.customer?.email || '—'}
                </p>
                <p className="mt-1 flex items-center gap-1.5 font-dm text-[12px] text-caramel">
                  <Phone size={11} /> {order.customer?.phone || addr?.phone || '—'}
                </p>
              </div>

              <div className="rounded-[12px] bg-cream/60 p-4">
                <p className="mb-2.5 flex items-center gap-1.5 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
                  <MapPin size={12} /> Ship To
                </p>
                {addr ? (
                  <p className="font-dm text-[13px] leading-relaxed text-espresso">
                    {addr.name}<br />
                    {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}<br />
                    {addr.city}, {addr.province} {addr.zip}<br />
                    <span className="text-caramel">{addr.country}</span>
                  </p>
                ) : (
                  <p className="font-dm text-[12px] text-caramel">No shipping address</p>
                )}
              </div>
            </div>

            <p className="mb-2 mt-5 flex items-center gap-1.5 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
              <Package size={12} /> Items
            </p>
            <ul className="overflow-hidden rounded-[12px] border border-cappuccino/25">
              {order.items.map((it, i) => (
                <li key={i} className={`flex items-center gap-3 p-3 ${i > 0 ? 'border-t border-cappuccino/20' : ''}`}>
                  {it.image ? (
                    <img src={it.image} alt={it.title} className="h-12 w-12 flex-shrink-0 rounded-[8px] object-cover ring-1 ring-cappuccino/30" />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px] bg-cappuccino/30">
                      <Package size={16} className="text-caramel" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-dm text-[13px] font-medium text-espresso">{it.title}</p>
                    {it.variantTitle && it.variantTitle !== 'Default Title' ? (
                      <p className="font-dm text-[11px] text-caramel">{it.variantTitle}</p>
                    ) : null}
                  </div>
                  <span className="flex h-6 min-w-[26px] items-center justify-center rounded-full bg-espresso/5 px-1.5 font-dm text-[11px] font-semibold text-espresso">
                    ×{it.quantity}
                  </span>
                  <span className="w-24 text-right font-dm text-[13px] font-semibold text-espresso">{money(it.price)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cappuccino/30 pt-4">
              {order.note ? (
                <p className="max-w-full flex-1 rounded-[8px] bg-caramel/10 px-3 py-2 font-dm text-[11px] text-mocha">
                  📝 {order.note}
                </p>
              ) : <span />}
              <div className="text-right">
                <span className="font-dm text-[11px] uppercase tracking-ultra text-caramel">Order Total</span>
                <p className="font-playfair text-[20px] font-bold text-espresso">{money(order.total)}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-cappuccino/30 pt-4">
              {!isShipped && (
                <button
                  onClick={async () => {
                    setShipping(true)
                    await onShip(order.id)
                    setShipping(false)
                  }}
                  disabled={shipping || revoking}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[8px] bg-espresso px-4 py-2.5 font-dm text-[13px] font-semibold text-cream transition-all hover:bg-mocha disabled:opacity-70"
                >
                  <Truck size={15} className={shipping ? 'animate-pulse' : ''} />
                  {shipping ? 'Marking as Shipped...' : 'Mark as Shipped'}
                </button>
              )}
              {isShipped && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Revoke shipment for this order? This will mark it as unfulfilled.')) return
                    setRevoking(true)
                    await onRevoke(order.id)
                    setRevoking(false)
                  }}
                  disabled={revoking || shipping}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[8px] border border-rose-300 bg-rose-50 px-4 py-2.5 font-dm text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-100 disabled:opacity-70"
                >
                  <Undo2 size={15} className={revoking ? 'animate-spin' : ''} />
                  {revoking ? 'Revoking...' : 'Revoke Shipment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'fulfilled', label: 'Shipped' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { email, logout, isAuthenticated } = useAdminAuth()
  const { logout: shopifyLogout } = useShopifyAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const doLogout = useCallback(() => {
    logout()
    shopifyLogout()
    navigate('/login', { replace: true })
  }, [logout, shopifyLogout, navigate])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/orders?first=50', {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      })
      if (res.status === 401) {
        doLogout()
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load orders')
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [doLogout])

  const handleShipOrder = async (orderId) => {
    try {
      const res = await fetch('/api/admin/ship-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to ship order');

      // Update local state immediately
      setOrders((current) =>
        current.map((o) =>
          o.id === orderId ? { ...o, fulfillmentStatus: 'FULFILLED', tags: [...(o.tags || []), 'shipped'] } : o
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRevokeOrder = async (orderId) => {
    try {
      const res = await fetch('/api/admin/unship-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke shipment');

      // Update local state: mark as unfulfilled and remove the shipped tag
      setOrders((current) =>
        current.map((o) =>
          o.id === orderId
            ? {
                ...o,
                fulfillmentStatus: 'UNFULFILLED',
                tags: (o.tags || []).filter((t) => t !== 'shipped'),
              }
            : o
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }
    fetchOrders()
  }, [isAuthenticated, navigate, fetchOrders])

  const stats = useMemo(() => {
    const paid = orders.filter((o) => String(o.financialStatus).toLowerCase().includes('paid'))
    const revenue = paid.reduce((s, o) => s + o.total, 0)
    const unfulfilled = orders.filter((o) => {
      const isShipped = String(o.fulfillmentStatus).toLowerCase() === 'fulfilled' || (o.tags && o.tags.includes('shipped'))
      return !isShipped
    }).length
    const avg = paid.length ? revenue / paid.length : 0
    return { total: orders.length, revenue, unfulfilled, avg, paidCount: paid.length }
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      const isShipped = String(o.fulfillmentStatus).toLowerCase() === 'fulfilled' || (o.tags && o.tags.includes('shipped'))
      if (filter === 'paid' && !String(o.financialStatus).toLowerCase().includes('paid')) return false
      if (filter === 'pending' && !String(o.financialStatus).toLowerCase().includes('pending')) return false
      if (filter === 'fulfilled' && !isShipped) return false
      if (!q) return true
      const hay = [o.name, o.customer?.name, o.customer?.email, o.shippingAddress?.city, ...o.items.map((i) => i.title)]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [orders, query, filter])

  return (
    <main className="min-h-screen bg-cream pt-24 sm:pt-32">
      <SEO title="Admin Dashboard" description="Little Essentials order management." noIndex />

      <div className="mx-auto max-w-screen-lg px-4 py-6 sm:px-6 sm:py-8">
        {/* Stats */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total} hint={`${stats.paidCount} paid`} accent="bg-espresso/5 text-mocha" />
          <StatCard icon={IndianRupee} label="Revenue" value={money(stats.revenue)} hint="from paid orders" accent="bg-emerald-50 text-emerald-600" />
          <StatCard icon={Truck} label="To Ship" value={stats.unfulfilled} hint="awaiting fulfillment" accent="bg-caramel/15 text-mocha" />
          <StatCard icon={TrendingUp} label="Avg. Order" value={money(stats.avg)} hint="per paid order" accent="bg-sky-50 text-sky-600" />
        </section>

        {/* Controls */}
        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-caramel" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, name, email, item…"
              className="h-11 w-full rounded-[10px] border border-cappuccino/50 bg-cream-light pl-9 pr-3 font-dm text-[13px] text-espresso outline-none transition-colors placeholder:text-caramel/60 focus:border-mocha"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`h-9 rounded-full px-3.5 font-dm text-[12px] font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-espresso text-cream'
                    : 'border border-cappuccino/50 bg-cream-light text-espresso hover:border-caramel'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="mb-4 rounded-[10px] border border-rose-200 bg-rose-50 p-3.5 font-dm text-[13px] text-rose-600">
            {error}
          </div>
        ) : null}

        {/* List */}
        {loading && orders.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-[14px] border border-cappuccino/20 bg-cream-light" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-cappuccino/50 bg-cream-light py-16 text-center">
            <Clock size={26} className="mx-auto mb-3 text-caramel/60" />
            <p className="font-playfair text-[17px] font-semibold text-espresso">
              {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
            </p>
            <p className="mt-1 font-dm text-[13px] text-caramel">
              {orders.length === 0 ? 'New orders will appear here automatically.' : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 font-dm text-[12px] text-caramel">
              Showing <span className="font-semibold text-espresso">{filtered.length}</span> of {orders.length} orders
            </p>
            <div className="space-y-3">
              {filtered.map((o) => (
                <OrderCard key={o.id} order={o} onShip={handleShipOrder} onRevoke={handleRevokeOrder} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Admin Control Bar */}
      <div className="mt-8 border-t border-cappuccino/30 bg-espresso">
        <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-caramel/20 ring-1 ring-inset ring-caramel/30">
              <PackageCheck size={17} className="text-caramel" />
            </div>
            <div>
              <p className="font-playfair text-[16px] font-bold leading-none text-cream">Little Essentials</p>
              <p className="mt-0.5 font-dm text-[10px] uppercase tracking-ultra text-caramel">Admin · Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden font-dm text-[12px] text-cream/60 sm:block">{email}</span>
            <button
              onClick={fetchOrders}
              className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-cream/15 text-cream/80 transition-colors hover:bg-cream/10"
              type="button"
              aria-label="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={doLogout}
              className="flex h-9 items-center gap-1.5 rounded-[9px] bg-caramel px-3 font-dm text-[12px] font-medium text-espresso transition-colors hover:bg-cream"
              type="button"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
