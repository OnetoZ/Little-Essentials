import { useCallback, useState } from 'react'
import App from './App.jsx'
import BrandLoader from './components/UI/BrandLoader.jsx'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

export default function Root() {
  const [loaded, setLoaded] = useState(false)
  const handleDone = useCallback(() => setLoaded(true), [])

  return (
    <>
      {!loaded && <BrandLoader onDone={handleDone} />}
      {loaded && (
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      )}
    </>
  )
}
