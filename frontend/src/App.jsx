import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import CustomCursor from './components/UI/CustomCursor'
import PageTransition from './components/UI/PageTransition'
import RouteWipe from './components/UI/RouteWipe'
import ScrollProgressBar from './components/UI/ScrollProgressBar'
import ToastContainer from './components/UI/Toast'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Collections = lazy(() => import('./pages/Collections'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const InfoPage = lazy(() => import('./pages/InfoPage'))
const Journal = lazy(() => import('./pages/Journal'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
    </div>
  )
}

function AppRoutes() {
  const location = useLocation()
  const focusedPage = ['/checkout', '/login'].includes(location.pathname)

  return (
    <>
      <ScrollProgressBar />
      <CustomCursor />
      <ToastContainer />
      <RouteWipe />
      {!focusedPage && <Navbar />}
      <Suspense fallback={<RouteFallback />}>
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/journal/:slug" element={<Journal />} />
            <Route path="/contact" element={<InfoPage />} />
            <Route path="/faqs" element={<InfoPage />} />
            <Route path="/shipping" element={<InfoPage />} />
            <Route path="/returns" element={<InfoPage />} />
            <Route path="/size-guide" element={<InfoPage />} />
            <Route path="/gift-cards" element={<InfoPage />} />
            <Route path="/order/:id/track" element={<OrderTracking />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
      {!focusedPage && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <AppRoutes />
    </BrowserRouter>
  )
}
