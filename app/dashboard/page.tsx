'use client'

import { motion } from "framer-motion"
import { FileText, GraduationCap, Users } from 'lucide-react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/layout"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth" // Assuming you have an auth hook

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

interface Stats {
  blogCount: number
  programmeCount: number
  applicationCount: number
}

interface BlogPost {
  _id: string
  title: string
  createdAt: string
}

// interface Application {
//   _id: string
//   applicantName: string
//   programmeId?: {
//     _id: string;
//     title: string;
//   };
//   createdAt: string
// }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ blogCount: 0, programmeCount: 0, applicationCount: 0 })
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([])
  // const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const { user } = useAuth() // Use the auth hook to get the user

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, blogsRes, applicationsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/blogs?limit=5'),
          fetch('/api/applications?limit=5')
        ])
        
        const statsData = await statsRes.json()
        const blogsData = await blogsRes.json()
        const applicationsData = await applicationsRes.json()

        setStats(statsData)
        setRecentBlogs(blogsData)
        // setRecentApplications(applicationsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchData()
  }, [])

  const statsData = [
    {
      title: "Total Blogs",
      value: stats.blogCount.toString(),
      icon: FileText,
      href: "/dashboard/blogs"
    },
    {
      title: "Active Programs",
      value: stats.programmeCount.toString(),
      icon: GraduationCap,
      href: "/dashboard/programmes"
    },
    {
      title: "New Applications",
      value: stats.applicationCount.toString(),
      icon: Users,
      href: "/dashboard/applications"
    }
  ]

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold">
            {getGreeting()} {user?.username}👋
          </h1>
          <p className="text-gray-500 mt-2">Here are some insights for the dynamic content on <a href="https://www.wescng.com" className="text-primary font-semibold">wescng.com</a></p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsData.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentBlogs.length > 0 ? (
                <ul className="space-y-2">
                  {recentBlogs.map((blog) => (
                    <li key={blog._id}>
                      <Link href={`/dashboard/blogs/edit/${blog._id}`} className="text-primary hover:underline">
                        {blog.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Posted on: {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No blog posts yet</p>
              )}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <ul className="space-y-2">
                  {recentApplications.map((application) => (
                    <li key={application._id}>
                      <Link href={`/dashboard/applications/${application._id}`} className="text-primary hover:underline">
                        {application.applicantName} - {application.programmeId.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Applied on: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No applications yet</p>
              )}
            </CardContent>
          </Card> */}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

