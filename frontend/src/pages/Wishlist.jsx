import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, Sparkles } from 'lucide-react'
import SEO from '../components/SEO/SEO'
import ProductCard from '../components/ProductCard/ProductCard'
import useStore from '../store/useStore'
import { useShopifyProducts, useShopifyProduct } from '../hooks/useCatalog'

function WishlistItemCard({ id }) {
  const { products } = useShopifyProducts({ first: 50 })
  const { product: fetchedProduct, loading } = useShopifyProduct(id)

  const product = products?.find(
    (p) => String(p.id) === String(id) || String(p._id) === String(id) || p.slug === String(id)
  ) || fetchedProduct

  if (loading && !product) {
    return (
      <div className="flex aspect-[4/5] flex-col justify-between rounded-xl border border-cappuccino/20 bg-white/80 p-4 animate-pulse">
        <div className="mb-3 flex-1 w-full rounded-[8px] bg-cappuccino/20" />
        <div className="mb-1 h-4 w-3/4 rounded bg-cappuccino/20" />
        <div className="h-3 w-1/2 rounded bg-cappuccino/20" />
      </div>
    )
  }

  if (!product) return null

  return <ProductCard product={product} />
}

export default function Wishlist() {
  const wishlist = useStore((state) => state.wishlist)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return (
    <main className="min-h-screen bg-cream pb-24 pt-[110px]">
      <SEO
        title={`Your Wishlist (${wishlist.length})`}
        description="View your saved favourite items on Little Essentials."
        canonical="https://www.littleessentials.in/wishlist"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cappuccino/40 bg-cream-light/80 px-4 py-1.5 font-dm text-[11px] font-bold uppercase tracking-wider text-caramel">
            <Sparkles size={13} />
            <span>Curated Collection</span>
          </div>
          <h1 className="font-playfair text-4xl font-bold tracking-tight text-espresso sm:text-5xl">
            Your Wishlist
          </h1>
          <p className="mx-auto mt-3 max-w-md font-dm text-sm text-mocha">
            Thoughtfully saved essentials awaiting a place in your home.
          </p>
        </header>

        {wishlist.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 flex items-center justify-between border-b border-cappuccino/20 pb-4">
              <p className="font-dm text-sm font-medium text-espresso">
                Showing {wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}
              </p>
              <Link
                to="/collections"
                className="inline-flex items-center gap-1 font-dm text-xs font-bold text-caramel transition-colors hover:text-espresso"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {wishlist.map((id) => (
                <WishlistItemCard key={id} id={id} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-3xl border border-cappuccino/30 bg-white/60 p-12 text-center shadow-sm"
          >
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cream text-caramel">
              <Heart size={36} strokeWidth={1.5} />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-espresso">
              Your wishlist is empty
            </h2>
            <p className="mt-2 font-dm text-sm text-mocha">
              Browse our collections and tap the heart icon on any piece you would love to save for later.
            </p>
            <Link
              to="/collections"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-espresso px-8 py-3.5 font-dm text-xs font-bold uppercase tracking-wider text-cream shadow-md transition-all hover:bg-mocha"
            >
              <span>Explore Catalogue</span>
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  )
}

