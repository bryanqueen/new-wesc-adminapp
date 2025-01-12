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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '@/components/ui/alert-dialog'

interface Programme {
  _id: string
  title: string
  description: string
  createdAt: string
  coverImage?: string
}

export default function ProgrammesPage() {
  const router = useRouter()
  const [programmes, setProgrammes] = useState<Programme[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [programmeToDelete, setProgrammeToDelete] = useState<string | null>(null)
  
 useEffect(() => {
  const fetchProgrammes = async () => {
    const response = await fetch('/api/programmes')
    const programmes = await response.json()
    setProgrammes(programmes)
  }
  fetchProgrammes()
 }, [])

  const handleEdit = (id: string) => {
    router.push(`/dashboard/programmes/edit/${id}`)
  }

  const handleDelete = (id: string) => {
    setProgrammeToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async (id: string) => {
    await fetch(`/api/programmes/${id}`, { method: 'DELETE' })
    setProgrammes(programmes.filter((programme) => programme._id !== id))
    setShowDeleteDialog(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Programmes</h1>
          <Link href="/dashboard/programmes/create">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Programme
            </Button>
          </Link>
        </div>

        {programmes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No programmes found. Create your first programme!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <Card key={programme._id}>
                <CardHeader className="relative p-0">
                  <Image
                    src={programme.coverImage || '/placeholder.svg'}
                    alt={programme.title}
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
                        <DropdownMenuItem onSelect={() => handleEdit(programme._id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDelete(programme._id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg font-semibold py-2">{programme.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {programme.description}
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground mt-2">
                    Created on: {new Date(programme.createdAt).toLocaleDateString()}
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
          <AlertDialogTitle>Are you sure you want to delete this programme?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteConfirm(programmeToDelete!)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </DashboardLayout>
  )
}
