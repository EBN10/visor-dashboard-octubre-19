"use client"

import React from "react"

export function MapLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div className="absolute inset-0 z-[999] flex items-center justify-center bg-white/40 backdrop-blur-[1px] pointer-events-none">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-700">Cargando datos…</p>
      </div>
    </div>
  )
}