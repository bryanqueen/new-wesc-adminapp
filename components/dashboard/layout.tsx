'use client'

import { useState } from "react"
import { motion } from "framer-motion"
import { LayoutDashboard, FileText, GraduationCap, Users, LogOut, Menu, BrickWall, User, Users2 } from 'lucide-react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { withAuth } from "../auth/withAuth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardLayoutBase({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard'
    },
    {
      title: 'Blogs',
      icon: FileText,
      href: '/dashboard/blogs'
    },
    {
      title: 'Programmes',
      icon: GraduationCap,
      href: '/dashboard/programmes'
    },
    {
      title: 'Applications',
      icon: Users,
      href: '/dashboard/applications'
    },
    {
      title: 'Eligibility form builder',
      icon: BrickWall,
      href: '/dashboard/eligibility-form-builder'
    },
    {
      title: 'Eligibility Applications',
      icon: Users2,
      href: '/dashboard/eligibility-applications'
    }
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{duration: 0.5}}
        className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href='/' className="text-xl font-bold text-primary">WESC Admin</Link>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 ${
                  pathname === item.href ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t p-4">
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="flex w-full items-center space-x-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-0'} min-h-screen transition-all duration-300`}>
        <header className="bg-white border-b h-16 flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export const DashboardLayout = withAuth(DashboardLayoutBase)