import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Gem, Heart, LockKeyhole, LogOut, MapPin, ShoppingBag, Sparkles, Truck } from 'lucide-react'
import FloatInput from '../components/UI/FloatInput'
import SmartImage from '../components/UI/SmartImage'
import SEO from '../components/SEO/SEO'
import { sanitizeText } from '../utils/sanitize'
import { useShopifyProducts } from '../hooks/useShopify'
import { useShopifyAuth } from '../hooks/useShopifyAuth'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1300&q=90'


export default function Login() {
  const navigate = useNavigate()
  const { products } = useShopifyProducts({ first: 12 })
  const { user, isAuthenticated, login, register, logout, recoverPassword, fetchOrders, fetchProfile, loading, error: authError } = useShopifyAuth()

  const [tab, setTab] = useState('login')
  const [dashboardTab, setDashboardTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const wishlist = useStore((state) => state.wishlist)
  
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    zip: '',
    country: 'India',
    phone: ''
  })

  const { addAddress, updateAddress, deleteAddress, setDefaultAddress } = useShopifyAuth()

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm)
      } else {
        await addAddress(addressForm)
      }
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        province: '',
        zip: '',
        country: 'India',
        phone: ''
      })
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditAddress = (addr) => {
    setEditingAddress(addr)
    setAddressForm({
      firstName: addr.firstName || user.firstName,
      lastName: addr.lastName || user.lastName,
      address1: addr.address1,
      address2: addr.address2 || '',
      city: addr.city,
      province: addr.province,
      zip: addr.zip,
      country: addr.country,
      phone: addr.phone || ''
    })
    setShowAddressForm(true)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      
      setOrdersLoading(true)
      fetchOrders()
        .then(data => {
          setOrders(data || [])
          setOrdersLoading(false)
        })
        .catch(err => {
          console.error('Failed to load orders:', err)
          setOrders([])
          setOrdersLoading(false)
        })
    }
  }, [isAuthenticated])
  
  const setField = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: key === 'password' ? event.target.value : sanitizeText(event.target.value),
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitEmail = form.email.trim()
      if (tab === 'login') {
        await login(submitEmail, form.password)
        navigate('/')
      } else if (tab === 'register') {
        const nameParts = form.name.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || '-'
        await register(firstName, lastName, submitEmail, form.password)
        setTab('login')
        alert('Account created! Please sign in.')
      } else if (tab === 'forgot') {
        await recoverPassword(submitEmail)
        alert('Password recovery email sent. Please check your inbox.')
        setTab('login')
      }
    } catch (err) {
      console.error('Auth error:', err)
    }
  }

  return (
    <main className={`${!isAuthenticated ? 'bg-espresso h-[100dvh] overflow-hidden px-4 pb-4 pt-[96px] sm:px-6 lg:px-8' : 'bg-cream min-h-screen pb-16'}`}>
      <SEO
        title={isAuthenticated ? 'Your Account' : 'Sign In'}
        description="Manage your Little Essentials account, orders, and preferences."
        canonical="https://www.littleessentials.in/login"
        noIndex
      />

      {!isAuthenticated && (
        <motion.div
          aria-hidden="true"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute left-0 top-20 flex whitespace-nowrap opacity-[0.04]"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="pr-12 font-playfair text-[clamp(72px,13vw,180px)] font-bold leading-none text-cream"
            >
              PRIVATE EDIT
            </span>
          ))}
        </motion.div>
      )}

      <div className={`relative z-10 mx-auto h-full transition-all duration-500 ease-premium ${!isAuthenticated ? 'max-w-screen-xl overflow-hidden rounded-[30px] border border-cream/12 bg-cream-light shadow-[0_28px_100px_rgba(0,0,0,0.28)] grid lg:grid-cols-[0.94fr_1.06fr]' : 'max-w-none bg-cream-light flex flex-col'}`}>
        {!isAuthenticated && (
          <section className="relative hidden min-h-0 flex-col justify-between overflow-hidden bg-espresso p-6 lg:flex xl:p-8">
            <SmartImage
              src={HERO_IMAGE}
              alt="Little Essentials private account atmosphere"
              className="absolute inset-0 h-full w-full"
              imageClassName="object-cover object-center opacity-[0.54]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/72 to-espresso/28" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(243,233,215,1) 1px, transparent 1px), linear-gradient(90deg, rgba(243,233,215,1) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
              }}
            />

            <Link
              to="/"
              className="relative z-10 inline-flex w-fit font-playfair text-[24px] font-bold text-cream transition-colors hover:text-caramel"
            >
              Little Essentials
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 max-w-[650px]"
            >
              <p className="mb-4 inline-flex items-center gap-3 border border-cream/18 bg-cream/10 px-4 py-2 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel backdrop-blur-xl">
                <Sparkles size={14} /> Private customer desk
              </p>
              <h1 className="font-playfair text-[clamp(52px,7vw,88px)] font-bold leading-[0.82] text-cream">
                Sign in to a calmer shop.
              </h1>
              <p className="mt-5 max-w-[430px] font-dm text-[14px] font-light leading-[1.75] text-cream/68">
                Saved carts, wishlists, early drops, and order tracking in one
                quiet account space.
              </p>
            </motion.div>

            <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, 'Early access'],
                [Gem, 'Saved wishlist'],
                [LockKeyhole, 'Secure checkout'],
              ].map(([Icon, label], index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.28 + index * 0.08,
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-[18px] border border-cream/12 bg-cream/10 p-4 backdrop-blur-xl"
                >
                  <Icon size={16} className="mb-3 text-caramel" strokeWidth={1.7} />
                  <p className="font-dm text-[12px] font-semibold text-cream">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <section className={`relative flex min-h-0 flex-col px-5 py-8 sm:px-8 lg:px-12 ${isAuthenticated ? 'w-full pt-[100px]' : 'items-center justify-center overflow-hidden'}`}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${isAuthenticated ? 'max-w-none' : 'max-w-[430px]'}`}
          >
            <div className="mb-8 flex items-end justify-between border-b border-cappuccino/20 pb-6">
              <div>
                <p className="mb-2 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
                  {isAuthenticated ? 'Private Account' : (tab === 'login' ? 'Welcome back' : tab === 'forgot' ? 'Reset password' : 'Join the edit')}
                </p>
                <h2 className="font-playfair text-[clamp(32px,5vw,48px)] font-bold leading-tight text-espresso">
                  {isAuthenticated ? `Hello, ${user?.firstName}.` : (tab === 'login' ? 'Continue beautifully.' : tab === 'forgot' ? 'Recover access.' : 'Create your account.')}
                </h2>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="grid h-full gap-8 lg:grid-cols-[240px_1fr]">
                {/* Sidebar Navigation */}
                <div className="flex flex-col h-full min-h-[400px] gap-2 border-r border-cappuccino/10 pr-6">
                  {[
                    { id: 'overview', label: 'Dashboard', icon: Sparkles },
                    { id: 'orders', label: 'Order History', icon: ShoppingBag },
                    { id: 'track', label: 'Track Your Order', icon: Truck },
                    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                    { id: 'wishlist', label: 'Your Wishlist', icon: Heart },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDashboardTab(t.id)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-dm text-[14px] font-medium transition-all ${
                        dashboardTab === t.id
                          ? 'bg-espresso text-cream'
                          : 'text-mocha hover:bg-cream'
                      }`}
                    >
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  ))}
                  
                  <div className="mt-auto">
                    <div className="my-2 border-t border-cappuccino/10 pt-2" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-dm text-[14px] font-semibold text-red-500 transition-all hover:bg-red-50/50"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {dashboardTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-6 sm:grid-cols-3">
                          <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm">
                            <p className="mb-1 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Recent Orders</p>
                            <p className="font-playfair text-2xl font-bold text-espresso">{orders.length}</p>
                          </div>
                          <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm">
                            <p className="mb-1 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Wishlist Items</p>
                            <p className="font-playfair text-2xl font-bold text-espresso">{wishlist.length}</p>
                          </div>
                          <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm">
                            <p className="mb-1 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Member Since</p>
                            <p className="font-playfair text-lg font-bold text-espresso">2026</p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-8 shadow-sm">
                          <h3 className="mb-4 font-playfair text-xl font-bold text-espresso text-center">Account Details</h3>
                          <div className="mx-auto max-w-md space-y-4">
                            <div className="flex justify-between border-b border-cappuccino/10 pb-2">
                              <span className="font-dm text-sm text-mocha">Full Name</span>
                              <span className="font-dm text-sm font-semibold text-espresso">{user?.firstName} {user?.lastName}</span>
                            </div>
                            <div className="flex justify-between border-b border-cappuccino/10 pb-2">
                              <span className="font-dm text-sm text-mocha">Email</span>
                              <span className="font-dm text-sm font-semibold text-espresso">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-dm text-sm text-mocha">Default City</span>
                              <span className="font-dm text-sm font-semibold text-espresso">{user?.defaultAddress?.city || 'Not set'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {dashboardTab === 'orders' && (
                      <motion.div
                        key="orders"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {ordersLoading ? (
                          <div className="flex h-64 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
                          </div>
                        ) : orders.length > 0 ? (
                          <div className="overflow-hidden rounded-2xl border border-cappuccino/30 bg-white/50 shadow-sm">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-cappuccino/20 bg-cream/30">
                                  <th className="px-6 py-4 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Order</th>
                                  <th className="px-6 py-4 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Date</th>
                                  <th className="px-6 py-4 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">Status</th>
                                  <th className="px-6 py-4 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-cappuccino/10">
                                {orders.map((order) => (
                                  <tr key={order.id} className="hover:bg-cream/20 transition-colors">
                                    <td className="px-6 py-4 font-dm text-sm font-bold text-espresso">{order.name}</td>
                                    <td className="px-6 py-4 font-dm text-sm text-mocha">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                      <span className="inline-block rounded-full bg-cream-light px-3 py-1 font-dm text-[10px] font-bold uppercase text-caramel">
                                        {order.displayFulfillmentStatus}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 font-dm text-sm font-semibold text-espresso text-right">
                                      {order.totalPriceSet.shopMoney.amount} {order.totalPriceSet.shopMoney.currencyCode}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex h-64 flex-col items-center justify-center text-center">
                            <ShoppingBag className="mb-4 text-cappuccino/40" size={48} />
                            <p className="font-dm text-lg text-mocha">You haven&apos;t placed any orders yet.</p>
                            <Link to="/collections" className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-mocha px-8 font-dm text-sm font-semibold text-cream transition-colors hover:bg-espresso">
                              Shop our Collections
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {dashboardTab === 'addresses' && (
                      <motion.div
                        key="addresses"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-playfair text-xl font-bold text-espresso">Your Addresses</h3>
                          <button
                            onClick={() => {
                              setEditingAddress(null)
                              setAddressForm({
                                firstName: user.firstName,
                                lastName: user.lastName,
                                address1: '',
                                address2: '',
                                city: '',
                                province: '',
                                zip: '',
                                country: 'India',
                                phone: ''
                              })
                              setShowAddressForm(true)
                            }}
                            className="flex items-center gap-2 rounded-full bg-espresso px-4 py-2 font-dm text-[12px] font-bold text-cream transition-colors hover:bg-mocha"
                          >
                            <MapPin size={14} />
                            Add New Address
                          </button>
                        </div>

                        {showAddressForm && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-caramel/20 bg-cream/30 p-6"
                          >
                            <form onSubmit={handleAddressSubmit} className="space-y-4">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <FloatInput
                                  label="First Name"
                                  value={addressForm.firstName}
                                  onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                                  required
                                />
                                <FloatInput
                                  label="Last Name"
                                  value={addressForm.lastName}
                                  onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                                  required
                                />
                              </div>
                              <FloatInput
                                label="Address Line 1"
                                value={addressForm.address1}
                                onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                                required
                              />
                              <FloatInput
                                label="Address Line 2 (Optional)"
                                value={addressForm.address2}
                                onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                              />
                              <div className="grid gap-4 sm:grid-cols-3">
                                <FloatInput
                                  label="City"
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                  required
                                />
                                <FloatInput
                                  label="State/Province"
                                  value={addressForm.province}
                                  onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                                  required
                                />
                                <FloatInput
                                  label="ZIP/Pincode"
                                  value={addressForm.zip}
                                  onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="flex justify-end gap-3 pt-2">
                                <button
                                  type="button"
                                  onClick={() => setShowAddressForm(false)}
                                  className="rounded-full border border-cappuccino px-6 py-2 font-dm text-sm font-semibold text-mocha hover:bg-cream"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="rounded-full bg-espresso px-8 py-2 font-dm text-sm font-semibold text-cream hover:bg-mocha"
                                >
                                  {editingAddress ? 'Update Address' : 'Save Address'}
                                </button>
                              </div>
                            </form>
                          </motion.div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2">
                          {user?.addresses?.edges?.map(({ node: addr }) => (
                            <div key={addr.id} className="group relative flex flex-col rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm transition-all hover:border-caramel/40 hover:bg-white/80">
                              <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MapPin size={16} className="text-caramel" />
                                  <h4 className="font-dm text-sm font-bold text-espresso">{addr.firstName} {addr.lastName}</h4>
                                </div>
                                {user.defaultAddress?.id === addr.id && (
                                  <span className="rounded-full bg-caramel/10 px-3 py-1 font-dm text-[9px] font-bold uppercase tracking-wider text-caramel">Default</span>
                                )}
                              </div>
                              <p className="flex-1 font-dm text-[13px] leading-relaxed text-mocha/80">
                                {addr.address1}<br />
                                {addr.address2 && `${addr.address2}, `}{addr.city}<br />
                                {addr.province}, {addr.zip}<br />
                                {addr.country}
                              </p>
                              
                              <div className="mt-6 flex items-center justify-between border-t border-cappuccino/10 pt-4">
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => handleEditAddress(addr)}
                                    className="font-dm text-[11px] font-bold text-mocha transition-colors hover:text-caramel"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteAddress(addr.id)}
                                    className="font-dm text-[11px] font-bold text-red-400 transition-colors hover:text-red-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                                {user.defaultAddress?.id !== addr.id && (
                                  <button
                                    onClick={() => setDefaultAddress(addr.id)}
                                    className="font-dm text-[11px] font-bold text-caramel transition-colors hover:text-espresso"
                                  >
                                    Set as Default
                                  </button>
                                )}
                              </div>
                            </div>
                          )) || (
                            <div className="col-span-2 flex h-64 flex-col items-center justify-center text-center">
                              <MapPin className="mb-4 text-cappuccino/40" size={48} />
                              <p className="font-dm text-lg text-mocha">No saved addresses found.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {dashboardTab === 'track' && (
                      <motion.div
                        key="track"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm">
                          <h3 className="mb-2 font-playfair text-xl font-bold text-espresso">Track Your Order</h3>
                          <p className="mb-6 font-dm text-sm text-mocha">Enter your Order ID (e.g. LE-2025-08847) to track shipping progress and delivery status in real-time.</p>
                          
                          <div className="max-w-md">
                            <form onSubmit={(e) => {
                              e.preventDefault()
                              const orderId = e.target.orderId.value.trim()
                              if (orderId) {
                                navigate(`/order/${orderId}/track`)
                              }
                            }} className="flex gap-3">
                              <input
                                type="text"
                                name="orderId"
                                placeholder="Order ID (LE-XXXXX)"
                                defaultValue="LE-2025-08847"
                                className="h-11 flex-1 rounded-[8px] border border-cappuccino/40 bg-white pl-4 font-dm text-sm text-espresso outline-none transition-colors focus:border-caramel"
                                required
                              />
                              <button
                                type="submit"
                                className="inline-flex h-11 items-center justify-center rounded-[8px] bg-espresso px-6 font-dm text-sm font-semibold text-cream transition-colors hover:bg-mocha"
                              >
                                Track Status
                              </button>
                            </form>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {dashboardTab === 'wishlist' && (
                      <motion.div
                        key="wishlist"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={wishlist.length === 0 ? "flex h-64 flex-col items-center justify-center text-center" : "space-y-6"}
                      >
                        {wishlist.length > 0 ? (
                          <div className="rounded-2xl border border-cappuccino/30 bg-white/50 p-6 shadow-sm">
                            <h3 className="mb-6 font-playfair text-xl font-bold text-espresso">Your Wishlist ({wishlist.length})</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {/* Display simple cards for wishlisted items. In a full implementation, we would query the Storefront API for these specific IDs to show full product details. */}
                              {wishlist.map(id => (
                                <div key={id} className="rounded-xl border border-cappuccino/20 p-4 bg-white/80">
                                  <p className="font-dm text-[11px] font-medium text-caramel mb-1 break-all truncate">ID: {id.split('/').pop()}</p>
                                  <Link to={`/product/${id}`} className="font-dm text-sm font-bold text-espresso hover:text-caramel transition-colors">
                                    View Product →
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            <Heart className="mb-4 text-cappuccino/40" size={48} />
                            <p className="font-dm text-lg text-mocha">Your wishlist is currently empty.</p>
                            <Link to="/collections" className="mt-4 font-dm text-sm font-bold text-caramel underline underline-offset-8">
                              Browse New Arrivals
                            </Link>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2 rounded-full border border-cappuccino/65 bg-cream p-1.5 shadow-[0_16px_54px_rgba(59,42,34,0.07)]">
                  {['login', 'register'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setTab(item)}
                      className={`rounded-full px-4 py-2.5 font-dm text-[12px] font-semibold capitalize transition-all duration-250 ease-smooth ${
                        tab === item
                          ? 'bg-espresso text-cream shadow-[0_10px_28px_rgba(59,42,34,0.18)]'
                          : 'text-mocha hover:bg-cream-light'
                      }`}
                      type="button"
                    >
                      {item === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-[26px] border border-cappuccino/55 bg-cream/88 p-4 shadow-[0_22px_80px_rgba(59,42,34,0.10)] backdrop-blur-xl sm:p-5"
                  >
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 space-y-2.5">
                        {tab === 'register' ? (
                          <FloatInput
                            label="Full name"
                            name="name"
                            value={form.name}
                            onChange={setField('name')}
                            required
                          />
                        ) : null}
                        <FloatInput
                          label="Email address"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={setField('email')}
                          required
                        />
                        {tab !== 'forgot' && (
                          <FloatInput
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={setField('password')}
                            required
                          />
                        )}
                      </div>

                      {authError && (
                        <p className="mb-4 text-center font-dm text-[12px] font-medium text-red-600">
                          {authError}
                        </p>
                      )}

                      {tab === 'login' ? (
                        <button
                          onClick={() => setTab('forgot')}
                          className="mb-4 block w-full text-right font-dm text-[12px] font-semibold text-caramel underline underline-offset-4"
                          type="button"
                        >
                          Forgot Password?
                        </button>
                      ) : tab === 'forgot' ? (
                        <button
                          onClick={() => setTab('login')}
                          className="mb-4 block w-full text-center font-dm text-[12px] font-semibold text-mocha hover:text-espresso transition-colors"
                          type="button"
                        >
                          Back to Sign In
                        </button>
                      ) : null}

                      <button
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mocha font-dm text-[14px] font-semibold text-cream transition-colors duration-250 hover:bg-espresso disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : (tab === 'login' ? 'Sign In' : tab === 'forgot' ? 'Send Link' : 'Create Account')}
                        {!loading && (
                          <ArrowRight
                            size={15}
                            className="transition-transform duration-250 group-hover:translate-x-1"
                          />
                        )}
                      </button>

                      {/* Google login removed as it requires backend OAuth */}
                    </form>
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </section>
      </div>
    </main>
  )
}
