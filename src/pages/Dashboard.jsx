import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

// ── Constantes ────────────────────────────────────────────────
const ESTADO_LABELS = { perdida: 'Perdida', encontrada: 'Encontrada', resuelta: 'Resuelta 🎉' }
const ESTADO_COLORS = { perdida: '#C94B1A', encontrada: '#2D7D46', resuelta: '#8B6E54' }
const PAGE_SIZE = 20

// ── Coordenadas nacionales (capitales comunales Chile) ────────
const COORDS_CHILE = {
  // Región de Arica y Parinacota
  'Arica': { lat: -18.4783, lng: -70.3126 },
  'Putre': { lat: -18.1987, lng: -69.5592 },
  'General Lagos': { lat: -17.4833, lng: -69.6333 },
  'Camarones': { lat: -19.0167, lng: -70.0833 },
  // Región de Tarapacá
  'Iquique': { lat: -20.2133, lng: -70.1503 },
  'Alto Hospicio': { lat: -20.2667, lng: -70.1000 },
  'Pozo Almonte': { lat: -20.2594, lng: -69.7833 },
  'Pica': { lat: -20.4833, lng: -69.3333 },
  'Huara': { lat: -19.9981, lng: -69.7706 },
  'Camiña': { lat: -19.3167, lng: -69.4167 },
  'Colchane': { lat: -19.2667, lng: -68.6333 },
  // Región de Antofagasta
  'Antofagasta': { lat: -23.6509, lng: -70.3975 },
  'Mejillones': { lat: -23.1000, lng: -70.4500 },
  'Sierra Gorda': { lat: -22.8833, lng: -69.3167 },
  'Taltal': { lat: -25.4000, lng: -70.4833 },
  'Calama': { lat: -22.4667, lng: -68.9333 },
  'Ollagüe': { lat: -21.2167, lng: -68.2500 },
  'San Pedro de Atacama': { lat: -22.9089, lng: -68.1997 },
  'Tocopilla': { lat: -22.0917, lng: -70.1981 },
  'María Elena': { lat: -22.3500, lng: -69.6667 },
  // Región de Atacama
  'Copiapó': { lat: -27.3667, lng: -70.3333 },
  'Caldera': { lat: -27.0667, lng: -70.8167 },
  'Tierra Amarilla': { lat: -27.4833, lng: -70.2833 },
  'Chañaral': { lat: -26.3500, lng: -70.6167 },
  'Diego de Almagro': { lat: -26.3667, lng: -70.0500 },
  'Vallenar': { lat: -28.5708, lng: -70.7597 },
  'Alto del Carmen': { lat: -28.7500, lng: -70.4833 },
  'Freirina': { lat: -28.5000, lng: -71.0833 },
  'Huasco': { lat: -28.4667, lng: -71.2167 },
  // Región de Coquimbo
  'La Serena': { lat: -29.9027, lng: -71.2520 },
  'Coquimbo': { lat: -29.9533, lng: -71.3436 },
  'Andacollo': { lat: -30.2333, lng: -71.0833 },
  'La Higuera': { lat: -29.5000, lng: -71.2667 },
  'Paihuano': { lat: -30.0000, lng: -70.5000 },
  'Vicuña': { lat: -30.0319, lng: -70.7097 },
  'Los Andenes': { lat: -30.0280, lng: -70.7050 },
  'Rivadavia': { lat: -30.0150, lng: -70.6950 },
  'Diaguitas': { lat: -29.9950, lng: -70.7250 },
  'Illapel': { lat: -31.6333, lng: -71.1667 },
  'Canela': { lat: -31.4000, lng: -71.4500 },
  'Los Vilos': { lat: -31.9167, lng: -71.5167 },
  'Salamanca': { lat: -31.7833, lng: -70.9667 },
  'Ovalle': { lat: -30.6000, lng: -71.2000 },
  'Combarbalá': { lat: -31.1833, lng: -71.0167 },
  'Monte Patria': { lat: -30.6833, lng: -70.9667 },
  'Punitaqui': { lat: -30.8333, lng: -71.2500 },
  'Río Hurtado': { lat: -30.4667, lng: -70.8167 },
  // Región de Valparaíso
  'Valparaíso': { lat: -33.0472, lng: -71.6127 },
  'Viña del Mar': { lat: -33.0245, lng: -71.5518 },
  'Concón': { lat: -32.9233, lng: -71.5294 },
  'Quilpué': { lat: -33.0500, lng: -71.4333 },
  'Villa Alemana': { lat: -33.0431, lng: -71.3736 },
  'Casablanca': { lat: -33.3167, lng: -71.4167 },
  'Juan Fernández': { lat: -33.6167, lng: -78.8333 },
  'San Antonio': { lat: -33.5928, lng: -71.6011 },
  'Algarrobo': { lat: -33.3500, lng: -71.6667 },
  'Cartagena': { lat: -33.5333, lng: -71.6167 },
  'El Quisco': { lat: -33.3833, lng: -71.7000 },
  'El Tabo': { lat: -33.4500, lng: -71.6667 },
  'Santo Domingo': { lat: -33.6500, lng: -71.6167 },
  'Quillota': { lat: -32.8833, lng: -71.2500 },
  'La Calera': { lat: -32.7833, lng: -71.2000 },
  'Hijuelas': { lat: -32.8167, lng: -71.1500 },
  'La Cruz': { lat: -32.8167, lng: -71.2667 },
  'Limache': { lat: -33.0167, lng: -71.2667 },
  'Nogales': { lat: -32.7167, lng: -71.2167 },
  'Olmué': { lat: -33.0000, lng: -71.2000 },
  'Los Andes': { lat: -32.8333, lng: -70.5997 },
  'Calle Larga': { lat: -32.8500, lng: -70.6333 },
  'Rinconada': { lat: -32.8333, lng: -70.7833 },
  'San Esteban': { lat: -32.7667, lng: -70.6500 },
  'La Ligua': { lat: -32.4500, lng: -71.2333 },
  'Cabildo': { lat: -32.4167, lng: -71.0667 },
  'Papudo': { lat: -32.5167, lng: -71.4500 },
  'Petorca': { lat: -32.2500, lng: -70.9167 },
  'Zapallar': { lat: -32.5500, lng: -71.4667 },
  'Putaendo': { lat: -32.6333, lng: -70.7167 },
  'San Felipe': { lat: -32.7500, lng: -70.7167 },
  'Santa María': { lat: -32.7500, lng: -70.6833 },
  'Isla de Pascua': { lat: -27.1127, lng: -109.3497 },
  // Región Metropolitana
  'Santiago': { lat: -33.4569, lng: -70.6483 },
  'Cerrillos': { lat: -33.4917, lng: -70.7167 },
  'Cerro Navia': { lat: -33.4333, lng: -70.7333 },
  'Conchalí': { lat: -33.3833, lng: -70.6667 },
  'El Bosque': { lat: -33.5667, lng: -70.6667 },
  'Estación Central': { lat: -33.4667, lng: -70.6833 },
  'Huechuraba': { lat: -33.3667, lng: -70.6500 },
  'Independencia': { lat: -33.4167, lng: -70.6667 },
  'La Cisterna': { lat: -33.5333, lng: -70.6667 },
  'La Florida': { lat: -33.5167, lng: -70.5833 },
  'La Granja': { lat: -33.5333, lng: -70.6333 },
  'La Pintana': { lat: -33.5833, lng: -70.6333 },
  'La Reina': { lat: -33.4500, lng: -70.5500 },
  'Las Condes': { lat: -33.4167, lng: -70.5500 },
  'Lo Barnechea': { lat: -33.3500, lng: -70.5167 },
  'Lo Espejo': { lat: -33.5167, lng: -70.6833 },
  'Lo Prado': { lat: -33.4500, lng: -70.7333 },
  'Macul': { lat: -33.4833, lng: -70.5833 },
  'Maipú': { lat: -33.5167, lng: -70.7667 },
  'Ñuñoa': { lat: -33.4667, lng: -70.6000 },
  'Pedro Aguirre Cerda': { lat: -33.5000, lng: -70.6833 },
  'Peñalolén': { lat: -33.4833, lng: -70.5333 },
  'Providencia': { lat: -33.4333, lng: -70.6167 },
  'Pudahuel': { lat: -33.4333, lng: -70.7667 },
  'Quilicura': { lat: -33.3667, lng: -70.7333 },
  'Quinta Normal': { lat: -33.4333, lng: -70.7000 },
  'Recoleta': { lat: -33.4000, lng: -70.6500 },
  'Renca': { lat: -33.4000, lng: -70.7333 },
  'San Joaquín': { lat: -33.4833, lng: -70.6333 },
  'San Miguel': { lat: -33.5000, lng: -70.6500 },
  'San Ramón': { lat: -33.5333, lng: -70.6500 },
  'Vitacura': { lat: -33.3833, lng: -70.5833 },
  'Puente Alto': { lat: -33.6167, lng: -70.5833 },
  'Pirque': { lat: -33.6333, lng: -70.5667 },
  'San José de Maipo': { lat: -33.6333, lng: -70.3500 },
  'Colina': { lat: -33.2000, lng: -70.6667 },
  'Lampa': { lat: -33.2833, lng: -70.8833 },
  'Tiltil': { lat: -33.0833, lng: -70.9333 },
  'San Bernardo': { lat: -33.5833, lng: -70.6833 },
  'Buin': { lat: -33.7333, lng: -70.7500 },
  'Calera de Tango': { lat: -33.6333, lng: -70.7667 },
  'Paine': { lat: -33.8167, lng: -70.7333 },
  'Melipilla': { lat: -33.6833, lng: -71.2167 },
  'Alhué': { lat: -34.0333, lng: -71.0833 },
  'Curacaví': { lat: -33.3833, lng: -71.1333 },
  'María Pinto': { lat: -33.5167, lng: -71.1333 },
  'San Pedro': { lat: -33.6667, lng: -71.4667 },
  'Talagante': { lat: -33.6667, lng: -70.9167 },
  'El Monte': { lat: -33.6833, lng: -71.0333 },
  'Isla de Maipo': { lat: -33.7333, lng: -70.9000 },
  'Padre Hurtado': { lat: -33.5667, lng: -70.8333 },
  'Peñaflor': { lat: -33.6167, lng: -70.8833 },
  // Región de O'Higgins
  'Rancagua': { lat: -34.1708, lng: -70.7444 },
  'Codegua': { lat: -34.0333, lng: -70.6333 },
  'Coinco': { lat: -34.2667, lng: -70.9500 },
  'Coltauco': { lat: -34.2833, lng: -71.0833 },
  'Doñihue': { lat: -34.2167, lng: -70.9667 },
  'Graneros': { lat: -34.0667, lng: -70.7333 },
  'Las Cabras': { lat: -34.2833, lng: -71.3000 },
  'Machalí': { lat: -34.1667, lng: -70.6500 },
  'Malloa': { lat: -34.3500, lng: -71.0000 },
  'Mostazal': { lat: -33.9833, lng: -70.7167 },
  'Olivar': { lat: -34.2000, lng: -70.8000 },
  'Peumo': { lat: -34.3667, lng: -71.2000 },
  'Pichidegua': { lat: -34.4000, lng: -71.2500 },
  'Quinta de Tilcoco': { lat: -34.3167, lng: -70.9667 },
  'Rengo': { lat: -34.4000, lng: -70.8667 },
  'Requínoa': { lat: -34.2333, lng: -70.8167 },
  'San Vicente': { lat: -34.4333, lng: -71.0833 },
  'Pichilemu': { lat: -34.3875, lng: -72.0067 },
  'San Fernando': { lat: -34.5833, lng: -70.9833 },
  'Curicó': { lat: -34.9833, lng: -71.2333 },
  // Región del Maule
  'Talca': { lat: -35.4264, lng: -71.6553 },
  'Linares': { lat: -35.8500, lng: -71.5833 },
  'Cauquenes': { lat: -35.9667, lng: -72.3167 },
  'Parral': { lat: -36.1500, lng: -71.8167 },
  'Constitución': { lat: -35.3333, lng: -72.4167 },
  'Chillán': { lat: -36.6069, lng: -72.1028 },
  // Región de Ñuble
  'Chillán Viejo': { lat: -36.6333, lng: -72.1333 },
  'Bulnes': { lat: -36.7500, lng: -72.3000 },
  'Quirihue': { lat: -36.2833, lng: -72.5333 },
  'San Carlos': { lat: -36.4167, lng: -71.9500 },
  'Yungay': { lat: -37.1333, lng: -72.0167 },
  // Región del Biobío
  'Concepción': { lat: -36.8270, lng: -73.0503 },
  'Talcahuano': { lat: -36.7167, lng: -73.1167 },
  'Hualpén': { lat: -36.7667, lng: -73.0833 },
  'Penco': { lat: -36.7333, lng: -72.9833 },
  'Tomé': { lat: -36.6167, lng: -72.9500 },
  'Coronel': { lat: -37.0167, lng: -73.1500 },
  'Lota': { lat: -37.0833, lng: -73.1500 },
  'Lebu': { lat: -37.6000, lng: -73.6500 },
  'Los Ángeles': { lat: -37.4667, lng: -72.3500 },
  'Mulchén': { lat: -37.7167, lng: -72.2333 },
  // Región de La Araucanía
  'Temuco': { lat: -38.7359, lng: -72.5904 },
  'Padre Las Casas': { lat: -38.7833, lng: -72.5667 },
  'Angol': { lat: -37.7958, lng: -72.7097 },
  'Victoria': { lat: -38.2333, lng: -72.3333 },
  'Villarrica': { lat: -39.2833, lng: -72.2333 },
  'Pucón': { lat: -39.2667, lng: -71.9667 },
  'Nueva Imperial': { lat: -38.7500, lng: -72.9667 },
  // Región de Los Ríos
  'Valdivia': { lat: -39.8142, lng: -73.2459 },
  'La Unión': { lat: -40.2833, lng: -73.0833 },
  'Río Bueno': { lat: -40.3333, lng: -72.9667 },
  'Futrono': { lat: -40.1333, lng: -72.3833 },
  'Panguipulli': { lat: -39.6333, lng: -72.3333 },
  // Región de Los Lagos
  'Puerto Montt': { lat: -41.4717, lng: -72.9367 },
  'Puerto Varas': { lat: -41.3167, lng: -72.9833 },
  'Osorno': { lat: -40.5728, lng: -73.1328 },
  'Castro': { lat: -42.4833, lng: -73.7667 },
  'Ancud': { lat: -41.8667, lng: -73.8333 },
  'Quellón': { lat: -43.1167, lng: -73.6167 },
  'Calbuco': { lat: -41.7667, lng: -73.1333 },
  'Frutillar': { lat: -41.1167, lng: -73.0500 },
  'Llanquihue': { lat: -41.2500, lng: -73.0000 },
  // Región de Aysén
  'Coyhaique': { lat: -45.5752, lng: -72.0662 },
  'Chile Chico': { lat: -46.5333, lng: -71.7167 },
  'Cochrane': { lat: -47.2500, lng: -72.5667 },
  'Puerto Aysén': { lat: -45.4000, lng: -72.6833 },
  // Región de Magallanes
  'Punta Arenas': { lat: -53.1548, lng: -70.9111 },
  'Puerto Natales': { lat: -51.7333, lng: -72.5000 },
  'Porvenir': { lat: -53.2833, lng: -70.3667 },
  'Puerto Williams': { lat: -54.9333, lng: -67.6167 },
}

function getCoordsZona(zona) {
  if (!zona) return null
  const z = zona.toLowerCase().trim()
  for (const [key, coords] of Object.entries(COORDS_CHILE)) {
    if (key.toLowerCase() === z) return { ...coords, nombre: key }
  }
  for (const [key, coords] of Object.entries(COORDS_CHILE)) {
    if (z.includes(key.toLowerCase()) || key.toLowerCase().includes(z)) return { ...coords, nombre: key }
  }
  return null
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr + 'T12:00:00')
  const hoy   = new Date()
  const dias  = Math.floor((hoy - fecha) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7)  return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} sem.`
  return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
}

function cap(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function compartirWhatsApp(m) {
  const nombre = m.nombre ? cap(m.nombre) : cap(m.especie)
  const texto = [
    `🐾 *${nombre} está perdido/a en ${m.comuna}*`,
    ``,
    `📋 ${m.descripcion}`,
    `📍 Zona: ${m.comuna}`,
    `📅 ${formatFecha(m.fecha_perdida)}`,
    m.contacto_alt ? `📞 Contacto: ${m.contacto_alt}` : '',
    ``,
    `🔗 https://sosmascotas.kcrs.cl`,
  ].filter(Boolean).join('\n')
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
}

// ── Mapa con Leaflet y marcadores reales ──────────────────────
function MapaLeaflet({ mascotas }) {
  const mapRef  = useRef(null)
  const mapInst = useRef(null)
  const perdidas = mascotas.filter(m => m.estado === 'perdida')

  const dibujarMarcadores = (L, map) => {
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;background:#C94B1A;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -32],
    })

    const bounds = []
    perdidas.forEach(m => {
      const coords = getCoordsZona(m.comuna)
      if (!coords) return
      bounds.push([coords.lat, coords.lng])
      const nombre = m.nombre ? cap(m.nombre) : cap(m.especie)
      const foto   = m.fotos?.[0] ? `<img src="${m.fotos[0]}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px"/>` : ''
      const popup  = `<div style="font-family:'DM Sans',sans-serif;min-width:150px">
        ${foto}
        <strong style="font-size:13px;color:#1A1009">${nombre}</strong><br>
        <span style="font-size:11px;color:#8B6E54">${cap(m.especie)} · ${m.comuna}</span><br>
        <span style="font-size:11px;color:#A89077">${formatFecha(m.fecha_perdida)}</span>
      </div>`
      L.marker([coords.lat, coords.lng], { icon }).addTo(map).bindPopup(popup)
    })

    if (bounds.length === 1) {
      map.setView(bounds[0], 13)
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  useEffect(() => {
    if (mapInst.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN2GqsQ='
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      const L = window.L
      if (!mapRef.current || mapInst.current) return
      const map = L.map(mapRef.current).setView([-33.4569, -70.6483], 5)
      mapInst.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)
      dibujarMarcadores(L, map)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null }
    }
  }, [])

  useEffect(() => {
    if (!mapInst.current || !window.L) return
    dibujarMarcadores(window.L, mapInst.current)
  }, [mascotas])

  return (
    <div className="db-mapa-wrap">
      <div className="db-mapa-header">
        <h2 className="db-mapa-title">📍 Mapa de reportes</h2>
        <span className="db-mapa-badge">{perdidas.length} perdidas</span>
      </div>
      <div ref={mapRef} className="db-mapa-iframe" />
      {perdidas.length > 0 && (
        <div className="db-mapa-leyenda">
          <p className="db-mapa-leyenda-title">Zonas activas</p>
          {Object.entries(
            perdidas.reduce((acc, m) => { acc[m.comuna] = (acc[m.comuna] || 0) + 1; return acc }, {})
          ).map(([zona, count]) => (
            <div key={zona} className="db-mapa-zona">
              <span className="db-mapa-zona-dot" />
              <span className="db-mapa-zona-nombre">{zona}</span>
              <span className="db-mapa-zona-count">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Placeholder SVG ───────────────────────────────────────────
function Placeholder({ especie }) {
  return (
    <div className="db-card-placeholder">
      <svg viewBox="0 0 120 100" fill="none" width="80" height="67">
        {especie === 'gato' ? (
          <>
            <ellipse cx="60" cy="58" rx="28" ry="24" fill="#D4C4B0"/>
            <ellipse cx="44" cy="36" rx="10" ry="14" fill="#D4C4B0"/>
            <ellipse cx="76" cy="36" rx="10" ry="14" fill="#D4C4B0"/>
            <circle cx="60" cy="58" r="18" fill="#C4B09C"/>
            <circle cx="53" cy="54" r="4" fill="#8B6E54"/>
            <circle cx="67" cy="54" r="4" fill="#8B6E54"/>
          </>
        ) : (
          <>
            <ellipse cx="42" cy="32" rx="10" ry="14" fill="#D4C4B0"/>
            <ellipse cx="78" cy="32" rx="10" ry="14" fill="#D4C4B0"/>
            <circle cx="60" cy="52" r="22" fill="#D4C4B0"/>
            <circle cx="50" cy="50" r="3.5" fill="#6B4F38"/>
            <circle cx="70" cy="50" r="3.5" fill="#6B4F38"/>
          </>
        )}
      </svg>
      <span className="db-placeholder-label">Sin foto</span>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return <div className={`db-toast db-toast--${tipo}`}><span>{tipo === 'ok' ? '✅' : '❌'}</span>{msg}</div>
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [mascotas,     setMascotas]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [showMapa,     setShowMapa]     = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState(null)
  const [toast,        setToast]        = useState(null)
  const [pagina,       setPagina]       = useState(1)
  const [filtroEstado, setFiltroEstado] = useState('perdida')
  const [busqueda,     setBusqueda]     = useState('')
  const [confirmId,    setConfirmId]    = useState(null)

  const [form, setForm] = useState({
    nombre: '', especie: 'perro', descripcion: '',
    zona: '', contacto: '', imagenes: [],
  })
  const [previews,  setPreviews]  = useState([])
  const [telError,  setTelError]  = useState('')

  const cargarMascotas = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('publicaciones_mascotas')
      .select('*')
      .order('created_at', { ascending: false })
    setMascotas(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarMascotas() }, [])

  const listaFiltrada = useMemo(() => {
    let r = mascotas
    if (filtroEstado !== 'todas') r = r.filter(m => m.estado === filtroEstado)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase()
      r = r.filter(m =>
        m.nombre?.toLowerCase().includes(q) ||
        m.comuna?.toLowerCase().includes(q) ||
        m.descripcion?.toLowerCase().includes(q) ||
        m.especie?.toLowerCase().includes(q)
      )
    }
    return r
  }, [mascotas, filtroEstado, busqueda])

  const totalPaginas = Math.ceil(listaFiltrada.length / PAGE_SIZE)
  const lista = listaFiltrada.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  const contadores = useMemo(() => ({
    todas:      mascotas.length,
    perdida:    mascotas.filter(m => m.estado === 'perdida').length,
    encontrada: mascotas.filter(m => m.estado === 'encontrada').length,
    resuelta:   mascotas.filter(m => m.estado === 'resuelta').length,
  }), [mascotas])

  useEffect(() => { setPagina(1) }, [filtroEstado, busqueda])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // ── Fotos múltiples ─────────────────────────────────────────
  const handleImagenes = (e) => {
    const nuevos = Array.from(e.target.files).slice(0, 4 - form.imagenes.length)
    const merged = [...form.imagenes, ...nuevos].slice(0, 4)
    setForm(f => ({ ...f, imagenes: merged }))
    setPreviews(merged.map(f => URL.createObjectURL(f)))
  }

  const removeImagen = (idx) => {
    const newFiles = form.imagenes.filter((_, i) => i !== idx)
    setForm(f => ({ ...f, imagenes: newFiles }))
    setPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  // ── Validar teléfono ────────────────────────────────────────
  const handleTelChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, contacto: val }))
    const digits = val.replace(/\D/g, '')
    setTelError(val && (digits.length < 8 || digits.length > 15)
      ? 'Número inválido (ej: +56 9 1234 5678)' : '')
  }

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (telError) return
    setSubmitting(true)
    setError(null)
    try {
      const fotosUrls = []
      for (const file of form.imagenes) {
        const ext  = file.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('fotos-mascotas').upload(path, file, { upsert: false })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('fotos-mascotas').getPublicUrl(path)
        fotosUrls.push(urlData.publicUrl)
      }

      const { error: insErr } = await supabase
        .from('publicaciones_mascotas')
        .insert([{
          owner_id:      session.user.id,
          owner_nombre:  session.user.user_metadata?.full_name || null,
          owner_avatar:  session.user.user_metadata?.avatar_url || null,
          nombre:        form.nombre || null,
          especie:       form.especie,
          fotos:         fotosUrls,
          descripcion:   form.descripcion,
          region:        'Chile',
          comuna:        form.zona,
          contacto_alt:  form.contacto || null,
          fecha_perdida: new Date().toISOString().split('T')[0],
          estado:        'perdida',
        }])
      if (insErr) throw insErr

      setForm({ nombre: '', especie: 'perro', descripcion: '', zona: '', contacto: '', imagenes: [] })
      setPreviews([])
      setTelError('')
      setShowForm(false)
      setToast({ msg: '¡Reporte publicado! La comunidad ya puede verlo.', tipo: 'ok' })
      await cargarMascotas()
    } catch (err) {
      setError(err.message || 'Error al publicar.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Avanzar estado ──────────────────────────────────────────
  const avanzarEstado = async (id, estadoActual) => {
    const sig = { perdida: 'encontrada', encontrada: 'resuelta' }
    if (!sig[estadoActual]) return
    await supabase.from('publicaciones_mascotas').update({ estado: sig[estadoActual] }).eq('id', id)
    if (sig[estadoActual] === 'resuelta') setToast({ msg: '🎉 ¡Mascota marcada como reunida!', tipo: 'ok' })
    await cargarMascotas()
  }

  // ── Eliminar reporte ────────────────────────────────────────
  const eliminarReporte = async (id) => {
    const { error } = await supabase
      .from('publicaciones_mascotas')
      .delete()
      .eq('id', id)
      .eq('owner_id', session.user.id)
    if (!error) {
      setToast({ msg: 'Reporte eliminado.', tipo: 'ok' })
      setConfirmId(null)
      await cargarMascotas()
    }
  }

  return (
    <div className="db">
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}

      {/* Confirm eliminar */}
      {confirmId && (
        <div className="db-overlay" onClick={() => setConfirmId(null)}>
          <div className="db-confirm" onClick={e => e.stopPropagation()}>
            <h3 className="db-confirm-title">¿Eliminar este reporte?</h3>
            <p className="db-confirm-desc">Esta acción no se puede deshacer.</p>
            <div className="db-confirm-actions">
              <button className="db-confirm-cancel" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="db-confirm-delete" onClick={() => eliminarReporte(confirmId)}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="db-header">
        <div className="db-logo">
          <div className="db-paw">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <ellipse cx="7"    cy="7"  rx="2.2" ry="3"   fill="#FDF8F2"/>
              <ellipse cx="17"   cy="7"  rx="2.2" ry="3"   fill="#FDF8F2"/>
              <ellipse cx="4.5"  cy="12" rx="1.8" ry="2.5" fill="#FDF8F2"/>
              <ellipse cx="19.5" cy="12" rx="1.8" ry="2.5" fill="#FDF8F2"/>
              <path d="M12 10c-3.5 0-6 2-6 5.5 0 2.5 2 4.5 6 4.5s6-2 6-4.5c0-3.5-2.5-5.5-6-5.5z" fill="#FDF8F2"/>
            </svg>
          </div>
          <span className="db-brand">SOS<span> Mascotas</span></span>
        </div>
        <div className="db-user">
          {session?.user?.user_metadata?.avatar_url && (
            <img src={session.user.user_metadata.avatar_url} alt="avatar" className="db-avatar"/>
          )}
          <span className="db-username">
            {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
          </span>
          <button className="db-logout" onClick={cerrarSesion}>Salir</button>
        </div>
      </header>

      {/* Main */}
      <main className="db-main">
        <div className="db-top-bar">
          <div>
            <h1 className="db-title">Mascotas perdidas</h1>
            <p className="db-subtitle">Chile — búsqueda nacional</p>
          </div>
          <div className="db-top-actions">
            <button className={`db-btn-mapa${showMapa ? ' active' : ''}`} onClick={() => setShowMapa(v => !v)}>
              {showMapa ? '📋 Lista' : '🗺️ Mapa'}
            </button>
            <button className="db-btn-new" onClick={() => setShowForm(true)}>+ Reportar</button>
          </div>
        </div>

        {showMapa && <MapaLeaflet mascotas={mascotas} />}

        {/* Buscador */}
        <div className="db-search-wrap">
          <span className="db-search-icon">🔍</span>
          <input className="db-search" type="text"
            placeholder="Buscar por nombre, ciudad o descripción..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}/>
          {busqueda && <button className="db-search-clear" onClick={() => setBusqueda('')}>✕</button>}
        </div>

        {/* Filtros */}
        <div className="db-filtros">
          {[
            { key: 'perdida',    label: 'Perdidas'    },
            { key: 'encontrada', label: 'Encontradas' },
            { key: 'resuelta',   label: 'Resueltas'   },
            { key: 'todas',      label: 'Todas'       },
          ].map(({ key, label }) => (
            <button key={key}
              className={`db-filtro${filtroEstado === key ? ' active' : ''}${key === 'perdida' ? ' urgente' : ''}`}
              onClick={() => setFiltroEstado(key)}
            >
              {label}<span className="db-filtro-count">{contadores[key]}</span>
            </button>
          ))}
        </div>

        {busqueda && !loading && (
          <p className="db-search-result">
            {listaFiltrada.length === 0
              ? `Sin resultados para "${busqueda}"`
              : `${listaFiltrada.length} resultado${listaFiltrada.length !== 1 ? 's' : ''} para "${busqueda}"`
            }
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="db-empty">Cargando reportes...</div>
        ) : lista.length === 0 ? (
          <div className="db-empty">
            <span className="db-empty-icon">🐾</span>
            {busqueda
              ? <p>No hay resultados para "{busqueda}".</p>
              : filtroEstado === 'perdida'
                ? <><p>No hay mascotas perdidas.</p><p>¡Buenas noticias!</p></>
                : <p>No hay reportes en esta categoría.</p>
            }
          </div>
        ) : (
          <>
            <div className="db-grid">
              {lista.map(m => (
                <div key={m.id} className="db-card">
                  {/* Galería de fotos */}
                  <div className="db-card-img">
                    {m.fotos?.length > 0
                      ? <img src={m.fotos[0]} alt={m.nombre || m.especie}/>
                      : <Placeholder especie={m.especie}/>
                    }
                    <span className="db-card-badge" style={{ background: ESTADO_COLORS[m.estado] }}>
                      {ESTADO_LABELS[m.estado]}
                    </span>
                    <span className="db-card-fecha-img">{formatFecha(m.fecha_perdida)}</span>
                    {m.fotos?.length > 1 && (
                      <span className="db-card-more-fotos">+{m.fotos.length - 1} fotos</span>
                    )}
                  </div>

                  <div className="db-card-body">
                    <div className="db-card-reportante">
                      <div className="db-card-reportante-avatar">
                        {m.owner_avatar
                          ? <img src={m.owner_avatar} alt="reportante"/>
                          : <span>{(m.owner_nombre || '?')[0].toUpperCase()}</span>
                        }
                      </div>
                      <span className="db-card-reportante-nombre">
                        {m.owner_nombre ? `Reportado por ${m.owner_nombre.split(' ')[0]}` : 'Reporte de la comunidad'}
                      </span>
                    </div>

                    <h3 className="db-card-name">{m.nombre ? cap(m.nombre) : `${cap(m.especie)} sin nombre`}</h3>
                    <p className="db-card-meta">{cap(m.especie)} · {m.comuna}</p>
                    <p className="db-card-desc">{m.descripcion}</p>

                    <div className="db-card-footer">
                      <div className="db-card-actions">
                        {m.contacto_alt && (
                          <a href={`https://wa.me/${m.contacto_alt.replace(/\D/g, '')}`}
                            target="_blank" rel="noopener noreferrer" className="db-card-whatsapp">
                            💬 Contactar
                          </a>
                        )}
                        <button className="db-card-share" onClick={() => compartirWhatsApp(m)}>
                          📤 Compartir
                        </button>
                      </div>
                      <div className="db-card-owner-actions">
                        {m.estado !== 'resuelta' && m.owner_id === session?.user?.id && (
                          <button className="db-card-btn" onClick={() => avanzarEstado(m.id, m.estado)}>
                            {m.estado === 'perdida' ? '¡Lo encontré!' : 'Marcar reunido'}
                          </button>
                        )}
                        {m.owner_id === session?.user?.id && (
                          <button className="db-card-delete" onClick={() => setConfirmId(m.id)}>
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="db-pagination">
                <button className="db-page-btn" disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}>← Anterior</button>
                <span className="db-page-info">Página {pagina} de {totalPaginas}</span>
                <button className="db-page-btn" disabled={pagina === totalPaginas}
                  onClick={() => { setPagina(p => p + 1); window.scrollTo(0, 0) }}>Siguiente →</button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal formulario */}
      {showForm && (
        <div className="db-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="db-modal">
            <div className="db-modal-header">
              <h2>Reportar mascota perdida</h2>
              <button className="db-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form className="db-form" onSubmit={handleSubmit}>
              {/* Fotos múltiples */}
              <div className="db-field">
                <label>Fotos <span className="optional">(hasta 4)</span></label>
                <div className="db-fotos-grid">
                  {previews.map((src, i) => (
                    <div key={i} className="db-foto-thumb">
                      <img src={src} alt={`foto ${i+1}`}/>
                      <button type="button" className="db-foto-remove" onClick={() => removeImagen(i)}>✕</button>
                    </div>
                  ))}
                  {previews.length < 4 && (
                    <div className="db-foto-add" onClick={() => document.getElementById('img-input').click()}>
                      <span>📸</span>
                      <span>Agregar</span>
                    </div>
                  )}
                </div>
                <input id="img-input" type="file" accept="image/*" multiple
                  style={{ display: 'none' }} onChange={handleImagenes}/>
              </div>

              <div className="db-field">
                <label>Nombre <span className="optional">(opcional)</span></label>
                <input type="text" placeholder="Ej: Firulais" value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}/>
              </div>

              <div className="db-field">
                <label>Especie <span className="req">*</span></label>
                <select value={form.especie} onChange={e => setForm(f => ({ ...f, especie: e.target.value }))}>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="db-field">
                <label>Descripción <span className="req">*</span></label>
                <textarea placeholder="Color, tamaño, collar, señas particulares..."
                  value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  required rows={3}/>
              </div>

              <div className="db-field">
                <label>Ciudad / Zona <span className="req">*</span></label>
                <input type="text" placeholder="Ej: Vicuña, Valparaíso, Santiago..."
                  value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))} required/>
                <span className="db-field-hint">Cualquier ciudad de Chile — el mapa la ubica automáticamente</span>
              </div>

              <div className="db-field">
                <label>WhatsApp de contacto <span className="optional">(opcional)</span></label>
                <input type="tel" placeholder="+56 9 1234 5678"
                  value={form.contacto} onChange={handleTelChange}/>
                {telError && <span className="db-field-error">{telError}</span>}
              </div>

              {error && <p className="db-error">{error}</p>}

              <button type="submit" className="db-submit" disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar reporte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}