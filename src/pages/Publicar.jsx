import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Publicar.css'

function Publicar({ session }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [foto, setFoto] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'Perro', // Valor por defecto
    ubicacion: '',
    descripcion: ''
  })

  // Manejar cambios en los campos de texto
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Manejar la selección de la foto
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0])
    }
  }

  // El motor de subida a la base de datos
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!foto || !formData.ubicacion || !formData.descripcion) {
      alert('Por favor, sube una foto, indica la ubicación y añade una descripción.')
      return
    }

    try {
      setLoading(true)

      // 1. Subir la imagen al Bucket de Supabase
      const fileExt = foto.name.split('.').pop()
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`
      const filePath = `mascotas/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('fotos-mascotas') // Asegúrate de que el bucket se llama así en Supabase
        .upload(filePath, foto)

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública de la imagen
      const { data: publicUrlData } = supabase.storage
        .from('fotos-mascotas')
        .getPublicUrl(filePath)

      const fotoUrl = publicUrlData.publicUrl

      // 3. Insertar el registro en la tabla SQL
      const { error: insertError } = await supabase
        .from('publicaciones_mascotas')
        .insert([
          {
            nombre: formData.nombre,
            especie: formData.especie,
            ubicacion: formData.ubicacion,
            descripcion: formData.descripcion,
            foto_url: fotoUrl,
            owner_id: session.user.id // Vinculación estricta de seguridad
          }
        ])

      if (insertError) throw insertError

      // Si todo sale bien, volvemos al Dashboard
      alert('¡Mascota reportada con éxito!')
      navigate('/dashboard')

    } catch (error) {
      console.error('Error en la transacción:', error.message)
      alert('Hubo un error al subir el reporte: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="publicar-layout">
      <div className="publicar-card">
        <header className="form-header">
          <h2>Nuevo Reporte</h2>
          <p>La información precisa ayuda a la comunidad a buscar mejor.</p>
        </header>

        <form onSubmit={handleSubmit} className="publicar-form">
          <div className="form-group">
            <label>Foto de la Mascota *</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              disabled={loading}
              className="file-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre (si lo sabes)</label>
              <input 
                type="text" 
                name="nombre" 
                placeholder="Ej: Toby" 
                value={formData.nombre} 
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Especie *</label>
              <select name="especie" value={formData.especie} onChange={handleChange} disabled={loading}>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación / Sector *</label>
            <input 
              type="text" 
              name="ubicacion" 
              placeholder="Ej: Cerca de la Plaza de Armas, San Isidro..." 
              value={formData.ubicacion} 
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Descripción y Detalles *</label>
            <textarea 
              name="descripcion" 
              rows="4" 
              placeholder="Color, tamaño, si lleva collar, comportamiento..." 
              value={formData.descripcion} 
              onChange={handleChange}
              disabled={loading}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancelar" onClick={() => navigate('/dashboard')} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Subiendo al servidor...' : 'Publicar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Publicar