import { useCallback, useState } from 'react'

const TOKEN_KEY = 'le_admin_token'
const EMAIL_KEY = 'le_admin_email'

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Admin authentication hook. Talks to /api/admin/login and stores a
 * short-lived session token in localStorage.
 */
export function useAdminAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (emailInput, password) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Login failed')
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(EMAIL_KEY, data.email)
      setToken(data.token)
      setEmail(data.email)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setToken(null)
    setEmail(null)
  }, [])

  return {
    token,
    email,
    isAuthenticated: Boolean(token),
    loading,
    error,
    login,
    logout,
  }
}
