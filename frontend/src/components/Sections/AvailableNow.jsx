import { motion } from 'framer-motion'
import ProductCard from '../ProductCard/ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton'
import SectionHeader from '../UI/SectionHeader'
import { useShopifyProducts } from '../../hooks/useShopify'

export default function AvailableNow() {
  const { products, loading } = useShopifyProducts({ first: 6, sortKey: 'BEST_SELLING' })
  const featured = products.slice(0, 4)

  const renderCard = (index, featuredCard = false, className = '') => {
    if (loading) {
      return (
        <div className={className}>
          <ProductCardSkeleton />
        </div>
      )
    }

    const product = featured[index]
    if (!product) return null

    return (
      <ProductCard
        product={product}
        className={className}
        featured={featuredCard}
      />
    )
  }

  return (
    <section className="bg-cream px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-screen-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeader
            number="05"
            label="Available Now"
            title="A quieter way to shop premium."
            description="Browse the edit by mood and category, with quick actions for the products already in stock."
            viewAllLink="/collections"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1.08fr_0.82fr_1fr] lg:grid-rows-2 lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:row-span-2"
          >
            {renderCard(0, true, 'lg:h-full')}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.1,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {renderCard(1)}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.2,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {renderCard(2)}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.15,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            {renderCard(3, true, 'lg:h-full')}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
