import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import useStore from '../../store/useStore'

export default function CartItem({ item }) {
  const { updateQty, removeFromCart } = useStore()
  const variantLabel =
    item.selectedSize ??
    (item.selectedVariantName && item.selectedVariant
      ? `${item.selectedVariantName}: ${item.selectedVariant}`
      : null)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 48, height: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-4 overflow-hidden py-5"
    >
      <div className="h-[80px] w-[80px] flex-shrink-0 overflow-hidden rounded-[8px] bg-cappuccino">
        <img
          src={item.images?.[0]}
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-0.5 font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
          {item.brand}
        </p>
        <p className="mb-1 line-clamp-2 font-dm text-[13px] font-medium leading-tight text-espresso">
          {item.name}
        </p>
        {variantLabel ? (
          <p className="mb-2 font-dm text-[11px] text-caramel">
            {variantLabel}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="flex overflow-hidden rounded-[4px] border border-cappuccino">
            <button
              onClick={() => updateQty(item.id, item.qty - 1)}
              className="flex h-8 w-8 items-center justify-center text-caramel transition-colors duration-250 ease-smooth hover:bg-cappuccino/40"
              aria-label={`Decrease ${item.name} quantity`}
              type="button"
            >
              <Minus size={11} />
            </button>
            <span className="flex h-8 w-7 items-center justify-center text-center font-dm text-[12px] text-espresso">
              {item.qty}
            </span>
            <button
              onClick={() => updateQty(item.id, item.qty + 1)}
              className="flex h-8 w-8 items-center justify-center text-caramel transition-colors duration-250 ease-smooth hover:bg-cappuccino/40"
              aria-label={`Increase ${item.name} quantity`}
              type="button"
            >
              <Plus size={11} />
            </button>
          </div>

          <span className="font-dm text-[13px] font-semibold text-espresso">
            ₹{(item.price * item.qty).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <button
        onClick={() => removeFromCart(item.id)}
        className="mt-1 flex-shrink-0 text-caramel transition-colors duration-250 ease-smooth hover:text-mocha"
        aria-label={`Remove ${item.name}`}
        type="button"
      >
        <Trash2 size={15} strokeWidth={1.5} />
      </button>
    </motion.li>
  )
}

CartItem.propTypes = {
  item: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    qty: PropTypes.number.isRequired,
    selectedSize: PropTypes.string,
    selectedVariant: PropTypes.string,
    selectedVariantName: PropTypes.string,
  }).isRequired,
}
