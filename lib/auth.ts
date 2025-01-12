import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'
import { sign, verify } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import OTP from '@/models/OTP'
import dbConnect from './db'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
  if (!hashedPassword || !plainPassword) {
    console.error('Invalid password provided for verification')
    return false
  }

  try {
    const isValid = await bcrypt.compare(plainPassword, hashedPassword)
    console.log('Password verification result:', isValid)
    return isValid
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

export function generateOTP(): string {
  return randomBytes(3).toString('hex').toUpperCase()
}

export async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10)
}

export async function verifyOTP(hashedOTP: string, plainOTP: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainOTP, hashedOTP)
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return false
  }
}

export function generateToken(userId: string): string {
  console.log('generateToken called with userId:', userId)
  
  if (!userId || typeof userId !== 'string') {
    console.error('Invalid userId provided:', userId)
    throw new Error('Invalid user ID provided')
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('Invalid JWT_SECRET configuration')
    throw new Error('JWT_SECRET is not properly configured')
  }

  try {
    const payload = {
      sub: userId,
      userId: userId,
      iat: Math.floor(Date.now() / 1000)
    }
    
    console.log('Token payload before signing:', payload)

    const token = sign(payload, secret)
    console.log('Token generated successfully')
    
    return token
  } catch (error) {
    console.error('Token generation error:', error)
    throw error
  }
}

export function verifyToken(token: string): { userId: string } | null {
  if (!token) {
    console.error('No token provided for verification')
    return null
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = verify(token, secret) as { userId: string }
    console.log('Token verified successfully:', decoded)
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function getUserFromToken(token: string) {
  console.log('Getting user from token:', token?.substring(0, 10) + '...')
  
  const payload = verifyToken(token)
  if (!payload) {
    console.log('No valid payload from token')
    return null
  }

  try {
    await dbConnect()
    const user = await User.findById(payload.userId).select('id username')
    console.log('User retrieved from token:', user?._id)
    return user
  } catch (error) {
    console.error('Error fetching user from token:', error)
    return null
  }
}

