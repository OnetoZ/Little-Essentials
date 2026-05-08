import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import CartDrawer from '../Cart/CartDrawer'
import useStore from '../../store/useStore'
import { useShopifyCollections } from '../../hooks/useShopify'

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Collections', path: '/collections', preview: true },
  { label: 'New Arrivals', path: '/collections?filter=new' },
  { label: 'About', path: '/about' },
  { label: 'Journal', path: '/journal' },
]

export default function Navbar() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { categories } = useShopifyCollections()

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
      setScrolled(currentScrollY >= 20)
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

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMobileMenu()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [closeMobileMenu, mobileMenuOpen])

  const isActive = (path) => {
    const [pathname, queryString] = path.split('?')

    if (queryString) {
      return location.pathname === pathname && location.search === `?${queryString}`
    }

    return location.pathname === pathname && location.search === ''
  }

  const logoColor = 'text-espresso'
  const iconColor = 'text-espresso hover:text-mocha'
  const linkColor = 'text-espresso/80 hover:text-espresso'

  return (
    <>
      <motion.nav
        className={`fixed left-1/2 top-4 z-50 flex w-[calc(100%-24px)] max-w-[1440px] -translate-x-1/2 items-center justify-between rounded-full border border-cappuccino/55 bg-cream-light/90 px-5 shadow-[0_18px_60px_rgba(59,42,34,0.12)] backdrop-blur-2xl transition-[height,background-color,border-color,box-shadow,backdrop-filter,top] duration-400 ease-premium lg:w-[calc(100%-64px)] lg:px-7 ${
          scrolled ? 'h-[60px] bg-cream-light/96' : 'h-[68px]'
        }`}
      >
        <Link
          to="/"
          className={`hidden flex-shrink-0 font-playfair text-[25px] font-bold tracking-normal transition-all duration-300 ease-premium hover:scale-[1.02] lg:block ${logoColor}`}
          aria-label="Little Essentials home"
        >
          <span className="font-normal italic">Little</span>
          <span className="ml-1 font-bold">Essentials</span>
        </Link>

        <ul className="hidden items-center gap-2 rounded-full border border-cappuccino/35 bg-cream/60 px-2 py-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={() => link.preview && setPreviewOpen(true)}
              onMouseLeave={() => link.preview && setPreviewOpen(false)}
            >
              <Link
                to={link.path}
                className={`group relative inline-flex rounded-full px-4 py-2 font-dm text-[12px] font-semibold tracking-wide-2 transition-all duration-300 ease-premium hover:bg-cappuccino/22 ${linkColor}`}
                aria-expanded={link.preview ? previewOpen : undefined}
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
              {link.preview ? (
                <AnimatePresence>
                  {previewOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 top-12 w-[460px] -translate-x-1/2 rounded-[22px] border border-cappuccino/45 bg-cream-light/96 p-4 shadow-[0_24px_70px_rgba(59,42,34,0.16)] backdrop-blur-xl"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-cappuccino/35 pb-3">
                        <p className="font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
                          Shop by ritual
                        </p>
                        <Link
                          to="/collections"
                          className="font-dm text-[12px] text-mocha underline underline-offset-4 hover:text-espresso"
                        >
                          View all
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.slice(1).map((category) => (
                          <Link
                            key={category}
                            to={`/collections?category=${encodeURIComponent(category)}`}
                            className="group/preview rounded-[16px] border border-transparent bg-cream px-4 py-3 transition-all duration-250 ease-smooth hover:border-cappuccino hover:bg-cream-light"
                          >
                            <span className="block font-playfair text-[18px] font-bold text-espresso transition-colors duration-250 group-hover/preview:text-mocha">
                              {category}
                            </span>
                            <span className="mt-1 block font-dm text-[11px] text-caramel">
                              Explore edit →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 rounded-full border border-cappuccino/35 bg-cream/60 px-2 py-1 lg:flex">
          <button
            className={`flex h-9 w-9 items-center justify-center rounded-full ${iconColor} transition-all duration-300 ease-premium hover:scale-105 hover:bg-cappuccino/22`}
            aria-label="Search"
            type="button"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          <button
            className={`flex h-9 w-9 items-center justify-center rounded-full ${iconColor} transition-all duration-300 ease-premium hover:scale-105 hover:bg-cappuccino/22`}
            aria-label="Wishlist"
            type="button"
          >
            <Heart size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={toggleCart}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full ${iconColor} transition-all duration-300 ease-premium hover:scale-105 hover:bg-cappuccino/22`}
            aria-label={`Open cart with ${count} items`}
            type="button"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-mocha font-dm text-[10px] font-medium text-cream"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <Link
            to="/login"
            className={`flex h-9 w-9 items-center justify-center rounded-full ${iconColor} transition-all duration-300 ease-premium hover:scale-105 hover:bg-cappuccino/22`}
            aria-label="Login"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
        </div>

        <div className="flex w-full items-center justify-between lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className={`${iconColor} transition-all duration-300 ease-premium active:scale-95`}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
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
            className={`relative ${iconColor} transition-all duration-300 ease-premium active:scale-95`}
            aria-label={`Open cart with ${count} items`}
            type="button"
          >
            <ShoppingBag size={22} strokeWidth={1.5} />
            <AnimatePresence initial={false}>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
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
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
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

            <nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="flex flex-1 flex-col items-center justify-center gap-8"
            >
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
