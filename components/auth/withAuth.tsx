import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function withAuth<T extends object>(WrappedComponent: React.ComponentType<T>) {
  return function WithAuth(props: T) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        console.log('No user found in withAuth, redirecting to /')
        router.push('/')
      }
    }, [user, loading, router])

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    // If no user and not loading, render nothing while redirect happens
    if (!user) {
      return null
    }

    // If we have a user, render the component
    return <WrappedComponent {...props} />
  }
}