import { forwardRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react'

const FloatInput = forwardRef(function FloatInput(
  {
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    success,
    optional = false,
    className = '',
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const inputValue = value ?? ''
  const isFloated = focused || inputValue.length > 0
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={name}
        name={name}
        type={inputType}
        value={inputValue}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        placeholder=" "
        autoComplete={name}
        className={`peer h-[56px] w-full rounded-[8px] border bg-cream-light px-4 pb-2 pt-5 font-dm text-[14px] text-espresso outline-none transition-all duration-250 ease-smooth focus:ring-1 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
            : success
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
              : 'border-cappuccino focus:border-mocha focus:ring-mocha'
        } ${isPassword || success || error ? 'pr-12' : ''}`}
        {...props}
      />

      <label
        htmlFor={name}
        className={`pointer-events-none absolute left-4 font-dm transition-all duration-250 ease-smooth ${
          isFloated
            ? 'top-[8px] text-[10px] font-medium uppercase tracking-ultra text-mocha'
            : 'top-[18px] text-[14px] font-light text-caramel'
        }`}
      >
        {label}
        {optional ? (
          <span className="ml-1 normal-case text-caramel/50">(optional)</span>
        ) : null}
      </label>

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPass((current) => !current)}
            className="p-1 text-caramel transition-colors duration-250 ease-smooth hover:text-espresso"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        ) : null}

        <AnimatePresence>
          {success && !error ? (
            <motion.div
              key="success"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check size={15} className="text-green-600" />
            </motion.div>
          ) : null}
          {error ? (
            <motion.div
              key="error"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <AlertCircle size={15} className="text-red-400" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="ml-1 mt-1 font-dm text-[11px] text-red-400"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

FloatInput.propTypes = {
  className: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  optional: PropTypes.bool,
  success: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default FloatInput
