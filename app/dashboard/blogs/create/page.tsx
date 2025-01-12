'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard/layout"
import { BlogEditor } from "@/components/blog-editor/editor"
import { toast } from "@/hooks/use-toast"

export default function CreateBlogPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async (blogData: { title: string, coverImage: string, content: any[] }) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        throw new Error('Failed to create blog')
      }

      toast({
        title: "Success",
        description: "Blog post created successfully",
      })
      router.push('/dashboard/blogs')
    } catch (error) {
      console.error('Error creating blog:', error)
      toast({
        title: "Error",
        description: "Failed to create blog post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
      <BlogEditor onSave={handleSave} />
    </DashboardLayout>
  )
}

