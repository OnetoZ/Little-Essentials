import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function ProgressTimeline({ stages, currentStatus }) {
  const completedCount = stages.filter((stage) => stage.done).length
  const activeIndex = stages.findIndex((stage) => stage.key === currentStatus)
  const fillScale =
    stages.length > 1 ? Math.max((completedCount - 1) / (stages.length - 1), 0) : 0

  return (
    <div className="relative overflow-x-auto px-2 py-6 sm:px-4">
      <div className="relative min-w-[620px]">
        <div className="absolute left-12 right-12 top-[34px] z-0 h-[2px] bg-cappuccino/40" />
        <motion.div
          className="absolute left-12 right-12 top-[34px] z-0 h-[2px] origin-left bg-caramel"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: fillScale }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="relative z-10 flex items-start justify-between">
          {stages.map((stage, index) => {
            const isActive = index === activeIndex

            return (
              <motion.div
                key={stage.key}
                className="flex flex-1 flex-col items-center gap-2"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.12 + 0.3,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div className="relative">
                  <motion.div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      stage.done
                        ? 'border-mocha bg-mocha'
                        : 'border-cappuccino bg-cream'
                    }`}
                  >
                    {stage.done ? (
                      <Check size={14} className="text-cream" strokeWidth={2.5} />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-cappuccino" />
                    )}
                  </motion.div>

                  {isActive ? (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-caramel"
                      animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ) : null}
                </div>

                <div className="max-w-[86px] text-center">
                  <p
                    className={`font-dm text-[11px] font-medium leading-tight ${
                      stage.done ? 'text-espresso' : 'text-caramel'
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="mt-0.5 font-dm text-[10px] text-caramel/60">
                    {stage.date}
                  </p>
                  {stage.time ? (
                    <p className="font-dm text-[9px] text-caramel/40">
                      {stage.time}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

ProgressTimeline.propTypes = {
  currentStatus: PropTypes.string.isRequired,
  stages: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      done: PropTypes.bool.isRequired,
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      time: PropTypes.string,
    }),
  ).isRequired,
}
