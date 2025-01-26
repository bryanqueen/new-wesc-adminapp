import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Application from '@/models/Application'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
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
    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .populate('programme', 'title')

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let connection;
  try {
    connection = await dbConnect();
    
    const { programmeId, formData } = await request.json();

    if (!programmeId || !formData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newApplication = new Application({
      programmeId,
      formData,
    });

    await newApplication.save();

    return NextResponse.json(
      { message: "Application submitted successfully", application: newApplication },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

