import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Gem, LockKeyhole, Sparkles } from 'lucide-react'
import FloatInput from '../components/UI/FloatInput'
import SmartImage from '../components/UI/SmartImage'
import SEO from '../components/SEO/SEO'
import { sanitizeText } from '../utils/sanitize'
import { products } from '../data/mockProducts'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1300&q=90'
const PRODUCT_STRIP = [products[0], products[4], products[11]]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

export default function Login() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const setField = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: sanitizeText(event.target.value),
    }))

  return (
    <main className="h-[100dvh] overflow-hidden bg-espresso px-4 pb-4 pt-[96px] sm:px-6 lg:px-8">
      <SEO
        title="Sign In"
        description="Sign in to your Little Essentials account to manage orders, wishlist, and preferences."
        canonical="https://www.littleessentials.in/login"
        noIndex
      />

      <motion.div
        aria-hidden="true"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute left-0 top-20 flex whitespace-nowrap opacity-[0.04]"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className="pr-12 font-playfair text-[clamp(72px,13vw,180px)] font-bold leading-none text-cream"
          >
            PRIVATE EDIT
          </span>
        ))}
      </motion.div>

      <div className="relative z-10 mx-auto grid h-full max-w-screen-xl overflow-hidden rounded-[30px] border border-cream/12 bg-cream-light shadow-[0_28px_100px_rgba(0,0,0,0.28)] lg:grid-cols-[0.94fr_1.06fr]">
        <section className="relative hidden min-h-0 flex-col justify-between overflow-hidden bg-espresso p-6 lg:flex xl:p-8">
          <SmartImage
            src={HERO_IMAGE}
            alt="Little Essentials private account atmosphere"
            className="absolute inset-0 h-full w-full"
            imageClassName="object-cover object-center opacity-[0.54]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/72 to-espresso/28" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(243,233,215,1) 1px, transparent 1px), linear-gradient(90deg, rgba(243,233,215,1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <Link
            to="/"
            className="relative z-10 inline-flex w-fit font-playfair text-[24px] font-bold text-cream transition-colors hover:text-caramel"
          >
            Little Essentials
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-[650px]"
          >
            <p className="mb-4 inline-flex items-center gap-3 border border-cream/18 bg-cream/10 px-4 py-2 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel backdrop-blur-xl">
              <Sparkles size={14} /> Private customer desk
            </p>
            <h1 className="font-playfair text-[clamp(52px,7vw,88px)] font-bold leading-[0.82] text-cream">
              Sign in to a calmer shop.
            </h1>
            <p className="mt-5 max-w-[430px] font-dm text-[14px] font-light leading-[1.75] text-cream/68">
              Saved carts, wishlists, early drops, and order tracking in one
              quiet account space.
            </p>
          </motion.div>

          <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [BadgeCheck, 'Early access'],
              [Gem, 'Saved wishlist'],
              [LockKeyhole, 'Secure checkout'],
            ].map(([Icon, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.28 + index * 0.08,
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="rounded-[18px] border border-cream/12 bg-cream/10 p-4 backdrop-blur-xl"
              >
                <Icon size={16} className="mb-3 text-caramel" strokeWidth={1.7} />
                <p className="font-dm text-[12px] font-semibold text-cream">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative flex min-h-0 items-center justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-10">
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-8 top-6 hidden grid-cols-3 gap-3 lg:grid"
          >
            {PRODUCT_STRIP.map((product, index) => (
              <div
                key={product.id}
                className={`w-[88px] overflow-hidden rounded-[18px] border border-cappuccino/50 bg-cream shadow-[0_14px_44px_rgba(59,42,34,0.10)] xl:w-[100px] ${
                  index === 1 ? 'translate-y-5' : ''
                }`}
              >
                <SmartImage
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-[4/5] w-full"
                  imageClassName="object-cover object-center"
                  priority
                />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[430px]"
          >
            <div className="mb-5">
              <p className="mb-2 font-dm text-[10px] font-semibold uppercase tracking-ultra text-caramel">
                {tab === 'login' ? 'Welcome back' : 'Join the edit'}
              </p>
              <h2 className="font-playfair text-[clamp(40px,5vw,58px)] font-bold leading-[0.88] text-espresso">
                {tab === 'login' ? 'Continue beautifully.' : 'Create your account.'}
              </h2>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-full border border-cappuccino/65 bg-cream p-1.5 shadow-[0_16px_54px_rgba(59,42,34,0.07)]">
              {['login', 'register'].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-full px-4 py-2.5 font-dm text-[12px] font-semibold capitalize transition-all duration-250 ease-smooth ${
                    tab === item
                      ? 'bg-espresso text-cream shadow-[0_10px_28px_rgba(59,42,34,0.18)]'
                      : 'text-mocha hover:bg-cream-light'
                  }`}
                  type="button"
                >
                  {item === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[26px] border border-cappuccino/55 bg-cream/88 p-4 shadow-[0_22px_80px_rgba(59,42,34,0.10)] backdrop-blur-xl sm:p-5"
              >
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <button
                    className="flex h-11 items-center justify-center gap-3 rounded-full border border-cappuccino bg-cream-light font-dm text-[12px] font-semibold text-espresso transition-colors duration-250 hover:border-caramel"
                    type="button"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    className="flex h-11 items-center justify-center gap-3 rounded-full bg-espresso font-dm text-[12px] font-semibold text-cream transition-colors duration-250 hover:bg-mocha"
                    type="button"
                  >
                    <AppleIcon />
                    Apple
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-cappuccino/55" />
                  <span className="font-dm text-[11px] uppercase tracking-wide-2 text-caramel">
                    or use email
                  </span>
                  <div className="h-px flex-1 bg-cappuccino/55" />
                </div>

                <div className="mb-3 space-y-2.5">
                  {tab === 'register' ? (
                    <FloatInput
                      label="Full name"
                      name="name"
                      value={form.name}
                      onChange={setField('name')}
                    />
                  ) : null}
                  <FloatInput
                    label="Email address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                  />
                  <FloatInput
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={setField('password')}
                  />
                </div>

                {tab === 'login' ? (
                  <button
                    className="mb-4 block w-full text-right font-dm text-[12px] font-semibold text-caramel underline underline-offset-4"
                    type="button"
                  >
                    Forgot Password?
                  </button>
                ) : null}

                <button
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mocha font-dm text-[14px] font-semibold text-cream transition-colors duration-250 hover:bg-espresso"
                  type="button"
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-250 group-hover:translate-x-1"
                  />
                </button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
