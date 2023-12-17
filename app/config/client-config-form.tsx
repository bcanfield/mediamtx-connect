"use client";
import { GridFormItem } from "@/components/grid-form-item";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Config } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import updateClientConfig from "../_actions/updateClientConfig";

export default function ClientConfigForm({
  clientConfig,
}: {
  clientConfig: Config | null;
}) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof ClientConfigFormSchema>>({
    resolver: zodResolver(ClientConfigFormSchema),
    mode: "onBlur",
    defaultValues: clientConfig ? clientConfig : undefined,
  });
  const onSubmit = async (values: z.infer<typeof ClientConfigFormSchema>) => {
    console.log({ values });
    const updated = await updateClientConfig({ clientConfig: values });

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
          name="mediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Url">
              <>
                <FormControl {...field}>
                  <Input placeholder="http://mediamtx" />
                </FormControl>
                <FormDescription>
                  The address to your MediaMTX Instance. Within a Docker
                  Network, you can use the container name. Otherwise, use the
                  external IP / hostname.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="mediaMtxApiPort"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="MediaMtx Api Port">
              <>
                <FormControl {...field}>
                  <Input type="number" placeholder="9997" />
                </FormControl>
                <FormDescription>The port to the MediaMTX API</FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="remoteMediaMtxUrl"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Remote MediaMtx URL">
              <>
                <FormControl {...field}>
                  <Input placeholder="http://localhost" />
                </FormControl>
                <FormDescription>
                  This is the browser-accessible, externally-facing IP /
                  hostname of your MediaMTX Server.
                </FormDescription>
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="recordingsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Recordings Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/recordings" />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </>
            </GridFormItem>
          )}
        ></FormField>
        <FormField
          name="screenshotsDirectory"
          control={form.control}
          render={({ field }) => (
            <GridFormItem label="Screenshots Directory">
              <>
                <FormControl {...field}>
                  <Input placeholder="/screenshots" />
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

export const ClientConfigFormSchema = z.object({
  id: z.coerce.number(),
  mediaMtxUrl: z.string().min(1),
  mediaMtxApiPort: z.coerce.number().gt(0),
  remoteMediaMtxUrl: z.string().nullable(),
  recordingsDirectory: z.string().min(1),
  screenshotsDirectory: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}) satisfies z.ZodType<Config>;
