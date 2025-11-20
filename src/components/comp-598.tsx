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
import { useEffect, useMemo } from "react"
import { ROOT_ID, useLayers } from "~/components/layers/provider"

const indent = 20

function LayerTreeView({
  items,
  visibleLayerIds,
  setVisibleFromChecked,
}: {
  items: Record<string, { name: string; children?: string[] }>
  visibleLayerIds: Set<string>
  setVisibleFromChecked: (ids: string[]) => void
}) {
  const tree = useTree({
    initialState: {
      expandedItems: [ROOT_ID],
      checkedItems: Array.from(visibleLayerIds),
    },
    indent,
    rootItemId: ROOT_ID,
    getItemName: (item) => item.getItemData()!.name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId: string) => items[itemId] ?? null,
      getChildren: (itemId: string) => items[itemId]?.children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  })

  // Sync initial state from props
  useEffect(() => {
    try {
      (tree as any).expandItem?.(ROOT_ID)
    } catch {}
  }, [])

  // Sync prop changes to tree (e.g. defaults loaded)
  useEffect(() => {
    tree.setCheckedItems(Array.from(visibleLayerIds))
  }, [visibleLayerIds])

  // Sync prop changes to tree (e.g. defaults loaded)
  useEffect(() => {
    tree.setCheckedItems(Array.from(visibleLayerIds))
  }, [visibleLayerIds])

  return (
    <Tree indent={indent} tree={tree}>
      {tree.getItems().map((item) => {
        const checkboxProps = item.getCheckboxProps()
        const id = item.getId()
        const itemData = item.getItemData?.()
        return (
          <div
            key={id}
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
                checkboxProps.onChange?.({ target: { checked } })
                // We need to wait for the tree to update its internal state? 
                // headless-tree usually updates synchronously or we might need to defer this?
                // Let's try deferring slightly or assuming synchronous update if it's not React state based.
                // Actually, let's use a timeout to let the tree update process.
                requestAnimationFrame(() => {
                   const checkedItems = tree.getItems()
                    .filter((i: any) => i.getCheckedState() === "checked")
                    .map((i: any) => i.getId())
                   setVisibleFromChecked(checkedItems)
                })
              }}
            />
            <TreeItem item={item} className="flex-1 not-last:pb-0">
              <TreeItemLabel />
            </TreeItem>
          </div>
        )
      })}
    </Tree>
  )
}

export default function ArbolCapas() {
  const { ready, items, visibleLayerIds, setVisibleFromChecked } = useLayers()

  // Derive a version key from items to remount visual tree when data arrives
  const dataVersion = useMemo(
    () => JSON.stringify(Object.keys(items).sort()),
    [items],
  )

  if (!ready) return <div className="p-2 text-sm">Cargando capas…</div>

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <LayerTreeView
        key={dataVersion}
        items={items}
        visibleLayerIds={visibleLayerIds}
        setVisibleFromChecked={setVisibleFromChecked}
      />
    </div>
  )
}