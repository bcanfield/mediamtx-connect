'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/components/ui/use-toast'

import { deletePathConfig } from '../actions/deletePathConfig'

export function DeletePathButton({ pathName }: { pathName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    const success = await deletePathConfig(pathName)
    setIsDeleting(false)
    setIsOpen(false)

    if (success) {
      toast({
        title: 'Path Deleted',
        description: `Successfully deleted path "${pathName}"`,
      })
      router.refresh()
    }
    else {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: `Failed to delete path "${pathName}"`,
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Path</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the path &quot;
            {pathName}
            &quot;?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
