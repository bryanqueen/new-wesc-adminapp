import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import EligibilityApplication from "@/models/EligibilityApplication"

export async function GET() {
  try {
    await dbConnect()
    const applications = await EligibilityApplication.find().sort({ createdAt: -1 })
    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching eligibility applications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const applicationData = await req.json()
    const newApplication = new EligibilityApplication(applicationData)
    await newApplication.save()
    return NextResponse.json({ message: "Application submitted successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error submitting eligibility application:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

