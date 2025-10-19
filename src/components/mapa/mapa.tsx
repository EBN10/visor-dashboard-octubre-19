"use client";
import { useCallback, useMemo, useState } from 'react';
import {
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvent
} from 'react-leaflet';
import { useEventHandlers, useLeafletContext } from '@react-leaflet/core';
import type { Map as LeafletMap, LeafletEvent, LatLngBounds } from 'leaflet';

type Position =
  | 'bottomleft'
  | 'bottomright'
  | 'topleft'
  | 'topright';

const POSITION_CLASSES: Record<Position, string> = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

const BOUNDS_STYLE = { weight: 1 };

interface MinimapBoundsProps {
  parentMap: LeafletMap;
  zoom: number;
}

function MinimapBounds({ parentMap, zoom }: MinimapBoundsProps) {
  const minimap = useMap();
  const context = useLeafletContext();

  // Clicking a point on the minimap sets the parent's map center
  const onClick = useCallback(
    (e: LeafletEvent & { latlng: L.LatLng }) => {
      parentMap.setView(e.latlng, parentMap.getZoom());
    },
    [parentMap]
  );
  useMapEvent('click', onClick);

  // Keep track of bounds in state to trigger renders
  const [bounds, setBounds] = useState<LatLngBounds>(parentMap.getBounds());
  const onChange = useCallback(() => {
    setBounds(parentMap.getBounds());
    minimap.setView(parentMap.getCenter(), zoom);
  }, [minimap, parentMap, zoom]);

  // Listen to events on the parent map
  const handlers = useMemo(() => ({ move: onChange, zoom: onChange }), [onChange]);
  useEventHandlers({ instance: parentMap, context }, handlers);

  return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />;
}

interface MinimapControlProps {
  position?: Position;
  zoom?: number;
}

function MinimapControl({ position, zoom }: MinimapControlProps) {
  const parentMap = useMap();
  const mapZoom = zoom ?? 0;

  // Memoize the minimap so it's not affected by position changes
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
    [parentMap, mapZoom]
  );

  const positionClass =
    (position && POSITION_CLASSES[position]) ?? POSITION_CLASSES.topright;
  return (
    <div className={positionClass}>
      <div className="leaflet-control leaflet-bar">{minimap}</div>
    </div>
  );
}

export function Mapa() {
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
      <MinimapControl zoom={5} position="bottomright" />
    </MapContainer>
  );
}