"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchJson } from "~/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Layers, Users, Map, Server } from "lucide-react"

export default function AdminDashboard() {
  const layersQuery = useQuery({
    queryKey: ["admin", "layers"],
    queryFn: () => fetchJson<any[]>("/api/admin/layers"),
  })

  const groupsQuery = useQuery({
    queryKey: ["admin", "layer-groups"],
    queryFn: () => fetchJson<any[]>("/api/admin/layer-groups"),
  })

  const stats = [
    {
      title: "Capas Totales",
      value: layersQuery.data?.length || 0,
      icon: Layers,
      description: "Capas de mapa activas",
    },
    {
      title: "Grupos de Capas",
      value: groupsQuery.data?.length || 0,
      icon: Server,
      description: "Categorías organizadas",
    },
    {
      title: "Usuarios Totales",
      value: "12", // Placeholder
      icon: Users,
      description: "Administradores registrados",
    },
    {
      title: "Vistas del Mapa",
      value: "1,234", // Placeholder
      icon: Map,
      description: "Impresiones totales del mapa",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente para mostrar.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de Datos</span>
                <span className="text-sm text-green-500">Conectado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API</span>
                <span className="text-sm text-green-500">Operacional</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Versión</span>
                <span className="text-sm">v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
