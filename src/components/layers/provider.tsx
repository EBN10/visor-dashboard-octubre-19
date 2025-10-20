"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { LayerConfig } from "~/server/db/schema";

type Item = { name: string; children?: string[] }

export type LayerNodeMeta = {
  id: string
  type: "group" | "layer"
  name: string
  parentId: string | null
  kind?: "vector" | "xyz" | "wms"
  config?: LayerConfig
  defaultVisible?: boolean
  order: number
}

type CatalogResponse = {
  nodes: LayerNodeMeta[]
}

type LayersContextValue = {
  ready: boolean
  items: Record<string, Item>
  metas: Record<string, LayerNodeMeta>
  visibleLayerIds: Set<string>
  setVisibleFromChecked: (checkedIds: string[]) => void
}

const LayersContext = createContext<LayersContextValue | null>(null)

function nodesToItems(nodes: LayerNodeMeta[]) {
  const items: Record<string, Item> = {}
  const children: Record<string, string[]> = {}

  // ensure all groups/items exist
  nodes.forEach((n) => {
    items[n.id] ??= { name: n.name, children: [] };
  })

  nodes.forEach((n) => {
    if (n.parentId) {
      children[n.parentId] ??= [];
      children[n.parentId]!.push(n.id)
    }
  })

  // sort children by order then name
  Object.keys(children).forEach((pid) => {
    children[pid]!.sort((a, b) => {
      const na = nodes.find((n) => n.id === a)!
      const nb = nodes.find((n) => n.id === b)!
      if ((na.order ?? 0) !== (nb.order ?? 0)) {
        return (na.order ?? 0) - (nb.order ?? 0)
      }
      return na.name.localeCompare(nb.name)
    })
  })

  nodes.forEach((n) => {
    items[n.id]!.children = children[n.id] ?? []
  })

  return items
}

export function LayersProvider(props: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [items, setItems] = useState<Record<string, Item>>({})
  const [metas, setMetas] = useState<Record<string, LayerNodeMeta>>({})
  const [visibleLayerIds, setVisibleLayerIds] = useState<Set<string>>(
    new Set(),
  )

useEffect(() => {
  let cancelled = false

  async function loadCatalog() {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" })
      const data = (await res.json()) as CatalogResponse
      if (cancelled) return

      const metasById: Record<string, LayerNodeMeta> = {}
      data.nodes.forEach((n) => {
        metasById[n.id] = n
      })

      setMetas(metasById)
      setItems(nodesToItems(data.nodes))

      // visible inicial: las capas con defaultVisible
      const vis = new Set<string>()
      data.nodes.forEach((n) => {
        if (n.type === "layer" && n.defaultVisible) vis.add(n.id)
      })
      setVisibleLayerIds(vis)
      setReady(true)
    } catch (error) {
      console.error("Error cargando catálogo:", error)
    }
  }

  loadCatalog().catch(console.error) // ejecuta la función asíncrona

  return () => {
    cancelled = true
  }
}, [])

  const value = useMemo<LayersContextValue>(
    () => ({
      ready,
      items,
      metas,
      visibleLayerIds,
      setVisibleFromChecked: (checkedIds: string[]) => {
        const onlyLayers = checkedIds.filter(
          (id) => metas[id]?.type === "layer",
        )
        setVisibleLayerIds(new Set(onlyLayers))
      },
    }),
    [ready, items, metas, visibleLayerIds],
  )

  return (
    <LayersContext.Provider value={value}>
      {props.children}
    </LayersContext.Provider>
  )
}

export function useLayers() {
  const ctx = useContext(LayersContext)
  if (!ctx) throw new Error("useLayers must be used within LayersProvider")
  return ctx
}