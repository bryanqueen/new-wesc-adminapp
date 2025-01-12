import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { EmailTemplate } from '@/components/email/otp-template'
import { generateOTP, hashOTP, verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import OTP from '@/models/OTP'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
    
    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json({ 
        error: 'Invalid request body' 
      }, { status: 400 })
    }

    const { username, password } = body
    console.log('Login attempt for username:', username)

    if (!username || !password) {
      return NextResponse.json({ 
        error: 'Username and password are required' 
      }, { status: 400 })
    }

    await dbConnect()

    try {
      const user = await User.findOne({ username }).select('_id username password')

      console.log('User lookup result:', user ? `found user with ID ${user._id}` : 'not found')

      if (!user) {
        // Create new user with OTP flow
        const otp = generateOTP()
        const hashedOTP = await hashOTP(otp)
        const hashedPassword = await hashPassword(password)

        const newUser = await User.create({
          username,
          password: hashedPassword,
        })

        await OTP.create({
          otp: hashedOTP,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          user: newUser._id,
        })

        console.log('New user created:', {
          id: newUser._id,
          username: newUser.username
        })

        await resend.emails.send({
          from: `WESC Admin <noreply@wescng.com>`,
          to: [process.env.ADMIN_EMAIL_FROM!],
          subject: 'Your Login OTP',
          react: EmailTemplate({ otp }),
        })

        return NextResponse.json({ 
          message: 'OTP sent successfully',
          requiresOTP: true
        })
      }

      // Verify password for existing user
      console.log('Verifying password for user:', user._id)
      const passwordValid = await verifyPassword(user.password, password)
      console.log('Password verification result:', passwordValid)

      if (!passwordValid) {
        return NextResponse.json({ 
          error: 'Invalid credentials' 
        }, { status: 401 })
      }

      try {
        const userId = user._id.toString()
        console.log('Generating token for user ID:', userId)
        
        const token = generateToken(userId)
        console.log('Token generated successfully')
        
        const response = NextResponse.json({ 
          message: 'Login successful',
          user: { 
            id: user._id, 
            username: user.username 
          }
        })
        
        response.cookies.set('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24
        })
        
        return response
      } catch (tokenError) {
        console.error('Token generation failed:', tokenError)
        return NextResponse.json({ 
          error: 'Authentication failed',
          details: tokenError instanceof Error ? tokenError.message : 'Unknown error'
        }, { status: 500 })
      }

    } catch (dbError) {
      console.error('Database operation failed:', dbError)
      return NextResponse.json({ 
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

