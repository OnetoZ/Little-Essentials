import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Heart, Leaf, Sparkles, Star } from 'lucide-react'
import SEO from '../components/SEO/SEO'
import RevealOnScroll from '../components/UI/RevealOnScroll'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1800&q=90'
const STORY_IMAGE =
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&q=85'
const CRAFT_IMAGE =
  'https://images.unsplash.com/photo-1612521564730-62fc7691cd85?w=900&q=85'

const VALUES = [
  {
    icon: Sparkles,
    title: 'Intentional Curation',
    desc: 'Every product earns its place. We reject the noise, surface only what genuinely elevates everyday life.',
  },
  {
    icon: Leaf,
    title: 'Considered Sourcing',
    desc: 'We partner with makers and brands who share our belief that how something is made is as important as what it does.',
  },
  {
    icon: Heart,
    title: 'Quiet Luxury',
    desc: 'Beauty without ostentation. Functionality without compromise. Objects that belong in a life well lived.',
  },
  {
    icon: Star,
    title: 'Enduring Quality',
    desc: 'We choose goods designed to last — not for a season, but for years. Timeless over trendy, always.',
  },
]

const NUMBERS = [
  { value: '200+', label: 'Curated Products' },
  { value: '18K+', label: 'Happy Customers' },
  { value: '50+', label: 'Partner Brands' },
  { value: '4.9★', label: 'Average Rating' },
]

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
}

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

export default function About() {
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], ['0%', '30%'])

  return (
    <main className="overflow-x-hidden bg-cream">
      <SEO
        title="About Little Essentials"
        description="Little Essentials is a premium curated lifestyle store in India, built around intentional objects, enduring design, and quiet luxury."
        canonical="https://www.littleessentials.in/about"
        keywords="about little essentials, little essentials india, premium curated lifestyle store, luxury lifestyle store india"
      />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] items-center justify-center overflow-hidden"
      >
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 scale-110 will-change-transform"
        >
          <img
            src={HERO_IMAGE}
            alt="Little Essentials store interior"
            className="h-full w-full object-cover object-center"
          />
        </motion.div>

        {/* Gradient overlays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(59,42,34,0.35) 0%, rgba(59,42,34,0.72) 60%, rgba(59,42,34,0.92) 100%)',
          }}
        />

        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-screen-md px-8 text-center"
        >
          <motion.p
            variants={FADE_UP}
            className="mb-5 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel"
          >
            Est. 2024 · India
          </motion.p>

          <motion.h1
            variants={FADE_UP}
            className="mb-6 font-playfair text-[clamp(52px,9vw,96px)] font-black leading-[0.92] text-cream"
          >
            Curation
            <br />
            <span className="italic font-normal">over clutter.</span>
          </motion.h1>

          <motion.p
            variants={FADE_UP}
            className="mx-auto mb-10 max-w-[480px] font-dm text-[17px] font-light leading-[1.8] text-cream/70"
          >
            Little Essentials exists to surface the world&apos;s most considered goods —
            chosen for materiality, usefulness, longevity, and the quiet pleasure
            they bring to everyday life.
          </motion.p>

          <motion.div variants={FADE_UP} className="flex justify-center gap-4">
            <Link
              to="/collections"
              className="inline-flex items-center gap-2 rounded-[3px] bg-caramel px-8 py-4 font-dm text-[13px] font-medium text-cream transition-all duration-300 hover:bg-mocha hover:gap-3"
            >
              Shop the Edit <ArrowRight size={16} />
            </Link>
            <Link
              to="/journal"
              className="inline-flex items-center gap-2 rounded-[3px] border border-cream/40 px-8 py-4 font-dm text-[13px] font-medium text-cream transition-all duration-300 hover:border-cream/80 hover:bg-cream/10"
            >
              Read the Journal
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
          <div className="h-10 w-[1.5px] bg-caramel/60" />
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-2 w-2 rotate-45 border-b border-r border-caramel" />
          </motion.div>
        </div>
      </section>

      {/* ── NUMBERS ── */}
      <section className="border-y border-cappuccino/40 bg-cream py-16">
        <div className="mx-auto max-w-screen-xl px-8 lg:px-16">
          <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
            {NUMBERS.map((item, i) => (
              <RevealOnScroll key={item.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <p className="mb-1 font-playfair text-[clamp(36px,5vw,56px)] font-black leading-none text-espresso">
                    {item.value}
                  </p>
                  <p className="font-dm text-[12px] uppercase tracking-[0.18em] text-caramel">
                    {item.label}
                  </p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section className="mx-auto max-w-screen-xl px-8 py-24 lg:px-16 lg:py-36">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <RevealOnScroll>
            <div className="relative">
              <div className="overflow-hidden rounded-[4px] shadow-[0_24px_80px_rgba(59,42,34,0.12)]">
                <motion.img
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  src={STORY_IMAGE}
                  alt="The Little Essentials story"
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/5' }}
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-40 w-40 rounded-full bg-cappuccino/40" />
              <div className="absolute -left-4 -top-4 -z-10 h-24 w-24 rounded-full bg-caramel/20" />
              {/* Floating label */}
              <div className="absolute -right-4 top-8 rounded-[4px] bg-espresso px-5 py-3 shadow-lg">
                <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">Founded</p>
                <p className="font-playfair text-[20px] font-bold text-cream">2024</p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div>
              <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel">
                Our Origin
              </p>
              <h2 className="mb-6 font-playfair text-[clamp(36px,4.5vw,56px)] font-black leading-[1.05] text-espresso">
                Born from a belief that everyday objects matter.
              </h2>
              <div className="space-y-5 font-dm text-[15px] font-light leading-[1.9] text-mocha">
                <p>
                  Little Essentials began as a simple frustration: why was it so hard
                  to find objects that were both beautiful <em>and</em> genuinely useful?
                  Products that felt worth owning, not just worth buying?
                </p>
                <p>
                  We set out to answer that question — spending months sourcing from
                  the world&apos;s most considered makers, visiting studios, testing
                  materials, and learning from craftspeople who dedicate their lives to
                  making things right.
                </p>
                <p>
                  Today, Little Essentials curates the finest skincare, home goods,
                  fragrance, and stationery — each product chosen because it earns a
                  permanent place in a thoughtful life.
                </p>
              </div>

              <div className="mt-10 border-l-2 border-caramel pl-6">
                <p className="font-playfair text-[18px] italic leading-[1.6] text-espresso">
                  &ldquo;The best things in life are small, considered, and quietly
                  extraordinary.&rdquo;
                </p>
                <p className="mt-3 font-dm text-[12px] uppercase tracking-ultra text-caramel">
                  — Sriman, Founder
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-espresso py-24 lg:py-36">
        <div className="mx-auto max-w-screen-xl px-8 lg:px-16">
          <RevealOnScroll>
            <div className="mb-16 text-center">
              <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel">
                What We Stand For
              </p>
              <h2 className="font-playfair text-[clamp(36px,5vw,60px)] font-black leading-[1.05] text-cream">
                The principles behind
                <br />
                <span className="italic font-normal">every decision we make.</span>
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <RevealOnScroll key={value.title}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6 }}
                  className="group rounded-[8px] border border-cream/[0.08] bg-cream/[0.04] p-8 transition-all duration-300 hover:border-caramel/30 hover:bg-cream/[0.07]"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-caramel/15 transition-colors duration-300 group-hover:bg-caramel/25">
                    <value.icon size={22} className="text-caramel" />
                  </div>
                  <h3 className="mb-3 font-playfair text-[18px] font-bold text-cream">
                    {value.title}
                  </h3>
                  <p className="font-dm text-[14px] font-light leading-[1.8] text-cream/55">
                    {value.desc}
                  </p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRAFT SECTION ── */}
      <section className="mx-auto max-w-screen-xl px-8 py-24 lg:px-16 lg:py-36">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <RevealOnScroll>
            <div>
              <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel">
                Our Process
              </p>
              <h2 className="mb-6 font-playfair text-[clamp(36px,4.5vw,56px)] font-black leading-[1.05] text-espresso">
                Each product chosen
                <br />
                <span className="italic font-normal">by human hands.</span>
              </h2>
              <div className="space-y-5 font-dm text-[15px] font-light leading-[1.9] text-mocha">
                <p>
                  Our team personally tests every product before it appears in the edit.
                  No algorithm. No sponsored placements. Just honest assessment of
                  materials, performance, and the feeling something gives you in daily use.
                </p>
                <p>
                  We apply five criteria: quality of materials, longevity, experience of
                  use, design integrity, and sustainable practices. A product that passes
                  all five earns a place on Little Essentials.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { step: '01', label: 'Discovery' },
                  { step: '02', label: 'Evaluation' },
                  { step: '03', label: 'Curation' },
                ].map((item) => (
                  <div key={item.step} className="rounded-[6px] bg-cappuccino/30 p-5 text-center">
                    <p className="mb-1 font-playfair text-[24px] font-black text-caramel">
                      {item.step}
                    </p>
                    <p className="font-dm text-[12px] uppercase tracking-ultra text-espresso">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="relative">
              <div className="overflow-hidden rounded-[4px] shadow-[0_24px_80px_rgba(59,42,34,0.12)]">
                <motion.img
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  src={CRAFT_IMAGE}
                  alt="Craftsmanship and curation process"
                  className="w-full object-cover"
                  style={{ aspectRatio: '4/5' }}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 -z-10 h-40 w-40 rounded-full bg-caramel/20" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-cappuccino/30 py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,42,34,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,42,34,1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <RevealOnScroll>
          <div className="relative z-10 mx-auto max-w-screen-md px-8 text-center">
            <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel">
              Start exploring
            </p>
            <h2 className="mb-6 font-playfair text-[clamp(40px,6vw,72px)] font-black leading-[1.0] text-espresso">
              Find something worth keeping.
            </h2>
            <p className="mx-auto mb-10 max-w-[420px] font-dm text-[16px] font-light leading-[1.8] text-mocha">
              Browse our full edit of premium, considered goods — delivered with care
              to your door across India.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 rounded-[3px] bg-espresso px-10 py-4 font-dm text-[13px] font-medium text-cream transition-all duration-300 hover:bg-mocha hover:gap-3"
              >
                Shop All Collections <ArrowRight size={16} />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-[3px] border border-espresso/30 px-10 py-4 font-dm text-[13px] font-medium text-espresso transition-all duration-300 hover:border-espresso hover:bg-espresso/5"
              >
                Read the Journal
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  )
}
