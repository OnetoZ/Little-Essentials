import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: `
    bg-mocha text-cream
    hover:bg-espresso active:scale-[0.98]
  `,
  ghost: `
    bg-transparent border border-cappuccino text-espresso
    hover:border-caramel active:scale-[0.98]
  `,
  dark: `
    bg-espresso text-cream
    hover:bg-mocha active:scale-[0.98]
  `,
  ghost_dark: `
    bg-transparent border border-cream/40 text-cream
    hover:border-cream/80 active:scale-[0.98]
  `,
}

const SIZES = {
  sm: 'px-6 py-3 text-[13px]',
  md: 'px-9 py-4 text-[14px]',
  lg: 'px-12 py-[18px] text-[15px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-dm font-medium tracking-wide-2 rounded-[3px]
    transition-all duration-250 ease-smooth
    ${VARIANTS[variant] ?? VARIANTS.primary}
    ${SIZES[size] ?? SIZES.md}
    ${className}
  `

  if (to) {
    return (
      <Link to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={baseClasses} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button
      onClick={onClick}
      className={baseClasses}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  to: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'ghost', 'dark', 'ghost_dark']),
}
