import { useState } from 'react'
import PropTypes from 'prop-types'

export default function SmartImage({
  src,
  alt,
  className = '',
  imageClassName = '',
  aspectRatio,
  priority = false,
  imgStyle,
  onLoad,
  children,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={`relative overflow-hidden bg-cappuccino/30 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded ? (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-cappuccino/30 via-cream to-cappuccino/30 bg-[length:400px_100%]" />
      ) : null}
      <img
        src={src}
        alt={alt}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
        style={imgStyle}
        {...props}
      />
      {children}
    </div>
  )
}

SmartImage.propTypes = {
  alt: PropTypes.string.isRequired,
  aspectRatio: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  imgStyle: PropTypes.object,
  onLoad: PropTypes.func,
  priority: PropTypes.bool,
  src: PropTypes.string.isRequired,
}
