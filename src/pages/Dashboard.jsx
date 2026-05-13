import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Dashboard.css'

function Dashboard({ session }) {
  const navigate = useNavigate()
  const [mascotas, setMascotas] = useState([])
  const [loading, setLoading] = useState(true)

  // Función para obtener los datos de la tabla de Supabase
  const fetchMascotas = async () => {
    try {
      setLoading(true)
      // Asegúrate de que el nombre de la tabla coincida con la que creaste en la Fase 1
      const { data, error } = await supabase
        .from('publicaciones_mascotas') 
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setMascotas(data)
    } catch (error) {
      console.error('Error al cargar mascotas:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Ejecutar la búsqueda al entrar al panel
  useEffect(() => {
    fetchMascotas()
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="dashboard-layout">
      {/* Barra de Navegación Superior */}
      <nav className="dashboard-nav">
        <div className="nav-brand">🐾 SOS Mascotas Vicuña</div>
        <div className="nav-actions">
          <span className="user-email">{session.user.email}</span>
          <button className="btn-logout" onClick={cerrarSesion}>Salir</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2>Mascotas Reportadas</h2>
            <p>Red de búsqueda activa en la comuna.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/publicar')}>
            + Reportar Mascota
          </button>
        </div>

        {/* Zona del Feed / Resultados */}
        {loading ? (
          <div className="loading-state">Cargando base de datos segura...</div>
        ) : mascotas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No hay reportes activos</h3>
            <p>Afortunadamente, no hay mascotas perdidas en este momento. Si necesitas ayuda, crea un nuevo reporte.</p>
          </div>
        ) : (
          <div className="mascotas-grid">
            {mascotas.map((mascota) => (
              <div key={mascota.id} className="mascota-card">
                {/* Si no hay foto, mostramos un recuadro gris temporal */}
                <div 
                  className="mascota-img" 
                  style={{ backgroundImage: `url(${mascota.foto_url || 'https://via.placeholder.com/300?text=Sin+Foto'})` }}
                ></div>
                <div className="mascota-info">
                  <h3>{mascota.nombre || 'Desconocido'}</h3>
                  <span className="badge-especie">{mascota.especie}</span>
                  <p className="ubicacion">📍 {mascota.ubicacion}</p>
                  <p className="descripcion">{mascota.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard