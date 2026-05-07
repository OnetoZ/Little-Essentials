import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default function SectionHeader({
  align = 'left',
  description,
  label,
  number,
  title,
  viewAllLink,
}) {
  const centered = align === 'center'

  return (
    <div
      className={`relative mb-10 flex min-h-[72px] gap-6 ${
        centered
          ? 'flex-col items-center text-center'
          : 'items-end justify-between'
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-playfair font-black leading-none ${
          centered ? 'left-1/2 -translate-x-1/2' : '-left-2'
        }`}
        style={{
          fontSize: 'clamp(80px,12vw,120px)',
          color: 'rgba(59,42,34,0.06)',
        }}
      >
        {number}
      </span>

      <div className="relative z-10 max-w-[620px]">
        <p className="mb-3 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
          {label}
        </p>
        {title ? (
          <h2 className="font-playfair text-[clamp(32px,5vw,54px)] font-bold leading-[1.08] text-espresso">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-[500px] font-dm text-[15px] font-light leading-[1.7] text-mocha/75">
            {description}
          </p>
        ) : null}
      </div>

      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="relative z-10 hidden flex-shrink-0 font-dm text-[13px] text-mocha underline underline-offset-4 transition-colors duration-250 ease-smooth hover:text-espresso sm:inline-flex"
        >
          View All →
        </Link>
      )}
    </div>
  )
}

SectionHeader.propTypes = {
  align: PropTypes.oneOf(['left', 'center']),
  description: PropTypes.string,
  label: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  title: PropTypes.string,
  viewAllLink: PropTypes.string,
}
