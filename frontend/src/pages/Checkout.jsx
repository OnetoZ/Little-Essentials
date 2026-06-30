import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Loader2,
  Lock,
  ShoppingBag,
} from 'lucide-react'
import FloatInput from '../components/UI/FloatInput'
import SmartImage from '../components/UI/SmartImage'
import SEO from '../components/SEO/SEO'
import { useOnce } from '../hooks/useOnce'
import { useShopifyAuth } from '../hooks/useShopifyAuth'
import useStore from '../store/useStore'
import { sanitizeText } from '../utils/sanitize'

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const STEPS = ['Information', 'Shipping', 'Payment']
const SHIPPING_METHODS = {
  standard: {
    label: 'Standard Delivery',
    detail: '5-7 business days',
    price: 0,
  },
  express: {
    label: 'Express Delivery',
    detail: '2-3 business days',
    price: 149,
  },
}


function StepIndicator({ current }) {
  return (
    <nav className="mb-8" aria-label="Checkout progress">
      <ol className="flex items-center justify-center">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current

        return (
          <li
            key={step}
            className="flex items-center"
            aria-current={active ? 'step' : undefined}
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-[10px] w-[10px] items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  done ? 'border-caramel bg-caramel' : ''
                } ${active ? 'scale-125 border-mocha bg-mocha' : ''} ${
                  !done && !active ? 'border-cappuccino bg-transparent' : ''
                }`}
              >
                {done ? (
                  <Check size={6} className="text-cream" strokeWidth={3} />
                ) : null}
              </div>
              <span
                className={`font-dm text-[11px] ${
                  active ? 'font-medium text-espresso' : 'text-caramel'
                }`}
              >
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div
                className={`mb-4 mx-2 h-px w-12 sm:w-20 ${
                  done ? 'bg-caramel' : 'bg-cappuccino/50'
                }`}
              />
            ) : null}
          </li>
        )
      })}
      </ol>
    </nav>
  )
}

StepIndicator.propTypes = {
  current: PropTypes.number.isRequired,
}

function SocialButton({ variant, onClick, children }) {
  const dark = variant === 'dark'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-[8px] font-dm text-[13px] font-medium transition-all duration-250 ease-smooth active:scale-[0.98] ${
        dark
          ? 'bg-espresso text-cream hover:bg-mocha'
          : 'border border-cappuccino bg-cream-light text-espresso hover:border-caramel hover:bg-cream'
      }`}
    >
      {children}
    </button>
  )
}

SocialButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['light', 'dark']).isRequired,
}

function getVariantLabel(item) {
  if (item.selectedSize) return item.selectedSize
  if (item.selectedVariantName && item.selectedVariant) {
    return `${item.selectedVariantName}: ${item.selectedVariant}`
  }
  return null
}

function OrderSummary({ cartItems, subtotal, shippingCost }) {
  const [expanded, setExpanded] = useState(false)
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const total = subtotal + shippingCost

  return (
    <aside className="sticky top-24 rounded-[8px] border border-cappuccino/30 bg-cream-light p-6">
      <button
        className="flex w-full items-center justify-between lg:cursor-default"
        onClick={() => setExpanded((current) => !current)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-caramel" />
          <span className="font-playfair text-[16px] font-bold text-espresso">
            Order Summary
          </span>
          <span className="font-dm text-[12px] text-caramel">
            ({itemCount} items)
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-caramel transition-transform duration-250 ease-smooth lg:hidden ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div className={`mt-4 ${expanded ? 'block' : 'hidden lg:block'}`}>
        {cartItems.length > 0 ? (
          <ul className="mb-4 divide-y divide-cappuccino/20">
            {cartItems.map((item) => {
              const variantLabel = getVariantLabel(item)

              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 overflow-hidden rounded-[8px] bg-cappuccino">
                      <SmartImage
                        src={item.images?.[0] ?? ''}
                        alt={`${item.name} in Little Essentials checkout summary`}
                        className="h-full w-full"
                      />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-espresso text-[9px] font-medium text-cream">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-dm text-[12px] font-medium leading-tight text-espresso">
                      {item.name}
                    </p>
                    {variantLabel ? (
                      <p className="font-dm text-[11px] text-caramel">
                        {variantLabel}
                      </p>
                    ) : null}
                  </div>
                  <span className="flex-shrink-0 font-dm text-[13px] font-medium text-espresso">
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mb-4 font-dm text-[13px] text-caramel">
            Your bag is empty. You can still preview the checkout flow.
          </p>
        )}

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            name="promoCode"
            autoComplete="off"
            maxLength={40}
            placeholder="Gift card or promo code"
            className="h-10 flex-1 rounded-[8px] border border-cappuccino bg-cream px-3 font-dm text-[12px] text-espresso outline-none transition-colors placeholder:text-caramel/50 focus:border-mocha"
          />
          <button
            className="h-10 rounded-[8px] bg-espresso px-4 font-dm text-[12px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-mocha"
            type="button"
          >
            Apply
          </button>
        </div>

        <div className="space-y-2 border-t border-cappuccino/40 pt-4">
          <div className="flex justify-between font-dm text-[13px] text-caramel">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-dm text-[13px] text-caramel">
            <span>Shipping</span>
            <span className="font-medium text-green-700">
              {shippingCost === 0
                ? 'Free'
                : `₹${shippingCost.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex justify-between font-dm text-[13px] text-caramel">
            <span>Taxes</span>
            <span>Included</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-cappuccino/40 pt-2 font-dm text-[16px] font-semibold text-espresso">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

OrderSummary.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string),
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      qty: PropTypes.number.isRequired,
    }),
  ).isRequired,
  shippingCost: PropTypes.number.isRequired,
  subtotal: PropTypes.number.isRequired,
}

function validateInformation(form) {
  const errors = {}

  if (!form.email) errors.email = 'Email is required'
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!form.firstName) errors.firstName = 'First name is required'
  if (!form.lastName) errors.lastName = 'Last name is required'
  if (!form.address) errors.address = 'Address is required'
  if (!form.city) errors.city = 'City is required'
  if (!form.state) errors.state = 'State is required'
  if (!form.pincode || !/^\d{6}$/.test(form.pincode)) {
    errors.pincode = 'Enter a valid 6-digit pincode'
  }

  return errors
}

function InformationStep({ form, setForm, onNext, isAuthenticated }) {
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const errors = useMemo(() => validateInformation(form), [form])

  const setField = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: sanitizeText(event.target.value),
    }))
  const touch = (key) => () =>
    setTouched((current) => ({ ...current, [key]: true }))
  const shouldShow = (key) => touched[key] || submitted
  const fieldError = (key) => (shouldShow(key) ? errors[key] : '')
  const fieldSuccess = (key) =>
    shouldShow(key) && !errors[key] && Boolean(form[key])

  const handleNext = () => {
    setSubmitted(true)
    if (Object.keys(errors).length === 0) onNext()
  }

  return (
    <div className="space-y-6">
      {!isAuthenticated && (
        <>
          <div className="space-y-3">
            <Link
              to="/login"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[8px] border border-cappuccino bg-cream-light font-dm text-[13px] font-medium text-espresso transition-all duration-250 ease-smooth hover:border-caramel hover:bg-cream"
            >
              <img src="https://cdn.shopify.com/assets/images/logos/shopify-bag.png" alt="" className="h-5 w-5 object-contain" />
              Sign in to your account
            </Link>
          </div>
        </>
      )}

      <div>
        <p className="mb-3 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Contact Information
        </p>
        <div className="space-y-3">
          <FloatInput
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            onBlur={touch('email')}
            error={fieldError('email')}
            success={fieldSuccess('email')}
          />
          <FloatInput
            label="Mobile number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={setField('phone')}
            optional
          />
        </div>
      </div>

      <div>
        <p className="mb-3 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Shipping Address
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FloatInput
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={setField('firstName')}
              onBlur={touch('firstName')}
              error={fieldError('firstName')}
              success={fieldSuccess('firstName')}
            />
            <FloatInput
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={setField('lastName')}
              onBlur={touch('lastName')}
              error={fieldError('lastName')}
              success={fieldSuccess('lastName')}
            />
          </div>
          <FloatInput
            label="Address"
            name="address"
            value={form.address}
            onChange={setField('address')}
            onBlur={touch('address')}
            error={fieldError('address')}
            success={fieldSuccess('address')}
          />
          <FloatInput
            label="Apartment, suite, etc."
            name="address2"
            value={form.address2}
            onChange={setField('address2')}
            optional
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1.5fr_1.5fr]">
            <FloatInput
              label="City"
              name="city"
              value={form.city}
              onChange={setField('city')}
              onBlur={touch('city')}
              error={fieldError('city')}
              success={fieldSuccess('city')}
            />
            <FloatInput
              label="State"
              name="state"
              value={form.state}
              onChange={setField('state')}
              onBlur={touch('state')}
              error={fieldError('state')}
              success={fieldSuccess('state')}
            />
            <FloatInput
              label="Pincode"
              name="pincode"
              inputMode="numeric"
              value={form.pincode}
              onChange={setField('pincode')}
              onBlur={touch('pincode')}
              error={fieldError('pincode')}
              success={fieldSuccess('pincode')}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleNext}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[4px] bg-mocha font-dm text-[14px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
        type="button"
      >
        Continue to Shipping →
      </button>
    </div>
  )
}

InformationStep.propTypes = {
  form: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
  onNext: PropTypes.func.isRequired,
  setForm: PropTypes.func.isRequired,
}

function ShippingStep({ method, setMethod, onNext, onBack }) {
  return (
    <div className="space-y-4">
      {Object.entries(SHIPPING_METHODS).map(([key, option]) => (
        <button
          key={key}
          onClick={() => setMethod(key)}
          className={`flex w-full items-center justify-between rounded-[8px] border p-4 transition-all duration-250 ease-smooth ${
            method === key
              ? 'border-mocha bg-mocha/5'
              : 'border-cappuccino hover:border-caramel'
          }`}
          type="button"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                method === key ? 'border-mocha' : 'border-cappuccino'
              }`}
            >
              {method === key ? (
                <div className="h-2 w-2 rounded-full bg-mocha" />
              ) : null}
            </div>
            <div className="text-left">
              <p className="font-dm text-[13px] font-medium text-espresso">
                {option.label}
              </p>
              <p className="font-dm text-[11px] text-caramel">
                {option.detail}
              </p>
            </div>
          </div>
          <span className="font-dm text-[13px] font-medium text-espresso">
            {option.price === 0
              ? 'Free'
              : `₹${option.price.toLocaleString('en-IN')}`}
          </span>
        </button>
      ))}

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-dm text-[13px] text-caramel transition-colors duration-250 ease-smooth hover:text-espresso"
          type="button"
        >
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={onNext}
          className="h-[52px] flex-1 rounded-[4px] bg-mocha font-dm text-[14px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
          type="button"
        >
          Continue to Payment →
        </button>
      </div>
    </div>
  )
}

ShippingStep.propTypes = {
  method: PropTypes.oneOf(['standard', 'express']).isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
}

function PaymentStep({ customerInfo, totalAmount, onBack, onPay, loading, error }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[8px] border border-cappuccino/30 bg-cream-light p-6 space-y-4">
        <p className="font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Review Order Details
        </p>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-[13px] font-dm border-b border-cappuccino/20 pb-4">
          <div>
            <p className="text-caramel font-medium mb-1">Contact Email</p>
            <p className="text-espresso font-semibold break-all">{customerInfo.email}</p>
            {customerInfo.phone && (
              <>
                <p className="text-caramel font-medium mt-2 mb-1">Phone Number</p>
                <p className="text-espresso font-semibold">{customerInfo.phone}</p>
              </>
            )}
          </div>
          <div>
            <p className="text-caramel font-medium mb-1">Shipping Address</p>
            <p className="text-espresso font-semibold leading-relaxed">
              {customerInfo.firstName} {customerInfo.lastName}
              <br />
              {customerInfo.address}
              {customerInfo.address2 ? `, ${customerInfo.address2}` : ''}
              <br />
              {customerInfo.city}, {customerInfo.state} - {customerInfo.pincode}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <p className="font-dm text-[12px] text-caramel leading-relaxed">
            Payments are processed securely via **Razorpay**. You can pay using UPI (Google Pay, PhonePe), credit/debit cards, Net Banking, or popular wallets.
          </p>
        </div>

        {error && (
          <div className="rounded-[4px] bg-red-50 border border-red-200 p-3 text-[12px] font-dm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1 font-dm text-[13px] text-caramel transition-colors duration-250 ease-smooth hover:text-espresso disabled:opacity-50"
          type="button"
        >
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={onPay}
          disabled={loading}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[4px] bg-mocha font-dm text-[14px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso disabled:opacity-75 active:scale-[0.98]"
          type="button"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <Lock size={15} />
              <span>Pay Now (₹{totalAmount.toLocaleString('en-IN')})</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

PaymentStep.propTypes = {
  customerInfo: PropTypes.object.isRequired,
  error: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onBack: PropTypes.func.isRequired,
  onPay: PropTypes.func.isRequired,
  totalAmount: PropTypes.number.isRequired,
}

export default function Checkout() {
  const [step, setStep] = useState(0)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState(null)
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [information, setInformation] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const navigate = useNavigate()
  const cartItems = useStore((state) => state.cartItems)
  const subtotal = useStore((state) => state.cartTotal())
  const { user, isAuthenticated } = useShopifyAuth()

  // Pre-fill user data if authenticated
  useMemo(() => {
    if (isAuthenticated && user) {
      setInformation((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        phone: user.phone || prev.phone,
        address: user.defaultAddress?.address1 || prev.address,
        address2: user.defaultAddress?.address2 || prev.address2,
        city: user.defaultAddress?.city || prev.city,
        state: user.defaultAddress?.province || prev.state,
        pincode: user.defaultAddress?.zip || prev.pincode,
      }))
    }
  }, [isAuthenticated, user])

  const shippingCost = SHIPPING_METHODS[shippingMethod].price

  const handleRazorpayPayment = async () => {
    setPaymentLoading(true)
    setPaymentError(null)

    try {
      const isScriptLoaded = await loadRazorpayScript()
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.')
      }

      const totalPaise = Math.round((subtotal + shippingCost) * 100)

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to initialize payment order with server.')
      }

      const orderData = await response.json()
      const { order_id } = orderData

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_T7msUGTtcifr2z',
        amount: totalPaise,
        currency: 'INR',
        name: 'Little Essentials',
        description: 'Lifestyle Store Checkout',
        order_id: order_id,
        handler: async function (razorpayResponse) {
          setPaymentLoading(true)
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                cartItems: cartItems,
                customerInfo: information,
                totalAmount: subtotal + shippingCost
              })
            })

            if (!verifyRes.ok) {
              const verifyError = await verifyRes.json().catch(() => ({}))
              throw new Error(verifyError.error || 'Payment verification failed.')
            }

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              // Clear cart on successful payment
              useStore.setState({ cartItems: [] })
              
              // Redirect to order tracking page
              navigate(`/order/${verifyData.shopify_order_id || order_id}/track`)
            } else {
              throw new Error('Verification failed: payment is not marked as paid.')
            }
          } catch (err) {
            setPaymentError(err.message || 'Error verifying payment.')
          } finally {
            setPaymentLoading(false)
          }
        },
        prefill: {
          name: `${information.firstName} ${information.lastName}`,
          email: information.email,
          contact: information.phone || ''
        },
        notes: {
          address: `${information.address}, ${information.address2 || ''}, ${information.city}, ${information.state} - ${information.pincode}`
        },
        theme: {
          color: '#3B2A22'
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false)
            setPaymentError('Payment window was closed before completion.')
          }
        }
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (response) {
        console.error('Payment failure details:', response.error)
        setPaymentError(`Payment failed: ${response.error.description}`)
        setPaymentLoading(false)
      })

      rzp.open()
    } catch (err) {
      console.error('Razorpay initialization error:', err)
      setPaymentError(err.message || 'An error occurred while setting up the payment modal.')
      setPaymentLoading(false)
    }
  }

  const currentStep = [
    <InformationStep
      key="information"
      form={information}
      setForm={setInformation}
      onNext={() => setStep(1)}
      isAuthenticated={isAuthenticated}
    />,
    <ShippingStep
      key="shipping"
      method={shippingMethod}
      setMethod={setShippingMethod}
      onNext={() => setStep(2)}
      onBack={() => setStep(0)}
    />,
    <PaymentStep
      key="payment"
      customerInfo={information}
      totalAmount={subtotal + shippingCost}
      onBack={() => setStep(1)}
      onPay={handleRazorpayPayment}
      loading={paymentLoading}
      error={paymentError}
    />,
  ]

  return (
    <main className="min-h-screen bg-cream pt-[68px]">
      <SEO
        title="Checkout"
        description="Secure checkout for Little Essentials orders."
        canonical="https://www.littleessentials.in/checkout"
        noIndex
      />
      <h1 className="sr-only">Checkout</h1>
      <header className="border-b border-cappuccino/50 px-8 py-4">
        <div className="mx-auto flex max-w-screen-lg items-center justify-between">
          <Link
            to="/"
            className="font-playfair text-[20px] font-bold text-espresso"
          >
            Little Essentials
          </Link>
          <a
            href="mailto:hello@littleessentials.in"
            className="font-dm text-[13px] text-caramel underline underline-offset-2"
          >
            Need Help?
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-screen-lg px-6 py-10">
        <StepIndicator current={step} />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentStep[step]}
            </motion.div>
          </AnimatePresence>

          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
          />
        </div>
      </div>
    </main>
  )
}
