"use client"

import dynamic from "next/dynamic"

// Export a dynamic client-only map to avoid SSR evaluation of react-leaflet
export const Mapa = dynamic(() => import("./ClientMap"), { ssr: false })
