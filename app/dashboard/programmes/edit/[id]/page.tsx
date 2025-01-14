'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/dashboard/layout";
import { ProgrammeEditor } from "@/components/programme-editor/editor";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProgrammePage({ params }: PageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [programme, setProgramme] = useState<any>(null);
  const [originalProgramme, setOriginalProgramme] = useState<any>(null);
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [id, setId] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params;
      setId(id);
    };
    unwrapParams();
  }, [params]);

  // Fetch programme data
  useEffect(() => {
    const fetchProgramme = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await fetch(`/api/programmes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch programme');
        const data = await response.json();
        setProgramme(data);
        setOriginalProgramme(JSON.stringify(data)); // Store original state
      } catch (error) {
        console.error('Error fetching programme:', error);
        toast({
          title: "Error",
          description: "Failed to load programme",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgramme();
  }, [id]);

  const handleSave = async (programmeData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/programmes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programmeData),
      });

      if (!response.ok) {
        throw new Error('Failed to update programme');
      }

      const updatedData = await response.json();
      setProgramme(updatedData);
      setOriginalProgramme(JSON.stringify(updatedData));
      setIsDirty(false);

      toast({
        title: "Success",
        description: "Programme updated successfully",
      });
      router.push('/dashboard/programmes');
    } catch (error) {
      console.error('Error updating programme:', error);
      toast({
        title: "Error",
        description: "Failed to update programme",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgrammeChange = async (newData: any) => {
    setProgramme(newData);
    setIsDirty(JSON.stringify(newData) !== originalProgramme);
    return Promise.resolve();
  };

  const handleContentChange = (newData: any) => {
    setProgramme(newData);
    setIsDirty(JSON.stringify(newData) !== originalProgramme);
  };

  const handleNavigateAway = () => {
    if (isDirty) {
      setShowUnsavedChanges(true);
    } else {
      router.push('/dashboard/programmes');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Edit Programme</CardTitle>
              {isDirty && (
                <p className="text-sm text-yellow-600">You have unsaved changes</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleNavigateAway}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSave(programme)}
                disabled={isLoading || !isDirty}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && !programme ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : programme ? (
              <ProgrammeEditor
                initialProgramme={programme}
                onSave={handleProgrammeChange}
                onChange={handleContentChange}
              />
            ) : (
              <div className="text-center py-8">
                <p>Failed to load programme</p>
                <Button
                  variant="outline"
                  onClick={() => router.refresh()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={showUnsavedChanges}
        onOpenChange={setShowUnsavedChanges}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? All unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnsavedChanges(false)}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedChanges(false);
                router.push('/dashboard/programmes');
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
