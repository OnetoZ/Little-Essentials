import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Little Essentials'
const SITE_URL = 'https://www.littleessentials.in'
const SITE_TWITTER = '@LittleEssentials'
const DEFAULT_IMG = `${SITE_URL}/og-default.svg`

const DEFAULTS = {
  title: 'Little Essentials - Premium Curated Lifestyle Store',
  description:
    'Shop premium curated products - skincare, home, fragrance, stationery and accessories. Handpicked with intention. Free delivery over Rs.999.',
  keywords:
    'premium lifestyle store, curated products india, luxury skincare india, premium home decor, little essentials, aesop india, paddywax india, premium stationery',
  canonical: SITE_URL,
  image: DEFAULT_IMG,
  type: 'website',
}

function compactJsonLd(schema) {
  return JSON.stringify(schema, (_, value) => {
    if (value === undefined || value === null || value === '') return undefined
    return value
  })
}

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  image,
  type = 'website',
  product,
  noIndex = false,
  children,
}) {
  const resolvedTitle = title || DEFAULTS.title
  const resolvedDescription = description || DEFAULTS.description
  const resolvedKeywords = keywords || DEFAULTS.keywords
  const resolvedCanonical = canonical || DEFAULTS.canonical
  const resolvedImage = image || DEFAULTS.image
  const fullTitle = title?.includes(SITE_NAME)
    ? title
    : title
      ? `${title} | ${SITE_NAME}`
      : DEFAULTS.title

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/collections?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    description:
      'Premium curated lifestyle store. Free delivery in India over Rs.999.',
    sameAs: [
      'https://www.instagram.com/littleessentials',
      'https://www.pinterest.com/littleessentials',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@littleessentials.in',
      availableLanguage: ['English', 'Hindi'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
    },
  }

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        brand: {
          '@type': 'Brand',
          name: product.brand,
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'INR',
          availability: product.isSoldOut
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          url: `${SITE_URL}/product/${product.id}`,
          seller: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
        },
        image: product.images?.[0],
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      }
    : null

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="author" content={SITE_NAME} />
      <meta
        name="robots"
        content={
          noIndex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />
      <meta name="googlebot" content={noIndex ? 'noindex' : 'index, follow'} />
      <link rel="canonical" href={resolvedCanonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${SITE_NAME} - ${resolvedTitle}`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER} />
      <meta name="twitter:creator" content={SITE_TWITTER} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      <meta name="theme-color" content="#F3E9D7" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="msapplication-TileColor" content="#3B2A22" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="ICBM" content="20.5937, 78.9629" />

      <script type="application/ld+json">
        {compactJsonLd(websiteSchema)}
      </script>
      <script type="application/ld+json">{compactJsonLd(orgSchema)}</script>
      {productSchema ? (
        <script type="application/ld+json">
          {compactJsonLd(productSchema)}
        </script>
      ) : null}

      {children}
    </Helmet>
  )
}

SEO.propTypes = {
  canonical: PropTypes.string,
  children: PropTypes.node,
  description: PropTypes.string,
  image: PropTypes.string,
  keywords: PropTypes.string,
  noIndex: PropTypes.bool,
  product: PropTypes.shape({
    brand: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    isSoldOut: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
  }),
  title: PropTypes.string,
  type: PropTypes.string,
}
