"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface CropImageDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (croppedImageUrl: string) => void
  imageUrl: string
}

export function CropImageDialog({ open, onClose, onConfirm, imageUrl }: CropImageDialogProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState({ x: 0, y: 0, width: 100, height: 100 })
  const [imageLoaded, setImageLoaded] = React.useState(false)

  React.useEffect(() => {
    if (open && imageUrl) {
      setImageLoaded(false)
      setCrop({ x: 0, y: 0, width: 100, height: 100 })
    }
  }, [open, imageUrl])

  const handleImageLoad = () => {
    setImageLoaded(true)
    if (imageRef.current) {
      const img = imageRef.current
      setCrop({
        x: 0,
        y: 0,
        width: Math.min(img.naturalWidth, 300),
        height: Math.min(img.naturalHeight, 300),
      })
    }
  }

  const handleImageError = () => {
    console.error("Failed to load image for cropping")
    setImageLoaded(false)
  }

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = imageRef.current

    if (!ctx) return

    try {
      // Set canvas size to crop dimensions
      canvas.width = crop.width
      canvas.height = crop.height

      // Draw the cropped portion
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

      // Convert to blob and upload
      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          const formData = new FormData()
          formData.append("file", blob, "cropped-image.png")

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const { url } = await response.json()
          onConfirm(url)
          onClose()
        } catch (error) {
          console.error("Error uploading cropped image:", error)
          // You might want to show a toast notification here
        }
      }, "image/png")
    } catch (error) {
      console.error("Error cropping image (CORS issue):", error)

      // Fallback: If CORS fails, we can't crop the image directly
      // Instead, we could send the crop parameters to the server
      try {
        const response = await fetch("/api/crop-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
            crop: crop,
          }),
        })

        if (!response.ok) {
          throw new Error("Server-side crop failed")
        }

        const { url } = await response.json()
        onConfirm(url)
        onClose()
      } catch (serverError) {
        console.error("Server-side crop also failed:", serverError)
        // Show error message to user
        alert(
          "Unable to crop image due to CORS restrictions. Please try uploading the image again or use a different image.",
        )
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative max-h-96 overflow-hidden rounded-lg border">
            <img
              ref={imageRef}
              src={imageUrl || "/placeholder.svg"}
              alt="Image to crop"
              className="max-w-full h-auto"
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
              style={{ display: imageLoaded ? "block" : "none" }}
            />
            {imageLoaded && imageRef.current && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: `${(crop.x / imageRef.current.naturalWidth) * 100}%`,
                  top: `${(crop.y / imageRef.current.naturalHeight) * 100}%`,
                  width: `${(crop.width / imageRef.current.naturalWidth) * 100}%`,
                  height: `${(crop.height / imageRef.current.naturalHeight) * 100}%`,
                }}
              />
            )}
          </div>

          {imageLoaded && imageRef.current && (
            <div className="space-y-4">
              <div>
                <Label>X Position: {crop.x}px</Label>
                <Slider
                  value={[crop.x]}
                  onValueChange={([x]) => setCrop({ ...crop, x })}
                  max={imageRef.current.naturalWidth - crop.width}
                  step={1}
                />
              </div>
              <div>
                <Label>Y Position: {crop.y}px</Label>
                <Slider
                  value={[crop.y]}
                  onValueChange={([y]) => setCrop({ ...crop, y })}
                  max={imageRef.current.naturalHeight - crop.height}
                  step={1}
                />
              </div>
              <div>
                <Label>Width: {crop.width}px</Label>
                <Slider
                  value={[crop.width]}
                  onValueChange={([width]) => setCrop({ ...crop, width })}
                  min={50}
                  max={imageRef.current.naturalWidth - crop.x}
                  step={1}
                />
              </div>
              <div>
                <Label>Height: {crop.height}px</Label>
                <Slider
                  value={[crop.height]}
                  onValueChange={([height]) => setCrop({ ...crop, height })}
                  min={50}
                  max={imageRef.current.naturalHeight - crop.y}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!imageLoaded}>
            Crop Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
