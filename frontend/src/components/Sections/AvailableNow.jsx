import { motion } from 'framer-motion'
import ProductCard from '../ProductCard/ProductCard'
import SectionHeader from '../UI/SectionHeader'
import { products } from '../../data/mockProducts'

export default function AvailableNow() {
  const featured = products.slice(2, 6)

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
            number="02"
            label="Available Now"
            viewAllLink="/collections"
          />
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_0.82fr_1fr] lg:grid-rows-2 lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 lg:row-span-2"
          >
            <ProductCard
              product={featured[0]}
              className="lg:h-full"
              featured
            />
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
            <ProductCard product={featured[1]} />
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
            <ProductCard product={featured[2]} />
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
            className="col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <ProductCard
              product={featured[3]}
              className="lg:h-full"
              featured
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
