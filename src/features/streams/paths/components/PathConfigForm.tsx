'use client'

import type { ChangeEvent } from 'react'
import type { z } from 'zod'

import type { PathConfigFormData } from '../schemas/path-config.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { GridFormItem } from '@/shared/components/forms'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { Textarea } from '@/shared/components/ui/textarea'

import { useToast } from '@/shared/components/ui/use-toast'
import { createPathConfig } from '../actions/createPathConfig'
import { updatePathConfig } from '../actions/updatePathConfig'
import { PathConfigSchema } from '../schemas/path-config.schema'

interface PathConfigFormProps {
  pathConf?: PathConfigFormData
  isNew?: boolean
}

export function PathConfigForm({ pathConf, isNew = false }: PathConfigFormProps) {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(PathConfigSchema),
    mode: 'onBlur',
    defaultValues: pathConf || {
      name: '',
      source: '',
      record: false,
      sourceOnDemand: false,
      overridePublisher: true,
    },
  })

  const onSubmit = async (values: z.output<typeof PathConfigSchema>) => {
    let success: boolean

    if (isNew) {
      success = await createPathConfig({
        name: values.name,
        pathConfig: values,
      })
    }
    else {
      success = await updatePathConfig({
        name: values.name,
        pathConfig: values,
      })
    }

    if (success) {
      toast({
        title: isNew ? 'Path Created' : 'Path Updated',
        description: `Successfully ${isNew ? 'created' : 'updated'} path "${values.name}"`,
      })
      if (isNew) {
        router.push('/config/paths')
      }
    }
    else {
      toast({
        variant: 'destructive',
        title: isNew ? 'Create Failed' : 'Update Failed',
        description: 'Please check your form values and try again.',
      })
    }
  }

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    const arrayOfLines = value.split('\n').filter(line => line.trim() !== '')
    return arrayOfLines
  }

  const handleTextareaValue = (value: string[] | undefined) => {
    return value?.join('\n')
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">{isNew ? 'Create New Path' : 'Edit Path'}</h2>
            <p className="text-sm text-muted-foreground">
              {isNew ? 'Configure a new stream path' : `Editing path: ${pathConf?.name}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/config/paths')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || !form.formState.isDirty}
            >
              {isNew ? 'Create Path' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <CardDescription>Configure the basic path settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Path Name">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="my-stream" disabled={!isNew} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="source"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Source">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="rtsp://..." />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="sourceFingerprint"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Source Fingerprint">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="SHA256 fingerprint" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="sourceOnDemand"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Source On Demand">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="sourceOnDemandStartTimeout"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="On Demand Start Timeout">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="10s" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="sourceOnDemandCloseAfter"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="On Demand Close After">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="10s" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="maxReaders"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Max Readers">
                  <>
                    <FormControl {...field}>
                      <Input type="number" placeholder="0 (unlimited)" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="fallback"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Fallback Path">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="fallback-stream" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Recording Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Recording</CardTitle>
            <CardDescription>Enable and configure recording for this path</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="record"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Enable Recording">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Configure publish and read authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="publishUser"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Publish Username">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="username" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="publishPass"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Publish Password">
                  <>
                    <FormControl {...field}>
                      <Input type="password" placeholder="password" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="publishIPs"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Publish IPs">
                  <>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={handleTextareaValue(field.value)}
                        onChange={(e) => {
                          field.onChange(handleTextareaChange(e))
                        }}
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="readUser"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Read Username">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="username" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="readPass"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Read Password">
                  <>
                    <FormControl {...field}>
                      <Input type="password" placeholder="password" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="readIPs"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Read IPs">
                  <>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={handleTextareaValue(field.value)}
                        onChange={(e) => {
                          field.onChange(handleTextareaChange(e))
                        }}
                        placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                      />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="overridePublisher"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Override Publisher">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* RTSP Settings */}
        <Card>
          <CardHeader>
            <CardTitle>RTSP Settings</CardTitle>
            <CardDescription>Configure RTSP-specific options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="rtspTransport"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="RTSP Transport">
                  <>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="multicast">Multicast</SelectItem>
                        <SelectItem value="tcp">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="rtspAnyPort"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="RTSP Any Port">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="rtspRangeType"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="RTSP Range Type">
                  <>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clock">Clock</SelectItem>
                        <SelectItem value="npt">NPT</SelectItem>
                        <SelectItem value="smpte">SMPTE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="rtspRangeStart"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="RTSP Range Start">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="now" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* SRT Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SRT Settings</CardTitle>
            <CardDescription>Configure SRT-specific options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="srtPublishPassphrase"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="SRT Publish Passphrase">
                  <>
                    <FormControl {...field}>
                      <Input type="password" placeholder="passphrase" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="srtReadPassphrase"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="SRT Read Passphrase">
                  <>
                    <FormControl {...field}>
                      <Input type="password" placeholder="passphrase" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Run On Commands */}
        <Card>
          <CardHeader>
            <CardTitle>Run On Commands</CardTitle>
            <CardDescription>Commands to execute on various events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="runOnInit"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Init">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on init" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnInitRestart"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Init Restart">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnDemand"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Demand">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on demand" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnDemandRestart"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Demand Restart">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnReady"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Ready">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run when ready" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnReadyRestart"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Ready Restart">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnNotReady"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Not Ready">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run when not ready" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnRead"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Read">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on read" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnReadRestart"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Read Restart">
                  <>
                    <Select
                      onValueChange={val => field.onChange(val === 'true')}
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Enabled</SelectItem>
                        <SelectItem value="false">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnUnread"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Unread">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on unread" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnRecordSegmentCreate"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Record Segment Create">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on segment create" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />

            <FormField
              name="runOnRecordSegmentComplete"
              control={form.control}
              render={({ field }) => (
                <GridFormItem label="Run On Record Segment Complete">
                  <>
                    <FormControl {...field}>
                      <Input placeholder="command to run on segment complete" />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </>
                </GridFormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/config/paths')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            {isNew ? 'Create Path' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
