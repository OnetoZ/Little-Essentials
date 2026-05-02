import { motion } from 'framer-motion'
import Button from '../UI/Button'
import { products } from '../../data/mockProducts'
import SmartImage from '../UI/SmartImage'

const SPOTLIGHT_BG =
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1600&q=85'

export default function FeaturedSpotlight() {
  const product = products[0]

  return (
    <section className="relative h-[520px] overflow-hidden lg:h-[600px]">
      <motion.div
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-0"
      >
        <SmartImage
          src={SPOTLIGHT_BG}
          alt="Featured product"
          className="h-full w-full"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(59,42,34,0.88) 0%, rgba(59,42,34,0.64) 42%, rgba(59,42,34,0.18) 80%, transparent 100%)',
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex h-full max-w-screen-xl items-center px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md"
        >
          <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
            Featured This Week
          </p>
          <h2 className="mb-4 font-playfair text-[clamp(32px,5vw,52px)] font-bold leading-[1.15] text-cream">
            {product.name}
          </h2>
          <p className="mb-6 font-dm text-[15px] font-light leading-[1.7] text-cream/70">
            {product.description}
          </p>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-playfair text-[28px] font-bold text-cream">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="font-dm text-[12px] text-caramel">
              ★ {product.rating} ({product.reviewCount})
            </span>
          </div>
          <Button variant="primary" to={`/product/${product.id}`}>
            Shop Now →
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
