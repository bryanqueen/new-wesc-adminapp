'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard/layout"

interface Application {
  id: string
  applicantName: string
  createdAt: string
  programme: {
    id: string
    title: string
  }
}

interface GroupedApplications {
  [programmeId: string]: {
    programmeTitle: string
    applications: Application[]
  }
}

// Dummy data
const dummyGroupedApplications: GroupedApplications = {
  "prog1": {
    programmeTitle: "Medical Residency",
    applications: [
      { id: "app1", applicantName: "John Doe", createdAt: "2023-05-15T10:30:00Z", programme: { id: "prog1", title: "Medical Residency" } },
      { id: "app2", applicantName: "Jane Smith", createdAt: "2023-05-16T14:45:00Z", programme: { id: "prog1", title: "Medical Residency" } },
    ]
  },
  "prog2": {
    programmeTitle: "Nursing Scholarship",
    applications: [
      { id: "app3", applicantName: "Alice Johnson", createdAt: "2023-05-17T09:15:00Z", programme: { id: "prog2", title: "Nursing Scholarship" } },
      { id: "app4", applicantName: "Bob Williams", createdAt: "2023-05-18T11:00:00Z", programme: { id: "prog2", title: "Nursing Scholarship" } },
    ]
  }
}

export default function ApplicationsPage() {
  const [groupedApplications, setGroupedApplications] = useState<GroupedApplications>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  

  useEffect(() => {
  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/applications')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      const applications: Application[] = await response.json()
      
      const grouped = applications.reduce((acc, app) => {
        if (!acc[app.programme.id]) {
          acc[app.programme.id] = {
            programmeTitle: app.programme.title,
            applications: []
          }
        }
        acc[app.programme.id].applications.push(app)
        return acc
      }, {} as GroupedApplications)

      setGroupedApplications(grouped)
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: 'Failed to load applications',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])



  const handleViewApplication = (applicationId: string) => {
    router.push(`/dashboard/applications/${applicationId}`)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Applications</h1>
        {Object.keys(groupedApplications).length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No applications are submitted yet.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedApplications).map(([programmeId, { programmeTitle, applications }]) => (
              <AccordionItem key={programmeId} value={programmeId}>
                <AccordionTrigger>{programmeTitle}</AccordionTrigger>
                <AccordionContent>
                  {applications.map((application) => (
                    <Card key={application.id} className="mb-4">
                      <CardHeader>
                        <CardTitle>{application.applicantName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Submitted on: {new Date(application.createdAt).toLocaleDateString()}</p>
                        <Button 
                          onClick={() => handleViewApplication(application.id)}
                          className="mt-2"
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </DashboardLayout>
  )
}

