import Application from "@/models/Application";
import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      await dbConnect();
      const id = (await params).id
  
      const application = await Application.findByIdAndDelete(id);
  
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }