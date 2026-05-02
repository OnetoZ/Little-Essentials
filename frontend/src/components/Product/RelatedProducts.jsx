import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import ProductCard from '../ProductCard/ProductCard'
import RevealOnScroll from '../UI/RevealOnScroll'
import { products } from '../../data/mockProducts'

export default function RelatedProducts({ product }) {
  const categoryMatches = products.filter(
    (item) => item.category === product.category && item.id !== product.id,
  )
  const fallback = products.filter(
    (item) =>
      item.category !== product.category &&
      item.id !== product.id &&
      !categoryMatches.some((match) => match.id === item.id),
  )
  const related = [...categoryMatches, ...fallback].slice(0, 4)

  if (related.length === 0) return null

  return (
    <section className="bg-cappuccino/20 px-8 py-20 lg:px-16">
      <div className="mx-auto max-w-screen-xl">
        <RevealOnScroll>
          <h2 className="mb-8 font-playfair text-[32px] font-bold text-espresso">
            You might also like
          </h2>
        </RevealOnScroll>

        <div
          className="scrollbar-none flex gap-4 overflow-x-auto pb-4 lg:gap-5"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {related.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                delay: index * 0.1,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[76vw] flex-shrink-0 sm:w-[260px] md:w-[280px] lg:basis-[calc((100%-60px)/4)]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard product={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

RelatedProducts.propTypes = {
  product: PropTypes.shape({
    category: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
}
