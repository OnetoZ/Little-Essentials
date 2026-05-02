import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, Play } from 'lucide-react'
import Button from '../UI/Button'

const HERO_BG =
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1800&q=90'
const PRODUCT_IMG =
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=85'

const STAGGER_CONTAINER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
}

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

const HEADLINE_CONTAINER = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18 },
  },
}

export default function HeroSection() {
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const backgroundY = useTransform(scrollY, [0, 600], ['0%', '35%'])
  const indicatorOpacity = useTransform(scrollY, [0, 420, 620], [1, 0.55, 0])

  return (
    <section
      ref={containerRef}
      className="relative flex h-[100dvh] min-h-[640px] w-full items-end overflow-hidden"
    >
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 scale-110 will-change-transform"
      >
        <img
          src={HERO_BG}
          alt="Little Essentials curated premium lifestyle"
          className="h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(
              to top,
              rgba(59,42,34,0.88) 0%,
              rgba(59,42,34,0.58) 35%,
              rgba(59,42,34,0.18) 62%,
              transparent 100%
            )
          `,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(59,42,34,0.42) 0%, transparent 55%)',
        }}
      />

      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex w-full max-w-screen-xl items-end justify-between px-6 pb-24 sm:px-8 lg:px-16 lg:pb-28"
      >
        <div className="max-w-[600px]">
          <motion.div
            variants={FADE_UP}
            className="mb-6 flex items-center gap-4"
          >
            <div className="h-[1.5px] w-10 bg-caramel" />
            <span className="font-dm text-[11px] font-medium uppercase tracking-ultra text-cream/80">
              Curated for you · Crafted with care
            </span>
          </motion.div>

          <motion.h1
            variants={HEADLINE_CONTAINER}
            className="mb-6 font-playfair leading-[0.95]"
          >
            <motion.span
              variants={FADE_UP}
              className="block text-[clamp(48px,8vw,80px)] font-normal italic text-cream"
            >
              The Art of
            </motion.span>
            <motion.span
              variants={FADE_UP}
              className="block text-[clamp(58px,9.5vw,96px)] font-black text-cream"
            >
              Small Luxuries
              <span className="text-caramel">.</span>
            </motion.span>
          </motion.h1>

          <motion.p
            variants={FADE_UP}
            className="mb-8 max-w-[380px] font-dm text-[clamp(15px,1.6vw,18px)] font-light leading-[1.7] text-cream/75"
          >
            Premium goods, mindfully chosen.
            <br />
            For the life you&apos;re building.
          </motion.p>

          <motion.div
            variants={FADE_UP}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button
              to="/collections"
              variant="primary"
              className="group px-10 py-4 hover:bg-caramel"
            >
              Explore Now
              <span className="ml-1 transition-transform duration-250 ease-smooth group-hover:translate-x-1">
                →
              </span>
            </Button>

            <Button
              to="/journal"
              variant="ghost_dark"
              className="px-8 py-4 tracking-normal"
            >
              <Play size={14} className="text-caramel" />
              View Lookbook
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ delay: 0.9, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="hidden w-[260px] flex-shrink-0 xl:block"
        >
          <div className="overflow-hidden rounded-[8px] bg-cream shadow-[0_32px_80px_rgba(59,42,34,0.40)]">
            <div className="relative h-[320px] bg-cappuccino">
              <img
                src={PRODUCT_IMG}
                alt="Featured Aesop hand balm"
                className="h-full w-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded-[2px] bg-espresso px-[10px] py-[4px] font-dm text-[9px] font-medium uppercase tracking-ultra text-cream">
                New
              </span>
            </div>

            <div className="p-4">
              <p className="mb-1 font-dm text-[10px] uppercase tracking-ultra text-caramel">
                Aesop · Skincare
              </p>
              <p className="mb-2 line-clamp-2 font-playfair text-[14px] font-semibold leading-tight text-espresso">
                Resurrection Aromatique Hand Balm
              </p>
              <div className="flex items-center justify-between">
                <p className="font-dm text-[13px] font-medium text-espresso">
                  ₹2,400
                </p>
                <span className="font-dm text-[11px] text-caramel">
                  ★ 4.8
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="flex flex-col items-center gap-2"
        >
          <div className="h-10 w-[1.5px] bg-caramel" />
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} className="text-caramel" />
          </motion.div>
          <span className="font-dm text-[10px] uppercase tracking-ultra text-cream/40">
            Scroll
          </span>
        </motion.div>
      </motion.div>
    </section>
  )
}
