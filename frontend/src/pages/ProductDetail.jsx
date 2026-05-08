import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'
import RelatedProducts from '../components/Product/RelatedProducts'
import SEO from '../components/SEO/SEO'
import useStore from '../store/useStore'
import { useShopifyProduct } from '../hooks/useShopify'

export default function ProductDetail() {
  const { id: handle } = useParams()
  const { product, loading, error } = useShopifyProduct(handle)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const { addToCart, openCart } = useStore()

  useEffect(() => {
    window.scrollTo(0, 0)
    if (product?.variantNodes?.length > 0) {
      setSelectedVariant(product.variantNodes[0])
    }
  }, [product])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-cream">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 border-2 border-mocha border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-cream px-8 text-center">
        <h2 className="font-playfair text-3xl font-bold text-espresso">Product not found</h2>
        <p className="mt-4 font-dm text-mocha">The piece you're looking for might have been moved or is no longer available.</p>
        <Link to="/collections" className="mt-8 border-b border-caramel pb-1 font-dm text-sm font-semibold text-espresso">
          Back to Collections
        </Link>
      </div>
    )
  }

  const handleMobileAdd = () => {
    if (product.isSoldOut || !selectedVariant) return

    addToCart({
      ...product,
      id: selectedVariant.id,
      price: selectedVariant.price,
      image: selectedVariant.image || product.images[0],
      qty: 1
    })
    openCart()
  }

  return (
    <main className="min-h-screen bg-cream pb-[96px] pt-[80px] lg:pb-0">
      <SEO
        title={product.name}
        description={`${product.description} Shop ${product.name} by ${product.brand} at Little Essentials. Free delivery over Rs.999.`}
        canonical={`https://www.littleessentials.in/product/${product.handle}`}
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
          disabled={product.isSoldOut}
          className="flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-espresso px-6 font-dm text-[12px] font-bold uppercase tracking-wide text-cream transition-colors duration-250 hover:bg-mocha disabled:cursor-not-allowed disabled:bg-cappuccino/60"
        >
          <ShoppingBag size={14} />
          {product.isSoldOut ? 'Sold Out' : 'Add to Bag'}
        </button>
      </motion.div>
    </main>
  )
}
