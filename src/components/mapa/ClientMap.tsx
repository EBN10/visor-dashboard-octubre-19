"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  Rectangle,
  TileLayer,
  GeoJSON,
  useMap,
  useMapEvent,
} from "react-leaflet"
import { WMSTileLayer } from "react-leaflet"
import { useQuery } from "@tanstack/react-query"
import { fetchJson, qk } from "~/lib/api"
import { useEventHandlers, useLeafletContext } from "@react-leaflet/core"
import type {
  Map as LeafletMap,
  LeafletEvent,
  LatLngBounds,
} from "leaflet"
import type { FeatureCollection } from "geojson"
import { useLayers } from "~/components/layers/provider"

// Keep all react-leaflet usage here to avoid SSR evaluation

type Position = "bottomleft" | "bottomright" | "topleft" | "topright"

const POSITION_CLASSES: Record<Position, string> = {
  bottomleft: "leaflet-bottom leaflet-left",
  bottomright: "leaflet-bottom leaflet-right",
  topleft: "leaflet-top leaflet-left",
  topright: "leaflet-top leaflet-right",
}

const BOUNDS_STYLE = { weight: 1 }

interface MinimapBoundsProps {
  parentMap: LeafletMap
  zoom: number
}

function MinimapBounds({ parentMap, zoom }: MinimapBoundsProps) {
  const minimap = useMap()
  const context = useLeafletContext()

  const onClick = useCallback(
    (e: LeafletEvent & { latlng: L.LatLng }) => {
      parentMap.setView(e.latlng, parentMap.getZoom())
    },
    [parentMap],
  )
  useMapEvent("click", onClick)

  const [bounds, setBounds] = useState<LatLngBounds>(parentMap.getBounds())
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds())
    minimap.setView(parentMap.getCenter(), zoom)
  }, [minimap, parentMap, zoom])

  const handlers = useMemo(
    () => ({ move: onChange, zoom: onChange }),
    [onChange],
  )
  useEventHandlers({ instance: parentMap, context }, handlers)

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
}

interface MinimapControlProps {
  position?: Position
  zoom?: number
}

function MinimapControl({ position, zoom }: MinimapControlProps) {
  const parentMap = useMap()
  const mapZoom = zoom ?? 0

  const minimap = useMemo(
    () => (
      <MapContainer
        className="hidden sm:block w-48 h-24 lg:w-64 lg:h-32"
        center={parentMap.getCenter()}
        zoom={mapZoom}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
      </MapContainer>
    ),
    [parentMap, mapZoom],
  )

  const positionClass =
    (position && POSITION_CLASSES[position]) ?? POSITION_CLASSES.topright
  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  )
}

// Helpers

function boundsToBboxParam(b: LatLngBounds) {
  const sw = b.getSouthWest()
  const ne = b.getNorthEast()
  return `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`
}

function useMapViewport() {
  const map = useMap()
  const [viewport, setViewport] = useState(() => ({
    bounds: map.getBounds(),
    zoom: map.getZoom(),
  }))

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleUpdate = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setViewport({ bounds: map.getBounds(), zoom: map.getZoom() })
    }, 150) // debounce
  }, [map])

  useMapEvent("moveend", scheduleUpdate)
  useMapEvent("zoomend", scheduleUpdate)

  return viewport
}

function VectorLayer({ id, color }: { id: string; color?: string }) {
  const { bounds, zoom } = useMapViewport()
  const bbox = boundsToBboxParam(bounds)

  const { data } = useQuery({
    queryKey: qk.vectorLayer(id, bbox, zoom),
    queryFn: ({ signal }) =>
      fetchJson<FeatureCollection>(
        `/api/layers/${encodeURIComponent(id)}/data?bbox=${bbox}&z=${zoom}`,
        { signal },
      ),
    placeholderData: (prev) => prev,
  })

  if (!data) return null

 return (
  <GeoJSON
    key={id}
    data={data}
    style={() => ({
      color: color ?? "#0066cc",
      weight: 2,
      fillOpacity: 0.25,
    })}
    onEachFeature={(feature, layer) => {
      // Lee propiedades de la feature
      const p = (feature.properties ?? {}) as Record<string, any>

      // Props que querés mostrar en el popup
      // Puedes “cablearlas” aquí o leerlas del catálogo (metas[id].config.popupProps)
      const props = ["cod_indec", "jur", "dpto"]

      // Construye HTML simple
      const html = props
        .map((k) => `<div><b>${k}:</b> ${p?.[k] ?? ""}</div>`)
        .join("")

      layer.bindPopup(`<div style="min-width:180px">${html}</div>`)
    }}
  />
)
}

function WmsLayer(props: {
  url: string
  layers: string
  format?: string
  transparent?: boolean
  version?: string
}) {
  return (
    <WMSTileLayer
      url={props.url}
      params={{
        layers: props.layers,
        format: props.format ?? "image/png",
        transparent: props.transparent ?? true,
        version: props.version ?? "1.3.0",
      }}
    />
  )
}

function XyzLayer({ url, attribution }: { url: string; attribution?: string }) {
  return <TileLayer url={url} attribution={attribution} />
}

function LayerRenderer() {
  const { metas, visibleLayerIds } = useLayers()

  const visible = Array.from(visibleLayerIds).map((id) => metas[id])

  return (
    <>
      {visible.map((m) => {
        if (!m) return null
        if (m.type !== "layer") return null
        if (m.kind === "vector") {
          return (
            <VectorLayer
              key={m.id}
              id={m.id}
              // puedes mapear color por capa si quieres:
              color="#0066cc"
            />
          )
        }
        if (m.kind === "wms") {
          const cfg = m.config!
          return (
            <WmsLayer
              key={m.id}
              url={cfg.url}
              layers={cfg.layers}
              format={cfg.format}
              transparent={cfg.transparent}
              version={cfg.version}
            />
          )
        }
        if (m.kind === "xyz") {
          const cfg = m.config!
          return (
            <XyzLayer key={m.id} url={cfg.url} attribution={cfg.attribution} />
          )
        }
        return null
      })}
    </>
  )
}

export default function ClientMap() {
  return (
    <MapContainer
      center={[-27.909423151558293, -62.85220337225053]}
      zoom={7}
      className="h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayerRenderer />
      <MinimapControl zoom={5} position="bottomright" />
    </MapContainer>
  )
}
