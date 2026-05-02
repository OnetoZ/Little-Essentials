import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import CartDrawer from '../Cart/CartDrawer'
import useStore from '../../store/useStore'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Collections', path: '/collections' },
  { label: 'New Arrivals', path: '/collections?filter=new' },
  { label: 'About', path: '/about' },
  { label: 'Journal', path: '/journal' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const previousScrollY = useRef(0)
  const location = useLocation()

  const {
    closeMobileMenu,
    mobileMenuOpen,
    toggleCart,
    toggleMobileMenu,
  } = useStore()
  const count = useStore((state) => state.cartCount())

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      setScrolled(currentScrollY >= 40)
      setHidden(currentScrollY > previousScrollY.current && currentScrollY > 100)
      previousScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    closeMobileMenu()
  }, [closeMobileMenu, location])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const isActive = (path) => {
    const [pathname, queryString] = path.split('?')

    if (queryString) {
      return location.pathname === pathname && location.search === `?${queryString}`
    }

    return location.pathname === pathname && location.search === ''
  }

  const logoColor = scrolled ? 'text-espresso' : 'text-cream'
  const iconColor = scrolled
    ? 'text-espresso hover:text-mocha'
    : 'text-cream hover:text-cappuccino'
  const linkColor = scrolled
    ? 'text-espresso/80 hover:text-espresso'
    : 'text-cream/80 hover:text-cream'

  return (
    <>
      <motion.nav
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-5 transition-[height,background-color,border-color,box-shadow,backdrop-filter] duration-400 ease-premium lg:px-16 ${
          scrolled
            ? 'h-[68px] border-b border-cappuccino/40 bg-cream/95 shadow-[0_4px_24px_rgba(59,42,34,0.06)] backdrop-blur-md'
            : 'h-[80px] border-b border-transparent bg-transparent'
        }`}
      >
        <Link
          to="/"
          className={`hidden flex-shrink-0 font-playfair text-[22px] transition-colors duration-300 ease-premium lg:block ${logoColor}`}
          aria-label="Little Essentials home"
        >
          <span className="font-normal italic">Little</span>
          <span className="ml-1 font-bold">Essentials</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.path}
                className={`group relative font-dm text-[13px] font-medium tracking-wide-2 transition-colors duration-300 ease-premium ${linkColor}`}
              >
                {link.label}
                <motion.span
                  aria-hidden="true"
                  className="absolute -bottom-[5px] left-0 h-[1.5px] bg-caramel"
                  initial={false}
                  animate={{ width: isActive(link.path) ? '100%' : '0%' }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <button
            className={`${iconColor} transition-all duration-300 ease-premium hover:scale-110`}
            aria-label="Search"
            type="button"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          <button
            className={`${iconColor} transition-all duration-300 ease-premium hover:scale-110`}
            aria-label="Wishlist"
            type="button"
          >
            <Heart size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={toggleCart}
            className={`relative ${iconColor} transition-all duration-300 ease-premium hover:scale-110`}
            aria-label={`Open cart with ${count} items`}
            type="button"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.18, 1] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-mocha font-dm text-[10px] font-medium text-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link
            to="/login"
            className={`${iconColor} transition-all duration-300 ease-premium hover:scale-110`}
            aria-label="Login"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex w-full items-center justify-between lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className={`${iconColor} transition-colors duration-300 ease-premium`}
            aria-label="Open menu"
            type="button"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <Link
            to="/"
            className={`font-playfair text-lg font-bold transition-colors duration-300 ease-premium ${logoColor}`}
            aria-label="Little Essentials home"
          >
            LE
          </Link>

          <button
            onClick={toggleCart}
            className={`relative ${iconColor} transition-colors duration-300 ease-premium`}
            aria-label={`Open cart with ${count} items`}
            type="button"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [1, 1.18, 1] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -right-2 -top-2 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-mocha font-dm text-[9px] font-medium text-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col bg-espresso"
          >
            <div className="flex justify-end p-8">
              <button
                onClick={closeMobileMenu}
                className="text-cream transition-colors duration-300 ease-premium hover:text-cappuccino"
                aria-label="Close menu"
                type="button"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex flex-1 flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    to={link.path}
                    className="font-playfair text-4xl text-cream transition-colors duration-300 ease-premium hover:text-caramel"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex justify-center gap-8 p-8">
              {['Instagram', 'Pinterest', 'TikTok'].map((social) => (
                <a
                  href="/"
                  key={social}
                  className="font-dm text-sm text-caramel/60 transition-colors duration-300 ease-premium hover:text-caramel"
                  onClick={(event) => event.preventDefault()}
                >
                  {social}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  )
}
