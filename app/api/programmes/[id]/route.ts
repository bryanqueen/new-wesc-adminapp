import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Programme from '@/models/Programme'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  
  try {
    await dbConnect()
    const programme = await Programme.findById(params.id).populate('author', 'username')

    if (!programme) {
      return NextResponse.json({ error: 'Programme not found' }, { status: 404 })
    }

    return NextResponse.json(programme)
  } catch (error) {
    console.error('Error fetching programme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  
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

    const updates = await request.json()
    
    await dbConnect()
    const programme = await Programme.findByIdAndUpdate(
      params.id,
      { 
        ...updates,
        updatedAt: new Date() 
      },
      { new: true }
    ).populate('author', 'username')

    if (!programme) {
      return NextResponse.json({ error: 'Programme not found' }, { status: 404 })
    }

    return NextResponse.json(programme)
  } catch (error) {
    console.error('Error updating programme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  
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
    const programme = await Programme.findByIdAndDelete(params.id)

    if (!programme) {
      return NextResponse.json({ error: 'Programme not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Programme deleted successfully' })
  } catch (error) {
    console.error('Error deleting programme:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}