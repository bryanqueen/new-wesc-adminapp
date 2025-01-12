import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function loadUserFromSession() {
      try {
        const res = await fetch('/api/auth/sessions')
        if (!mounted) return

        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        } else {
          setUser(null)
          if (window.location.pathname.startsWith('/dashboard')) {
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Failed to load user session:', error)
        setUser(null)
        if (window.location.pathname.startsWith('/dashboard')) {
          router.push('/')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadUserFromSession()

    return () => {
      mounted = false
    }
  }, [router])

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.requiresOTP) {
          return { success: false, requiresOTP: true }
        } else {
          setUser(data.user)
          return { success: true }
        }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return { user, loading, login, logout }
}