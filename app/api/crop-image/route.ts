import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { writeFile } from "fs/promises"
import { join } from "path"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, crop } = await req.json()

    if (!imageUrl || !crop) {
      return NextResponse.json({ error: "Missing imageUrl or crop parameters" }, { status: 400 })
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // Crop the image using Sharp
    const croppedBuffer = await sharp(Buffer.from(imageBuffer))
      .extract({
        left: Math.round(crop.x),
        top: Math.round(crop.y),
        width: Math.round(crop.width),
        height: Math.round(crop.height),
      })
      .png()
      .toBuffer()

    // Save the cropped image
    const filename = `cropped-${nanoid()}.png`
    const filepath = join(process.cwd(), "public", "uploads", filename)
    
    await writeFile(filepath, croppedBuffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error cropping image:", error)
    return NextResponse.json({ error: "Failed to crop image" }, { status: 500 })
  }
}