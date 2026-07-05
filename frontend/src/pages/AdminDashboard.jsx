import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  User,
} from 'lucide-react'
import { useAdminAuth, getAdminToken } from '../hooks/useAdminAuth'
import SEO from '../components/SEO/SEO'

function StatusBadge({ label, tone }) {
  const tones = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    fulfilled: 'bg-green-100 text-green-700',
    unfulfilled: 'bg-cappuccino/40 text-espresso',
    default: 'bg-cappuccino/30 text-espresso',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 font-dm text-[10px] font-medium uppercase tracking-wide ${tones[tone] || tones.default}`}>
      {label || '—'}
    </span>
  )
}

function OrderRow({ order }) {
  const [open, setOpen] = useState(false)
  const addr = order.shippingAddress

  return (
    <div className="rounded-[10px] border border-cappuccino/30 bg-cream-light">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 p-4 text-left"
        type="button"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-playfair text-[15px] font-bold text-espresso">{order.name}</span>
            <StatusBadge
              label={order.financialStatus}
              tone={String(order.financialStatus).toLowerCase().includes('paid') ? 'paid' : 'pending'}
            />
            <StatusBadge
              label={order.fulfillmentStatus}
              tone={String(order.fulfillmentStatus).toLowerCase() === 'fulfilled' ? 'fulfilled' : 'unfulfilled'}
            />
          </div>
          <p className="mt-1 font-dm text-[12px] text-caramel">
            {order.customer?.name || order.shippingAddress?.name || 'Guest'} ·{' '}
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
        <span className="flex-shrink-0 font-dm text-[15px] font-semibold text-espresso">
          ₹{order.total.toLocaleString('en-IN')}
        </span>
        <ChevronDown size={16} className={`flex-shrink-0 text-caramel transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-cappuccino/30 p-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-1.5 font-dm text-[11px] font-medium uppercase tracking-wide text-caramel">
                <User size={12} /> Customer
              </p>
              <p className="font-dm text-[13px] text-espresso">{order.customer?.name || '—'}</p>
              <p className="font-dm text-[12px] text-caramel">{order.customer?.email || '—'}</p>
              <p className="font-dm text-[12px] text-caramel">{order.customer?.phone || addr?.phone || '—'}</p>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 font-dm text-[11px] font-medium uppercase tracking-wide text-caramel">
                <MapPin size={12} /> Shipping Address
              </p>
              {addr ? (
                <p className="font-dm text-[13px] leading-relaxed text-espresso">
                  {addr.name}<br />
                  {addr.address1}{addr.address2 ? `, ${addr.address2}` : ''}<br />
                  {addr.city}, {addr.province} {addr.zip}<br />
                  {addr.country} {addr.phone ? `· ${addr.phone}` : ''}
                </p>
              ) : (
                <p className="font-dm text-[12px] text-caramel">No address</p>
              )}
            </div>
          </div>

          <p className="mb-2 mt-5 flex items-center gap-1.5 font-dm text-[11px] font-medium uppercase tracking-wide text-caramel">
            <Package size={12} /> Items ({order.items.length})
          </p>
          <ul className="divide-y divide-cappuccino/20">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 py-2">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="h-10 w-10 flex-shrink-0 rounded-[6px] object-cover" />
                ) : (
                  <div className="h-10 w-10 flex-shrink-0 rounded-[6px] bg-cappuccino/40" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-dm text-[13px] text-espresso">{it.title}</p>
                  {it.variantTitle && it.variantTitle !== 'Default Title' ? (
                    <p className="font-dm text-[11px] text-caramel">{it.variantTitle}</p>
                  ) : null}
                </div>
                <span className="font-dm text-[12px] text-caramel">×{it.quantity}</span>
                <span className="w-20 text-right font-dm text-[13px] font-medium text-espresso">
                  ₹{it.price.toLocaleString('en-IN')}
                </span>
              </li>
            ))}
          </ul>
          {order.note ? (
            <p className="mt-3 rounded-[6px] bg-cream p-2.5 font-dm text-[11px] text-caramel">Note: {order.note}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { email, logout, isAuthenticated } = useAdminAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const doLogout = useCallback(() => {
    logout()
    navigate('/admin/login', { replace: true })
  }, [logout, navigate])

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true })
      return
    }
    fetchOrders()
  }, [isAuthenticated, navigate, fetchOrders])

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8">
      <SEO title="Admin Dashboard" description="Little Essentials order management." noIndex />
      <div className="mx-auto max-w-screen-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-[26px] font-bold text-espresso">Orders</h1>
            <p className="font-dm text-[12px] text-caramel">{email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="flex h-9 items-center gap-1.5 rounded-[8px] border border-cappuccino px-3 font-dm text-[12px] text-espresso hover:border-caramel"
              type="button"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={doLogout}
              className="flex h-9 items-center gap-1.5 rounded-[8px] bg-espresso px-3 font-dm text-[12px] text-cream hover:bg-mocha"
              type="button"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 p-3 font-dm text-[13px] text-red-600">
            {error}
          </div>
        ) : null}

        {loading && orders.length === 0 ? (
          <p className="py-16 text-center font-dm text-[14px] text-caramel">Loading orders…</p>
        ) : orders.length === 0 && !error ? (
          <p className="py-16 text-center font-dm text-[14px] text-caramel">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
