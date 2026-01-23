import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { getBackupConfig } from '../actions/getBackupConfig'
import { getBackupHistory } from '../actions/getBackupHistory'
import { BackupConfigForm } from './BackupConfigForm'
import { BackupHistoryTable } from './BackupHistoryTable'
import { ManualBackupButton } from './ManualBackupButton'

export async function BackupConfigPage() {
  const [backupConfig, backupHistory] = await Promise.all([
    getBackupConfig(),
    getBackupHistory(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Backup Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Configure automatic backups for your database and configuration files.
        </p>
      </div>
      <Separator />

      <ManualBackupButton />

      <Card>
        <CardHeader>
          <CardTitle>Backup Settings</CardTitle>
          <CardDescription>
            Configure scheduled backups and remote storage options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackupConfigForm backupConfig={backupConfig} />
        </CardContent>
      </Card>

      <BackupHistoryTable history={backupHistory} />
    </div>
  )
}
