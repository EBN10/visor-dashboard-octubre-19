"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson, qk } from "~/lib/api"

const layerSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  groupId: z.string().min(1, "Group is required"),
  kind: z.enum(["vector", "wms", "xyz"]),
  order: z.coerce.number().default(0),
  defaultVisible: z.boolean().default(false),
  config: z.object({
    type: z.enum(["vector", "wms", "xyz"]),
    // Vector specific
    schema: z.string().optional(),
    table: z.string().optional(),
    geomColumn: z.string().optional(),
    srid: z.coerce.number().optional(),
    props: z.array(z.string()).optional(),
    // WMS specific
    url: z.string().optional(),
    layers: z.string().optional(),
    version: z.string().optional(),
    format: z.string().optional(),
    // XYZ specific
    attribution: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.type === "vector") {
      if (!data.schema) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Schema is required", path: ["schema"] })
      if (!data.table) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Table is required", path: ["table"] })
      if (!data.geomColumn) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geom Column is required", path: ["geomColumn"] })
    }
    if (data.type === "wms") {
      if (!data.url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL is required", path: ["url"] })
      if (!data.layers) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Layers is required", path: ["layers"] })
    }
    if (data.type === "xyz") {
      if (!data.url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL is required", path: ["url"] })
    }
  })
})

type LayerFormValues = z.infer<typeof layerSchema>

export function LayerForm({ groups }: { groups: any[] }) {
  const queryClient = useQueryClient()
  const form = useForm<LayerFormValues>({
    resolver: zodResolver(layerSchema) as any, // Cast to any to bypass strict type check for now
    defaultValues: {
      kind: "vector",
      order: 0,
      defaultVisible: false,
      config: {
        type: "vector",
        schema: "public",
        geomColumn: "geom",
        srid: 4326,
      },
    },
  })

  const kind = form.watch("kind")

  const createLayerMutation = useMutation({
    mutationFn: async (data: LayerFormValues) => {
      // Ensure config.type matches kind
      data.config.type = data.kind
      return fetchJson("/api/admin/layers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast.success("Layer created successfully")
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["admin", "layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create layer")
    },
  })

  function onSubmit(data: LayerFormValues) {
    createLayerMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID (Slug)</FormLabel>
                <FormControl>
                  <Input placeholder="my-layer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Layer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue("config.type", val as any)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vector">Vector</SelectItem>
                    <SelectItem value="wms">WMS</SelectItem>
                    <SelectItem value="xyz">XYZ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Default Visible</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {kind === "vector" && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">Vector Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="config.schema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schema</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.table"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.geomColumn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geometry Column</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.srid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SRID</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="config.props"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Properties (comma separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="prop1, prop2"
                      value={field.value?.join(", ") || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {kind === "wms" && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">WMS Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="config.url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.layers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layers</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {kind === "xyz" && (
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-medium">XYZ Configuration</h4>
            <FormField
              control={form.control}
              name="config.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.attribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attribution</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <Button type="submit" disabled={createLayerMutation.isPending}>
          {createLayerMutation.isPending ? "Creating..." : "Create Layer"}
        </Button>
      </form>
    </Form>
  )
}
