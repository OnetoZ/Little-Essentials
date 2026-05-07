import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Calendar, Clock, Tag } from 'lucide-react'
import SEO from '../components/SEO/SEO'
import SmartImage from '../components/UI/SmartImage'

const JOURNAL_POSTS = [
  {
    slug: 'the-art-of-the-morning-ritual',
    category: 'Ritual',
    title: 'The Morning Ritual Is a Design System',
    excerpt:
      'How the first objects you touch can make the day feel calmer, clearer, and more deliberate.',
    image:
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1100&q=88',
    date: 'April 28, 2026',
    readTime: '5 min read',
    featured: true,
  },
  {
    slug: 'five-objects-worth-keeping',
    category: 'Edit',
    title: 'Five Objects Worth Keeping for a Lifetime',
    excerpt:
      'A compact argument for buying less, choosing better, and letting useful beauty stay.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=86',
    date: 'April 18, 2026',
    readTime: '4 min read',
  },
  {
    slug: 'on-fragrance-and-memory',
    category: 'Fragrance',
    title: 'On Fragrance, Memory, and the Scents We Carry',
    excerpt:
      'A guide to choosing scent by atmosphere, not just notes.',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=900&q=86',
    date: 'April 10, 2026',
    readTime: '6 min read',
  },
  {
    slug: 'the-case-for-slow-shopping',
    category: 'Philosophy',
    title: 'The Case for Slow Shopping',
    excerpt:
      'In a world of instant everything, waiting might be the most elegant decision.',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=86',
    date: 'March 30, 2026',
    readTime: '5 min read',
  },
  {
    slug: 'spring-home-edit-2026',
    category: 'Home',
    title: 'The Spring Home Edit 2026',
    excerpt:
      'Lighter textures, warmer light, and objects that bring air into a room.',
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=86',
    date: 'March 20, 2026',
    readTime: '3 min read',
  },
  {
    slug: 'why-skincare-is-a-form-of-self-respect',
    category: 'Skincare',
    title: 'Why Skincare Is a Form of Self-Respect',
    excerpt:
      'A routine becomes easier to repeat when the products feel good enough to keep close.',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=86',
    date: 'March 10, 2026',
    readTime: '5 min read',
  },
]

const CATEGORIES = [
  'All',
  'Ritual',
  'Edit',
  'Fragrance',
  'Philosophy',
  'Home',
  'Skincare',
]

function ArticleCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ delay: index * 0.07, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/journal/${post.slug}`}
        className="group grid overflow-hidden rounded-[26px] border border-cappuccino/45 bg-cream-light shadow-[0_14px_44px_rgba(59,42,34,0.07)] transition-transform duration-300 ease-premium hover:-translate-y-1"
      >
        <div className="relative overflow-hidden">
          <SmartImage
            src={post.image}
            alt={post.title}
            className="aspect-[4/3] w-full"
            imageClassName="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-espresso px-4 py-2 font-dm text-[10px] font-semibold uppercase tracking-ultra text-cream">
            {post.category}
          </span>
        </div>
        <div className="p-6">
          <div className="mb-5 flex flex-wrap items-center gap-4 font-dm text-[11px] text-caramel">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} /> {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5 text-caramel/70">
              <Clock size={12} /> {post.readTime}
            </span>
          </div>
          <h3 className="font-playfair text-[32px] font-bold leading-[0.98] text-espresso transition-colors duration-250 group-hover:text-mocha">
            {post.title}
          </h3>
          <p className="mt-4 line-clamp-2 font-dm text-[14px] font-light leading-[1.75] text-mocha/72">
            {post.excerpt}
          </p>
          <span className="mt-7 inline-flex items-center gap-2 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
            Read story <ArrowRight size={13} />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

function ArticleDetailView({ post }) {
  if (!post) {
    return (
      <main className="min-h-screen bg-cream px-8 pt-36">
        <div className="mx-auto max-w-screen-md py-28 text-center">
          <p className="mb-4 font-dm text-[11px] uppercase tracking-ultra text-caramel">
            404
          </p>
          <h1 className="font-playfair text-[64px] font-bold leading-none text-espresso">
            Article not found.
          </h1>
          <Link
            to="/journal"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-espresso px-7 py-3 font-dm text-[12px] font-semibold text-cream"
          >
            Back to Journal
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream">
      <SEO
        title={post.title}
        description={post.excerpt}
        canonical={`https://www.littleessentials.in/journal/${post.slug}`}
        noIndex
      />
      <section className="relative overflow-hidden bg-espresso px-8 pb-16 pt-32 lg:px-16 lg:pt-36">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-end">
          <div>
            <Link
              to="/journal"
              className="mb-8 inline-flex font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel"
            >
              Back to Journal
            </Link>
            <p className="mb-5 inline-flex items-center gap-2 font-dm text-[11px] uppercase tracking-ultra text-caramel">
              <Tag size={12} /> {post.category} · {post.readTime}
            </p>
            <h1 className="font-playfair text-[clamp(56px,9vw,118px)] font-bold leading-[0.84] text-cream">
              {post.title}
            </h1>
          </div>
          <SmartImage
            src={post.image}
            alt={post.title}
            className="aspect-[16/10] rounded-[30px]"
            imageClassName="object-cover object-center"
            priority
          />
        </div>
      </section>

      <article className="mx-auto max-w-screen-md px-8 py-16 lg:px-0 lg:py-24">
        <div className="mb-10 flex flex-wrap items-center gap-5 border-b border-cappuccino/50 pb-8 font-dm text-[12px] text-mocha/60">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={13} /> {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} /> {post.readTime}
          </span>
        </div>
        <p className="font-playfair text-[32px] font-semibold leading-[1.25] text-espresso">
          {post.excerpt}
        </p>
        <div className="mt-10 space-y-7 font-dm text-[16px] font-light leading-[2] text-mocha/82">
          <p>
            The best objects do not demand attention. They quietly improve the
            room, the routine, and the small decisions around them. That is the
            editorial lens behind Little Essentials.
          </p>
          <p>
            We look for products with presence: a useful shape, a thoughtful
            material, a texture worth touching, and a reason to return to them
            day after day.
          </p>
          <p>
            In a crowded market, restraint becomes a service. The edit exists so
            shoppers can move with more confidence and less noise.
          </p>
        </div>
        <Link
          to="/collections"
          className="mt-12 inline-flex items-center gap-2 rounded-full bg-espresso px-8 py-4 font-dm text-[13px] font-semibold text-cream transition-colors hover:bg-mocha"
        >
          Shop the edit <ArrowRight size={15} />
        </Link>
      </article>
    </main>
  )
}

export default function Journal() {
  const { slug } = useParams()
  const [activeCategory, setActiveCategory] = useState('All')

  if (slug) {
    const post = JOURNAL_POSTS.find((item) => item.slug === slug)
    return <ArticleDetailView post={post} />
  }

  const featured = JOURNAL_POSTS.find((item) => item.featured)
  const filtered = JOURNAL_POSTS.filter(
    (item) =>
      !item.featured &&
      (activeCategory === 'All' || item.category === activeCategory),
  )

  return (
    <main className="overflow-x-hidden bg-cream">
      <SEO
        title="The Journal - Little Essentials"
        description="Read the Little Essentials journal for premium lifestyle edits, curation notes, gifting ideas, and stories behind considered objects."
        canonical="https://www.littleessentials.in/journal"
        keywords="little essentials journal, premium lifestyle journal india, curated gifting ideas india, premium home and skincare edits"
      />

      <section className="relative overflow-hidden bg-espresso px-8 pb-20 pt-32 lg:px-16 lg:pt-36">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Stories, edits, rituals
            </p>
            <h1 className="font-playfair text-[clamp(64px,12vw,140px)] font-bold leading-[0.78] text-cream">
              Journal for considered living.
            </h1>
            <p className="mt-8 max-w-[520px] font-dm text-[16px] font-light leading-[1.85] text-cream/65">
              Product stories, founder notes, gifting ideas, and quiet luxury
              rituals from the Little Essentials edit.
            </p>
          </motion.div>

          {featured ? (
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/journal/${featured.slug}`}
                className="group block overflow-hidden rounded-[30px] border border-cream/12 bg-mocha shadow-[0_28px_90px_rgba(0,0,0,0.22)]"
              >
                <div className="relative overflow-hidden">
                  <SmartImage
                    src={featured.image}
                    alt={featured.title}
                    className="aspect-[16/10] w-full"
                    imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
                    priority
                  />
                  <span className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-cream/88 text-espresso backdrop-blur-md">
                    <ArrowUpRight size={18} strokeWidth={1.7} />
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
                    Featured · {featured.readTime}
                  </p>
                  <h2 className="mt-3 max-w-[560px] font-playfair text-[clamp(36px,5vw,58px)] font-bold leading-[0.94] text-cream">
                    {featured.title}
                  </h2>
                </div>
              </Link>
            </motion.div>
          ) : null}
        </div>
      </section>

      <section className="sticky top-[76px] z-40 border-y border-cappuccino/45 bg-cream/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-screen-xl items-center gap-2 overflow-x-auto px-8 py-4 scrollbar-none lg:px-16">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
              className={`flex-shrink-0 rounded-full px-5 py-2 font-dm text-[12px] font-semibold transition-all duration-250 ${
                activeCategory === category
                  ? 'bg-espresso text-cream'
                  : 'border border-cappuccino text-espresso hover:border-caramel hover:bg-cream-light'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-screen-xl px-8 py-16 lg:px-16 lg:py-24">
        <div className="mb-10 grid gap-5 border-b border-cappuccino/45 pb-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <h2 className="font-playfair text-[clamp(44px,7vw,88px)] font-bold leading-[0.86] text-espresso">
            Latest notes from the edit.
          </h2>
          <p className="font-dm text-[14px] font-light leading-[1.75] text-mocha/72">
            Browse by mood and category. Each story is built to support better
            product choices, not to fill space.
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((post, index) => (
              <ArticleCard key={post.slug} post={post} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="bg-cappuccino px-8 py-20 lg:px-16">
        <div className="mx-auto grid max-w-screen-xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-5 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Stay in the edit
            </p>
            <h2 className="max-w-[760px] font-playfair text-[clamp(48px,8vw,104px)] font-bold leading-[0.82] text-espresso">
              New stories. Better choices.
            </h2>
          </div>
          <form
            className="flex w-full max-w-[460px] flex-col gap-3 rounded-[26px] border border-cappuccino/70 bg-cream-light p-3 sm:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 font-dm text-[13px] text-espresso outline-none placeholder:text-mocha/45"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-espresso px-6 font-dm text-[12px] font-semibold text-cream transition-colors hover:bg-mocha"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
