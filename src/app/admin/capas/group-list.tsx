"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchJson } from "~/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Pencil, Trash2, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"

export function GroupList({ groups }: { groups: any[] }) {
  const queryClient = useQueryClient()
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Form states
  const [formData, setFormData] = useState({ id: "", name: "", order: 0 })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchJson("/api/admin/layer-groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast.success("Grupo creado")
      queryClient.invalidateQueries({ queryKey: ["admin", "layer-groups"] })
      setIsCreateOpen(false)
      setFormData({ id: "", name: "", order: 0 })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetchJson("/api/admin/layer-groups", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      })
    },
    onSuccess: () => {
      toast.success("Grupo actualizado")
      queryClient.invalidateQueries({ queryKey: ["admin", "layer-groups"] })
      setIsEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchJson(`/api/admin/layer-groups?id=${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      toast.success("Grupo eliminado")
      queryClient.invalidateQueries({ queryKey: ["admin", "layer-groups"] })
    },
    onError: (err: any) => toast.error(err.message),
  })

  const handleCreate = () => {
    createMutation.mutate(formData)
  }

  const handleUpdate = () => {
    updateMutation.mutate(formData)
  }

  const openEdit = (group: any) => {
    setEditingGroup(group)
    setFormData({ id: group.id, name: group.name, order: group.order })
    setIsEditOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Grupos de Capas</CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setFormData({ id: "", name: "", order: 0 })}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Grupo de Capas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ID (Slug)</Label>
                <Input 
                  value={formData.id} 
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  placeholder="e.g. censo-2022"
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Censo 2022"
                />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                Crear
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.id}</TableCell>
                <TableCell>{group.order}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(group)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar Grupo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esto eliminará el grupo "{group.name}". Las capas en este grupo serán eliminadas (cascada).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive"
                          onClick={() => deleteMutation.mutate(group.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                />
              </div>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                Actualizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
