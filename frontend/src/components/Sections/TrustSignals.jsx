import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, Truck } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    label: 'Handpicked edit',
    text: 'Every object is selected by people, not pushed by algorithmic shelves.',
  },
  {
    icon: Truck,
    label: 'Free delivery over Rs.999',
    text: 'Premium packaging and quick dispatch across India on eligible orders.',
  },
  {
    icon: ShieldCheck,
    label: 'Easy returns',
    text: 'A considered buying experience, from discovery to after-care.',
  },
]

const QUOTES = [
  'Found three gifts in ten minutes.',
  'Packaging felt like a private boutique.',
  'The edit is calm, sharp, and genuinely useful.',
  'Every product felt like it had a reason.',
]

export default function TrustSignals() {
  return (
    <section className="overflow-hidden bg-cream-light px-8 py-16 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-12 flex flex-col gap-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mb-4 font-dm text-[11px] font-semibold uppercase tracking-ultra text-caramel">
              Trusted by thoughtful shoppers
            </p>
            <h2 className="max-w-none whitespace-nowrap font-playfair text-[clamp(42px,6vw,78px)] font-bold leading-[0.9] text-espresso">
              Confidence,<br />designed into<br />every step.
            </h2>
          </motion.div>

          <div className="hidden overflow-hidden lg:block [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
            <motion.div
              aria-hidden="true"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex w-fit whitespace-nowrap"
            >
              {[...QUOTES, ...QUOTES].map((quote, index) => (
                <span
                  key={`${quote}-${index}`}
                  className="mr-8 rounded-full border border-cappuccino/55 bg-cream px-5 py-3 font-dm text-[12px] font-semibold text-mocha/70 shadow-[0_10px_34px_rgba(59,42,34,0.05)]"
                >
                  {quote}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -6 }}
                className="rounded-[28px] border border-cappuccino/50 bg-cream p-6 shadow-[0_16px_54px_rgba(59,42,34,0.07)]"
              >
                <div className="mb-9 flex h-12 w-12 items-center justify-center rounded-full bg-cappuccino/30 text-caramel">
                  <Icon size={19} strokeWidth={1.6} />
                </div>
                <h3 className="font-playfair text-[32px] font-bold leading-none text-espresso">
                  {item.label}
                </h3>
                <p className="mt-4 font-dm text-[14px] font-light leading-[1.75] text-mocha/72">
                  {item.text}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
