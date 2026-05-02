import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import useStore from '../../store/useStore'

export default function ProductCard({
  product,
  size = 'md',
  className = '',
  featured = false,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const { addToCart, toggleWishlist, wishlist } = useStore()
  const isWished = wishlist.includes(product.id)

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const isSoldOut = product.isSoldOut

  const sizeClasses = {
    sm: 'w-[175px]',
    md: 'w-full',
    lg: 'w-full',
  }

  const handleAddToCart = (event) => {
    event.preventDefault()

    if (!isSoldOut) {
      addToCart(product)
    }
  }

  const handleWishlist = (event) => {
    event.preventDefault()
    toggleWishlist(product.id)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-[8px] border border-cappuccino/25 bg-cream-light transition-shadow duration-300 ease-smooth ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? '0 16px 48px rgba(59,42,34,0.16)'
          : '0 2px 8px rgba(59,42,34,0.04)',
      }}
    >
      <div
        className={`relative overflow-hidden bg-cream ${
          featured ? 'aspect-[4/5] lg:aspect-auto lg:flex-1' : 'aspect-[4/5]'
        }`}
      >
        {!imgLoaded && (
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-cappuccino/40 via-cream to-cappuccino/40 bg-[length:400px_100%]" />
        )}

        <motion.img
          src={product.images[0]}
          alt={product.name}
          onLoad={() => setImgLoaded(true)}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`h-full w-full object-cover object-center transition-opacity duration-300 ${
            imgLoaded
              ? isSoldOut
                ? 'opacity-60 grayscale'
                : 'opacity-100'
              : 'opacity-0'
          }`}
          loading="lazy"
        />

        {isOnSale && !isSoldOut ? (
          <span className="absolute left-3 top-3 z-10 rounded-[2px] bg-caramel px-[10px] py-[4px] font-dm text-[9px] font-medium uppercase tracking-ultra text-cream">
            Sale
          </span>
        ) : null}

        {product.isNew && !isOnSale && !isSoldOut ? (
          <span className="absolute left-3 top-3 z-10 rounded-[2px] bg-espresso px-[10px] py-[4px] font-dm text-[9px] font-medium uppercase tracking-ultra text-cream">
            New
          </span>
        ) : null}

        {isSoldOut ? (
          <div className="absolute right-[-28px] top-4 z-10 w-[110px] rotate-45 bg-espresso py-[5px] text-center font-dm text-[9px] font-medium uppercase tracking-ultra text-cream">
            Sold Out
          </div>
        ) : null}

        <motion.button
          onClick={handleWishlist}
          animate={{ scale: isWished ? 1.1 : 1 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream/80 text-caramel backdrop-blur-sm transition-colors duration-250 ease-smooth hover:text-mocha ${
            isWished ? 'text-mocha' : ''
          }`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
        >
          <Heart
            size={15}
            strokeWidth={1.8}
            fill={isWished ? '#7A553A' : 'none'}
          />
        </motion.button>

        <AnimatePresence>
          {isHovered && (
            <motion.button
              onClick={handleAddToCart}
              initial={{ y: '100%', opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              exit={{ y: '100%', opacity: 0, x: '-50%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`absolute bottom-3 left-1/2 z-10 whitespace-nowrap rounded-full px-6 py-2 font-dm text-[12px] font-medium tracking-wide transition-colors duration-250 ease-smooth ${
                isSoldOut
                  ? 'border border-caramel bg-cream/90 text-caramel'
                  : 'bg-espresso text-cream hover:bg-mocha'
              }`}
              type="button"
            >
              {isSoldOut ? 'Notify Me' : '+ Quick Add'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <p className="mb-1 font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
          {product.brand} · {product.category}
        </p>

        <p className="mb-3 line-clamp-2 font-playfair text-[15px] font-semibold leading-[1.3] text-espresso transition-colors duration-250 ease-smooth group-hover:text-mocha">
          {product.name}
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2">
            <span className="font-dm text-[14px] font-medium text-espresso">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {isOnSale ? (
              <span className="font-dm text-[12px] text-caramel line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            ) : null}
          </div>
          <span className="flex-shrink-0 font-dm text-[11px] text-caramel">
            ★ {product.rating}
          </span>
        </div>
      </div>
    </Link>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    isNew: PropTypes.bool.isRequired,
    isSoldOut: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    originalPrice: PropTypes.number,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number.isRequired,
  }).isRequired,
  className: PropTypes.string,
  featured: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}
