'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogTitle, AlertDialogHeader, AlertDialogCancel, AlertDialogAction, AlertDialogFooter, AlertDialogContent } from '@/components/ui/alert-dialog'

interface Blog {
  _id: string
  title: string
  createdAt: string
  coverImage?: string
}

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [blogToDelete, setShowBlogToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Fetch blogs from API
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs')
        if (!response.ok) throw new Error('Failed to fetch blogs')
        const blogs = await response.json()
        setBlogs(blogs)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }

    fetchBlogs()
  }, [])

  const handleEdit = (id: string) => {
    // Implement edit functionality
    router.push(`/dashboard/blogs/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    // Implement delete functionality
    setShowBlogToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async (id: string) => {
    await fetch(`/api/blogs/${id}`, { method: 'DELETE'})
    setBlogs(blogs.filter((blog) => blog._id !== id))
    setShowDeleteDialog(false)
  }

  // const handleShare = (id: string) => {
  //   // Implement share functionality
  //   console.log('Share blog:', id);
  // }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Blogs</h1>
          <Link href="/dashboard/blogs/create">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Blog
            </Button>
          </Link>
        </div>

        {blogs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No blogs found. Create your first blog post!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Card key={blog._id}>
                <CardHeader className="relative p-0">
                  <Image
                    src={blog.coverImage || '/placeholder.svg'}
                    alt={blog.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(blog._id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(blog._id)}>
                          Delete
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onSelect={() => handleShare(blog._id)}>
                          Share
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className='py-2 text-lg font-semibold'>{blog.title}</CardTitle>
                  <p className="text-sm font-semibold text-muted-foreground mt-2">
                    Created on: {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteConfirm(blogToDelete!)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

