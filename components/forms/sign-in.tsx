'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"

export function SignIn() {
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: ''
  })
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (!isOtpSent) {
        console.log('Attempting login with:', { username: formData.username.trim() })
        
        const result = await login(formData.username.trim(), formData.password.trim())

        if (result.requiresOTP) {
          setIsOtpSent(true)
          toast.success('OTP has been sent to your email')
        } else if (result.success) {
          toast.success('Login successful')
          router.push('/dashboard')
        } else {
          throw new Error(result.error || 'Login failed')
        }
      } else {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            otp: formData.otp
          })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'OTP verification failed')
        }

        const data = await response.json()
        
        if (response.ok) {
          toast.success('Verification successful')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username }),
      })

      if (response.ok) {
        toast.success('New OTP has been sent to your email')
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">WESC Admin</h1>
          <p className="text-gray-500 mt-2">Access your admin dashboard</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              {isOtpSent ? 'Enter the OTP sent to your email' : 'Enter your credentials to sign in'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isOtpSent ? (
                <>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    required
                  />
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : isOtpSent ? 'Verify OTP' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {isOtpSent && (
              <Button variant="link" onClick={handleResendOTP} disabled={isLoading}>
                Resend OTP
              </Button>
            )}
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

