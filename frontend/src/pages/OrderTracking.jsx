import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, MapPin, Package, RotateCcw } from 'lucide-react'
import Confetti from '../components/OrderTracking/Confetti'
import CountdownTimer from '../components/OrderTracking/CountdownTimer'
import DeliveryMap from '../components/OrderTracking/DeliveryMap'
import ProgressTimeline from '../components/OrderTracking/ProgressTimeline'
import RevealOnScroll from '../components/UI/RevealOnScroll'
import SmartImage from '../components/UI/SmartImage'
import useStore from '../store/useStore'

const MOCK_ORDER = {
  id: 'LE-2025-08847',
  status: 'in_transit',
  product: {
    id: 'p001',
    name: 'Resurrection Aromatique Hand Balm',
    brand: 'AESOP',
    price: 2400,
    image:
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=85',
  },
  estimatedDelivery: 'Thursday, 15 May 2025',
  placedOn: 'Tuesday, 13 May 2025',
  deliveryAddress: '42 Palm Grove, Bandra West, Mumbai — 400050',
  stages: [
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      date: 'May 13',
      time: '10:22 AM',
      done: true,
    },
    {
      key: 'packed',
      label: 'Packed',
      date: 'May 13',
      time: '02:45 PM',
      done: true,
    },
    {
      key: 'dispatched',
      label: 'Dispatched',
      date: 'May 14',
      time: '08:30 AM',
      done: true,
    },
    {
      key: 'in_transit',
      label: 'In Transit',
      date: 'May 14',
      time: '11:15 AM',
      done: true,
    },
    {
      key: 'delivered',
      label: 'Delivered',
      date: 'Est. May 15',
      time: '',
      done: false,
    },
  ],
  currentUpdate:
    'Your package is out for delivery. Current location: Andheri East, Mumbai',
}

function DeliveryStatusIcon() {
  return (
    <div className="relative h-10 w-10 flex-shrink-0 rounded-[12px] bg-caramel/15">
      <div className="absolute left-2 top-4 h-2.5 w-5 rounded-sm bg-mocha" />
      <div className="absolute left-5 top-2.5 h-3 w-2.5 rounded-sm bg-caramel" />
      <div className="absolute bottom-2 left-2.5 h-1.5 w-1.5 rounded-full bg-espresso" />
      <div className="absolute bottom-2 right-2.5 h-1.5 w-1.5 rounded-full bg-espresso" />
    </div>
  )
}

export default function OrderTracking() {
  const { id } = useParams()
  const [smsOn, setSmsOn] = useState(false)
  const isDelivered = MOCK_ORDER.status === 'delivered'
  const { addToCart, openCart } = useStore()
  const orderId = id ?? MOCK_ORDER.id

  const handleBuyAgain = () => {
    addToCart({
      ...MOCK_ORDER.product,
      images: [MOCK_ORDER.product.image],
      qty: 1,
      category: 'Skincare',
      isNew: false,
      isSoldOut: false,
      rating: 4.8,
    })
    openCart()
  }

  return (
    <main className="min-h-screen bg-cream pt-[80px]">
      <Confetti active={isDelivered} />

      <section className="bg-espresso px-8 py-10">
        <div className="mx-auto max-w-screen-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-caramel/40 bg-caramel/20"
          >
            <Package size={22} className="text-caramel" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-2 font-playfair text-[32px] font-bold text-cream"
          >
            {isDelivered ? 'Your little luxury has arrived.' : 'Order Confirmed'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-1 font-dm text-[14px] font-medium text-caramel"
          >
            #{orderId}
          </motion.p>
          <p className="font-dm text-[13px] text-cream/50">
            Estimated delivery: {MOCK_ORDER.estimatedDelivery}
          </p>
          <p className="mt-1 font-dm text-[12px] text-cream/35">
            Placed on {MOCK_ORDER.placedOn}
          </p>
        </div>
      </section>

      {!isDelivered ? (
        <section className="border-b border-cappuccino/40 bg-cream py-10">
          <div className="mx-auto max-w-screen-md px-6">
            <CountdownTimer targetHours={18} />
          </div>
        </section>
      ) : null}

      <section className="bg-cream px-6 py-10">
        <div className="mx-auto max-w-screen-lg">
          <RevealOnScroll>
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-caramel" />
              <p className="font-dm text-[13px] text-caramel">
                {MOCK_ORDER.deliveryAddress}
              </p>
            </div>
            <DeliveryMap progress={isDelivered ? 1 : 0.7} />
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-cream px-6 py-8">
        <div className="mx-auto max-w-screen-md">
          <RevealOnScroll>
            <ProgressTimeline
              stages={MOCK_ORDER.stages}
              currentStatus={MOCK_ORDER.status}
            />
          </RevealOnScroll>
        </div>
      </section>

      {!isDelivered ? (
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-screen-md">
            <RevealOnScroll>
              <div className="rounded-[16px] border border-cappuccino/30 bg-cream-light p-5">
                <div className="flex items-start gap-4">
                  <DeliveryStatusIcon />
                  <div className="flex-1">
                    <p className="mb-1 font-playfair text-[17px] font-bold text-espresso">
                      Out for delivery
                    </p>
                    <p className="font-dm text-[13px] font-light leading-[1.6] text-caramel">
                      {MOCK_ORDER.currentUpdate}
                    </p>
                  </div>
                  <button
                    className="flex-shrink-0 font-dm text-[12px] text-mocha underline underline-offset-2 transition-colors duration-250 ease-smooth hover:text-espresso"
                    type="button"
                  >
                    Track on Map
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-cappuccino/30 pt-4">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-caramel" />
                    <span className="font-dm text-[13px] text-espresso">
                      Get SMS updates
                    </span>
                  </div>
                  <button
                    onClick={() => setSmsOn((current) => !current)}
                    className={`relative h-6 w-12 rounded-full transition-colors duration-300 ${
                      smsOn ? 'bg-mocha' : 'bg-cappuccino'
                    }`}
                    aria-pressed={smsOn}
                    type="button"
                  >
                    <motion.div
                      animate={{ x: smsOn ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute top-1 h-4 w-4 rounded-full bg-cream-light shadow-sm"
                    />
                  </button>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      ) : (
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-screen-md space-y-6">
            <RevealOnScroll>
              <div className="rounded-[16px] border border-cappuccino/30 bg-cream-light p-6 text-center">
                <p className="mb-4 font-playfair text-[18px] font-bold text-espresso">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-3">
                  {['Poor', 'Okay', 'Good', 'Great', 'Perfect'].map((label, index) => (
                    <button
                      key={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-cappuccino font-dm text-[12px] text-caramel transition-all duration-250 ease-smooth hover:scale-110 hover:border-mocha hover:text-mocha"
                      aria-label={label}
                      type="button"
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.15}>
              <div className="flex items-center gap-4 rounded-[16px] border border-cappuccino/30 bg-cream-light p-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-cappuccino">
                  <SmartImage
                    src={MOCK_ORDER.product.image}
                    alt={MOCK_ORDER.product.name}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-dm text-[10px] uppercase tracking-ultra text-caramel">
                    {MOCK_ORDER.product.brand}
                  </p>
                  <p className="mb-2 line-clamp-2 font-playfair text-[14px] font-semibold text-espresso">
                    {MOCK_ORDER.product.name}
                  </p>
                  <p className="font-dm text-[13px] font-medium text-espresso">
                    ₹{MOCK_ORDER.product.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={handleBuyAgain}
                  className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-[4px] bg-mocha px-4 font-dm text-[12px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
                  type="button"
                >
                  <RotateCcw size={12} />
                  Buy Again
                </button>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      )}

      {!isDelivered ? (
        <section className="px-6 pb-12">
          <div className="mx-auto max-w-screen-md">
            <RevealOnScroll delay={0.15}>
              <div className="flex items-center gap-4 rounded-[16px] border border-cappuccino/30 bg-cream-light p-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-cappuccino">
                  <SmartImage
                    src={MOCK_ORDER.product.image}
                    alt={MOCK_ORDER.product.name}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 font-dm text-[10px] uppercase tracking-ultra text-caramel">
                    {MOCK_ORDER.product.brand}
                  </p>
                  <p className="mb-2 line-clamp-2 font-playfair text-[14px] font-semibold text-espresso">
                    {MOCK_ORDER.product.name}
                  </p>
                  <p className="font-dm text-[13px] font-medium text-espresso">
                    ₹{MOCK_ORDER.product.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={handleBuyAgain}
                  className="flex h-10 flex-shrink-0 items-center gap-1.5 rounded-[4px] bg-mocha px-4 font-dm text-[12px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
                  type="button"
                >
                  <RotateCcw size={12} />
                  Buy Again
                </button>
              </div>
            </RevealOnScroll>
          </div>
        </section>
      ) : null}

      <div className="pb-12 text-center">
        <Link
          to="/collections"
          className="font-dm text-[13px] text-caramel underline underline-offset-2 transition-colors duration-250 ease-smooth hover:text-mocha"
        >
          ← Continue Shopping
        </Link>
      </div>
    </main>
  )
}
