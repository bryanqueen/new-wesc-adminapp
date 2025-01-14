// import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Blog from '@/models/Blog'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    await dbConnect()
    const blog = await Blog.findById(id).populate('author', 'username')

    if (!blog) {
      return Response.json({ error: 'Blog not found' }, { status: 404 })
    }

    return Response.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  {params}: {params: Promise<{id: string}> }
) {
  const id = (await params).id
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { title, content } = await request.json()

    await dbConnect()
    const blog = await Blog.findByIdAndUpdate(
      id,
      { title, content, updatedAt: new Date() },
      { new: true }
    )

    if (!blog) {
      return Response.json({ error: 'Blog not found' }, { status: 404 })
    }

    return Response.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const id = (await params).id
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    await dbConnect()
    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
      return Response.json({ error: 'Blog not found' }, { status: 404 })
    }

    return Response.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

