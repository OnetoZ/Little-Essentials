import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Grid2X2, Grid3X3, SlidersHorizontal } from 'lucide-react'
import ProductGrid from '../components/ProductCard/ProductGrid'
import SEO from '../components/SEO/SEO'
import RevealOnScroll from '../components/UI/RevealOnScroll'
import { categories, getByCategory, products } from '../data/mockProducts'

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low-High', value: 'price-asc' },
  { label: 'Price: High-Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
]

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [gridCols, setGridCols] = useState(3)
  const [filtered, setFiltered] = useState(products)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let result = getByCategory(activeCategory)

      switch (sortBy) {
        case 'price-asc':
          result = [...result].sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          result = [...result].sort((a, b) => b.price - a.price)
          break
        case 'newest':
          result = [...result].sort((a, b) => Number(b.isNew) - Number(a.isNew))
          break
        case 'rating':
          result = [...result].sort((a, b) => b.rating - a.rating)
          break
        default:
          break
      }

      setFiltered(result)
      setLoading(false)
    }, 350)

    return () => clearTimeout(timeout)
  }, [activeCategory, sortBy])

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return

    setLoading(true)
    setActiveCategory(category)
  }

  const handleSortChange = (value) => {
    if (value === sortBy) return

    setLoading(true)
    setSortBy(value)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream pt-[80px]">
      <SEO
        title="Shop All Collections"
        description="Browse the complete Little Essentials collection of premium lifestyle products. Skincare, home, fragrance, stationery, and accessories - all curated by hand."
        canonical="https://www.littleessentials.in/collections"
        keywords="premium products india, shop skincare india, luxury candles india, premium stationery, little essentials collections"
      />
      <section className="relative overflow-hidden bg-cappuccino/40 px-8 py-16 lg:px-16 lg:py-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,42,34,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,42,34,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-screen-xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel"
          >
            Little Essentials
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mb-4 font-playfair text-[clamp(52px,8vw,80px)] font-black leading-[0.95] text-espresso"
          >
            Collections
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="font-dm text-[16px] font-light text-mocha"
          >
            Every edit, intentionally assembled.
          </motion.p>
        </div>
      </section>

      <div className="sticky top-[68px] z-40 border-b border-cappuccino/40 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-16">
          <div className="flex min-w-0 items-center gap-3">
            <SlidersHorizontal
              size={16}
              strokeWidth={1.6}
              className="hidden flex-shrink-0 text-caramel sm:block"
            />
            <div className="scrollbar-none flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-[6px] font-dm text-[12px] font-medium transition-all duration-250 ease-smooth ${
                    activeCategory === category
                      ? 'bg-espresso text-cream'
                      : 'border border-cappuccino bg-transparent text-espresso hover:border-caramel'
                  }`}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-3">
            <select
              name="sortProducts"
              aria-label="Sort products"
              value={sortBy}
              onChange={(event) => handleSortChange(event.target.value)}
              className="cursor-pointer rounded-[8px] border border-cappuccino/60 bg-cream px-3 py-2 font-dm text-[12px] text-espresso transition-colors hover:border-caramel focus:border-mocha focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="hidden items-center overflow-hidden rounded-[8px] border border-cappuccino/60 lg:flex">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 transition-colors duration-250 ease-smooth ${
                  gridCols === 3
                    ? 'bg-espresso text-cream'
                    : 'text-caramel hover:text-espresso'
                }`}
                aria-label="Use editorial grid"
                type="button"
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`p-2 transition-colors duration-250 ease-smooth ${
                  gridCols === 2
                    ? 'bg-espresso text-cream'
                    : 'text-caramel hover:text-espresso'
                }`}
                aria-label="Use two-column grid"
                type="button"
              >
                <Grid2X2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-8 lg:px-16">
        <RevealOnScroll>
          <p className="mb-8 font-dm text-[12px] text-caramel">
            Showing {filtered.length} of {products.length} products
          </p>
        </RevealOnScroll>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${sortBy}-${gridCols}-${loading}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductGrid
              products={filtered}
              loading={loading}
              editorial={gridCols === 3}
              columns={gridCols}
              skeletonCount={6}
            />
          </motion.div>
        </AnimatePresence>

        {filtered.length > 0 ? (
          <RevealOnScroll>
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-cappuccino/30">
                <div
                  className="h-full rounded-full bg-caramel transition-all duration-500"
                  style={{
                    width: `${Math.min((filtered.length / products.length) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="font-dm text-[12px] text-caramel">
                Showing {filtered.length} of {products.length} products
              </p>
              <button
                className="rounded-[3px] border border-cappuccino px-8 py-3 font-dm text-[13px] font-medium text-mocha transition-all duration-250 ease-smooth hover:border-caramel hover:bg-espresso-4"
                type="button"
              >
                Load More
              </button>
            </div>
          </RevealOnScroll>
        ) : null}
      </section>
    </main>
  )
}
