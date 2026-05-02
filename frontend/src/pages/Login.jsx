import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import FloatInput from '../components/UI/FloatInput'
import SmartImage from '../components/UI/SmartImage'
import SEO from '../components/SEO/SEO'

const LOGIN_BG =
  'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=900&q=85'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

export default function Login() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  return (
    <main className="flex min-h-screen">
      <SEO
        title="Sign In"
        description="Sign in to your Little Essentials account to manage orders, wishlist, and preferences."
        canonical="https://www.littleessentials.in/login"
        noIndex
      />
      <div className="relative hidden overflow-hidden bg-espresso lg:flex lg:w-1/2">
        <SmartImage
          src={LOGIN_BG}
          alt="Little Essentials"
          className="h-full w-full"
          imageClassName="opacity-70"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(59,42,34,0.85) 0%, transparent 60%)',
          }}
        />
        <div className="absolute bottom-12 left-12 max-w-[320px]">
          <p className="mb-3 font-playfair text-[36px] font-bold italic leading-tight text-cream">
            Welcome back.
          </p>
          <p className="font-dm text-[15px] font-light text-cream/65">
            Your curated world is waiting.
          </p>
        </div>
        <div className="absolute left-8 top-8">
          <Link
            to="/"
            className="font-playfair text-[18px] font-bold text-cream transition-colors duration-250 ease-smooth hover:text-caramel"
          >
            Little Essentials
          </Link>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-cream px-8 py-16 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-8 text-center lg:hidden">
            <Link
              to="/"
              className="font-playfair text-[22px] font-bold text-espresso"
            >
              Little Essentials
            </Link>
          </div>

          <div className="mb-6 flex overflow-hidden rounded-[8px] border border-cappuccino">
            {['login', 'register'].map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`flex-1 py-3 font-dm text-[13px] font-medium capitalize transition-colors duration-250 ease-smooth ${
                  tab === item
                    ? 'bg-espresso text-cream'
                    : 'text-caramel hover:text-espresso'
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="mb-6 font-playfair text-[28px] font-bold text-espresso">
                {tab === 'login'
                  ? 'Sign in to your account'
                  : 'Create your account'}
              </h1>

              <div className="mb-4 space-y-3">
                <button
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-[8px] border border-cappuccino bg-cream-light font-dm text-[13px] font-medium text-espresso transition-colors duration-250 ease-smooth hover:border-caramel"
                  type="button"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-[8px] bg-espresso font-dm text-[13px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-mocha"
                  type="button"
                >
                  <AppleIcon />
                  Continue with Apple
                </button>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-cappuccino/50" />
                <span className="font-dm text-[12px] text-caramel">or</span>
                <div className="h-px flex-1 bg-cappuccino/50" />
              </div>

              <div className="mb-4 space-y-3">
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
                  className="mb-4 block w-full text-right font-dm text-[12px] text-caramel underline underline-offset-2"
                  type="button"
                >
                  Forgot Password?
                </button>
              ) : null}

              <button
                className="h-[52px] w-full rounded-[4px] bg-mocha font-dm text-[14px] font-medium text-cream transition-colors duration-250 ease-smooth hover:bg-espresso"
                type="button"
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  )
}
