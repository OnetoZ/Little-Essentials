import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import SEO from '../components/SEO/SEO'

const PAGE_COPY = {
  '/contact': {
    title: 'Contact Us',
    body: 'For product questions, order support, or partnership enquiries, write to hello@littleessentials.in.',
  },
  '/faqs': {
    title: 'FAQs',
    body: 'Answers about orders, delivery, returns, and product care are being curated with the same attention as the shop.',
  },
  '/shipping': {
    title: 'Shipping Policy',
    body: 'Little Essentials offers carefully packed delivery across India, with free standard shipping on eligible orders.',
  },
  '/returns': {
    title: 'Returns',
    body: 'Returns are designed to be simple, fair, and considerate for unopened items within the eligible return window.',
  },
  '/size-guide': {
    title: 'Size Guide',
    body: 'Variant and sizing guidance will live here for products where fit, format, or volume matters.',
  },
  '/gift-cards': {
    title: 'Gift Cards',
    body: 'Gift cards are coming soon for considered presents, last-minute generosity, and beautifully flexible gifting.',
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const page = useMemo(
    () => PAGE_COPY[pathname] ?? PAGE_COPY['/contact'],
    [pathname],
  )

  return (
    <main className="min-h-screen bg-cream px-8 py-28 lg:px-16">
      <SEO
        title={page.title}
        description={`${page.title} information for Little Essentials customers.`}
        canonical={`https://www.littleessentials.in${pathname}`}
        noIndex
      />
      <section className="mx-auto max-w-screen-md">
        <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Little Essentials
        </p>
        <h1 className="mb-6 font-playfair text-[clamp(42px,7vw,68px)] font-black leading-[1] text-espresso">
          {page.title}
        </h1>
        <p className="font-dm text-[16px] font-light leading-[1.8] text-mocha">
          {page.body}
        </p>
      </section>
    </main>
  )
}
