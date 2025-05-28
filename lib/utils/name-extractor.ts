/**
 * Extracts the applicant's name from form data with flexible key matching
 * Priority: Full Name > First Name + Middle Name + Last Name/Surname
 */
export function extractApplicantName(formData: Record<string, any>): string {
    if (!formData || typeof formData !== "object") {
      return "Unknown Applicant"
    }
  
    // Convert all keys to lowercase for case-insensitive matching
    const lowerCaseData: Record<string, any> = {}
    Object.keys(formData).forEach((key) => {
      lowerCaseData[key.toLowerCase()] = formData[key]
    })
  
    // First priority: Look for "Full Name" variations
    const fullNameKeys = ["full name", "fullname", "name", "applicant name", "applicantname"]
  
    for (const key of fullNameKeys) {
      if (lowerCaseData[key] && typeof lowerCaseData[key] === "string" && lowerCaseData[key].trim()) {
        return lowerCaseData[key].trim()
      }
    }
  
    // Second priority: Combine first, middle, and last names
    const firstNameKeys = ["first name", "firstname", "given name", "givenname"]
    const middleNameKeys = ["middle name", "middlename", "middle initial", "middleinitial"]
    const lastNameKeys = ["last name", "lastname", "surname", "family name", "familyname"]
  
    let firstName = ""
    let middleName = ""
    let lastName = ""
  
    // Find first name
    for (const key of firstNameKeys) {
      if (lowerCaseData[key] && typeof lowerCaseData[key] === "string" && lowerCaseData[key].trim()) {
        firstName = lowerCaseData[key].trim()
        break
      }
    }
  
    // Find middle name
    for (const key of middleNameKeys) {
      if (lowerCaseData[key] && typeof lowerCaseData[key] === "string" && lowerCaseData[key].trim()) {
        middleName = lowerCaseData[key].trim()
        break
      }
    }
  
    // Find last name
    for (const key of lastNameKeys) {
      if (lowerCaseData[key] && typeof lowerCaseData[key] === "string" && lowerCaseData[key].trim()) {
        lastName = lowerCaseData[key].trim()
        break
      }
    }
  
    // Combine available name parts
    const nameParts = [firstName, middleName, lastName].filter((part) => part.length > 0)
  
    if (nameParts.length > 0) {
      return nameParts.join(" ")
    }
  
    // Fallback: Try to find any field that might contain a name
    const possibleNameKeys = Object.keys(lowerCaseData).filter(
      (key) =>
        key.includes("name") && lowerCaseData[key] && typeof lowerCaseData[key] === "string" && lowerCaseData[key].trim(),
    )
  
    if (possibleNameKeys.length > 0) {
      return lowerCaseData[possibleNameKeys[0]].trim()
    }
  
    return "Unknown Applicant"
  }
  