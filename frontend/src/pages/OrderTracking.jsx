import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, RotateCcw } from 'lucide-react'
import Confetti from '../components/OrderTracking/Confetti'
import SEO from '../components/SEO/SEO'
import RevealOnScroll from '../components/UI/RevealOnScroll'
import SmartImage from '../components/UI/SmartImage'
import useStore from '../store/useStore'


function mapShopifyOrderToMock(shopifyOrder) {
  if (!shopifyOrder) return null;

  const lineItem = shopifyOrder.lineItems?.edges?.[0]?.node || {};
  const isDelivered = shopifyOrder.displayFulfillmentStatus === 'FULFILLED';
  const status = isDelivered ? 'delivered' : (shopifyOrder.displayFulfillmentStatus === 'UNFULFILLED' ? 'confirmed' : 'in_transit');

  return {
    id: shopifyOrder.name,
    status: status,
    product: {
      id: lineItem.product?.id?.split('/').pop() || '0',
      name: lineItem.title || 'Product',
      brand: lineItem.product?.vendor || 'Little Essentials',
      price: parseFloat(shopifyOrder.totalPriceSet?.shopMoney?.amount || 0),
      image: lineItem.image?.url || 'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85',
      variantTitle: lineItem.variantTitle
    },
    estimatedDelivery: isDelivered ? 'Delivered' : 'Delivery estimate pending',
    placedOn: new Date(shopifyOrder.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    deliveryAddress: shopifyOrder.shippingAddress ? `${shopifyOrder.shippingAddress.address1}, ${shopifyOrder.shippingAddress.city} — ${shopifyOrder.shippingAddress.zip}` : 'Address pending',
    stages: [
      {
        key: 'confirmed',
        label: 'Order Confirmed',
        date: new Date(shopifyOrder.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
        time: new Date(shopifyOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        done: true,
      },
      {
        key: 'packed',
        label: 'Packed',
        date: '',
        time: '',
        done: shopifyOrder.displayFulfillmentStatus === 'PARTIALLY_FULFILLED' || isDelivered,
      },
      {
        key: 'dispatched',
        label: 'Dispatched',
        date: '',
        time: '',
        done: isDelivered,
      },
      {
        key: 'in_transit',
        label: 'In Transit',
        date: '',
        time: '',
        done: isDelivered,
      },
      {
        key: 'delivered',
        label: 'Delivered',
        date: '',
        time: '',
        done: isDelivered,
      },
    ],
    currentUpdate: shopifyOrder.fulfillments?.[0]?.trackingInfo?.[0]?.url 
      ? `Track your package here: ${shopifyOrder.fulfillments[0].trackingInfo[0].url}` 
      : 'Your order is confirmed and will be packed soon.',
    trackingUrl: shopifyOrder.fulfillments?.[0]?.trackingInfo?.[0]?.url || null
  };
}




export default function OrderTracking() {
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart, openCart } = useStore()
  const orderId = id

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/shopify/order?id=${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrderData(mapShopifyOrderToMock(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen bg-cream pt-[80px] flex items-center justify-center">Loading order...</div>;
  }

  if (error || !orderData) {
    return <div className="min-h-screen bg-cream pt-[80px] flex items-center justify-center font-playfair text-xl">Order not found.</div>;
  }

  const isDelivered = orderData.status === 'delivered'

  const handleBuyAgain = () => {
    addToCart({
      ...orderData.product,
      images: [orderData.product.image],
      qty: 1,
      category: 'Home',
      isNew: false,
      isSoldOut: false,
      rating: 4.9,
    })
    openCart()
  }

  return (
    <main className="min-h-screen bg-cream pt-[80px]">
      <SEO
        title="Order Confirmation"
        description="Your Little Essentials order has been confirmed."
        canonical={`https://www.littleessentials.in/order/${orderId}/track`}
        noIndex
      />
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
            Estimated delivery: {orderData.estimatedDelivery}
          </p>
          <p className="mt-1 font-dm text-[12px] text-cream/35">
            Placed on {orderData.placedOn}
          </p>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="mx-auto max-w-screen-md">
          <RevealOnScroll delay={0.15}>
            <div className="flex items-center gap-4 rounded-[16px] border border-cappuccino/30 bg-cream-light p-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px] bg-cappuccino">
                <SmartImage
                  src={orderData.product.image}
                  alt={`${orderData.product.name} product at Little Essentials`}
                  className="h-full w-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 font-dm text-[10px] uppercase tracking-ultra text-caramel">
                  {orderData.product.brand}
                </p>
                <p className="mb-2 line-clamp-2 font-playfair text-[14px] font-semibold text-espresso">
                  {orderData.product.name} {orderData.product.variantTitle ? `— ${orderData.product.variantTitle}` : ''}
                </p>
                <p className="font-dm text-[13px] font-medium text-espresso">
                  ₹{orderData.product.price.toLocaleString('en-IN')}
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
