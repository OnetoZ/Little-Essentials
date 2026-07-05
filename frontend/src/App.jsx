import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
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
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Login = lazy(() => import('./pages/Login'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
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
  const isAdmin = location.pathname.startsWith('/admin')
  const hideChrome = location.pathname === '/login' || isAdmin

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <ScrollProgressBar />
      <ToastContainer />
      <RouteWipe />
      <a
        href="#main-content"
        className="absolute left-2 top-2 z-[9999] -translate-y-16 rounded-[3px] bg-mocha px-4 py-2 font-dm text-[13px] font-medium text-cream transition-transform duration-200 focus:translate-y-0"
      >
        Skip to main content
      </a>
      {!hideChrome ? <Navbar /> : null}
      <Suspense fallback={<RouteFallback />}>
        <div id="main-content">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<InfoPage />} />
              <Route path="/faqs" element={<InfoPage />} />
              <Route path="/shipping" element={<InfoPage />} />
              <Route path="/returns" element={<InfoPage />} />
              <Route path="/size-guide" element={<InfoPage />} />
              <Route path="/gift-cards" element={<InfoPage />} />
              <Route path="/privacy" element={<InfoPage />} />
              <Route path="/terms" element={<InfoPage />} />
              <Route path="/cookies" element={<InfoPage />} />
              <Route path="/order/:id/track" element={<OrderTracking />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </div>
      </Suspense>
      {!hideChrome ? <Footer /> : null}
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
