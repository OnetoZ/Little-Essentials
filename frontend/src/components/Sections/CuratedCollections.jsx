import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import SmartImage from '../UI/SmartImage'
import { useShopifyCollections, useShopifyProducts } from '../../hooks/useShopify'

const COPY = {
  Home: 'Objects that quiet the room.',
  Fragrance: 'Scents with memory and restraint.',
  Stationery: 'Desk pieces with a point of view.',
  Accessories: 'Small forms, sharper details.',
}

export default function CuratedCollections() {
  const { collections, categories } = useShopifyCollections()
  const { products } = useShopifyProducts({ first: 24 })

  const COLLECTIONS = collections.length > 0
    ? collections.map((col) => {
        return {
          category: col.title,
          count: col.products.length,
          products: col.products,
          text: COPY[col.title] ?? 'A considered edit.',
        }
      }).filter((c) => c.products.length > 0)
    : categories.slice(1).map((category) => {
        const items = products.filter(
          (p) => p.category.toLowerCase() === category.toLowerCase(),
        )

        return {
          category,
          count: items.length,
          products: items.length ? items : products.slice(0, 2),
          text: COPY[category] ?? 'A considered edit.',
        }
      }).filter((c) => c.products.length > 0)

  return (
    <section className="overflow-hidden bg-espresso px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Featured collections
            </p>
            <h2 className="max-w-[760px] font-playfair text-[clamp(54px,9vw,118px)] font-bold leading-[0.82] text-cream">
              Shop by mood, not menu.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="lg:justify-self-end"
          >
            <p className="max-w-[430px] font-dm text-[15px] font-light leading-[1.85] text-cream/62">
              A cinematic collection wall with real product imagery in every
              card. Each category opens into a focused shopping edit.
            </p>
            <Link
              to="/collections"
              className="mt-7 inline-flex items-center gap-2 border-b border-caramel pb-1 font-dm text-[13px] font-semibold text-cream transition-colors hover:text-caramel"
            >
              View all collections <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {COLLECTIONS.map((item, index) => {
            const [lead, support] = item.products
            const wide = index === 0 || index === 3

            return (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}
              >
                <Link
                  to={`/collections?category=${encodeURIComponent(item.category)}`}
                  className="group relative block min-h-[430px] overflow-hidden rounded-[30px] border border-cream/10 bg-mocha shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                >
                  <div className="absolute inset-0 grid grid-cols-[1.08fr_0.92fr]">
                    <SmartImage
                      src={lead.images[0]}
                      alt={`${item.category} collection lead`}
                      className="h-full w-full"
                      imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
                      priority={index < 2}
                    />
                    <div className="grid grid-rows-2">
                      <SmartImage
                        src={(support ?? lead).images[0]}
                        alt={`${item.category} collection detail`}
                        className="h-full w-full"
                        imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
                        priority={index < 2}
                      />
                      <div className="bg-mocha/95" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/52 to-espresso/8" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <p className="mb-4 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
                      {item.count} piece edit
                    </p>
                    <h3 className="font-playfair text-[clamp(44px,7vw,82px)] font-bold leading-[0.84] text-cream">
                      {item.category}
                    </h3>
                    <p className="mt-5 max-w-[340px] font-dm text-[14px] font-light leading-[1.65] text-cream/68">
                      {item.text}
                    </p>
                  </div>
                  <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-cream/12 text-cream backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                    <ArrowUpRight size={18} strokeWidth={1.7} />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
