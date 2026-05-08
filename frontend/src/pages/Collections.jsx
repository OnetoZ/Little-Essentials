import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Grid2X2, Grid3X3, SlidersHorizontal, Star } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/ProductCard/ProductGrid'
import SEO from '../components/SEO/SEO'
import RevealOnScroll from '../components/UI/RevealOnScroll'
import SmartImage from '../components/UI/SmartImage'
import { useShopifyProducts, useShopifyCollections } from '../hooks/useShopify'

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low-High', value: 'price-asc' },
  { label: 'Price: High-Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rated', value: 'rating' },
]

// Map frontend sort values to Shopify sort keys
const SORT_MAP = {
  featured: { sortKey: 'BEST_SELLING', reverse: false },
  'price-asc': { sortKey: 'PRICE', reverse: false },
  'price-desc': { sortKey: 'PRICE', reverse: true },
  newest: { sortKey: 'CREATED_AT', reverse: true },
  rating: { sortKey: 'BEST_SELLING', reverse: false },
}

export default function Collections() {
  const [searchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const requestedFilter = searchParams.get('filter')

  const { categories } = useShopifyCollections()

  const initialCategory = categories.includes(requestedCategory)
    ? requestedCategory
    : 'All'

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [activeFilter, setActiveFilter] = useState(
    requestedFilter === 'new' ? 'new' : '',
  )
  const [sortBy, setSortBy] = useState(
    requestedFilter === 'new' ? 'newest' : 'featured',
  )
  const [gridCols, setGridCols] = useState(3)

  const sortConfig = SORT_MAP[sortBy] || SORT_MAP.featured

  const { products, loading, hasNextPage, loadMore } = useShopifyProducts({
    first: 24,
    sortKey: sortConfig.sortKey,
    reverse: sortConfig.reverse,
    category: activeCategory,
    filter: activeFilter,
  })

  // Pick 3 hero products from the loaded results
  const heroProducts = products.slice(0, 3)

  useEffect(() => {
    const category = searchParams.get('category')
    const filter = searchParams.get('filter')
    const nextCategory = categories.includes(category) ? category : 'All'
    const nextFilter = filter === 'new' ? 'new' : ''

    setActiveCategory(nextCategory)
    setActiveFilter(nextFilter)
    if (nextFilter === 'new' || nextCategory === 'New Arrivals') setSortBy('newest')
  }, [searchParams, categories])

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return
    setActiveCategory(category)
    setActiveFilter('')
  }

  const handleSortChange = (value) => {
    if (value === sortBy) return
    setSortBy(value)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream">
      <SEO
        title="Shop All Collections"
        description="Browse the complete Little Essentials collection of premium lifestyle products. Skincare, home, fragrance, stationery, and accessories - all curated by hand."
        canonical="https://www.littleessentials.in/collections"
        keywords="premium products india, shop skincare india, luxury candles india, premium stationery, little essentials collections"
      />
      <section className="relative overflow-hidden bg-cream px-8 pb-16 pt-32 lg:px-16 lg:pb-20 lg:pt-36">
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,42,34,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,42,34,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[620px]"
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Shop the full edit
            </p>
            <h1 className="font-playfair text-[clamp(58px,10vw,118px)] font-bold leading-[0.82] text-espresso">
              Products with a point of view.
            </h1>
            <p className="mt-7 max-w-[500px] font-dm text-[16px] font-light leading-[1.8] text-mocha/78">
              No center-stage clutter. Browse skincare, home, fragrance,
              stationery, and accessories in a product-first layout built for
              fast discovery.
            </p>

            <div className="mt-9 grid max-w-[520px] grid-cols-3 divide-x divide-cappuccino/60 border-y border-cappuccino/55 py-4">
              {[
                [products.length, 'Products'],
                [categories.length - 1, 'Categories'],
                ['4.8★', 'Avg rating'],
              ].map(([value, label]) => (
                <div key={label} className="px-4 first:pl-0">
                  <p className="font-playfair text-[32px] font-bold leading-none text-espresso">
                    {value}
                  </p>
                  <p className="mt-2 font-dm text-[10px] uppercase tracking-wide-2 text-caramel">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3">
            {heroProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.08,
                  duration: 0.72,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`${index === 1 ? 'sm:-translate-y-8' : ''}`}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="group block overflow-hidden rounded-[24px] border border-cappuccino/45 bg-cream-light shadow-[0_18px_58px_rgba(59,42,34,0.10)] transition-transform duration-300 ease-premium hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <SmartImage
                      src={product.images[0]}
                      alt={product.name}
                      className="aspect-[4/5] w-full"
                      imageClassName="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-105"
                      priority={index === 0}
                    />
                    <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/85 text-espresso backdrop-blur-md">
                      <ArrowUpRight size={16} strokeWidth={1.7} />
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
                      {product.brand} · {product.category}
                    </p>
                    <h2 className="mt-2 line-clamp-2 font-playfair text-[24px] font-bold leading-[1.05] text-espresso">
                      {product.name}
                    </h2>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-dm text-[14px] font-semibold text-espresso">
                        Rs. {product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="inline-flex items-center gap-1 font-dm text-[12px] text-caramel">
                        <Star size={12} fill="currentColor" /> {product.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky top-[76px] z-40 border-y border-cappuccino/40 bg-cream/92 backdrop-blur-xl">
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

      <section className="mx-auto max-w-screen-xl px-4 py-14 sm:px-8 lg:px-16">
        <RevealOnScroll>
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-cappuccino/45 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="font-dm text-[11px] uppercase tracking-ultra text-caramel">
                {activeFilter === 'new' ? 'New arrivals' : activeCategory}
              </p>
              <h2 className="mt-3 font-playfair text-[clamp(38px,5vw,68px)] font-bold leading-none text-espresso">
                {products.length} visible pieces.
              </h2>
            </div>
            <p className="max-w-[360px] font-dm text-[14px] font-light leading-[1.7] text-mocha/70">
              Products are arranged as a shopping wall, not a template grid,
              with editorial pacing and quick comparison.
            </p>
          </div>
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
              products={products}
              loading={loading}
              editorial={gridCols === 3}
              columns={gridCols}
              skeletonCount={6}
            />
          </motion.div>
        </AnimatePresence>

        {products.length > 0 ? (
          <RevealOnScroll>
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="font-dm text-[12px] text-caramel">
                Showing {products.length} products
              </p>
              {hasNextPage ? (
                <button
                  onClick={loadMore}
                  className="rounded-[3px] border border-cappuccino px-8 py-3 font-dm text-[13px] font-medium text-mocha transition-all duration-250 ease-smooth hover:border-caramel hover:bg-espresso-4"
                  type="button"
                >
                  Load More
                </button>
              ) : null}
            </div>
          </RevealOnScroll>
        ) : null}
      </section>
    </main>
  )
}
