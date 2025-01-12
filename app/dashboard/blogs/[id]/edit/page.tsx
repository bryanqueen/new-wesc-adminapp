'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from "@/components/dashboard/layout"
import { BlogEditor } from "@/components/blog-editor/editor"
import { toast } from "@/hooks/use-toast"

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch blog')
        }
        const data = await response.json()
        setBlog(data)
      } catch (error) {
        console.error('Error fetching blog:', error)
        toast({
          title: "Error",
          description: "Failed to fetch blog post",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [params.id, toast])

  const handleSave = async (blogData: { title: string, coverImage: string, content: any[] }) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog')
      }

      toast({
        title: "Success",
        description: "Blog post updated successfully",
      })
      router.push('/admin/dashboard/blogs')
    } catch (error) {
      console.error('Error updating blog:', error)
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!blog) {
    return <div>Blog not found</div>
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      <BlogEditor initialBlog={blog} onSave={handleSave} />
    </DashboardLayout>
  )
}

