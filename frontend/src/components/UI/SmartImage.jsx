import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const FALLBACK_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDQwMCA1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNENkJGQTYiLz48cmVjdCB4PSI0MCIgeT0iNDAiIHdpZHRoPSIzMjAiIGhlaWdodD0iNDIwIiByeD0iOCIgc3Ryb2tlPSIjQjA4OTY4IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNGM0U5RDciIGZpbGwtb3BhY2l0eT0iLjQ1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCxzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjN0E1NTNBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='

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
  const [status, setStatus] = useState({
    errored: false,
    loaded: false,
    src,
  })
  const timeoutRef = useRef(null)
  const loaded = status.src === src ? status.loaded : false
  const errored = status.src === src ? status.errored : false

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setStatus({ errored: true, loaded: true, src })
    }, 8000)

    return () => window.clearTimeout(timeoutRef.current)
  }, [src])

  return (
    <div
      className={`relative overflow-hidden bg-cappuccino/30 ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && !errored ? (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-cappuccino/30 via-cream to-cappuccino/30 bg-[length:400px_100%]" />
      ) : null}
      <img
        src={errored ? FALLBACK_SRC : src}
        alt={alt}
        onLoad={(event) => {
          window.clearTimeout(timeoutRef.current)
          setStatus({ errored: false, loaded: true, src })
          onLoad?.(event)
        }}
        onError={() => {
          window.clearTimeout(timeoutRef.current)
          setStatus({ errored: true, loaded: true, src })
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
