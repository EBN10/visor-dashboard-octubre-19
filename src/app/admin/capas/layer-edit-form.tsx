"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson, qk } from "~/lib/api"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Loader2 } from "lucide-react"

interface LayerEditFormProps {
  layer: any
  groups: any[]
  onClose: () => void
}

export function LayerEditForm({ layer, groups, onClose }: LayerEditFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(layer.name)
  const [groupId, setGroupId] = useState(layer.groupId)
  const [defaultVisible, setDefaultVisible] = useState(layer.defaultVisible)
  const [popupProps, setPopupProps] = useState<string>(
    layer.config?.popupProps?.join(", ") || ""
  )

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchJson("/api/admin/layers", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast.success("Capa actualizada")
      queryClient.invalidateQueries({ queryKey: ["admin", "layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
      onClose()
    },
    onError: (err: any) => toast.error(err.message),
  })

  const handleSave = () => {
    const config = { ...layer.config }
    
    // Update popupProps if it's a vector layer
    if (config.type === "vector") {
      config.popupProps = popupProps
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }

    updateMutation.mutate({
      id: layer.id,
      name,
      groupId,
      defaultVisible,
      config,
    })
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Grupo</Label>
        <Select value={groupId} onValueChange={setGroupId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="visible"
          checked={defaultVisible}
          onCheckedChange={setDefaultVisible}
        />
        <Label htmlFor="visible">Visible por defecto</Label>
      </div>

      {layer.kind === "vector" && (
        <div className="space-y-2">
          <Label>Propiedades del Popup (separadas por coma)</Label>
          <Input
            value={popupProps}
            onChange={(e) => setPopupProps(e.target.value)}
            placeholder="ej. nombre, descripcion, id"
          />
          <p className="text-xs text-muted-foreground">
            Campos para mostrar en el popup al hacer clic.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
