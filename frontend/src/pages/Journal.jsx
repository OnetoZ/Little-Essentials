import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import SEO from '../components/SEO/SEO'
import RevealOnScroll from '../components/UI/RevealOnScroll'

const JOURNAL_POSTS = [
  {
    slug: 'the-art-of-the-morning-ritual',
    category: 'Ritual',
    title: 'The Art of the Morning Ritual',
    excerpt:
      'How the first 20 minutes of your day, done with intention, can change everything about what follows.',
    image:
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&q=85',
    date: 'April 28, 2026',
    readTime: '5 min read',
    featured: true,
  },
  {
    slug: 'five-objects-worth-keeping',
    category: 'Edit',
    title: 'Five Objects Worth Keeping for a Lifetime',
    excerpt:
      'Not every purchase should be a forever decision. But some should — and here are five that warrant the commitment.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85',
    date: 'April 18, 2026',
    readTime: '4 min read',
    featured: false,
  },
  {
    slug: 'on-fragrance-and-memory',
    category: 'Fragrance',
    title: 'On Fragrance, Memory, and the Scents We Carry',
    excerpt:
      'Scent is the most primal sense. It bypasses thought and lands directly in memory. Here\'s how to choose one that stays with you.',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=900&q=85',
    date: 'April 10, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    slug: 'the-case-for-slow-shopping',
    category: 'Philosophy',
    title: 'The Case for Slow Shopping',
    excerpt:
      'In a world of instant everything, the most radical act might be to wait — and to choose with intention.',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85',
    date: 'March 30, 2026',
    readTime: '5 min read',
    featured: false,
  },
  {
    slug: 'spring-home-edit-2026',
    category: 'Home',
    title: 'The Spring Home Edit 2026',
    excerpt:
      'Lighter textures, warmer light, and objects that bring the outside in. Our favourite pieces for the season.',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85',
    date: 'March 20, 2026',
    readTime: '3 min read',
    featured: false,
  },
  {
    slug: 'why-skincare-is-a-form-of-self-respect',
    category: 'Skincare',
    title: 'Why Skincare Is a Form of Self-Respect',
    excerpt:
      'A five-step routine doesn\'t have to feel like a chore. When chosen carefully, it becomes the quietest form of daily care.',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=85',
    date: 'March 10, 2026',
    readTime: '5 min read',
    featured: false,
  },
]

const CATEGORIES = ['All', 'Ritual', 'Edit', 'Fragrance', 'Philosophy', 'Home', 'Skincare']

const FADE_UP = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

function ArticleCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/journal/${post.slug}`} className="block">
        <div className="relative mb-5 overflow-hidden rounded-[6px]">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            src={post.image}
            alt={post.title}
            className="w-full object-cover"
            style={{ aspectRatio: '4/3' }}
          />
          <span className="absolute left-4 top-4 rounded-[2px] bg-espresso/90 px-3 py-1 font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel backdrop-blur-sm">
            {post.category}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <span className="flex items-center gap-1.5 font-dm text-[11px] text-caramel">
            <Calendar size={12} />
            {post.date}
          </span>
          <span className="flex items-center gap-1.5 font-dm text-[11px] text-caramel/60">
            <Clock size={12} />
            {post.readTime}
          </span>
        </div>

        <h3 className="mb-2 font-playfair text-[20px] font-bold leading-[1.25] text-espresso transition-colors duration-300 group-hover:text-caramel">
          {post.title}
        </h3>
        <p className="mb-4 font-dm text-[14px] font-light leading-[1.75] text-mocha line-clamp-2">
          {post.excerpt}
        </p>

        <span className="inline-flex items-center gap-2 font-dm text-[12px] font-medium uppercase tracking-ultra text-caramel transition-all duration-300 group-hover:gap-3">
          Read more <ArrowRight size={14} />
        </span>
      </Link>
    </motion.article>
  )
}

function FeaturedPost({ post }) {
  return (
    <Link to={`/journal/${post.slug}`} className="group block">
      <div className="grid items-center gap-0 overflow-hidden rounded-[8px] shadow-[0_16px_60px_rgba(59,42,34,0.12)] lg:grid-cols-2">
        <div className="relative overflow-hidden" style={{ aspectRatio: '3/2' }}>
          <motion.img
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, transparent 60%, rgba(243,233,215,0.08) 100%)',
            }}
          />
        </div>
        <div className="bg-cream p-10 lg:p-14">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-[2px] bg-caramel/15 px-3 py-1 font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
              {post.category}
            </span>
            <span className="font-dm text-[11px] text-mocha/50">{post.date}</span>
          </div>
          <h2 className="mb-4 font-playfair text-[clamp(28px,3.5vw,42px)] font-black leading-[1.15] text-espresso transition-colors duration-300 group-hover:text-caramel">
            {post.title}
          </h2>
          <p className="mb-8 font-dm text-[15px] font-light leading-[1.85] text-mocha">
            {post.excerpt}
          </p>
          <span className="inline-flex items-center gap-2 rounded-[3px] bg-espresso px-7 py-3.5 font-dm text-[12px] font-medium uppercase tracking-ultra text-cream transition-all duration-300 group-hover:gap-3 group-hover:bg-mocha">
            Read Article <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ArticleDetailView({ post }) {
  if (!post) {
    return (
      <main className="min-h-screen bg-cream pt-[80px]">
        <div className="mx-auto max-w-screen-md px-8 py-32 text-center">
          <p className="mb-4 font-dm text-[11px] uppercase tracking-ultra text-caramel">404</p>
          <h1 className="mb-6 font-playfair text-[48px] font-black text-espresso">Article not found.</h1>
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 font-dm text-[13px] font-medium text-caramel transition-colors hover:text-espresso"
          >
            ← Back to Journal
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
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(59,42,34,0.85) 0%, rgba(59,42,34,0.2) 70%, transparent 100%)' }}
        />
        <div className="absolute bottom-12 left-0 right-0 px-8 lg:px-16">
          <div className="mx-auto max-w-screen-md">
            <span className="mb-4 inline-flex items-center gap-2 font-dm text-[11px] uppercase tracking-ultra text-caramel">
              <Tag size={12} /> {post.category}
            </span>
            <h1 className="font-playfair text-[clamp(32px,5vw,56px)] font-black leading-[1.1] text-cream">
              {post.title}
            </h1>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="mx-auto max-w-screen-md px-8 py-16 lg:px-16">
        <div className="mb-8 flex items-center gap-5 border-b border-cappuccino/40 pb-8">
          <Link
            to="/journal"
            className="font-dm text-[12px] uppercase tracking-ultra text-caramel transition-colors hover:text-espresso"
          >
            ← All Articles
          </Link>
          <span className="flex items-center gap-1.5 font-dm text-[12px] text-mocha/50">
            <Calendar size={13} /> {post.date}
          </span>
          <span className="flex items-center gap-1.5 font-dm text-[12px] text-mocha/50">
            <Clock size={13} /> {post.readTime}
          </span>
        </div>
        <p className="mb-6 font-dm text-[17px] font-light leading-[2] text-mocha">{post.excerpt}</p>
        <div className="prose-like space-y-5 font-dm text-[16px] font-light leading-[1.95] text-mocha">
          <p>
            The best things don&apos;t announce themselves loudly. They arrive quietly, settle into
            your life, and before long you can&apos;t imagine the day without them. That&apos;s the
            philosophy behind every choice we make at Little Essentials.
          </p>
          <p>
            When we think about {post.title.toLowerCase()}, we think about presence — the quality of
            attention we bring to moments that might otherwise blur past. The right object, at the
            right time, can make the ordinary feel deliberate.
          </p>
          <p>
            We believe in starting small. One considered choice, repeated with consistency, builds
            something extraordinary over time. The ritual. The object. The intention.
          </p>
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 rounded-[3px] bg-caramel px-8 py-4 font-dm text-[13px] font-medium text-cream transition-all duration-300 hover:bg-mocha hover:gap-3"
          >
            Shop the Edit <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function Journal() {
  const { slug } = useParams()
  const [activeCategory, setActiveCategory] = useState('All')

  // If slug, render article detail
  if (slug) {
    const post = JOURNAL_POSTS.find((p) => p.slug === slug)
    return <ArticleDetailView post={post} />
  }

  const featured = JOURNAL_POSTS.find((p) => p.featured)
  const filtered = JOURNAL_POSTS.filter((p) => !p.featured && (activeCategory === 'All' || p.category === activeCategory))

  return (
    <main className="overflow-x-hidden bg-cream">
      <SEO
        title="The Journal — Little Essentials"
        description="Read the Little Essentials journal for premium lifestyle edits, curation notes, gifting ideas, and stories behind considered objects."
        canonical="https://www.littleessentials.in/journal"
        keywords="little essentials journal, premium lifestyle journal india, curated gifting ideas india, premium home and skincare edits"
      />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-espresso pt-[80px] pb-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(184,140,100,1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(184,140,100,0.6) 0%, transparent 50%)`,
          }}
        />

        {/* Scrolling text background */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden py-2 opacity-[0.04]">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="flex whitespace-nowrap"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className="pr-12 font-playfair font-black"
                style={{ fontSize: 'clamp(60px,10vw,100px)', color: '#f3e9d7' }}
              >
                THE JOURNAL &nbsp;&nbsp;
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto max-w-screen-xl px-8 pt-14 text-center lg:px-16"
        >
          <motion.p
            variants={FADE_UP}
            className="mb-5 font-dm text-[11px] font-medium uppercase tracking-[0.22em] text-caramel"
          >
            Stories, Edits &amp; Rituals
          </motion.p>
          <motion.h1
            variants={FADE_UP}
            className="mb-6 font-playfair text-[clamp(52px,9vw,96px)] font-black leading-[0.92] text-cream"
          >
            The
            <br />
            <span className="italic font-normal">Journal.</span>
          </motion.h1>
          <motion.p
            variants={FADE_UP}
            className="mx-auto max-w-[480px] font-dm text-[16px] font-light leading-[1.8] text-cream/60"
          >
            Editorial stories, founder notes, product rituals, and seasonal edits
            from Little Essentials.
          </motion.p>
        </motion.div>
      </section>

      {/* ── FEATURED POST ── */}
      {featured && (
        <section className="mx-auto max-w-screen-xl px-8 py-20 lg:px-16">
          <RevealOnScroll>
            <div className="mb-8 flex items-center gap-4">
              <div className="h-[1.5px] w-8 bg-caramel" />
              <p className="font-dm text-[11px] uppercase tracking-ultra text-caramel">
                Featured
              </p>
            </div>
            <FeaturedPost post={featured} />
          </RevealOnScroll>
        </section>
      )}

      {/* ── CATEGORY FILTER ── */}
      <section className="sticky top-[68px] z-40 border-b border-cappuccino/40 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center gap-2 overflow-x-auto px-8 py-4 scrollbar-none lg:px-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
              className={`flex-shrink-0 rounded-full px-5 py-2 font-dm text-[12px] font-medium transition-all duration-250 ${
                activeCategory === cat
                  ? 'bg-espresso text-cream'
                  : 'border border-cappuccino text-espresso hover:border-caramel'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── POSTS GRID ── */}
      <section className="mx-auto max-w-screen-xl px-8 py-20 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((post, i) => (
              <ArticleCard key={post.slug} post={post} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-dm text-[14px] text-caramel">
              No articles in this category yet.
            </p>
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-espresso py-24">
        <RevealOnScroll>
          <div className="mx-auto max-w-screen-md px-8 text-center">
            <p className="mb-4 font-dm text-[11px] uppercase tracking-ultra text-caramel">
              Stay in the edit
            </p>
            <h2 className="mb-4 font-playfair text-[clamp(32px,5vw,56px)] font-black leading-[1.1] text-cream">
              Never miss a story.
            </h2>
            <p className="mx-auto mb-10 max-w-[380px] font-dm text-[15px] font-light leading-[1.8] text-cream/55">
              New articles, curated edits, and exclusive drops — delivered to your inbox.
            </p>
            <form
              className="relative mx-auto max-w-[420px]"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="h-14 w-full rounded-[8px] border border-cream/[0.12] bg-cream/[0.06] pl-5 pr-36 font-dm text-[13px] text-cream outline-none placeholder:text-cream/30 focus:border-caramel/50 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 rounded-[6px] bg-caramel px-5 py-2.5 font-dm text-[12px] font-medium text-cream transition-colors hover:bg-mocha"
              >
                Subscribe
              </button>
            </form>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  )
}
