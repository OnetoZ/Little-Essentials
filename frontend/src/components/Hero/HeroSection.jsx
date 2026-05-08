import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import Button from '../UI/Button'
import SmartImage from '../UI/SmartImage'
import { useShopifyProducts } from '../../hooks/useShopify'

const CAMPAIGN_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1500&q=90'

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
}

const FADE = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
  },
}

export default function HeroSection() {
  const sectionRef = useRef(null)
  const { products } = useShopifyProducts({ first: 12, sortKey: 'BEST_SELLING' })
  const HERO_PRODUCTS = products.length >= 3
    ? [products[0], products[Math.floor(products.length / 2)], products[products.length - 1]]
    : products.slice(0, 3)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const stageY = useTransform(scrollYProgress, [0, 1], ['0%', '9%'])
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%'])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[94dvh] overflow-hidden bg-cream px-5 pb-10 pt-28 sm:px-8 lg:px-16 lg:pt-32"
    >
      <motion.div
        aria-hidden="true"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute left-0 top-24 flex whitespace-nowrap opacity-[0.055]"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className="pr-12 font-playfair text-[clamp(80px,14vw,190px)] font-bold leading-none text-espresso"
          >
            CURATED DAILY
          </span>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto grid max-w-screen-xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="max-w-[720px]"
        >
          <motion.div
            variants={FADE}
            className="mb-5 inline-flex items-center gap-3 border border-cappuccino/70 bg-cream-light/70 px-4 py-2 backdrop-blur-xl"
          >
            <Sparkles size={14} className="text-caramel" strokeWidth={1.7} />
            <span className="font-dm text-[11px] font-semibold uppercase tracking-ultra text-mocha">
              Curated weekly
            </span>
          </motion.div>

          <motion.h1
            variants={FADE}
            className="font-playfair text-[clamp(58px,9vw,116px)] font-bold leading-[0.82] text-espresso"
          >
            Everyday luxury, edited sharper.
          </motion.h1>

          <motion.p
            variants={FADE}
            className="mt-6 max-w-[500px] font-dm text-[16px] font-light leading-[1.75] text-mocha/78"
          >
            Premium skincare, home, fragrance, and desk objects arranged with
            the calm of a gallery and the speed of a modern shop.
          </motion.p>

          <motion.div variants={FADE} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/collections" variant="primary" className="group rounded-full px-10">
              Shop the Edit
              <ArrowRight
                size={15}
                className="transition-transform duration-250 group-hover:translate-x-1"
              />
            </Button>
            <Button
              to="/collections?filter=new"
              variant="ghost"
              className="rounded-full px-10"
            >
              New Arrivals
            </Button>
          </motion.div>

          <motion.div
            variants={FADE}
            className="mt-8 grid max-w-[540px] grid-cols-3 divide-x divide-cappuccino/60 border-y border-cappuccino/55 py-4"
          >
            {[
              ['500+', 'Curated pieces'],
              ['4.8/5', 'Customer rating'],
              ['48h', 'Dispatch window'],
            ].map(([value, label]) => (
              <div key={label} className="px-4 first:pl-0">
                <p className="font-playfair text-[28px] font-bold leading-none text-espresso">
                  {value}
                </p>
                <p className="mt-2 font-dm text-[10px] uppercase tracking-wide-2 text-caramel">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div style={{ y: stageY }} className="relative min-h-[570px] lg:min-h-[610px]">
          <div className="absolute inset-x-[8%] top-[1%] h-[50%] overflow-hidden rounded-[34px] shadow-[0_28px_90px_rgba(59,42,34,0.16)]">
            <motion.div style={{ y: imageY }} className="h-[112%] w-full">
              <SmartImage
                src={CAMPAIGN_IMAGE}
                alt="Little Essentials editorial home campaign"
                className="h-full w-full"
                imageClassName="object-cover object-center"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[4%] left-0 right-0 mx-auto grid max-w-[650px] grid-cols-3 gap-3"
          >
            {HERO_PRODUCTS.map((product, index) => (
              <motion.a
                key={product.id}
                href={`/product/${product.id}`}
                whileHover={{ y: -10, rotate: index === 1 ? 0 : index === 0 ? -1 : 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`group overflow-hidden rounded-[24px] border border-cappuccino/55 bg-cream-light shadow-[0_16px_54px_rgba(59,42,34,0.12)] ${
                  index === 1 ? '-translate-y-7' : ''
                }`}
              >
                <SmartImage
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-[4/5] w-full"
                  imageClassName="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-105"
                  priority
                />
                <div className="p-3.5">
                  <p className="font-dm text-[9px] uppercase tracking-ultra text-caramel">
                    {product.brand}
                  </p>
                  <p className="mt-1 line-clamp-2 font-playfair text-[18px] font-bold leading-none text-espresso">
                    {product.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-dm text-[12px] font-semibold text-mocha">
                      Rs. {product.price.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-dm text-[11px] text-caramel">
                      <Star size={11} fill="currentColor" /> {product.rating}
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
