import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Gem, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import SEO from '../components/SEO/SEO'
import SmartImage from '../components/UI/SmartImage'

const IMAGES = {
  hero:
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1300&q=88',
  detail:
    'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=900&q=86',
  studio:
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&q=86',
  process:
    'https://images.unsplash.com/photo-1612521564730-62fc7691cd85?w=900&q=86',
}

const NUMBERS = [
  ['500+', 'Curated products'],
  ['18K+', 'Thoughtful customers'],
  ['50+', 'Partner brands'],
  ['4.9', 'Average rating'],
]

const PRINCIPLES = [
  {
    icon: Sparkles,
    title: 'Curated, never crowded',
    text: 'Every piece has a reason to exist in the edit. The store stays calm by design.',
  },
  {
    icon: Gem,
    title: 'Material intelligence',
    text: 'Texture, finish, usefulness, and longevity matter more than trend cycles.',
  },
  {
    icon: Leaf,
    title: 'Slow-shopping energy',
    text: 'We help customers choose fewer, better objects they actually want to keep.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust in the details',
    text: 'Packaging, delivery, returns, and after-care are treated as part of the product.',
  },
]

const STEPS = [
  'Discover makers and brands with a clear point of view.',
  'Test products for feel, function, finish, and daily relevance.',
  'Build small edits that help shoppers decide with confidence.',
]

export default function About() {
  return (
    <main className="overflow-x-hidden bg-cream">
      <SEO
        title="About Little Essentials"
        description="Little Essentials is a premium curated lifestyle store in India, built around intentional objects, enduring design, and quiet luxury."
        canonical="https://www.littleessentials.in/about"
        keywords="about little essentials, little essentials india, premium curated lifestyle store, luxury lifestyle store india"
      />

      <section className="relative overflow-hidden px-8 pb-20 pt-32 lg:px-16 lg:pb-28 lg:pt-36">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,42,34,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,42,34,1) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              About the edit
            </p>
            <h1 className="font-playfair text-[clamp(62px,11vw,132px)] font-bold leading-[0.8] text-espresso">
              Curation over clutter.
            </h1>
            <p className="mt-8 max-w-[540px] font-dm text-[17px] font-light leading-[1.85] text-mocha/78">
              Little Essentials is built for people who want fewer choices, made
              better. We collect premium skincare, home, fragrance, stationery,
              and accessories into a calm, useful, highly edited shop.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso px-8 py-4 font-dm text-[13px] font-semibold text-cream transition-all duration-300 hover:bg-mocha"
              >
                Shop the Edit <ArrowRight size={15} />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cappuccino px-8 py-4 font-dm text-[13px] font-semibold text-espresso transition-all duration-300 hover:border-caramel hover:bg-cream-light"
              >
                Read the Journal
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[600px]"
          >
            <div className="absolute right-0 top-0 h-[72%] w-[70%] overflow-hidden rounded-[30px] shadow-[0_28px_90px_rgba(59,42,34,0.18)]">
              <SmartImage
                src={IMAGES.hero}
                alt="Little Essentials interior mood"
                className="h-full w-full"
                imageClassName="object-cover object-center"
                priority
              />
            </div>
            <div className="absolute bottom-0 left-0 w-[48%] overflow-hidden rounded-[26px] border border-cream/70 bg-cream-light shadow-[0_24px_70px_rgba(59,42,34,0.16)]">
              <SmartImage
                src={IMAGES.detail}
                alt="Considered home detail"
                className="aspect-[4/5] w-full"
                imageClassName="object-cover object-center"
              />
              <div className="p-5">
                <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
                  Founder note
                </p>
                <p className="mt-2 font-playfair text-[25px] font-bold leading-tight text-espresso">
                  Small things shape the feeling of a life.
                </p>
              </div>
            </div>
            <div className="absolute bottom-[18%] right-[10%] max-w-[230px] rounded-[22px] border border-cappuccino/60 bg-cream-light/88 p-5 shadow-[0_18px_54px_rgba(59,42,34,0.12)] backdrop-blur-xl">
              <p className="font-playfair text-[44px] font-bold leading-none text-espresso">
                4.9
              </p>
              <p className="mt-2 font-dm text-[11px] uppercase tracking-ultra text-caramel">
                Average customer rating
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-cappuccino/45 bg-cream-light px-8 py-10 lg:px-16">
        <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-6 lg:grid-cols-4">
          {NUMBERS.map(([value, label], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{
                delay: index * 0.06,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="py-4"
            >
              <p className="font-playfair text-[clamp(42px,6vw,72px)] font-bold leading-none text-espresso">
                {value}
              </p>
              <p className="mt-2 font-dm text-[10px] uppercase tracking-ultra text-caramel">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-espresso px-8 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              What makes us different
            </p>
            <h2 className="max-w-[560px] font-playfair text-[clamp(46px,8vw,96px)] font-bold leading-[0.86] text-cream">
              Designed like a store. Edited like a magazine.
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((item, index) => {
              const Icon = item.icon

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-70px' }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="rounded-[24px] border border-cream/10 bg-cream/[0.045] p-6 transition-colors duration-300 hover:bg-cream/[0.07]"
                >
                  <Icon size={20} className="mb-8 text-caramel" strokeWidth={1.7} />
                  <h3 className="font-playfair text-[28px] font-bold leading-none text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-dm text-[14px] font-light leading-[1.75] text-cream/58">
                    {item.text}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-8 py-20 lg:px-16 lg:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4 sm:grid-cols-[0.78fr_1fr]"
          >
            <SmartImage
              src={IMAGES.studio}
              alt="Little Essentials studio"
              className="aspect-[4/5] rounded-[28px]"
              imageClassName="object-cover object-center"
            />
            <SmartImage
              src={IMAGES.process}
              alt="Little Essentials curation process"
              className="aspect-[4/5] rounded-[28px] sm:translate-y-12"
              imageClassName="object-cover object-center"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.08, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Our process
            </p>
            <h2 className="font-playfair text-[clamp(44px,7vw,86px)] font-bold leading-[0.88] text-espresso">
              Every product earns the shelf.
            </h2>
            <div className="mt-9 space-y-4">
              {STEPS.map((step, index) => (
                <div
                  key={step}
                  className="grid grid-cols-[42px_1fr] items-start border-t border-cappuccino/55 py-5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-cream">
                    <Check size={14} strokeWidth={2} />
                  </span>
                  <p className="font-dm text-[15px] font-light leading-[1.75] text-mocha/80">
                    {index + 1}. {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-cappuccino px-8 py-20 lg:px-16 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-screen-xl"
        >
          <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
            Start exploring
          </p>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <h2 className="max-w-[820px] font-playfair text-[clamp(50px,9vw,116px)] font-bold leading-[0.82] text-espresso">
              Find something worth keeping.
            </h2>
            <Link
              to="/collections"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-espresso px-9 py-4 font-dm text-[13px] font-semibold text-cream transition-all duration-300 hover:bg-mocha"
            >
              Shop all products <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
