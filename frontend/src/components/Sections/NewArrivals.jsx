import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../ProductCard/ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton'
import RevealOnScroll from '../UI/RevealOnScroll'
import SectionHeader from '../UI/SectionHeader'
import { useShopifyProducts } from '../../hooks/useShopify'

export default function NewArrivals() {
  const scrollRef = useRef(null)
  const dragRef = useRef({ active: false, left: 0, x: 0 })
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { products, loading } = useShopifyProducts({
    first: 8,
    sortKey: 'CREATED_AT',
    reverse: true,
    filter: 'new',
  })

  const updateScrollState = () => {
    const element = scrollRef.current
    if (!element) return

    setCanScrollLeft(element.scrollLeft > 10)
    setCanScrollRight(
      element.scrollLeft < element.scrollWidth - element.clientWidth - 10,
    )
  }

  const scrollByAmount = (direction) => {
    const element = scrollRef.current
    if (!element) return

    element.scrollBy({ left: direction * 340, behavior: 'smooth' })
  }

  const handlePointerDown = (event) => {
    const element = scrollRef.current
    if (!element) return

    dragRef.current = {
      active: true,
      left: element.scrollLeft,
      x: event.clientX,
    }
    element.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const element = scrollRef.current
    if (!element || !dragRef.current.active) return

    element.scrollLeft = dragRef.current.left - (event.clientX - dragRef.current.x)
  }

  const handlePointerEnd = (event) => {
    const element = scrollRef.current
    if (!element) return

    dragRef.current.active = false
    element.releasePointerCapture(event.pointerId)
    updateScrollState()
  }

  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-screen-xl px-8 lg:px-16">
        <RevealOnScroll>
          <SectionHeader
            number="03"
            label="New Arrivals"
            title="Fresh pieces, chosen with restraint."
            description="A weekly edit of tactile objects, polished formulas, and thoughtful gifts that earn their place quickly."
            viewAllLink="/collections?filter=new"
          />
        </RevealOnScroll>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          className="scrollbar-none flex cursor-grab touch-pan-x select-none gap-4 overflow-x-auto scroll-smooth px-8 pb-5 active:cursor-grabbing lg:gap-5 lg:px-16"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="w-[76vw] flex-shrink-0 sm:w-[260px] md:w-[280px] lg:w-[300px]"
                >
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`w-[76vw] flex-shrink-0 sm:w-[260px] md:w-[280px] lg:w-[300px] ${
                    index % 3 === 1 ? 'lg:pt-10' : ''
                  }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>

        {canScrollLeft ? (
          <button
            onClick={() => scrollByAmount(-1)}
            className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-espresso text-cream shadow-lg transition-colors duration-250 ease-smooth hover:bg-mocha lg:flex"
            aria-label="Previous arrivals"
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
        ) : null}

        {canScrollRight ? (
          <button
            onClick={() => scrollByAmount(1)}
            className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-espresso text-cream shadow-lg transition-colors duration-250 ease-smooth hover:bg-mocha lg:flex"
            aria-label="Next arrivals"
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        ) : null}

        <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-20 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </section>
  )
}
