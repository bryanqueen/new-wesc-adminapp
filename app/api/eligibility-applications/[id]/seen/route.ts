import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import EligibilityApplication from "@/models/EligibilityApplication"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if(!token) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }

    const payload = verifyToken(token)
    if(!payload) {
        return NextResponse.json({error: "Invalid token"}, {status: 401})
    }

    await dbConnect()
    const application = await EligibilityApplication.findByIdAndUpdate(id, { seen: true }, { new: true })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Application marked as seen" })
  } catch (error) {
    console.error("Error marking application as seen:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

