"use client";
import {
  checkboxesFeature,
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core"
import { useTree } from "@headless-tree/react"

import { Checkbox } from "~/components/ui/checkbox"
import { Tree, TreeItem, TreeItemLabel } from "~/components/tree"

interface Item {
  name: string
  children?: string[]
}

const items: Record<string, Item> = {
  company: {
    name: "Company",
    children: ["orgnacionales", "orgprovinciales", "unse"],
  },
  orgnacionales: {
    name: "Organismos Nacionales",
    children: ["inta", "indec"],
  },
  inta: { name: "INTA", children: ["unidades-inta", "suelos"] },
  "unidades-inta": {
    name: "Unidades INTA",
    children: ["components", "tokens", "guidelines"],
  },
  components: { name: "Components" },
  tokens: { name: "Tokens" },
  guidelines: { name: "Guidelines" },
  "suelos": { name: "Suelos" },
  indec: { name: "INDEC", children: ["radioscensales", "estasdiscticaspais"] },
  radioscensales: { name: "Radios Censales" },
  estasdiscticaspais: { name: "Estadisticas Pais" },
  orgprovinciales: { name: "Organismos Provinciales", children: ["ministerioeducacion", "ministeriosalud"] },
  ministerioeducacion: { name: "Ministerio de Educacion" },
  ministeriosalud: { name: "Ministerio de Salud" },
  unse: { name: "Universidad Nacional de Santiago del Estero", children: ["fceyt", "fcm"] },
  fceyt: { name: "FCEyT" },
  fcm: { name: "FCM" },
}

const indent = 20

export default function ArbolCapas() {
  const tree = useTree<Item>({
    initialState: {
      expandedItems: ["engineering", "frontend", "design-system"],
      checkedItems: ["components", "tokens"],
    },
    indent,
    rootItemId: "company",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => items[itemId].children ?? [],
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      checkboxesFeature,
      hotkeysCoreFeature,
    ],
  })

  return (
    <div className="flex h-full flex-col gap-2 *:first:grow">
      <Tree indent={indent} tree={tree}>
        {tree.getItems().map((item) => {
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
                  const checkboxProps = item.getCheckboxProps()
                  checkboxProps.onChange?.({ target: { checked } })
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
