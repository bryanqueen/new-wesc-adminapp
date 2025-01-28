import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      await dbConnect();
      const id = (await params).id
  
      const application = await Application.findByIdAndUpdate(
        id,
        { seen: true },
        { new: true }
      );
  
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Application marked as seen", application }, { status: 200 });
    } catch (error) {
      console.error('Error marking application as seen:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  