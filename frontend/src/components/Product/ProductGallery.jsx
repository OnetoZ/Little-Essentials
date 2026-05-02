import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import { ZoomIn } from 'lucide-react'
import SmartImage from '../UI/SmartImage'

export default function ProductGallery({ images = [], productName = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [touchStart, setTouchStart] = useState(null)
  const imgRef = useRef(null)

  const safeImages = images.length > 0 ? images : ['']

  const handleMouseMove = (event) => {
    if (!imgRef.current) return

    const { left, top, width, height } = imgRef.current.getBoundingClientRect()
    const x = ((event.clientX - left) / width) * 100
    const y = ((event.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

  const handleTouchStart = (event) => {
    setTouchStart(event.touches[0].clientX)
  }

  const handleTouchEnd = (event) => {
    if (touchStart === null) return

    const delta = touchStart - event.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0) {
        setActiveIndex((index) => Math.min(index + 1, safeImages.length - 1))
      } else {
        setActiveIndex((index) => Math.max(index - 1, 0))
      }
    }

    setTouchStart(null)
  }

  return (
    <div className="w-full flex-shrink-0 lg:w-[55%]">
      <div
        ref={imgRef}
        className="relative w-full cursor-crosshair overflow-hidden rounded-[8px] bg-cream"
        style={{ aspectRatio: '4/5' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full transition-transform duration-150"
            style={{
              transform: isZoomed ? 'scale(1.65)' : 'scale(1)',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transition: isZoomed
                ? 'transform-origin 0s'
                : 'transform 0.3s ease',
            }}
          >
            <SmartImage
              src={safeImages[activeIndex]}
              alt={`${productName} product gallery view ${activeIndex + 1} at Little Essentials`}
              className="h-full w-full"
              imageClassName="object-cover object-center"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {!isZoomed ? (
          <div className="absolute right-4 top-4 hidden rounded-full bg-cream/85 p-2 text-caramel backdrop-blur-sm lg:flex">
            <ZoomIn size={16} />
          </div>
        ) : null}

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 lg:hidden">
          {safeImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full transition-all duration-250 ease-smooth ${
                index === activeIndex
                  ? 'h-[6px] w-5 bg-mocha'
                  : 'h-[6px] w-[6px] bg-cream/60'
              }`}
              aria-label={`Show image ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="mt-3 hidden gap-2 lg:flex">
        {safeImages.slice(0, 5).map((image, index) => (
          <button
            key={image}
            onClick={() => setActiveIndex(index)}
            className={`relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[8px] transition-all duration-250 ease-smooth ${
              index === activeIndex
                ? 'ring-2 ring-mocha ring-offset-2 ring-offset-cream'
                : 'opacity-60 hover:opacity-100'
            }`}
            aria-label={`Show thumbnail ${index + 1}`}
            type="button"
          >
            <SmartImage
              src={image}
              alt={`${productName} thumbnail ${index + 1} at Little Essentials`}
              className="h-full w-full"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

ProductGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  productName: PropTypes.string,
}
