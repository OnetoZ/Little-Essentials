import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default function SectionHeader({ number, label, viewAllLink }) {
  return (
    <div className="relative mb-10 flex min-h-[48px] items-center justify-between gap-6">
      <span
        className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 select-none font-playfair font-black leading-none"
        style={{
          fontSize: 'clamp(80px,12vw,120px)',
          color: 'rgba(59,42,34,0.06)',
        }}
      >
        {number}
      </span>

      <p className="relative z-10 font-dm text-[11px] font-medium uppercase tracking-ultra text-caramel">
        {label}
      </p>

      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="relative z-10 font-dm text-[13px] text-mocha underline underline-offset-4 transition-colors duration-250 ease-smooth hover:text-espresso"
        >
          View All →
        </Link>
      )}
    </div>
  )
}

SectionHeader.propTypes = {
  label: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  viewAllLink: PropTypes.string,
}
