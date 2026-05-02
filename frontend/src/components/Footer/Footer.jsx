import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.67a8.18 8.18 0 004.77 1.52V6.74a4.85 4.85 0 01-1-.05z" />
    </svg>
  )
}

const SHOP_LINKS = [
  { label: 'New Arrivals', path: '/collections?filter=new' },
  { label: 'Collections', path: '/collections' },
  { label: 'Best Sellers', path: '/collections?filter=bestsellers' },
  { label: 'Gift Cards', path: '/gift-cards' },
  { label: 'Sale', path: '/collections?filter=sale' },
  { label: 'Lookbook', path: '/journal' },
]

const CARE_LINKS = [
  { label: 'Contact Us', path: '/contact' },
  { label: 'FAQs', path: '/faqs' },
  { label: 'Shipping Policy', path: '/shipping' },
  { label: 'Returns', path: '/returns' },
  { label: 'Size Guide', path: '/size-guide' },
  { label: 'Track Your Order', path: '/order/LE-2025-08847/track' },
]

const SOCIAL = [
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: PinterestIcon, label: 'Pinterest', href: '#' },
  { icon: TikTokIcon, label: 'TikTok', href: '#' },
]

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group relative inline-block font-dm text-[13px] font-light text-cream/60 transition-colors duration-250 ease-smooth hover:text-cream"
    >
      {children}
      <span className="absolute bottom-0 left-1/2 h-[1px] w-0 origin-center -translate-x-1/2 bg-caramel transition-all duration-300 ease-smooth group-hover:w-full" />
    </Link>
  )
}

FooterLink.propTypes = {
  children: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleNewsletter = async (event) => {
    event.preventDefault()
    if (!email || submitting || submitted) return

    setSubmitting(true)
    await new Promise((resolve) => {
      window.setTimeout(resolve, 800)
    })
    setSubmitted(true)
    setSubmitting(false)
    window.setTimeout(() => {
      setSubmitted(false)
      setEmail('')
    }, 5000)
  }

  return (
    <footer className="relative overflow-hidden bg-espresso">
      <div className="relative overflow-hidden border-b border-cream/[0.04] py-4">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap will-change-transform"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="select-none pr-8 font-playfair font-black"
              style={{
                fontSize: 'clamp(48px, 8vw, 72px)',
                color: 'rgba(243,233,215,0.05)',
                letterSpacing: '0.02em',
              }}
            >
              LITTLE&nbsp;&nbsp;ESSENTIALS&nbsp;&nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto max-w-screen-xl px-8 pb-12 pt-14 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="mb-4 inline-block font-playfair text-[20px] font-bold text-cream transition-colors duration-250 ease-smooth hover:text-caramel"
            >
              Little Essentials
            </Link>
            <p className="mb-6 max-w-[240px] font-dm text-[14px] font-light leading-[1.8] text-cream/55">
              &quot;Curation over clutter.
              <br />
              Intention over impulse.
              <br />
              Small things, big meaning.&quot;
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-cappuccino/55 transition-colors duration-250 ease-smooth hover:text-caramel"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
              Shop
            </p>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink to={link.path}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-5 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
              Care
            </p>
            <ul className="space-y-3">
              {CARE_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink to={link.path}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
              Stay in the Edit
            </p>
            <p className="mb-4 font-dm text-[13px] font-light leading-[1.7] text-cream/50">
              New arrivals, exclusive drops, and stories worth reading. No spam,
              ever.
            </p>

            <form onSubmit={handleNewsletter} className="relative">
              <input
                type="email"
                value={submitted ? "You're in the edit. ✓" : email}
                onChange={(event) => !submitted && setEmail(event.target.value)}
                placeholder="your@email.com"
                readOnly={submitted}
                className={`h-12 w-full rounded-[8px] border border-cream/[0.12] bg-cream/[0.06] pl-4 pr-14 font-dm text-[13px] outline-none transition-all duration-250 ease-smooth placeholder:text-cream/30 focus:border-caramel/40 ${
                  submitted ? 'text-caramel' : 'text-cream'
                }`}
              />
              <button
                type="submit"
                disabled={submitting || submitted}
                className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-[8px] bg-caramel transition-colors duration-250 ease-smooth hover:bg-mocha disabled:opacity-50"
              >
                {submitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="h-3 w-3 rounded-full border border-cream border-t-transparent"
                  />
                ) : (
                  <span className="text-sm font-medium text-cream">→</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/[0.08] px-8 py-5 lg:px-16">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center font-dm text-[12px] text-cream/30 sm:text-left">
            © 2026 Little Essentials. Made with intention in India.
          </p>

          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((label, index) => (
              <span key={label}>
                <a
                  href="#"
                  className="font-dm text-[11px] text-cream/25 transition-colors duration-250 ease-smooth hover:text-cream/50"
                >
                  {label}
                </a>
                {index < 2 ? <span className="ml-4 text-cream/15">·</span> : null}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 opacity-30">
            {['VISA', 'MC', 'UPI', 'RuPay'].map((payment) => (
              <span
                key={payment}
                className="rounded-[3px] border border-cream/40 px-2 py-[3px] font-dm text-[10px] font-medium tracking-wide text-cream"
              >
                {payment}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
