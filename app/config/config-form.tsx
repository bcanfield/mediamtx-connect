"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridFormItem } from "@/components/grid-form-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlobalConf } from "@/lib/MediaMTX/generated";
import { Plus, Trash } from "lucide-react";
import { ChangeEvent } from "react";
import updateGlobalConfig from "../_actions/updateGlobalConfig";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export default function ConfigForm({
  globalConf,
}: {
  globalConf?: GlobalConf;
}) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof GlobalConfigFormSchema>>({
    resolver: zodResolver(GlobalConfigFormSchema),
    mode: "onBlur",
    defaultValues: globalConf,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "webrtcICEServers2",
  });

  const onSubmit = async (values: z.infer<typeof GlobalConfigFormSchema>) => {
    const updated = await updateGlobalConfig({ globalConfig: values });
    if (updated) {
      toast({
        title: "Updated Global Config",
      });
    } else {
      toast({
        variant: "destructive",
        title: "There was an issue updating the Global Config",
        description: "Please double check your form values.",
      });
    }
  };
  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    const arrayOfLines = value.split("\n");
    return arrayOfLines; // Return the array of lines to set the value in the form field
  };
  const handleTextareaValue = (value: string[] | undefined) => {
    return value?.join("\n"); // Return the array of lines to set the value in the form field
  };

  return (
    <Form {...form}>
      <form
        className="space-y-2 py-2 flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex justify-end py-2">
          <Button
            type="submit"
            disabled={!form.formState.isValid || !form.formState.isDirty}
          >
            Submit
          </Button>
        </div>

        <FormField
          name="logLevel"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Log Level">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="logDestinations"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Log Destinations">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>

        <FormField
          name="logFile"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Log File">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />
        <FormField
          name="readTimeout"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Read Timeout">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="writeTimeout"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Write Timeout">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="writeQueueSize"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Write Queue Size">
              <>
                <FormControl {...field}>
                  <Input type="number" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="udpMaxPayloadSize"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="UDP Max Payload Size">
              <>
                <FormControl {...field}>
                  <Input type="number" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="externalAuthenticationURL"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="External Authentication URL">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />
        <FormField
          name="api"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="API">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="apiAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="API Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="metrics"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Metrics">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="metricsAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Metrics Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="pprof"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="PPROF">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="pprofAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="PPROF Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="runOnConnect"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on Connect">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="runOnConnectRestart"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on Connect Restart">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="runOnDisconnect"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Run on Disconnect">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />
        <FormField
          name="rtsp"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTSP">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="protocols"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Protocols">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="encryption"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Encryption">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtspAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTSP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtpAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtcpAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTCP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="multicastIPRange"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Multicast IP Range">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="multicastRTPPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Multicast RTP Port">
              <>
                <FormControl {...field}>
                  <Input type="number" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="multicastRTCPPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Multicast RTCP Port">
              <>
                <FormControl {...field}>
                  <Input type="number" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />
        <FormField
          name="serverKey"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Server Key">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="serverCert"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Server Cert">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="authMethods"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Auth Methods">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="rtmp"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMP">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtmpAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtmpEncryption"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMP Encryption">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtmpsAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMPS Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtmpServerKey"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMP Server Key">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="rtmpServerCert"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="RTMP Server Cert">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="hls"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsEncryption"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Encryption">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsServerKey"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Server Key">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsServerCert"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Server Cert">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsAlwaysRemux"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Always Remux">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsVariant"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Variant">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsSegmentCount"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Segment Count">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsSegmentDuration"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Segment Duration">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsPartDuration"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Part Duration">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsSegmentMaxSize"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Segment Max Size">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsAllowOrigin"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Allow Origin">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsTrustedProxies"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Trusted Proxies">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="hlsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="HLS Directory">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="webrtc"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcEncryption"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Encryption">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcServerKey"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Server Key">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcServerCert"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Server Cert">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcAllowOrigin"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Allow Origin">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcTrustedProxies"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Trusted Proxies">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcLocalUDPAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Local UDP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcLocalTCPAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Local TCP Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcIPsFromInterfaces"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC IPs From Interfaces">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcIPsFromInterfacesList"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC IPs From Interfaces List">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="webrtcAdditionalHosts"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="WebRTC Additional Hosts">
              <>
                <FormControl>
                  <Textarea
                    {...field}
                    value={handleTextareaValue(field.value)}
                    onChange={(e) => {
                      field.onChange(handleTextareaChange(e));
                    }}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-default">
                WebRTC Ice Servers
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                append({
                  password: "a",
                  url: "b",
                  username: "c",
                })
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 pl-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-default">{`ICE Server`}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                key={field.id}
                name={`webrtcICEServers2.${index}.url`}
                render={({ field }) => (
                  <GridFormItem label="URL">
                    <>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </>
                  </GridFormItem>
                )}
              />
              <FormField
                control={form.control}
                key={field.id}
                name={`webrtcICEServers2.${index}.username`}
                render={({ field }) => (
                  <GridFormItem label="Username">
                    <>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </>
                  </GridFormItem>
                )}
              />
              <FormField
                control={form.control}
                key={field.id}
                name={`webrtcICEServers2.${index}.password`}
                render={({ field }) => (
                  <GridFormItem label="Password">
                    <>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription />
                      <FormMessage />
                    </>
                  </GridFormItem>
                )}
              />
            </div>
          ))}
        </div>
        <Separator />

        <FormField
          name="srt"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="SRT">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="srtAddress"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="SRT Address">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <Separator />

        <FormField
          name="record"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record">
              <>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value === "true" ? true : false);
                  }}
                  defaultValue={String(field.value)}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordPath"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record Path">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordFormat"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record Format">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordPartDuration"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record Part Duration">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordSegmentDuration"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record Segment Duration">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordDeleteAfter"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Record Delete After">
              <>
                <FormControl {...field}>
                  <Input />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
      </form>
    </Form>
  );
}

export const GlobalConfigFormSchema = z.object({
  logLevel: z.string().optional(),
  logDestinations: z.array(z.string()).optional(),
  logFile: z.string().optional(),
  readTimeout: z.string().optional(),
  writeTimeout: z.string().optional(),
  writeQueueSize: z.coerce.number().optional(),
  udpMaxPayloadSize: z.coerce.number().optional(),
  externalAuthenticationURL: z.string().optional(),
  api: z.boolean().optional(),
  apiAddress: z.string().optional(),
  metrics: z.boolean().optional(),
  metricsAddress: z.string().optional(),
  pprof: z.boolean().optional(),
  pprofAddress: z.string().optional(),
  runOnConnect: z.string().optional(),
  runOnConnectRestart: z.boolean().optional(),
  runOnDisconnect: z.string().optional(),
  rtsp: z.boolean().optional(),
  protocols: z.array(z.string()).optional(),
  encryption: z.string().optional(),
  rtspAddress: z.string().optional(),
  rtspsAddress: z.string().optional(),
  rtpAddress: z.string().optional(),
  rtcpAddress: z.string().optional(),
  multicastIPRange: z.string().optional(),
  multicastRTPPort: z.coerce.number().optional(),
  multicastRTCPPort: z.coerce.number().optional(),
  serverKey: z.string().optional(),
  serverCert: z.string().optional(),
  authMethods: z.array(z.string()).optional(),
  rtmp: z.boolean().optional(),
  rtmpAddress: z.string().optional(),
  rtmpEncryption: z.string().optional(),
  rtmpsAddress: z.string().optional(),

  rtmpServerKey: z.string().optional(),
  rtmpServerCert: z.string().optional(),
  hls: z.boolean().optional(),
  hlsAddress: z.string().optional(),
  hlsEncryption: z.boolean().optional(),
  hlsServerKey: z.string().optional(),

  hlsServerCert: z.string().optional(),
  hlsAlwaysRemux: z.boolean().optional(),
  hlsVariant: z.string().optional(),
  hlsSegmentCount: z.coerce.number().optional(),
  hlsSegmentDuration: z.string().optional(),
  hlsPartDuration: z.string().optional(),
  hlsSegmentMaxSize: z.string().optional(),
  hlsAllowOrigin: z.string().optional(),
  hlsTrustedProxies: z.array(z.string()).optional(),
  hlsDirectory: z.string().optional(),
  webrtc: z.boolean().optional(),
  webrtcAddress: z.string().optional(),
  webrtcEncryption: z.boolean().optional(),
  webrtcServerKey: z.string().optional(),
  webrtcServerCert: z.string().optional(),

  webrtcAllowOrigin: z.string().optional(),
  webrtcTrustedProxies: z.array(z.string()).optional(),
  webrtcLocalUDPAddress: z.string().optional(),
  webrtcLocalTCPAddress: z.string().optional(),
  webrtcIPsFromInterfaces: z.boolean().optional(),
  webrtcIPsFromInterfacesList: z.array(z.string()).optional(),
  webrtcAdditionalHosts: z.array(z.string()).optional(),
  webrtcICEServers2: z
    .array(
      z.object({
        url: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      }),
    )
    .optional(),
  srt: z.boolean().optional(),
  srtAddress: z.string().optional(),
  record: z.boolean().optional(),
  recordPath: z.string().optional(),
  recordFormat: z.string().optional(),
  recordPartDuration: z.string().optional(),
  recordSegmentDuration: z.string().optional(),
  recordDeleteAfter: z.string().optional(),
}) satisfies z.ZodType<GlobalConf>;
