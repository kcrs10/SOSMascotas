import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

const ESTADO_LABELS = {
  perdida: 'Perdida',
  encontrada: 'Encontrada',
  resuelta: 'Resuelta 🎉',
}

const ESTADO_COLORS = {
  perdida: '#C94B1A',
  encontrada: '#2D7D46',
  resuelta: '#8B6E54',
}

const COORDS_COMUNAS = {
  'Vicuña':        { lat: -30.0319, lng: -70.7097 },
  'La Serena':     { lat: -29.9027, lng: -71.2520 },
  'Coquimbo':      { lat: -29.9533, lng: -71.3436 },
  'Paihuano':      { lat: -30.0000, lng: -70.5000 },
  'Andacollo':     { lat: -30.2333, lng: -71.0833 },
  'Monte Patria':  { lat: -30.6833, lng: -70.9667 },
  'Ovalle':        { lat: -30.6000, lng: -71.2000 },
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr + 'T12:00:00')
  const hoy = new Date()
  const diffDias = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) > 1 ? 's' : ''}`
  return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })
}

function capitalizarNombre(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ── CAMBIO: URL corregida a dominio real ──────────────────────
function compartirWhatsApp(mascota) {
  const nombre = mascota.nombre ? capitalizarNombre(mascota.nombre) : capitalizarNombre(mascota.especie)
  const texto = [
    `🐾 *${nombre} está perdido/a en ${mascota.comuna}*`,
    ``,
    `📋 ${mascota.descripcion}`,
    `📍 Zona: ${mascota.comuna}${mascota.punto_referencia ? ` · ${mascota.punto_referencia}` : ''}`,
    `📅 Perdido el: ${formatFecha(mascota.fecha_perdida)}`,
    mascota.contacto_alt ? `📞 Contacto: ${mascota.contacto_alt}` : '',
    ``,
    `🔗 Ver más reportes: https://sosmascotas.kcrs.cl`, // <-- CAMBIO: era sosmascotas.pages.dev
  ].filter(Boolean).join('\n')

  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
}

function MapaReportes({ mascotas }) {
  const perdidas = mascotas.filter(m => m.estado === 'perdida')

  const lat = -30.0319
  const lng = -70.7097

  const mapaUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.8}%2C${lat - 0.5}%2C${lng + 0.8}%2C${lat + 0.5}&layer=mapnik&marker=${lat}%2C${lng}`

  return (
    <div className="db-mapa-wrap">
      <div className="db-mapa-header">
        <h2 className="db-mapa-title">📍 Mapa de reportes</h2>
        <span className="db-mapa-badge">{perdidas.length} mascotas perdidas</span>
      </div>

      <div className="db-mapa-container">
        <iframe
          title="Mapa Vicuña"
          src={mapaUrl}
          className="db-mapa-iframe"
          allowFullScreen
        />
        {perdidas.length > 0 && (
          <div className="db-mapa-leyenda">
            <p className="db-mapa-leyenda-title">Zonas activas</p>
            {Object.entries(
              perdidas.reduce((acc, m) => {
                acc[m.comuna] = (acc[m.comuna] || 0) + 1
                return acc
              }, {})
            ).map(([comuna, count]) => (
              <div key={comuna} className="db-mapa-zona">
                <span className="db-mapa-zona-dot" />
                <span className="db-mapa-zona-nombre">{comuna}</span>
                <span className="db-mapa-zona-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showMapa, setShowMapa] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('perdida')
  const [busqueda, setBusqueda] = useState('')

  const [form, setForm] = useState({
    nombre: '', especie: 'perro',
    descripcion: '', zona: '', contacto: '', imagen: null,
  })
  const [preview, setPreview] = useState(null)

  const cargarMascotas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('publicaciones_mascotas')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setMascotas(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarMascotas() }, [])

  const lista = useMemo(() => {
    let result = mascotas
    if (filtroEstado !== 'todas') result = result.filter(m => m.estado === filtroEstado)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      result = result.filter(m =>
        m.nombre?.toLowerCase().includes(q) ||
        m.comuna?.toLowerCase().includes(q) ||
        m.descripcion?.toLowerCase().includes(q) ||
        m.especie?.toLowerCase().includes(q)
      )
    }
    return result
  }, [mascotas, filtroEstado, busqueda])

  const contadores = useMemo(() => ({
    todas: mascotas.length,
    perdida: mascotas.filter(m => m.estado === 'perdida').length,
    encontrada: mascotas.filter(m => m.estado === 'encontrada').length,
    resuelta: mascotas.filter(m => m.estado === 'resuelta').length,
  }), [mascotas])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(f => ({ ...f, imagen: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      let imagen_url = null
      if (form.imagen) {
        const ext = form.imagen.name.split('.').pop()
        const fileName = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('fotos-mascotas').upload(fileName, form.imagen, { upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('fotos-mascotas').getPublicUrl(fileName)
        imagen_url = urlData.publicUrl
      }
      const { error: insertError } = await supabase
        .from('publicaciones_mascotas')
        .insert([{
          owner_id:      session.user.id,
          owner_nombre:  session.user.user_metadata?.full_name || null,
          owner_avatar:  session.user.user_metadata?.avatar_url || null,
          nombre:        form.nombre || null,
          especie:       form.especie,
          fotos:         imagen_url ? [imagen_url] : [],
          descripcion:   form.descripcion,
          region:        'Coquimbo',
          comuna:        form.zona,
          contacto_alt:  form.contacto || null,
          fecha_perdida: new Date().toISOString().split('T')[0],
          estado:        'perdida',
        }])
      if (insertError) throw insertError
      setForm({ nombre: '', especie: 'perro', descripcion: '', zona: '', contacto: '', imagen: null })
      setPreview(null)
      setShowForm(false)
      await cargarMascotas()
    } catch (err) {
      setError(err.message || 'Error al publicar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const avanzarEstado = async (id, estadoActual) => {
    const siguiente = { perdida: 'encontrada', encontrada: 'resuelta' }
    if (!siguiente[estadoActual]) return
    await supabase.from('publicaciones_mascotas').update({ estado: siguiente[estadoActual] }).eq('id', id)
    await cargarMascotas()
  }

  return (
    <div className="db">

      <header className="db-header">
        <div className="db-logo">
          <div className="db-paw">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <ellipse cx="7" cy="7" rx="2.2" ry="3" fill="#FDF8F2" />
              <ellipse cx="17" cy="7" rx="2.2" ry="3" fill="#FDF8F2" />
              <ellipse cx="4.5" cy="12" rx="1.8" ry="2.5" fill="#FDF8F2" />
              <ellipse cx="19.5" cy="12" rx="1.8" ry="2.5" fill="#FDF8F2" />
              <path d="M12 10c-3.5 0-6 2-6 5.5 0 2.5 2 4.5 6 4.5s6-2 6-4.5c0-3.5-2.5-5.5-6-5.5z" fill="#FDF8F2" />
            </svg>
          </div>
          <span className="db-brand">SOS<span> Mascotas</span></span>
        </div>
        <div className="db-user">
          {session?.user?.user_metadata?.avatar_url && (
            <img src={session.user.user_metadata.avatar_url} alt="avatar" className="db-avatar" />
          )}
          <span className="db-username">
            {session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
          </span>
          <button className="db-logout" onClick={cerrarSesion}>Salir</button>
        </div>
      </header>

      <main className="db-main">

        <div className="db-top-bar">
          <div>
            <h1 className="db-title">Mascotas perdidas</h1>
            <p className="db-subtitle">Valle del Elqui · Vicuña y alrededores</p>
          </div>
          <div className="db-top-actions">
            <button
              className={`db-btn-mapa${showMapa ? ' active' : ''}`}
              onClick={() => setShowMapa(v => !v)}
            >
              {showMapa ? '📋 Lista' : '🗺️ Mapa'}
            </button>
            <button className="db-btn-new" onClick={() => setShowForm(true)}>
              + Reportar
            </button>
          </div>
        </div>

        {showMapa && <MapaReportes mascotas={mascotas} />}

        <div className="db-search-wrap">
          <span className="db-search-icon">🔍</span>
          <input
            className="db-search"
            type="text"
            placeholder="Buscar por nombre, zona o descripción..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="db-search-clear" onClick={() => setBusqueda('')}>✕</button>
          )}
        </div>

        <div className="db-filtros">
          {[
            { key: 'perdida',    label: 'Perdidas' },
            { key: 'encontrada', label: 'Encontradas' },
            { key: 'resuelta',   label: 'Resueltas' },
            { key: 'todas',      label: 'Todas' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`db-filtro${filtroEstado === key ? ' active' : ''}${key === 'perdida' ? ' urgente' : ''}`}
              onClick={() => setFiltroEstado(key)}
            >
              {label}
              <span className="db-filtro-count">{contadores[key]}</span>
            </button>
          ))}
        </div>

        {busqueda && !loading && (
          <p className="db-search-result">
            {lista.length === 0
              ? `Sin resultados para "${busqueda}"`
              : `${lista.length} resultado${lista.length !== 1 ? 's' : ''} para "${busqueda}"`
            }
          </p>
        )}

        {loading ? (
          <div className="db-empty">Cargando reportes...</div>
        ) : lista.length === 0 ? (
          <div className="db-empty">
            <span className="db-empty-icon">🐾</span>
            {busqueda
              ? <p>No hay resultados para "{busqueda}".</p>
              : filtroEstado === 'perdida'
                ? <><p>No hay mascotas perdidas reportadas.</p><p>¡Buenas noticias para el valle!</p></>
                : <p>No hay reportes en esta categoría.</p>
            }
          </div>
        ) : (
          <div className="db-grid">
            {lista.map(m => (
              <div key={m.id} className="db-card">
                <div className="db-card-img">
                  {m.fotos?.length > 0
                    ? <img src={m.fotos[0]} alt={m.nombre || m.especie} />
                    : <div className="db-card-no-img">🐾</div>
                  }
                  <span className="db-card-badge" style={{ background: ESTADO_COLORS[m.estado] }}>
                    {ESTADO_LABELS[m.estado]}
                  </span>
                  <span className="db-card-fecha-img">{formatFecha(m.fecha_perdida)}</span>
                </div>

                <div className="db-card-body">
                  <div className="db-card-reportante">
                    <div className="db-card-reportante-avatar">
                      {m.owner_avatar
                        ? <img src={m.owner_avatar} alt="reportante" />
                        : <span>{(m.owner_nombre || '?')[0].toUpperCase()}</span>
                      }
                    </div>
                    <span className="db-card-reportante-nombre">
                      {m.owner_nombre ? `Reportado por ${m.owner_nombre.split(' ')[0]}` : 'Reporte de la comunidad'}
                    </span>
                  </div>

                  <h3 className="db-card-name">
                    {m.nombre
                      ? capitalizarNombre(m.nombre)
                      : `${capitalizarNombre(m.especie)} sin nombre`
                    }
                  </h3>
                  <p className="db-card-meta">
                    {capitalizarNombre(m.especie)} · {m.comuna}
                  </p>
                  <p className="db-card-desc">{m.descripcion}</p>

                  <div className="db-card-footer">
                    <div className="db-card-actions">
                      {m.contacto_alt && (
                        <a
                          href={`https://wa.me/${m.contacto_alt.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="db-card-whatsapp"
                        >
                          💬 Contactar
                        </a>
                      )}
                      <button
                        className="db-card-share"
                        onClick={() => compartirWhatsApp(m)}
                        title="Compartir por WhatsApp"
                      >
                        📤 Compartir
                      </button>
                    </div>
                    {m.estado !== 'resuelta' && m.owner_id === session?.user?.id && (
                      <button className="db-card-btn" onClick={() => avanzarEstado(m.id, m.estado)}>
                        {m.estado === 'perdida' ? '¡Lo encontré!' : 'Marcar reunido'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="db-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="db-modal">
            <div className="db-modal-header">
              <h2>Reportar mascota perdida</h2>
              <button className="db-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form className="db-form" onSubmit={handleSubmit}>
              <div className="db-field">
                <label>Foto de la mascota</label>
                <div className="db-upload-area" onClick={() => document.getElementById('img-input').click()}>
                  {preview
                    ? <img src={preview} alt="preview" className="db-upload-preview" />
                    : <div className="db-upload-placeholder"><span>📸</span><span>Toca para subir foto</span></div>
                  }
                </div>
                <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>

              <div className="db-field">
                <label>Nombre <span className="optional">(opcional)</span></label>
                <input type="text" placeholder="Ej: Firulais" value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
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
                <textarea placeholder="Color, tamaño, señas particulares, dónde fue visto por última vez..."
                  value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  required rows={3} />
              </div>

              <div className="db-field">
                <label>Zona / Sector <span className="req">*</span></label>
                <input type="text" placeholder="Ej: Centro Vicuña, Población Los Pinos"
                  value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))} required />
              </div>

              <div className="db-field">
                <label>WhatsApp de contacto <span className="optional">(opcional)</span></label>
                <input type="tel" placeholder="+56 9 1234 5678"
                  value={form.contacto} onChange={e => setForm(f => ({ ...f, contacto: e.target.value }))} />
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