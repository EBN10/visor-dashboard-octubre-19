"use client"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { fetchJson, qk } from "~/lib/api"

export default function AdminCapasPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<any>({ kind: "vector", config: { type: "vector" } })

  // Queries
  const groupsQuery = useQuery({
    queryKey: ["admin","layer-groups"],
    queryFn: () => fetchJson<any[]>("/api/admin/layer-groups"),
  })

  const layersQuery = useQuery({
    queryKey: ["admin","layers"],
    queryFn: () => fetchJson<any[]>("/api/admin/layers"),
  })

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (data: any) =>
      fetchJson("/api/admin/layer-groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin","layer-groups"] })
      // also invalidate catalog so UI trees update elsewhere
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
  })

  const createLayerMutation = useMutation({
    mutationFn: async (body: any) =>
      fetchJson("/api/admin/layers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin","layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
  })

  async function createLayerGroup(e: any) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    await createGroupMutation.mutateAsync(data)
    e.currentTarget.reset()
  }

  async function createLayer(e: any) {
    e.preventDefault()
    await createLayerMutation.mutateAsync(form)
  }

  return (
    <div className="p-4 grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Grupos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={createLayerGroup} className="grid grid-cols-2 gap-2">
            <Input name="id" placeholder="id (slug)" required />
            <Input name="name" placeholder="nombre" required />
            <Input name="parentId" placeholder="parentId (opcional)" />
            <Input name="order" placeholder="order" type="number" defaultValue={0} />
            <Button type="submit" className="col-span-2">Crear grupo</Button>
          </form>
          <div className="text-sm">
            {(groupsQuery.data ?? []).map(g => (
              <div key={g.id} className="border p-2 rounded mb-1">{g.name} <span className="text-muted-foreground">({g.id})</span></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Nueva capa</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="id (slug)" value={form.id||""} onChange={e=>setForm({ ...form, id: e.target.value })} />
            <Input placeholder="name" value={form.name||""} onChange={e=>setForm({ ...form, name: e.target.value })} />
            <Select value={form.groupId||""} onValueChange={(v)=>setForm({ ...form, groupId: v })}>
              <SelectTrigger><SelectValue placeholder="Grupo" /></SelectTrigger>
              <SelectContent>
                {(groupsQuery.data ?? []).map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.kind} onValueChange={(v)=>{
              if (v === "vector") setForm({ ...form, kind: v, config: { type: "vector" } })
              if (v === "wms") setForm({ ...form, kind: v, config: { type: "wms" } })
              if (v === "xyz") setForm({ ...form, kind: v, config: { type: "xyz" } })
            }}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vector">vector</SelectItem>
                <SelectItem value="wms">wms</SelectItem>
                <SelectItem value="xyz">xyz</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="order" value={form.order??0} onChange={e=>setForm({ ...form, order: Number(e.target.value) })} />
            <div className="flex items-center gap-2">
              <Switch checked={!!form.defaultVisible} onCheckedChange={(v)=>setForm({ ...form, defaultVisible: v })} />
              <span className="text-sm">Visible por defecto</span>
            </div>
          </div>

          {form.kind === "vector" && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="schema" value={form.config.schema||"public"} onChange={e=>setForm({ ...form, config: { ...form.config, schema: e.target.value, type: "vector" } })} />
              <Input placeholder="table" value={form.config.table||""} onChange={e=>setForm({ ...form, config: { ...form.config, table: e.target.value, type: "vector" } })} />
              <Input placeholder="geomColumn" value={form.config.geomColumn||"geom"} onChange={e=>setForm({ ...form, config: { ...form.config, geomColumn: e.target.value, type: "vector" } })} />
              <Input type="number" placeholder="srid" value={form.config.srid||4326} onChange={e=>setForm({ ...form, config: { ...form.config, srid: Number(e.target.value), type: "vector" } })} />
              <Textarea placeholder="props (coma separada)" value={(form.config.props||[]).join(",")} onChange={e=>setForm({ ...form, config: { ...form.config, props: e.target.value.split(",").map((s)=>s.trim()).filter(Boolean), type: "vector" } })} />
            </div>
          )}

          {form.kind === "wms" && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="url" value={form.config.url||""} onChange={e=>setForm({ ...form, config: { ...form.config, url: e.target.value, type: "wms" } })} />
              <Input placeholder="layers" value={form.config.layers||""} onChange={e=>setForm({ ...form, config: { ...form.config, layers: e.target.value, type: "wms" } })} />
              <Input placeholder="version (opcional)" value={form.config.version||""} onChange={e=>setForm({ ...form, config: { ...form.config, version: e.target.value, type: "wms" } })} />
              <Input placeholder="format (opcional)" value={form.config.format||""} onChange={e=>setForm({ ...form, config: { ...form.config, format: e.target.value, type: "wms" } })} />
            </div>
          )}

          {form.kind === "xyz" && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="url" value={form.config.url||""} onChange={e=>setForm({ ...form, config: { ...form.config, url: e.target.value, type: "xyz" } })} />
              <Input placeholder="attribution (opcional)" value={form.config.attribution||""} onChange={e=>setForm({ ...form, config: { ...form.config, attribution: e.target.value, type: "xyz" } })} />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={createLayer}>Crear capa</Button>
          </div>

          <div className="pt-4 space-y-1 text-sm">
            <div className="font-medium">Capas existentes</div>
            {(layersQuery.data ?? []).map(l => (
              <div key={l.id} className="border p-2 rounded mb-1">
                <div className="font-medium">{l.name} <span className="text-muted-foreground">({l.id})</span></div>
                <div className="text-xs text-muted-foreground">{l.kind}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader><CardTitle>Subir vector (experimental)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <UploadVector onSuggested={(cfg) => setForm({ ...form, kind: "vector", config: cfg })} />
        </CardContent>
      </Card>
    </div>
  )
}

function UploadVector({ onSuggested }: { onSuggested: (cfg: any) => void }) {
  const [text, setText] = useState("")
  const [table, setTable] = useState("")
  const [schema, setSchema] = useState("public")
  const [srid, setSrid] = useState(4326)
  const [geomColumn, setGeomColumn] = useState("geom")
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    try {
      const body = { schema, table, srid, geomColumn, geojson: JSON.parse(text) }
      const res = await fetch("/api/admin/upload/vector", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data?.suggestedConfig) onSuggested(data.suggestedConfig)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="schema" value={schema} onChange={e=>setSchema(e.target.value)} />
        <Input placeholder="table" value={table} onChange={e=>setTable(e.target.value)} />
        <Input type="number" placeholder="srid" value={srid} onChange={e=>setSrid(Number(e.target.value))} />
        <Input placeholder="geomColumn" value={geomColumn} onChange={e=>setGeomColumn(e.target.value)} />
      </div>
      <Textarea placeholder="Pega aquí un FeatureCollection GeoJSON" value={text} onChange={e=>setText(e.target.value)} className="h-48 font-mono text-xs" />
      <Button onClick={submit} disabled={loading}>{loading?"Subiendo…":"Subir"}</Button>
    </div>
  )
}
