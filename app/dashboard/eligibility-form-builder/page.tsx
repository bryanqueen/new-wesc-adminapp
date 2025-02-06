"use client"

import { useState, useEffect } from "react"
import { FormBuilder } from "@/components/programme-editor/form-builder"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  sections: Array<{
    id: string
    title: string
    description?: string
    fields: Array<{
      id: string
      type: "text" | "email" | "number" | "select" | "checkbox" | "tel" | "date" | "file" | "textarea" | "radio"
      label: string
      placeholder?: string
      helpText?: string
      options?: string[]
      required: boolean
      validation?: {
        minLength?: number
        maxLength?: number
        pattern?: string
        customError?: string
      }
    }>
  }>
  settings?: {
    submitButtonText: string
    successMessage: string
    enableEmailNotifications: boolean
    notificationEmail?: string
  }
}

export default function EligibilityFormBuilderPage() {
  const [form, setForm] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const defaultEligibilityForm: FormData = {
    sections: [
      {
        id: "personal-info",
        title: "Personal Information",
        description: "Please provide your basic personal details",
        fields: [
          {
            id: "full-name",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true,
            validation: {
              minLength: 2,
              maxLength: 100
            }
          },
          {
            id: "email",
            type: "email",
            label: "Email Address",
            placeholder: "Enter your email address",
            required: true
          },
          {
            id: "phone",
            type: "tel",
            label: "Phone Number",
            placeholder: "Enter your phone number",
            required: true
          }
        ]
      },
      {
        id: "education",
        title: "Educational Background",
        description: "Tell us about your educational qualifications",
        fields: [
          {
            id: "highest-qualification",
            type: "select",
            label: "Highest Qualification",
            required: true,
            options: ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other"]
          },
          {
            id: "institution",
            type: "text",
            label: "Institution Name",
            placeholder: "Enter your institution name",
            required: true
          },
          {
            id: "graduation-year",
            type: "number",
            label: "Year of Graduation",
            placeholder: "YYYY",
            required: true
          }
        ]
      }
    ],
    settings: {
      submitButtonText: "Submit Application",
      successMessage: "Your eligibility application has been submitted successfully!",
      enableEmailNotifications: false
    }
  } as const;

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch("/api/eligibility-form")
        if (response.ok) {
          const data = await response.json()
          setForm(data)
        } else {
          // If no form exists, initialize with a default structure
          setForm(defaultEligibilityForm)
        }
      } catch (error) {
        console.error("Error fetching form:", error)
        toast({
          title: "Error",
          description: "Failed to load the existing form. Starting with a new form.",
          variant: "destructive",
        })
        // Initialize with a default structure in case of error
        setForm(defaultEligibilityForm)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForm()
  }, [])

  const handleFormChange = (updatedForm: FormData) => {
    setForm(updatedForm)
  }

  const handleSaveForm = async () => {
    if (!form) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/eligibility-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error("Failed to save form")
      }

      toast({
        title: "Success",
        description: "Eligibility form has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving form:", error)
      toast({
        title: "Error",
        description: "Failed to save the eligibility form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      router.push('/dashboard')
    }
  }

// In page.tsx, before the return statement
if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }
  
  // Initialize form with defaultEligibilityForm if it's null
  const currentForm = form || defaultEligibilityForm;
  
  console.log('Form data being passed to FormBuilder:', currentForm);
  
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-6">Eligibility Form Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <FormBuilder form={currentForm} onChange={handleFormChange} />
            <Button onClick={handleSaveForm} className="mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Form"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

