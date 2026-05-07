import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Button from '../UI/Button'
import { products } from '../../data/mockProducts'
import SmartImage from '../UI/SmartImage'

export default function FeaturedSpotlight() {
  const product = products[0]
  const companion = products[11]

  return (
    <section className="overflow-hidden bg-espresso px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-5 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
            Featured This Week
          </p>
          <h2 className="max-w-[520px] font-playfair text-[clamp(42px,7vw,90px)] font-black leading-[0.92] text-cream">
            The polished daily ritual.
          </h2>
          <p className="mt-7 max-w-[420px] font-dm text-[15px] font-light leading-[1.8] text-cream/66">
            A compact pairing for hands, pulse points, and the bag you carry
            every day. Quiet, useful, gift-ready.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" to={`/product/${product.id}`} className="group">
              Shop Featured
              <ArrowRight
                size={15}
                className="transition-transform duration-250 group-hover:translate-x-1"
              />
            </Button>
            <span className="font-dm text-[12px] uppercase tracking-wide-2 text-caramel">
              From Rs. {product.price.toLocaleString('en-IN')}
            </span>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-[1fr_0.72fr] sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group overflow-hidden rounded-[8px] border border-cream/12 bg-mocha"
          >
            <SmartImage
              src={product.images[0]}
              alt={product.name}
              className="aspect-[4/5] w-full"
              imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
            />
            <div className="flex items-end justify-between gap-4 p-5">
              <div>
                <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
                  {product.brand}
                </p>
                <h3 className="mt-2 max-w-[280px] font-playfair text-[24px] font-bold leading-tight text-cream">
                  {product.name}
                </h3>
              </div>
              <p className="font-dm text-[13px] font-semibold text-cream">
                Rs. {product.price.toLocaleString('en-IN')}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group overflow-hidden rounded-[8px] border border-cream/12 bg-mocha sm:translate-y-10"
          >
            <SmartImage
              src={companion.images[0]}
              alt={companion.name}
              className="aspect-[4/5] w-full"
              imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
            />
            <div className="p-5">
              <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
                Pair it with
              </p>
              <h3 className="mt-2 font-playfair text-[22px] font-bold leading-tight text-cream">
                {companion.name}
              </h3>
              <p className="mt-4 font-dm text-[13px] text-cream/60">
                Rs. {companion.price.toLocaleString('en-IN')} · ★ {companion.rating}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
