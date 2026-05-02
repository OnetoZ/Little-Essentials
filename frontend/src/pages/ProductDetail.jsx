import { Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'
import RelatedProducts from '../components/Product/RelatedProducts'
import SEO from '../components/SEO/SEO'
import { getProductById } from '../data/mockProducts'
import useStore from '../store/useStore'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  const { addToCart, openCart } = useStore()

  if (!product) return <Navigate to="/collections" replace />

  const handleMobileAdd = () => {
    if (product.isSoldOut) return

    addToCart({ ...product, qty: 1 })
    openCart()
  }

  return (
    <main className="min-h-screen bg-cream pb-[96px] pt-[80px] lg:pb-0">
      <SEO
        title={product.name}
        description={`${product.description} Shop ${product.name} by ${product.brand} at Little Essentials. Free delivery over Rs.999.`}
        canonical={`https://www.littleessentials.in/product/${product.id}`}
        image={product.images?.[0]}
        type="product"
        product={product}
        keywords={`${product.name}, ${product.brand} india, buy ${product.category} india, little essentials ${product.brand.toLowerCase()}`}
      />
      <section className="mx-auto max-w-screen-xl px-8 py-12 lg:px-16 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-0">
          <ProductGallery
            key={`${product.id}-gallery`}
            images={product.images}
            productName={product.name}
          />
          <ProductInfo key={`${product.id}-info`} product={product} />
        </div>
      </section>

      <RelatedProducts product={product} />

      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-cappuccino/60 bg-cream p-4 lg:hidden"
      >
        <div className="min-w-0">
          <p className="line-clamp-1 font-playfair text-[15px] font-semibold text-espresso">
            {product.name}
          </p>
          <p className="font-dm text-[13px] font-medium text-mocha">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
        </div>
        <button
          onClick={handleMobileAdd}
          className={`flex h-11 flex-shrink-0 items-center gap-2 rounded-[4px] px-6 font-dm text-[13px] font-medium transition-colors duration-250 ease-smooth ${
            product.isSoldOut
              ? 'bg-cappuccino text-espresso/50'
              : 'bg-mocha text-cream hover:bg-espresso'
          }`}
          disabled={product.isSoldOut}
          type="button"
        >
          <ShoppingBag size={15} />
          {product.isSoldOut ? 'Sold Out' : 'Add to Bag'}
        </button>
      </motion.div>
    </main>
  )
}
