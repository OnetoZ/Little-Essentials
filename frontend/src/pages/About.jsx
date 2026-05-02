import SEO from '../components/SEO/SEO'

export default function About() {
  return (
    <main className="min-h-screen bg-cream px-8 py-28 lg:px-16">
      <SEO
        title="About Little Essentials"
        description="Little Essentials is a premium curated lifestyle store in India, built around intentional objects, enduring design, and quiet luxury."
        canonical="https://www.littleessentials.in/about"
        keywords="about little essentials, little essentials india, premium curated lifestyle store, luxury lifestyle store india"
      />
      <section className="mx-auto max-w-screen-md">
        <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          Our Philosophy
        </p>
        <h1 className="mb-6 font-playfair text-[clamp(44px,7vw,72px)] font-black leading-[1] text-espresso">
          Curation over clutter.
        </h1>
        <p className="font-dm text-[16px] font-light leading-[1.8] text-mocha">
          Little Essentials exists to surface the world&apos;s most considered
          goods: products chosen for materiality, usefulness, longevity, and the
          quiet pleasure they bring to everyday life.
        </p>
      </section>
    </main>
  )
}
