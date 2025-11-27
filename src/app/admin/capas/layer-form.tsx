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
  id: z.string().min(2, "El ID debe tener al menos 2 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  groupId: z.string().min(1, "El grupo es requerido"),
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
      if (!data.schema) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El esquema es requerido", path: ["schema"] })
      if (!data.table) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La tabla es requerida", path: ["table"] })
      if (!data.geomColumn) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La columna de geometría es requerida", path: ["geomColumn"] })
    }
    if (data.type === "wms") {
      if (!data.url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La URL es requerida", path: ["url"] })
      if (!data.layers) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las capas son requeridas", path: ["layers"] })
    }
    if (data.type === "xyz") {
      if (!data.url) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "La URL es requerida", path: ["url"] })
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
      toast.success("Capa creada exitosamente")
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["admin", "layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al crear la capa")
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
                <FormLabel>Nombre</FormLabel>
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
                <FormLabel>Grupo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar un grupo" />
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
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue("config.type", val as any)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vector">Vectorial</SelectItem>
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
                <FormLabel>Orden</FormLabel>
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
                  <FormLabel>Visible por defecto</FormLabel>
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
            <h4 className="font-medium">Configuración Vectorial</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="config.schema"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Esquema</FormLabel>
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
                    <FormLabel>Tabla</FormLabel>
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
                    <FormLabel>Columna de Geometría</FormLabel>
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
                  <FormLabel>Propiedades (separadas por coma)</FormLabel>
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
            <h4 className="font-medium">Configuración WMS</h4>
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
                    <FormLabel>Capas</FormLabel>
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
                    <FormLabel>Versión</FormLabel>
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
                    <FormLabel>Formato</FormLabel>
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
            <h4 className="font-medium">Configuración XYZ</h4>
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
                  <FormLabel>Atribución</FormLabel>
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
          {createLayerMutation.isPending ? "Creando..." : "Crear Capa"}
        </Button>
      </form>
    </Form>
  )
}
