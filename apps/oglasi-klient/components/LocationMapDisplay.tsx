'use client'

import { useEffect, useRef } from 'react'

type LocationMapDisplayProps = {
  latitude: number
  longitude: number
  city: string
}

export function LocationMapDisplay({
  latitude,
  longitude,
  city,
}: LocationMapDisplayProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const mapScriptLoaded = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Učitaj CSS ako već nije učitan
    if (!document.querySelector('link[href*="leaflet.min.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }

    // Učitaj JavaScript ako već nije učitan
    if (!(window as any).L && !mapScriptLoaded.current) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
      script.async = true
      script.onload = () => {
        mapScriptLoaded.current = true
        initializeMap()
      }
      document.body.appendChild(script)
    } else if ((window as any).L && !map.current) {
      initializeMap()
    }

    function initializeMap() {
      if (!mapContainer.current) return

      const L = (window as any).L

      if (map.current) {
        map.current.remove()
      }

      map.current = L.map(mapContainer.current).setView([latitude, longitude], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current)

      L.marker([latitude, longitude])
        .addTo(map.current)
        .bindPopup(`<div class="text-center"><p class="font-medium">${city}</p><p class="text-sm text-gray-600">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p></div>`)
        .openPopup()
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, city])

  return (
    <div
      ref={mapContainer}
      className="h-96 w-full rounded-lg border border-gray-200"
      style={{ position: 'relative', zIndex: 0 }}
    />
  )
}
