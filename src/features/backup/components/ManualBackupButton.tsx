'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useToast } from '@/shared/components/ui/use-toast'
import { runBackup } from '../actions/runBackup'

export function ManualBackupButton() {
  const [backupType, setBackupType] = useState<'database' | 'config' | 'full'>('full')
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const handleBackup = async () => {
    setIsRunning(true)
    try {
      const result = await runBackup(backupType)

      if (result.success) {
        toast({
          title: 'Backup Complete',
          description: `${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup completed in ${result.duration}ms`,
        })
      }
      else {
        toast({
          variant: 'destructive',
          title: 'Backup Failed',
          description: result.errorMessage || 'An error occurred during backup',
        })
      }
    }
    catch {
      toast({
        variant: 'destructive',
        title: 'Backup Failed',
        description: 'An unexpected error occurred',
      })
    }
    finally {
      setIsRunning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Backup</CardTitle>
        <CardDescription>
          Run a backup manually at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select
            value={backupType}
            onValueChange={value => setBackupType(value as 'database' | 'config' | 'full')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Backup type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="database">Database Only</SelectItem>
              <SelectItem value="config">Config Only</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleBackup}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run Backup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
