import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import OTP from '@/models/OTP'
import { verifyOTP, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, otp } = await request.json()

    await dbConnect()
    const user = await User.findOne({ username })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const otpRecord = await OTP.findOne({ user: user._id }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    const otpValid = await verifyOTP(otpRecord.otp, otp)

    if (!otpValid) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    }

    const currentTime = new Date()
    if (currentTime > otpRecord.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 401 })
    }

    await OTP.deleteOne({ _id: otpRecord._id })

    const token = generateToken(user._id.toString())

    const response = NextResponse.json({ message: 'OTP verified successfully' })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

