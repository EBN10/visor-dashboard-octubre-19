"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchJson } from "~/lib/api"
import { LayerForm } from "./layer-form"
import { LayerList } from "./layer-list"
import { GroupList } from "./group-list"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

export default function AdminCapasPage() {
  const groupsQuery = useQuery({
    queryKey: ["admin", "layer-groups"],
    queryFn: () => fetchJson<any[]>("/api/admin/layer-groups"),
  })

  const layersQuery = useQuery({
    queryKey: ["admin", "layers"],
    queryFn: () => fetchJson<any[]>("/api/admin/layers"),
  })

  return (
    <div className="space-y-6">
      <Tabs defaultValue="layers" className="w-full">
        <TabsList>
          <TabsTrigger value="layers">Capas</TabsTrigger>
          <TabsTrigger value="groups">Grupos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Nueva Capa</CardTitle>
                </CardHeader>
                <CardContent>
                  <LayerForm groups={groupsQuery.data ?? []} />
                </CardContent>
              </Card>
            </div>
            <div>
              <LayerList layers={layersQuery.data ?? []} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="groups">
          <GroupList groups={groupsQuery.data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
