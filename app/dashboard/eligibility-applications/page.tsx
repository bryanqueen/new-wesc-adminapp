"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Loader2 } from "lucide-react"

interface EligibilityApplication {
  _id: string
  applicantName: string
  createdAt: string
  formData: Record<string, any>
  seen: boolean
}

const FormDataViewer = ({ data }: { data: Record<string, any> }) => {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="border-b pb-2">
          <div className="text-sm font-medium text-muted-foreground">{key}</div>
          <div className="mt-1">
            {Array.isArray(value) ? (
              value.map((item, index) => (
                <div key={index} className="text-sm">
                  {item}
                </div>
              ))
            ) : (
              <div className="text-sm">{String(value)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function EligibilityApplicationsPage() {
  const [applications, setApplications] = useState<EligibilityApplication[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<EligibilityApplication | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/eligibility-applications")
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }
      const fetchedApplications: EligibilityApplication[] = await response.json()
      setApplications(fetchedApplications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Failed to load applications",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleViewApplication = (application: EligibilityApplication) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleMarkAsSeen = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/eligibility-applications/${applicationId}/seen`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to mark application as seen")
      }

      fetchApplications()
      toast({
        title: "Application marked as seen",
        variant: "default",
      })
    } catch (error) {
      console.error("Error marking application as seen:", error)
      toast({
        title: "Failed to mark application as seen",
        variant: "destructive",
      })
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/eligibility-applications/${applicationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete application")
      }

      fetchApplications()
      toast({
        title: "Application deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error("Error deleting application:", error)
      toast({
        title: "Failed to delete application",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Eligibility Applications</h1>
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No eligibility applications have been submitted yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application._id} className="hover:bg-secondary/10 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      {/* <CardTitle className="text-lg">{application.applicantName}</CardTitle> */}
                      <p className="text-sm text-muted-foreground">
                        Submitted on: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                      {application.seen && (
                        <Badge variant="outline" className="mt-1">
                          Seen
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => handleViewApplication(application)} variant="outline">
                        View Details
                      </Button>
                      {!application.seen && (
                        <Button onClick={() => handleMarkAsSeen(application._id)} variant="outline">
                          Mark as Seen
                        </Button>
                      )}
                      <Button onClick={() => handleDeleteApplication(application._id)} variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Applicant Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted on: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <FormDataViewer data={selectedApplication.formData} />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

