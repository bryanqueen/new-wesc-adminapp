"use client"

import { Upload, X, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"

interface CoverImageUploadProps {
  onUpload: (url: string) => void
  onDelete: () => void
  value?: string
  className?: string
}

export function CoverImageUpload({ onUpload, onDelete, value, className }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)

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
    disabled: isUploading,
  })

  const handleReplace = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          setIsUploading(true)
          setError(null)
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
          console.error("Replace error:", error)
          setError("Failed to replace image. Please try again.")
        } finally {
          setIsUploading(false)
        }
      }
    }
    input.click()
  }

  const handleDelete = () => {
    onDelete()
    setShowOptions(false)
  }

  if (value) {
    return (
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <div className="relative w-full h-full">
          <Image src={value || "/placeholder.svg"} alt="Cover image" fill className="object-cover rounded-lg" />

          {/* Overlay with options */}
          {showOptions && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center space-x-3 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReplace}
                disabled={isUploading}
                className="bg-white/90 hover:bg-white text-black"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading}
                className="bg-red-500/90 hover:bg-red-500 text-white"
              >
                <X className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                Uploading...
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-200"
        } ${className}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Cover Image</h3>
        <p className="text-sm text-gray-500">
          {isUploading
            ? "Uploading..."
            : isDragActive
              ? "Drop the cover image here"
              : "Click or drag to upload a cover image"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Recommended: 1200x630px or 16:9 aspect ratio</p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
