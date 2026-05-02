import { motion } from 'framer-motion'
import SectionHeader from '../UI/SectionHeader'

const JOURNAL_POSTS = [
  {
    id: 'j001',
    category: 'Lifestyle',
    title: 'The Art of the Morning Routine: 7 Objects Worth Waking Up For',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=85',
    href: '/journal/morning-routine',
  },
  {
    id: 'j002',
    category: 'Curation',
    title: 'Why We Only Carry Brands That Could Disappear Without Notice',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85',
    href: '/journal/our-curation-process',
  },
]

export default function JournalSection() {
  return (
    <section className="bg-cappuccino px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-screen-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeader number="03" label="The Journal" />
        </motion.div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {JOURNAL_POSTS.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.href}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.12,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -4,
                boxShadow: '0 24px 64px rgba(59,42,34,0.22)',
              }}
              className="group relative block cursor-pointer overflow-hidden rounded-[8px]"
              style={{ aspectRatio: '16/9' }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  loading="lazy"
                />
              </div>

              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(59,42,34,0.85) 0%, rgba(59,42,34,0.3) 50%, transparent 100%)',
                }}
              />

              <div className="absolute bottom-0 left-0 z-10 p-6">
                <span className="mb-3 inline-block font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
                  {post.category}
                </span>
                <h3 className="mb-3 max-w-[360px] font-playfair text-[20px] font-bold leading-[1.3] text-cream">
                  {post.title}
                </h3>
                <p className="font-dm text-[11px] text-cream/55">
                  {post.readTime}
                </p>
              </div>

              <div className="absolute bottom-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 transition-colors duration-250 ease-smooth group-hover:bg-cream/10">
                <span className="text-sm text-cream">→</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
