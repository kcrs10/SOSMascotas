import { useEffect, useState } from 'react'
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

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    nombre: '',
    especie: 'perro',
    raza: '',
    descripcion: '',
    zona: '',
    contacto: '',
    imagen: null,
  })
  const [preview, setPreview] = useState(null)

  // ── Cargar mascotas ───────────────────────
  const cargarMascotas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('publicaciones_mascotas')   // ✅ nombre correcto de la tabla
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setMascotas(data || [])
    setLoading(false)
  }

  useEffect(() => { cargarMascotas() }, [])

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

  // ── Enviar formulario ─────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let imagen_url = null

      // 1. Subir imagen al bucket
      if (form.imagen) {
        const ext = form.imagen.name.split('.').pop()
        const fileName = `${session.user.id}/${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('fotos-mascotas')       // ✅ nombre correcto del bucket
          .upload(fileName, form.imagen, { upsert: false })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('fotos-mascotas')       // ✅ nombre correcto del bucket
          .getPublicUrl(fileName)

        imagen_url = urlData.publicUrl
      }

      // 2. Insertar en la tabla correcta
      const { error: insertError } = await supabase
        .from('publicaciones_mascotas') // ✅ nombre correcto de la tabla
        .insert([{
          owner_id:        session.user.id,
          nombre:          form.nombre || null,
          especie:         form.especie,
          fotos:           imagen_url ? [imagen_url] : [],
          descripcion:     form.descripcion,
          region:          'Coquimbo',
          comuna:          form.zona,
          contacto_alt:    form.contacto || null,
          fecha_perdida:   new Date().toISOString().split('T')[0],
          estado:          'perdida',
        }])

      if (insertError) throw insertError

      setForm({ nombre: '', especie: 'perro', raza: '', descripcion: '', zona: '', contacto: '', imagen: null })
      setPreview(null)
      setShowForm(false)
      await cargarMascotas()

    } catch (err) {
      setError(err.message || 'Error al publicar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Cambiar estado ────────────────────────
  const avanzarEstado = async (id, estadoActual) => {
    const siguiente = { perdida: 'encontrada', encontrada: 'resuelta' }
    if (!siguiente[estadoActual]) return
    await supabase
      .from('publicaciones_mascotas')   // ✅ nombre correcto de la tabla
      .update({ estado: siguiente[estadoActual] })
      .eq('id', id)
    await cargarMascotas()
  }

  return (
    <div className="db">
      {/* Header */}
      <header className="db-header">
        <div className="db-logo">
          <div className="db-paw">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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

      {/* Main */}
      <main className="db-main">
        <div className="db-top-bar">
          <div>
            <h1 className="db-title">Mascotas perdidas</h1>
            <p className="db-subtitle">Valle del Elqui · Vicuña y alrededores</p>
          </div>
          <button className="db-btn-new" onClick={() => setShowForm(true)}>
            + Reportar mascota
          </button>
        </div>

        {loading ? (
          <div className="db-empty">Cargando reportes...</div>
        ) : mascotas.length === 0 ? (
          <div className="db-empty">
            <span className="db-empty-icon">🐾</span>
            <p>No hay mascotas reportadas aún.</p>
            <p>¡Sé el primero en ayudar a la comunidad!</p>
          </div>
        ) : (
          <div className="db-grid">
            {mascotas.map(m => (
              <div key={m.id} className="db-card">
                <div className="db-card-img">
                  {m.fotos?.length > 0
                    ? <img src={m.fotos[0]} alt={m.nombre || m.especie} />
                    : <div className="db-card-no-img">🐾</div>
                  }
                  <span className="db-card-badge" style={{ background: ESTADO_COLORS[m.estado] }}>
                    {ESTADO_LABELS[m.estado]}
                  </span>
                </div>
                <div className="db-card-body">
                  <h3 className="db-card-name">{m.nombre || `${m.especie} sin nombre`}</h3>
                  <p className="db-card-meta">{m.especie} · {m.comuna}</p>
                  <p className="db-card-desc">{m.descripcion}</p>
                  <div className="db-card-footer">
                    {m.contacto_alt && (
                      <span className="db-card-contacto">📞 {m.contacto_alt}</span>
                    )}
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

      {/* Modal */}
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
                    : (
                      <div className="db-upload-placeholder">
                        <span>📸</span>
                        <span>Toca para subir foto</span>
                      </div>
                    )
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
                <label>Teléfono de contacto <span className="optional">(opcional)</span></label>
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