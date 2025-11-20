import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Trash2, Pencil } from "lucide-react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { fetchJson, qk } from "~/lib/api"
import { toast } from "sonner"
import { useState } from "react"
import { LayerEditForm } from "./layer-edit-form"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

export function LayerList({ layers }: { layers: any[] }) {
  const queryClient = useQueryClient()
  const [editingLayer, setEditingLayer] = useState<any>(null)

  // We need groups for the edit form
  const groupsQuery = useQuery({
    queryKey: ["admin", "layer-groups"],
    queryFn: () => fetchJson<any[]>("/api/admin/layer-groups"),
  })

  const deleteLayerMutation = useMutation({
    mutationFn: async (id: string) => {
      return fetchJson(`/api/admin/layers?id=${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      toast.success("Layer deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "layers"] })
      queryClient.invalidateQueries({ queryKey: qk.catalog })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete layer")
    },
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Existing Layers</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{layer.name}</p>
                  <p className="text-sm text-muted-foreground">{layer.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{layer.kind}</Badge>
                  {layer.defaultVisible && <Badge>Visible</Badge>}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setEditingLayer(layer)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the layer
                          "{layer.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteLayerMutation.mutate(layer.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Dialog open={!!editingLayer} onOpenChange={(open) => !open && setEditingLayer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Layer</DialogTitle>
            </DialogHeader>
            {editingLayer && (
              <LayerEditForm 
                layer={editingLayer} 
                groups={groupsQuery.data ?? []} 
                onClose={() => setEditingLayer(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
