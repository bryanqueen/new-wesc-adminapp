'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
 const [password, setPassword] = useState('')
 const [confirmPassword, setConfirmPassword] = useState('')
 const [isLoading, setIsLoading] = useState(false)
 const { toast } = useToast()
 const router = useRouter()
 const searchParams = useSearchParams()
 const token = searchParams.get('token')

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault()
   if (password !== confirmPassword) {
     toast({
       title: "Error",
       description: "Passwords do not match",
       variant: "destructive",
     })
     return
   }

   setIsLoading(true)
   try {
     const response = await fetch('/api/auth/reset-password', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ token, newPassword: password }),
     })

     if (response.ok) {
       toast({
         title: "Password Reset Successful",
         description: "Your password has been reset. You can now log in with your new password.",
       })
       router.push('/admin/login')
     } else {
       const error = await response.json()
       throw new Error(error.error)
     }
   } catch (error) {
     toast({
       title: "Error",
       description: error instanceof Error ? error.message : "Failed to reset password",
       variant: "destructive",
     })
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="container mx-auto max-w-md mt-10">
     <Card>
       <CardHeader>
         <CardTitle>Reset Password</CardTitle>
         <CardDescription>Enter your new password</CardDescription>
       </CardHeader>
       <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
           <Input
             type="password"
             placeholder="New Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />
           <Input
             type="password"
             placeholder="Confirm New Password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             required
           />
         </CardContent>
         <CardFooter>
           <Button type="submit" className="w-full" disabled={isLoading}>
             {isLoading ? "Resetting..." : "Reset Password"}
           </Button>
         </CardFooter>
       </form>
     </Card>
   </div>
 )
}

