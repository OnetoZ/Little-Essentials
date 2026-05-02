import { useParams } from 'react-router-dom'
import SEO from '../components/SEO/SEO'

export default function Journal() {
  const { slug } = useParams()

  return (
    <main className="min-h-screen bg-cream px-8 py-28 lg:px-16">
      <SEO
        title="The Journal"
        description="Read the Little Essentials journal for premium lifestyle edits, curation notes, gifting ideas, and stories behind considered objects."
        canonical="https://www.littleessentials.in/journal"
        keywords="little essentials journal, premium lifestyle journal india, curated gifting ideas india, premium home and skincare edits"
        noIndex={Boolean(slug)}
      />
      <section className="mx-auto max-w-screen-md text-center">
        <p className="mb-4 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          The Journal
        </p>
        <h1 className="mb-5 font-playfair text-[clamp(48px,8vw,80px)] font-black leading-[0.95] text-espresso">
          Notes on living with intention.
        </h1>
        <p className="mx-auto max-w-xl font-dm text-[16px] font-light leading-[1.8] text-mocha">
          Editorial stories, founder notes, product rituals, and seasonal edits
          from Little Essentials.
        </p>
      </section>
    </main>
  )
}
