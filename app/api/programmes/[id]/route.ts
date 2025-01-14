// import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Programme from '@/models/Programme'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string}> }
) {
  const id = (await params).id
  
  try {
    await dbConnect()
    const programme = await Programme.findById(id).populate('author', 'username')

    if (!programme) {
      return Response.json({ error: 'Programme not found' }, { status: 404 })
    }

    return Response.json(programme)
  } catch (error) {
    console.error('Error fetching programme:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  {params}: {params: Promise<{id: string}> }
) {
  const id = (await params).id
  
  try {
    // Authentication check
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return Response.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the update data and validate it
    const updates = await request.json()
    
    // Validate that we have all required fields
    if (!updates) {
      return Response.json({ error: 'No update data provided' }, { status: 400 })
    }

    // Log the incoming data for debugging
    console.log('Incoming update data:', JSON.stringify(updates, null, 2))

    await dbConnect()

    // Explicitly construct the update object
    const updateData = {
      ...updates,
      title: updates.title?.trim(), // Trim any whitespace but keep full string
      description: updates.description,
      coverImage: updates.coverImage,
      content: updates.content,
      form: updates.form,
      updatedAt: new Date()
    }

    // Log the update data being sent to MongoDB
    console.log('Update data for MongoDB:', JSON.stringify(updateData, null, 2))

    const programme = await Programme.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return the updated document
        runValidators: true // Run model validations
      }
    ).populate('author', 'username')

    if (!programme) {
      return Response.json({ error: 'Programme not found' }, { status: 404 })
    }

    // Log the updated programme for verification
    console.log('Updated programme:', JSON.stringify(programme, null, 2))

    return Response.json(programme)
  } catch (error) {
    console.error('Error updating programme:', error)
    // More detailed error handling
    if (error instanceof Error) {
      return Response.json({ 
        error: 'Update failed', 
        details: error.message 
      }, { status: 500 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    await dbConnect()
    const programme = await Programme.findByIdAndDelete(id)

    if (!programme) {
      return Response.json({ error: 'Programme not found' }, { status: 404 })
    }

    return Response.json({ message: 'Programme deleted successfully' })
  } catch (error) {
    console.error('Error deleting programme:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}