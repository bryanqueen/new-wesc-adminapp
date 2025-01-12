import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Blog from '@/models/Blog'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    await dbConnect()
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username')

    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
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

    const { title, content, coverImage } = await request.json()

    if (!title || !content || !coverImage) {
      return NextResponse.json(
        { error: 'Title, content, and cover image are required' }, 
        { status: 400 }
      )
    }

    await dbConnect()
    const blog = await Blog.create({
      title,
      content,
      coverImage,
      author: payload.userId,
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

