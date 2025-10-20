"use client"

import {
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"

import { Checkbox } from "~/components/ui/checkbox"
import { Tree, TreeItem, TreeItemLabel } from "~/components/tree"
import { useEffect} from "react"
import { useLayers } from "~/components/layers/provider"

const indent = 20

export default function ArbolCapas() {
  const { ready, items, visibleLayerIds, setVisibleFromChecked } = useLayers()

  const tree = useTree({
    initialState: {
      expandedItems: ["company"], // expande raíz al inicio
      checkedItems: Array.from(visibleLayerIds),
    },
    indent,
    rootItemId: "company",
    getItemName: (item) => item.getItemData()!.name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId: string) => items[itemId],
      getChildren: (itemId: string) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  })

  // Cuando cambia el "items" o el visible inicial, sincronizamos checks
  useEffect(() => {
    if (!ready) return
    // Ajusta items checkeados en el árbol desde el provider
    tree.setCheckedItems(Array.from(visibleLayerIds))
  }, [ready, visibleLayerIds, tree])

  if (!ready) return <div className="p-2 text-sm">Cargando capas…</div>

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
          const checkboxProps = item.getCheckboxProps()
          return (
            <div
              key={item.getId()}
              className="flex items-center gap-1.5 not-last:pb-0.5"
            >
              <Checkbox
                checked={
                  {
                    checked: true,
                    unchecked: false,
                    indeterminate: "indeterminate" as const,
                  }[item.getCheckedState()]
                }
                onCheckedChange={(checked) => {
                  // Actualiza el estado interno del árbol
                  checkboxProps.onChange?.({ target: { checked }})
                  // Sincroniza Provider con todos los items checkeados del árbol
                  setVisibleFromChecked(tree.getCheckedItems())
                }}
              />
              <TreeItem item={item} className="flex-1 not-last:pb-0">
                <TreeItemLabel />
              </TreeItem>
            </div>
          )
        })}
      </Tree>
    </div>
  )
}