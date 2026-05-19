export const products = [

  {
    id: 'p002',
    brand: 'PADDYWAX',
    category: 'Home',
    name: 'Cypress & Fir Ceramic Candle',
    price: 1800,
    originalPrice: 2200,
    rating: 4.9,
    reviewCount: 89,
    isNew: true,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1602928298849-325cec8771cc?w=800&q=85',
      'https://images.unsplash.com/photo-1608181831718-c9e95d0b9dcd?w=800&q=85',
    ],
    description:
      'Hand-poured in a minimal ceramic vessel. Burns for 50+ hours.',
    variants: { scent: ['Cypress & Fir', 'Amber & Smoke'] },
  },
  {
    id: 'p003',
    brand: 'SMYTHSON',
    category: 'Stationery',
    name: 'Panama Cross-Grain Leather Notebook',
    price: 6500,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 42,
    isNew: false,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85',
    ],
    description:
      'Featherweight leather notebook with gilt-edged pages. A desk essential.',
    variants: { color: ['Navy', 'Tan', 'Forest'] },
  },
  {
    id: 'p004',
    brand: 'LE LABO',
    category: 'Fragrance',
    name: 'Santal 33 Eau de Parfum 50mL',
    price: 12500,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 311,
    isNew: false,
    isSoldOut: true,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=85',
    ],
    description: 'The iconic Santal 33. Woody, musky, universally loved.',
    variants: { size: ['50mL', '100mL'] },
  },
  {
    id: 'p005',
    brand: 'MUJI',
    category: 'Home',
    name: 'Stainless Steel Aroma Diffuser',
    price: 3200,
    originalPrice: 3800,
    rating: 4.6,
    reviewCount: 67,
    isNew: true,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=85',
    ],
    description: 'Ultrasonic diffusion. 7-hour continuous mist. Whisper quiet.',
    variants: {},
  },
  {
    id: 'p006',
    brand: 'OCTAEVO',
    category: 'Accessories',
    name: 'Brass Card Holder — Arch',
    price: 4200,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 28,
    isNew: true,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1586281010691-9b32a3db8bc2?w=800&q=85',
    ],
    description: 'Hand-polished solid brass. A minimal sculpture for your desk.',
    variants: { finish: ['Brass', 'Matte Black'] },
  },

  {
    id: 'p008',
    brand: 'ASSOULINE',
    category: 'Stationery',
    name: 'Travel Series Coffee Table Book',
    price: 7800,
    originalPrice: 8500,
    rating: 4.8,
    reviewCount: 58,
    isNew: false,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=85',
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=85',
    ],
    description:
      'An editorial hardbound volume with saturated photography and gilt details.',
    variants: { edition: ['Amalfi', 'Kyoto', 'Marrakech'] },
  },
  {
    id: 'p009',
    brand: 'FERM LIVING',
    category: 'Home',
    name: 'Ripple Ceramic Catchall Tray',
    price: 2900,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 39,
    isNew: true,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=85',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=85',
    ],
    description:
      'A glazed ceramic tray for jewelry, keys, and the little rituals of arrival.',
    variants: { color: ['Oat', 'Clay', 'Moss'] },
  },
  {
    id: 'p010',
    brand: 'TEKLA',
    category: 'Home',
    name: 'Organic Cotton Waffle Towel',
    price: 3600,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 102,
    isNew: false,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=85',
      'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=85',
    ],
    description:
      'Textured organic cotton with a dry hand feel and spa-level softness.',
    variants: { color: ['Ivory', 'Sage', 'Terracotta'] },
  },

  {
    id: 'p012',
    brand: 'JO MALONE',
    category: 'Fragrance',
    name: 'Wood Sage & Sea Salt Cologne',
    price: 7800,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 312,
    isNew: false,
    isSoldOut: false,
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=85',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=85',
    ],
    description:
      'A mineral, wind-swept fragrance with soft woods and coastal brightness.',
    variants: { size: ['30mL', '50mL', '100mL'] },
  },
]

export const categories = [
  'All',
  'Home',
  'Fragrance',
  'Stationery',
  'Accessories',
]

export const getProductById = (id) =>
  products.find((product) => product.id === id)
export const getByCategory = (category) =>
  category === 'All'
    ? products
    : products.filter((product) => product.category === category)
export const getNewArrivals = () => products.filter((product) => product.isNew)
export const getFeatured = () => products.slice(0, 4)
export const getFeaturedProducts = getFeatured
