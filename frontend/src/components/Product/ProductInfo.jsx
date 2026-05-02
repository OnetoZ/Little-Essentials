import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  Heart,
  Lock,
  RotateCcw,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react'
import useStore from '../../store/useStore'

const TRUST_ITEMS = [
  { icon: Truck, label: 'Free Delivery', sub: 'On orders over ₹999' },
  { icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle-free policy' },
  { icon: Lock, label: 'Secure Payment', sub: 'Encrypted checkout' },
]

const ACCORDION_ITEMS = [
  {
    title: 'Product Details',
    content:
      'Made from the finest botanical ingredients. This formula has been refined over 20 years and is free from synthetic fragrance, parabens, and mineral oils. Suitable for all skin types including sensitive skin.',
  },
  {
    title: 'Ingredients',
    content:
      'Aqua, Glycerin, Helianthus Annuus Seed Oil, Sodium Stearate, Stearic Acid, Cetearyl Alcohol, Aloe Barbadensis Leaf Juice, Tocopherol.',
  },
  {
    title: 'Shipping & Returns',
    content:
      'Free standard shipping on orders above ₹999. Express delivery in 2-3 business days. Returns accepted within 30 days of delivery for unopened items.',
  },
  {
    title: 'Brand Story',
    content:
      'Founded with a belief that good design and good ethics are not mutually exclusive. Every product in this edit is selected for material integrity, daily usefulness, and lasting beauty.',
  },
]

function AccordionItem({ title, content }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-cappuccino/50">
      <button
        onClick={() => setOpen((current) => !current)}
        className="group flex w-full items-center justify-between py-4 text-left"
        type="button"
      >
        <span className="font-dm text-[13px] font-medium text-espresso transition-colors duration-250 ease-smooth group-hover:text-mocha">
          {title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown size={16} className="text-caramel" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 font-dm text-[13px] font-light leading-[1.75] text-espresso/70">
              {content}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

AccordionItem.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default function ProductInfo({ product }) {
  const variantEntries = Object.entries(product.variants ?? {}).filter(
    ([, values]) => Array.isArray(values) && values.length > 0,
  )
  const [variantName, variantValues] = variantEntries[0] ?? []
  const [selectedVariant, setSelectedVariant] = useState(
    variantValues?.[0] ?? null,
  )
  const [qty, setQty] = useState(1)
  const [addedAnim, setAddedAnim] = useState(false)

  const { addToCart, openCart, toggleWishlist, wishlist } = useStore()
  const isWished = wishlist.includes(product.id)
  const isOnSale = product.originalPrice && product.originalPrice > product.price

  const handleAddToCart = () => {
    if (product.isSoldOut) return

    addToCart({
      ...product,
      qty,
      selectedVariant,
      selectedVariantName: variantName,
    })
    setAddedAnim(true)
    window.setTimeout(() => {
      setAddedAnim(false)
      openCart()
    }, 600)
  }

  return (
    <div className="w-full pt-8 lg:w-[45%] lg:pl-14 lg:pt-0">
      <p className="mb-4 font-dm text-[12px] text-caramel">
        Home <span className="mx-1 opacity-40">/</span>
        Collections <span className="mx-1 opacity-40">/</span>
        {product.category} <span className="mx-1 opacity-40">/</span>
        <span className="text-espresso">{product.brand}</span>
      </p>

      <p className="mb-2 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
        {product.brand}
      </p>

      <h1 className="mb-4 font-playfair text-[clamp(24px,3.5vw,36px)] font-bold leading-[1.2] text-espresso">
        {product.name}
      </h1>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              className={
                index < Math.round(product.rating)
                  ? 'fill-caramel text-caramel'
                  : 'text-cappuccino'
              }
            />
          ))}
        </div>
        <span className="font-dm text-[13px] text-caramel">
          {product.rating} ·{' '}
          <span className="cursor-pointer underline underline-offset-2">
            {product.reviewCount} reviews
          </span>
        </span>
      </div>

      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-playfair text-[28px] font-bold text-espresso">
          ₹{product.price.toLocaleString('en-IN')}
        </span>
        {isOnSale ? (
          <span className="font-dm text-[16px] text-caramel line-through">
            ₹{product.originalPrice.toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>
      <p className="mb-5 font-dm text-[12px] text-caramel">
        Inclusive of all taxes
      </p>

      <div className="mb-6 h-px bg-cappuccino/50" />

      <p className="mb-6 font-dm text-[15px] font-light leading-[1.75] text-espresso/75">
        {product.description}
      </p>

      {variantName && variantValues ? (
        <div className="mb-5">
          <p className="mb-2 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
            {variantName}{' '}
            <span className="normal-case text-espresso">
              {selectedVariant ? `— ${selectedVariant}` : ''}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variantValues.map((value) => (
              <button
                key={value}
                onClick={() => setSelectedVariant(value)}
                className={`rounded-[4px] border px-4 py-2 font-dm text-[12px] font-medium transition-all duration-250 ease-smooth ${
                  selectedVariant === value
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-cappuccino text-espresso hover:border-caramel'
                }`}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <p className="mb-2 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Quantity
        </p>
        <div className="inline-flex overflow-hidden rounded-[4px] border border-cappuccino">
          <button
            onClick={() => setQty((current) => Math.max(1, current - 1))}
            className="flex h-10 w-10 items-center justify-center text-lg text-caramel transition-colors duration-250 ease-smooth hover:bg-cappuccino/30"
            type="button"
          >
            −
          </button>
          <span className="flex h-10 w-10 items-center justify-center text-center font-playfair text-[15px] text-espresso">
            {qty}
          </span>
          <button
            onClick={() => setQty((current) => current + 1)}
            className="flex h-10 w-10 items-center justify-center text-lg text-caramel transition-colors duration-250 ease-smooth hover:bg-cappuccino/30"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3">
        <motion.button
          onClick={handleAddToCart}
          animate={addedAnim ? { scale: [1, 0.97, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-[4px] font-dm text-[14px] font-medium tracking-wide-2 transition-colors duration-250 ease-smooth active:scale-[0.98] ${
            product.isSoldOut
              ? 'bg-cappuccino text-espresso/50'
              : 'bg-mocha text-cream hover:bg-espresso'
          }`}
          disabled={product.isSoldOut}
          type="button"
        >
          <ShoppingBag size={17} strokeWidth={1.5} />
          {product.isSoldOut
            ? 'Sold Out'
            : addedAnim
              ? 'Added to Bag ✓'
              : 'Add to Bag'}
        </motion.button>

        <button
          onClick={() => toggleWishlist(product.id)}
          className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[4px] border border-cappuccino font-dm text-[14px] font-medium text-espresso transition-colors duration-250 ease-smooth hover:border-caramel active:scale-[0.98]"
          type="button"
        >
          <Heart
            size={17}
            strokeWidth={1.5}
            fill={isWished ? '#7A553A' : 'none'}
            className={isWished ? 'text-mocha' : 'text-caramel'}
          />
          {isWished ? 'Saved to Wishlist' : 'Add to Wishlist'}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2 border-y border-cappuccino/40 py-5">
        {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center gap-1 text-center">
            <Icon size={17} className="text-caramel" strokeWidth={1.5} />
            <p className="font-dm text-[10px] font-medium uppercase tracking-wide text-caramel">
              {label}
            </p>
            <p className="font-dm text-[10px] text-espresso/60">{sub}</p>
          </div>
        ))}
      </div>

      <div>
        {ACCORDION_ITEMS.map((item) => (
          <AccordionItem
            key={item.title}
            title={item.title}
            content={item.content}
          />
        ))}
      </div>
    </div>
  )
}

ProductInfo.propTypes = {
  product: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    isSoldOut: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    originalPrice: PropTypes.number,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
    reviewCount: PropTypes.number.isRequired,
    variants: PropTypes.object,
  }).isRequired,
}
