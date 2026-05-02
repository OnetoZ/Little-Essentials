import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import CustomCursor from './components/UI/CustomCursor'
import ScrollProgressBar from './components/UI/ScrollProgressBar'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Collections from './pages/Collections'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import OrderTracking from './pages/OrderTracking'
import ProductDetail from './pages/ProductDetail'

function AppRoutes() {
  const location = useLocation()
  const focusedPage = ['/checkout', '/login'].includes(location.pathname)

  return (
    <>
      <ScrollProgressBar />
      <CustomCursor />
      {!focusedPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id/track" element={<OrderTracking />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
