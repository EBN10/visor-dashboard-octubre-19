"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson, qk } from "~/lib/api"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function QgisImportPage() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [groupId, setGroupId] = useState("")

  const groupsQuery = useQuery({
    queryKey: ["admin", "layer-groups"],
    queryFn: () => fetchJson<any[]>("/api/admin/layer-groups"),
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !name || !groupId) throw new Error("Please fill all fields")
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name)
      formData.append("groupId", groupId)

      const res = await fetch("/api/admin/qgis/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        let errorMessage = "Upload failed"
        try {
          const err = await res.json()
          errorMessage = err.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response", e)
          errorMessage = `Upload failed with status ${res.status}`
        }
        throw new Error(errorMessage)
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success("Layer imported successfully!")
      setFile(null)
      setName("")
      setGroupId("")
      queryClient.invalidateQueries({ queryKey: ["admin", "layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Import from QGIS (GeoJSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Layer Name</Label>
            <Input 
              id="name" 
              placeholder="My Imported Layer" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groupsQuery.data?.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">GeoJSON File</Label>
            <Input 
              id="file" 
              type="file" 
              accept=".json,.geojson"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground">
              Upload a GeoJSON file exported from QGIS. It will be converted to a PostGIS table.
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending || !file || !name || !groupId}
          >
            {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {uploadMutation.isPending ? "Importing..." : "Import Layer"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
