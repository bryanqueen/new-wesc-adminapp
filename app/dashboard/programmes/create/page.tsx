'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard/layout"
import { ProgrammeEditor } from "@/components/programme-editor/editor"
import { toast } from "@/hooks/use-toast"

export default function CreateProgrammePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (programmeData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/programmes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programmeData),
      })

      if (!response.ok) {
        throw new Error('Failed to create programme')
      }

      toast({
        title: "Success",
        description: "Programme created successfully",
      })
      router.push('/dashboard/programmes')
    } catch (error) {
      console.error('Error creating programme:', error)
      toast({
        title: "Error",
        description: "Failed to create programme",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Create New Programme</h1>
      <ProgrammeEditor onSave={handleSave} />
    </DashboardLayout>
  )
}
