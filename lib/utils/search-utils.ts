import { extractApplicantName } from "./name-extractor"

export interface SearchableApplication {
  _id: string
  applicantName: string
  createdAt: string
  formData: Record<string, any>
  seen: boolean
  programmeId?: {
    _id: string
    title: string
  }
}

/**
 * Searches through applications based only on the extracted applicant name
 */
export function searchApplications(applications: SearchableApplication[], searchTerm: string): SearchableApplication[] {
  if (!searchTerm.trim()) {
    return applications
  }

  const term = searchTerm.toLowerCase().trim()

  return applications.filter((application) => {
    // Search only in extracted applicant name
    const applicantName = extractApplicantName(application.formData).toLowerCase()
    return applicantName.includes(term)
  })
}
