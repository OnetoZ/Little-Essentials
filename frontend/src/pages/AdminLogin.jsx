import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import { useAdminAuth } from '../hooks/useAdminAuth'
import SEO from '../components/SEO/SEO'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login, loading, error, isAuthenticated } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/admin', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6">
      <SEO title="Admin Login" description="Little Essentials admin dashboard login." noIndex />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[12px] border border-cappuccino/40 bg-cream-light p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-espresso">
            <Lock size={18} className="text-cream" />
          </div>
          <h1 className="font-playfair text-[22px] font-bold text-espresso">Admin Dashboard</h1>
          <p className="mt-1 font-dm text-[12px] text-caramel">Little Essentials — staff access only</p>
        </div>

        <label className="mb-1 block font-dm text-[12px] font-medium text-espresso">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
          className="mb-4 h-11 w-full rounded-[8px] border border-cappuccino bg-cream px-3 font-dm text-[13px] text-espresso outline-none focus:border-mocha"
          placeholder="you@example.com"
        />

        <label className="mb-1 block font-dm text-[12px] font-medium text-espresso">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="mb-5 h-11 w-full rounded-[8px] border border-cappuccino bg-cream px-3 font-dm text-[13px] text-espresso outline-none focus:border-mocha"
          placeholder="••••••••"
        />

        {error && (
          <div className="mb-4 rounded-[6px] border border-red-200 bg-red-50 p-2.5 font-dm text-[12px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-mocha font-dm text-[13px] font-medium text-cream transition-colors hover:bg-espresso disabled:opacity-70"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : null}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </main>
  )
}
