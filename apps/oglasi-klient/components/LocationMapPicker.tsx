'use client'

import { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'

type LocationMapPickerProps = {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialLat?: number
  initialLng?: number
  initialAddress?: string
}

export function LocationMapPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress,
}: LocationMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false)
  const [selectedLat, setSelectedLat] = useState<number | null>(initialLat ?? null)
  const [selectedLng, setSelectedLng] = useState<number | null>(initialLng ?? null)
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '')
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)

  // Učitaj Leaflet biblioteku dinamički
  useEffect(() => {
    if (typeof window === 'undefined' || mapScriptLoaded) return

    // Učitaj CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)

    // Učitaj JavaScript
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.async = true
    script.onload = () => {
      setMapScriptLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [mapScriptLoaded])

  // Inicijalizuj mapu
  useEffect(() => {
    if (!mapScriptLoaded || !showMap || !mapContainer.current || map.current) return

    const L = (window as any).L

    // Default lokacija: Sarajevo
    const defaultLat = initialLat || 43.85
    const defaultLng = initialLng || 18.35

    map.current = L.map(mapContainer.current).setView([defaultLat, defaultLng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Postavi marker ako je već izabrana lokacija
    if (selectedLat !== null && selectedLng !== null) {
      marker.current = L.marker([selectedLat, selectedLng]).addTo(map.current)
    }

    // Klik na mapu postavi marker
    map.current.on('click', async (e: any) => {
      const { lat, lng } = e.latlng
      setSelectedLat(lat)
      setSelectedLng(lng)

      // Ukloni stari marker
      if (marker.current) {
        map.current.removeLayer(marker.current)
      }

      // Dodaj novi marker
      marker.current = L.marker([lat, lng]).addTo(map.current)
      map.current.setView([lat, lng], 13)

      // Pokušaj reverse geocoding (besplatno od OpenStreetMap)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
        const data = await response.json()
        setSelectedAddress(data.address?.road || data.address?.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      } catch (err) {
        setSelectedAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapScriptLoaded, showMap])

  const handleConfirm = () => {
    if (selectedLat === null || selectedLng === null) {
      setError('Molimo odaberite lokaciju na mapi')
      return
    }
    onLocationSelect(selectedLat, selectedLng, selectedAddress)
    setError('')
  }

  return (
    <div className="space-y-3">
      <Label>Lokacija na Mapi</Label>

      {!showMap ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMap(true)}
          className="w-full"
        >
          {selectedLat && selectedLng ? 'Prosledi lokaciju' : 'Odaberi lokaciju na mapi'}
        </Button>
      ) : null}

      {showMap && (
        <>
          <div
            ref={mapContainer}
            className="h-96 w-full rounded-lg border border-gray-200"
            style={{ position: 'relative', zIndex: 1 }}
          />

          <div className="space-y-2">
            {selectedLat !== null && selectedLng !== null && (
              <>
                <Input
                  type="text"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  placeholder="Adresa (opciono - za prikaz)"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Koordinate: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                </p>
              </>
            )}

            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleConfirm}
                className="flex-1"
                disabled={selectedLat === null || selectedLng === null}
              >
                Potvrdi lokaciju
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMap(false)
                  setError('')
                }}
                className="flex-1"
              >
                Otkaži
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedLat !== null && selectedLng !== null && !showMap && (
        <div className="rounded-md bg-blue-50 p-3 text-sm">
          <p className="font-medium">Odabrana lokacija:</p>
          <p className="text-muted-foreground">{selectedAddress}</p>
          <p className="text-xs text-muted-foreground">
            {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
