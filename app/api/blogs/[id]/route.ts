import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Blog from '@/models/Blog'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

interface RequestContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  context: RequestContext
) {
  try {
    await dbConnect()
    const blog = await Blog.findById(context.params.id).populate('author', 'username')

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: RequestContext
) {
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

    const { title, content } = await request.json()

    await dbConnect()
    const blog = await Blog.findByIdAndUpdate(
      context.params.id,
      { title, content, updatedAt: new Date() },
      { new: true }
    )

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: RequestContext
) {
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
    const blog = await Blog.findByIdAndDelete(context.params.id)

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}