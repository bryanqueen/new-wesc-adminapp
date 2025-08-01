"use client"

import { Upload } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  onUpload: (url: string) => void
  value?: string
  className?: string
}

export function ImageUpload({ onUpload, value, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true)
        setError(null)
        const file = acceptedFiles[0]
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const { url } = await response.json()
        onUpload(url)
      } catch (error) {
        console.error("Upload error:", error)
        setError("Failed to upload image. Please try again.")
      } finally {
        setIsUploading(false)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
  })

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative w-full h-full">
          <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover rounded-lg" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${
            isDragActive ? "border-primary" : "border-gray-200"
          } ${className}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            {isUploading ? "Uploading..." : isDragActive ? "Drop the image here" : "Click or drag to upload an image"}
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
