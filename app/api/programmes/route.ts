import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Programme from '@/models/Programme'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    await dbConnect()
    const programmes = await Programme.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')

    return NextResponse.json(programmes)
  } catch (error) {
    console.error('Error fetching programmes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { title, description, coverImage, content, form } = await request.json()

    await dbConnect()
    const programme = await Programme.create({
      title,
      description,
      coverImage,
      content,
      form,
      author: payload.userId,
    })

    return NextResponse.json(programme, { status: 201 })
  } catch (error) {
    console.error('Error creating programme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

