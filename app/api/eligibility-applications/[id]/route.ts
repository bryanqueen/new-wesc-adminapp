import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db"
import EligibilityApplication from "@/models/EligibilityApplication"
import { verifyToken } from "@/lib/auth"

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if(!token) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const payload = verifyToken(token)
    if(!payload) {
        return NextResponse.json({error: 'Invalid Token'}, {status: 401})
    }

    await dbConnect()
    const application = await EligibilityApplication.findByIdAndDelete(id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Application deleted successfully" })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

