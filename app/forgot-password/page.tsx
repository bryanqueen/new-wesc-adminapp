'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
 const [username, setUsername] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const { toast } = useToast()
 const router = useRouter()

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   setIsLoading(true)
   try {
     const response = await fetch('/api/auth/forgot-password', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username }),
     })

     if (response.ok) {
       toast({
         title: "Reset Email Sent",
         description: "If an account exists with this email, you will receive password reset instructions.",
       })
       router.push('/')
     } else {
       const error = await response.json()
       throw new Error(error.error)
     }
   } catch (error) {
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to send reset email",
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="min-h-screen flex items-center justify-center">
     <Card className="w-full max-w-md">
       <CardHeader>
         <CardTitle>Forgot Password</CardTitle>
         <CardDescription>Enter your email to reset your password</CardDescription>
       </CardHeader>
       <form onSubmit={handleSubmit}>
         <CardContent>
           <Input
             type="email"
             placeholder="Email"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
           />
         </CardContent>
         <CardFooter>
           <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading ? "Sending..." : "Send Reset Link"}
           </Button>
         </CardFooter>
       </form>
     </Card>
   </div>
 )
}

