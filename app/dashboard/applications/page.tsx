"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Loader2, Search, X } from "lucide-react"
import { extractApplicantName } from "@/lib/utils/name-extractor"
import { searchApplications, type SearchableApplication } from "@/lib/utils/search-utils"

interface Application {
  _id: string
  applicantName: string
  createdAt: string
  formData: Record<string, any>
  programmeId?: {
    _id: string
    title: string
  }
  seen: boolean
}

interface GroupedApplications {
  [programmeId: string]: {
    programmeTitle: string
    applications: Application[]
  }
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

const SearchResultCard = ({
  application,
  onViewDetails,
  onMarkAsSeen,
  onDelete,
}: {
  application: Application
  onViewDetails: (app: Application) => void
  onMarkAsSeen: (id: string) => void
  onDelete: (id: string) => void
}) => {
  const displayName = extractApplicantName(application.formData)

  return (
    <Card className="hover:bg-secondary/10 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Programme: {application.programmeId?.title || "Unknown Programme"}
            </p>
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
            <Button onClick={() => onViewDetails(application)} variant="outline" size="sm">
              View Details
            </Button>
            {!application.seen && (
              <Button onClick={() => onMarkAsSeen(application._id)} variant="outline" size="sm">
                Mark as Seen
              </Button>
            )}
            <Button onClick={() => onDelete(application._id)} variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

export default function ApplicationsPage() {
  const [groupedApplications, setGroupedApplications] = useState<GroupedApplications>({})
  const [allApplications, setAllApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Application[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/applications")
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }
      const applications: Application[] = await response.json()

      // Store all applications for search
      setAllApplications(applications)

      const grouped = applications.reduce((acc, app) => {
        if (!app.programmeId || !app.programmeId._id) {
          console.warn("Skipping application with missing programmeId:", app)
          return acc
        }
        if (!acc[app.programmeId._id]) {
          acc[app.programmeId._id] = {
            programmeTitle: app.programmeId.title || "Unknown Programme",
            applications: [],
          }
        }
        acc[app.programmeId._id].applications.push(app)
        return acc
      }, {} as GroupedApplications)

      setGroupedApplications(grouped)
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

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const results = searchApplications(allApplications as SearchableApplication[], searchTerm)
    setSearchResults(results)
    setIsSearching(false)
  }, [searchTerm, allApplications])

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const handleMarkAsSeen = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/seen`, {
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
      const response = await fetch(`/api/applications/${applicationId}`, {
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

  const handleSearchClose = () => {
    setIsSearchOpen(false)
    setSearchTerm("")
    setSearchResults([])
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Applications</h1>
          <Button onClick={() => setIsSearchOpen(true)} variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search Applications
          </Button>
        </div>

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
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{programmeTitle}</span>
                    <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {applications.length} application{applications.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    {applications.map((application) => {
                      const displayName = extractApplicantName(application.formData)
                      return (
                        <Card key={application._id} className="hover:bg-secondary/10 transition-colors">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{displayName}</CardTitle>
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
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Search Dialog */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Search Applications</DialogTitle>
                {/* <Button variant="ghost" size="sm" onClick={handleSearchClose}>
                  <X className="h-4 w-4" />
                </Button> */}
              </div>
            </DialogHeader>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by applicant name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : searchTerm.trim() && searchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No applications found for "{searchTerm}"</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Found {searchResults.length} application{searchResults.length !== 1 ? "s" : ""} matching "
                      {searchTerm}"
                    </p>
                    {searchResults.map((application) => (
                      <SearchResultCard
                        key={application._id}
                        application={application}
                        onViewDetails={handleViewApplication}
                        onMarkAsSeen={handleMarkAsSeen}
                        onDelete={handleDeleteApplication}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Start typing to search by applicant name...
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Details Modal */}
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
                      Name: {extractApplicantName(selectedApplication.formData)}
                    </p>
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
