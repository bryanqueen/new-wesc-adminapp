'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/dashboard/layout";
import { BlogEditor } from "@/components/blog-editor/editor";
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<string | null>(null); // For storing the unwrapped ID
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params; // Unwrap the promise
      setId(id); // Store the ID in state
    };

    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      const fetchBlog = async () => {
        try {
          const response = await fetch(`/api/blogs/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch blog');
          }
          const data = await response.json();
          setBlog(data);
        } catch (error) {
          console.error('Error fetching blog:', error);
          toast({
            title: "Error",
            description: "Failed to fetch blog post",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchBlog();
    }
  }, [id]);

  const handleSave = async (blogData: { title: string; coverImage: string; content: any[] }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        throw new Error('Failed to update blog');
      }

      toast({
        title: "Success",
        description: "Blog post updated successfully"
      });
      router.push('/dashboard/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: "Error",
        description: "Failed to update blog post",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateAway = () => {
    router.push('/dashboard/blogs');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return <div className='min-h-screen flex flex-col items-center justify-center gap-5'>
      <h1 className='text-6xl'>Blog Not found</h1>
      <Button
      onClick={handleNavigateAway}
      className='inline-flex gap-2 items-center rounded-full'
      >
        Go back Home
        <ArrowRight/>
      </Button>
    </div>;
  }

  return (
    <DashboardLayout>
      <div className='flex justify-between'>
        <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
        <Button variant="outline" onClick={handleNavigateAway}>
          Cancel
        </Button>
      </div>
      <BlogEditor initialBlog={blog} onSave={handleSave} />
    </DashboardLayout>
  );
}
