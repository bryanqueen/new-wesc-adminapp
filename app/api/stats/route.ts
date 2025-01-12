import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Blog from '@/models/Blog'
import Programme from '@/models/Programme'
import Application from '@/models/Application'

export async function GET() {
  try {
    await dbConnect()
    const [blogCount, programmeCount, applicationCount] = await Promise.all([
      Blog.countDocuments(),
      Programme.countDocuments(),
      Application.countDocuments(),
    ])

    return NextResponse.json({ blogCount, programmeCount, applicationCount })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

