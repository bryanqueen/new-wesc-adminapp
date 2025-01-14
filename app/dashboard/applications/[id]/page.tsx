'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface Application {
  id: string
  applicantName: string
  createdAt: string
  programme: {
    id: string
    title: string
  }
  formData: Record<string, any>
}

export default function ApplicationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [application, setApplication] = useState<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/')
    } else {
      fetchApplicationDetails()
    }
  }, [user, router, params])

  const fetchApplicationDetails = async () => {
    try {
      const response = await fetch(`/api/applications/${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch application details')
      }
      const data: Application = await response.json()
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application details:', error)
      toast({
        title: 'Failed to load application details',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  }

  if (!application) {
    return <div>Application not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={() => router.back()} className="mb-4">Back to Applications</Button>
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Applicant Name:</strong> {application.applicantName}</p>
          <p><strong>Programme:</strong> {application.programme.title}</p>
          <p><strong>Submitted on:</strong> {new Date(application.createdAt).toLocaleString()}</p>
          <h3 className="text-lg font-semibold mt-4 mb-2">Form Data:</h3>
          {Object.entries(application.formData).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {JSON.stringify(value)}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

