"use client"

import { useEffect, useRef } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

type Feature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: { id: string; name: string; company?: string | null; specialties?: string[]; cidade?: string | null; estado?: string | null; logo_url?: string | null; contact_phone?: string | null }
}

type FeatureCollection = { type: 'FeatureCollection'; features: Feature[] }

export default function HomeMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let map: any
    let maplibregl: any
    let mounted = true

    async function init() {
      try {
        const res = await fetch(`/api/public/maricultores?_=${Date.now()}`, { cache: 'no-store' })
        const geojson: FeatureCollection = await res.json()

        if (!res.ok || !geojson?.features || !Array.isArray(geojson.features)) {
          return
        }

        // Mapa id -> logo_url do GeoJSON (chave em string para bater com props.id no click)
        const logoUrlById = new Map<string, string | null>()
        geojson.features.forEach((f) => {
          const id = f.properties?.id
          const url = (f.properties as any)?.logo_url ?? null
          if (id != null) logoUrlById.set(String(id), url ? String(url) : null)
        })

        // Lazy import maplibre-gl to avoid SSR issues
        maplibregl = (await import('maplibre-gl')).default

        if (!mounted || !mapContainerRef.current) return

        map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
          center: [-45.08, -23.43], // Ubatuba
          zoom: 11, // Zoom maior para região de Ubatuba
        })

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
        map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: true }), 'top-right')

        map.on('load', () => {
          map.addSource('maricultores', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 12,
            clusterRadius: 45,
          })

          map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'maricultores',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#0ea5e9',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                14,
                10,
                18,
                25,
                24,
              ],
              'circle-opacity': 0.85,
            },
          })

          map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'maricultores',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-size': 12,
              'text-font': ['Open Sans Semibold'],
            },
            paint: {
              'text-color': '#ffffff',
            },
          })

          map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'maricultores',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#22c55e',
              'circle-radius': 12,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          })

          map.on('click', 'clusters', (e: any) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
            const clusterId = features[0].properties.cluster_id
            ;(map.getSource('maricultores') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
              if (err) return
              map.easeTo({ center: features[0].geometry.coordinates, zoom })
            })
          })

          const buildPopupContent = (props: Record<string, unknown>, logoUrl: string | null) => {
            const spArr = props.specialties
              ? String(props.specialties).replace(/[\[\]\"]/g, '').split(',').map((s: string) => s.trim()).filter(Boolean)
              : []
            const badges = spArr.slice(0, 3)
              .map((s: string) => `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:#f1f5f9;color:#0f172a;font-size:10px;margin-right:4px;margin-bottom:4px">${s}</span>`)
              .join('')
            const location = props.cidade ? `${props.cidade}${props.estado ? ' - ' + props.estado : ''}` : ''
            const wrap = document.createElement('div')
            wrap.style.cssText = 'min-width:220px;max-width:260px;background:#fff;border-radius:12px;box-shadow:0 10px 25px rgba(2,6,23,.15);padding:12px;font-family:ui-sans-serif,system-ui,sans-serif'
            if (logoUrl) {
              const imgWrap = document.createElement('div')
              imgWrap.style.marginBottom = '8px'
              imgWrap.style.minHeight = '48px'
              const img = document.createElement('img')
              img.alt = 'Logo'
              img.style.cssText = 'width:48px;height:48px;border-radius:10px;object-fit:cover;border:1px solid #e2e8f0'
              imgWrap.appendChild(img)
              wrap.appendChild(imgWrap)
              // Usar proxy da nossa API (mesma origem) para evitar CORS/bloqueio de img externa
              const pathMatch = logoUrl.match(/maricultor_logos\/(.+)$/)
              const logoPath = pathMatch ? pathMatch[1] : ''
              img.src = logoPath
                ? `/api/public/maricultor-logo?path=${encodeURIComponent(logoPath)}`
                : logoUrl
            }
            const nameEl = document.createElement('div')
            nameEl.style.cssText = 'font-weight:700;font-size:14px;color:#0f172a'
            nameEl.textContent = (props.name as string) || 'Maricultor'
            wrap.appendChild(nameEl)
            if (props.company) {
              const companyEl = document.createElement('div')
              companyEl.style.cssText = 'font-size:12px;color:#0ea5e9;margin-top:2px'
              companyEl.textContent = String(props.company)
              wrap.appendChild(companyEl)
            }
            if (badges) {
              const badgesEl = document.createElement('div')
              badgesEl.style.marginTop = '6px'
              badgesEl.innerHTML = badges
              wrap.appendChild(badgesEl)
            }
            if (location) {
              const locEl = document.createElement('div')
              locEl.style.cssText = 'font-size:12px;color:#64748b;margin-top:6px'
              locEl.textContent = location
              wrap.appendChild(locEl)
            }
            const phone = props.contact_phone ? String(props.contact_phone).trim() : ''
            if (phone) {
              const phoneEl = document.createElement('div')
              phoneEl.style.cssText = 'font-size:12px;color:#0f172a;margin-top:6px'
              const link = document.createElement('a')
              link.href = `tel:${phone.replace(/\D/g, '')}`
              link.textContent = phone
              link.style.color = '#0ea5e9'
              link.style.textDecoration = 'none'
              phoneEl.appendChild(document.createTextNode('📞 '))
              phoneEl.appendChild(link)
              wrap.appendChild(phoneEl)
            }
            return wrap
          }

          map.on('click', 'unclustered-point', (e: any) => {
            const feat = e.features?.[0]
            if (!feat) return
            const props = feat.properties || {}
            const featId = props.id != null ? String(props.id) : ''
            const logoUrl = (featId && logoUrlById.get(featId)) ?? props.logo_url ?? null
            const content = buildPopupContent(props, logoUrl)
            new maplibregl.Popup({ offset: 12, closeButton: false })
              .setLngLat(feat.geometry.coordinates)
              .setDOMContent(content)
              .addTo(map)
          })

          map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = ''
          })
          map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = ''
          })

          // Fallback: se por algum motivo o evento no layer não disparar, tratamos no mapa inteiro
          map.on('click', (e: any) => {
            const feats = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
            if (!feats || feats.length === 0) return
            const feat = feats[0]
            const props = feat.properties || {}
            const featId = props.id != null ? String(props.id) : ''
            const logoUrl = (featId && logoUrlById.get(featId)) ?? props.logo_url ?? null
            const content = buildPopupContent(props, logoUrl)
            new maplibregl.Popup({ offset: 12, closeButton: false })
              .setLngLat(feat.geometry.coordinates)
              .setDOMContent(content)
              .addTo(map)
          })
        })
      } catch (err) {
        // fail silently
      }
    }

    init()
    return () => {
      mounted = false
      if (map) map.remove()
    }
  }, [])

  return <div ref={mapContainerRef} className="w-full h-[480px] rounded-xl" />
}


