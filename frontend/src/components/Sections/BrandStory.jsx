import { motion } from 'framer-motion'
import Button from '../UI/Button'

const STORY_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=85'

export default function BrandStory() {
  return (
    <section className="overflow-hidden bg-espresso">
      <div className="mx-auto max-w-screen-xl">
        <div className="flex min-h-[520px] flex-col lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[320px] overflow-hidden lg:h-auto lg:w-[55%]"
          >
            <img
              src={STORY_IMAGE}
              alt="Little Essentials brand story"
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-espresso/20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex items-center px-8 py-16 lg:w-[45%] lg:px-16 lg:py-20"
          >
            <div className="max-w-md">
              <p className="mb-6 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
                Our Philosophy
              </p>
              <h2 className="mb-6 font-playfair text-[clamp(32px,4vw,48px)] font-bold leading-[1.15] text-cream">
                Not just products.
                <br />
                <span className="font-normal italic">A point of view.</span>
              </h2>
              <p className="mb-4 font-dm text-[15px] font-light leading-[1.8] text-cream/65">
                We believe the objects you surround yourself with shape the life
                you live. Little Essentials exists to surface the world's most
                considered goods, things built with intention, made to last, and
                worthy of your space.
              </p>
              <p className="mb-8 font-dm text-[15px] font-light leading-[1.8] text-cream/65">
                Every product on this platform has been chosen by hand. No
                algorithms. No sponsorships. Just a genuine edit.
              </p>

              <Button variant="ghost_dark" to="/about">
                Read Our Story
              </Button>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {['500+ Products', 'Curated Weekly', 'Free Returns'].map(
                  (stat) => (
                    <span
                      key={stat}
                      className="rounded-full bg-mocha/60 px-4 py-2 font-dm text-[11px] font-medium text-cream"
                    >
                      {stat}
                    </span>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
