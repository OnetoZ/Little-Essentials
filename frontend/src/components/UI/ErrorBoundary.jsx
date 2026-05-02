import { Component } from 'react'
import PropTypes from 'prop-types'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Error boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-8 text-center">
          <span className="mb-6 font-playfair text-5xl text-caramel">LE</span>
          <h1 className="mb-3 font-playfair text-[32px] font-bold text-espresso">
            Something brewed wrong.
          </h1>
          <p className="mb-8 max-w-sm font-dm text-[15px] font-light text-caramel">
            We hit an unexpected error. Our team has been notified.
          </p>
          <a
            href="/"
            className="rounded-[3px] bg-mocha px-8 py-4 font-dm text-[14px] font-medium text-cream transition-colors hover:bg-espresso"
          >
            Return Home
          </a>
        </main>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
}
