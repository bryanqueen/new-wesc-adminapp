import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import EligibilityForm from "@/models/EligibilityForm"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"


export async function GET() {
    try {
        await dbConnect()
        const form = await EligibilityForm.findOne().sort({ createdAt: -1 })
        return NextResponse.json(form)
    } catch (error) {
        console.error("Error fetching eligibility form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        await dbConnect()
        const formData = await req.json()
        //If an existing form exists, update it. Otherwise, create a new one.
        const existingForm = await EligibilityForm.findOne()
        if (existingForm) {
            Object.assign(existingForm, formData)
            await existingForm.save()
        } else {
            const newForm = new EligibilityForm(formData)
            await newForm.save()
        }

        return NextResponse.json({ message: "Form saved successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error saving eligibility form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

