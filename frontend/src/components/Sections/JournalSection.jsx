import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import SectionHeader from '../UI/SectionHeader'
import SmartImage from '../UI/SmartImage'

const JOURNAL_POSTS = [
  {
    id: 'j001',
    category: 'Lifestyle',
    title: 'The Morning Edit',
    description: 'Seven objects that make the first hour feel composed.',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=86',
    href: '/journal/morning-routine',
  },
  {
    id: 'j002',
    category: 'Curation',
    title: 'What Makes a Product Worth Carrying?',
    description: 'A closer look at the filters behind the Little Essentials edit.',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=86',
    href: '/journal/our-curation-process',
  },
  {
    id: 'j003',
    category: 'Gifting',
    title: 'The Under Rs. 4,000 Gift List',
    description: 'Useful, personal, and polished without feeling overdone.',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=900&q=86',
    href: '/journal/gift-list',
  },
]

export default function JournalSection() {
  const [lead, ...supporting] = JOURNAL_POSTS

  return (
    <section className="bg-cappuccino px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-screen-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionHeader
            number="06"
            label="The Journal"
            title="Editorial, not filler content."
            description="Stories that help shoppers understand how to choose, gift, style, and live with the edit."
            viewAllLink="/journal"
          />
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={lead.href}
              className="group relative block min-h-[560px] overflow-hidden rounded-[8px] bg-espresso"
            >
              <SmartImage
                src={lead.image}
                alt={lead.title}
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover object-center transition-transform duration-800 ease-premium group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="mb-4 font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
                  {lead.category} · {lead.readTime}
                </p>
                <h3 className="max-w-[520px] font-playfair text-[clamp(42px,7vw,76px)] font-black leading-[0.96] text-cream">
                  {lead.title}
                </h3>
                <p className="mt-5 max-w-[380px] font-dm text-[15px] font-light leading-[1.7] text-cream/68">
                  {lead.description}
                </p>
              </div>
              <span className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-cream/30 bg-cream/10 text-cream backdrop-blur-md">
                <ArrowUpRight size={18} strokeWidth={1.7} />
              </span>
            </Link>
          </motion.div>

          <div className="grid gap-5">
            {supporting.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  to={post.href}
                  className="group grid min-h-[268px] overflow-hidden rounded-[8px] bg-cream-light shadow-[0_14px_44px_rgba(59,42,34,0.08)] transition-transform duration-300 ease-premium hover:-translate-y-1 sm:grid-cols-[0.82fr_1fr]"
                >
                  <SmartImage
                    src={post.image}
                    alt={post.title}
                    className="h-full min-h-[230px] w-full"
                    imageClassName="object-cover object-center transition-transform duration-700 ease-premium group-hover:scale-105"
                  />
                  <div className="flex flex-col justify-between p-6">
                    <div>
                      <p className="font-dm text-[10px] font-medium uppercase tracking-ultra text-caramel">
                        {post.category} · {post.readTime}
                      </p>
                      <h3 className="mt-4 font-playfair text-[30px] font-bold leading-[1.02] text-espresso">
                        {post.title}
                      </h3>
                    </div>
                    <p className="mt-6 font-dm text-[14px] font-light leading-[1.65] text-mocha/70">
                      {post.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
