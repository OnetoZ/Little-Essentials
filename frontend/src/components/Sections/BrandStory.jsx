import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import Button from '../UI/Button'
import SmartImage from '../UI/SmartImage'

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1100&q=88'
const DETAIL_IMAGE =
  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=900&q=85'

const PRINCIPLES = [
  ['01', 'Material first', 'Texture, finish, and daily usefulness guide the edit.'],
  ['02', 'Fewer better things', 'The store is intentionally small, so discovery stays calm.'],
  ['03', 'Ritual over trend', 'Products are chosen for repeat use, not one-scroll novelty.'],
]

export default function BrandStory() {
  return (
    <section className="overflow-hidden bg-espresso px-8 py-20 lg:px-16 lg:py-28">
      <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative min-h-[560px]"
        >
          <div className="absolute left-0 top-0 h-[76%] w-[78%] overflow-hidden rounded-[8px]">
            <SmartImage
              src={STORY_IMAGE}
              alt="Little Essentials home curation"
              className="h-full w-full"
              imageClassName="object-cover object-center"
            />
            <div className="absolute inset-0 bg-espresso/12" />
          </div>

          <div className="absolute bottom-0 right-0 w-[48%] overflow-hidden rounded-[8px] border border-cream/12 bg-mocha shadow-[0_28px_80px_rgba(0,0,0,0.22)]">
            <SmartImage
              src={DETAIL_IMAGE}
              alt="Textured home detail"
              className="aspect-[4/5] w-full"
              imageClassName="object-cover object-center"
            />
          </div>

          <div className="absolute bottom-[18%] left-6 max-w-[230px] border border-cream/14 bg-espresso/72 p-5 backdrop-blur-md">
            <p className="font-dm text-[10px] uppercase tracking-ultra text-caramel">
              Curation note
            </p>
            <p className="mt-3 font-playfair text-[24px] font-bold leading-tight text-cream">
              No endless aisles. Just a sharper point of view.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mb-5 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
            Our Philosophy
          </p>
          <h2 className="max-w-[620px] font-playfair text-[clamp(40px,6.7vw,86px)] font-black leading-[0.94] text-cream">
            Small luxuries, edited with discipline.
          </h2>
          <p className="mt-7 max-w-[520px] font-dm text-[16px] font-light leading-[1.85] text-cream/66">
            Little Essentials exists for people who care about the objects
            around them but do not want to sort through chaos. Every product is
            selected for beauty, use, and the quiet confidence it brings into a
            room.
          </p>

          <div className="mt-10 grid gap-3">
            {PRINCIPLES.map(([number, title, text], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="grid grid-cols-[64px_1fr] border-t border-cream/12 py-5"
              >
                <span className="font-playfair text-[28px] font-bold text-caramel">
                  {number}
                </span>
                <div>
                  <h3 className="font-dm text-[14px] font-semibold text-cream">
                    {title}
                  </h3>
                  <p className="mt-2 font-dm text-[13px] font-light leading-[1.65] text-cream/52">
                    {text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost_dark" to="/about" className="group">
              Read Our Story
              <ArrowUpRight
                size={15}
                className="transition-transform duration-250 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Button>
            <Button variant="primary" to="/collections">
              Shop the Edit
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
