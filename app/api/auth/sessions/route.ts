import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { cookies } from 'next/headers'

export async function GET() {
  console.log('Session route hit')
  
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    console.log('Auth token from cookies:', token ? 'Found' : 'Not found')

    if (!token) {
      console.log('No token found, returning 401')
      return NextResponse.json(null, { status: 401 })
    }

    console.log('Connecting to database...')
    await dbConnect()
    
    console.log('Verifying token...')
    const payload = verifyToken(token)
    console.log('Token payload:', payload)
    
    if (!payload) {
      console.log('Invalid token, returning 401')
      return NextResponse.json(null, { status: 401 })
    }

    console.log('Finding user with ID:', payload.userId)
    const user = await User.findById(payload.userId).select('_id username')
    console.log('User found:', user ? 'Yes' : 'No')

    if (!user) {
      console.log('No user found, returning 401')
      return NextResponse.json(null, { status: 401 })
    }

    console.log('Returning user data')
    return NextResponse.json({
      id: user._id,
      username: user.username
    })
  } catch (error) {
    console.error('Session verification failed:', error)
    return NextResponse.json(null, { status: 401 })
  }
}