import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

// Import de Páginas
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Publicar from './pages/Publicar'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Al cargar, verificamos si ya hay una llave de Google guardada
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchamos activamente cuando el usuario entra o sale
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Pantalla de espera mientras comprobamos la seguridad
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#7c4a32' }}>
        <h2>Verificando credenciales de rescate... 🐾</h2>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas: Si ya estás logueado, te enviamos directo al panel */}
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* 🔒 RUTAS PROTEGIDAS: Solo accesibles si 'session' existe (Inició con Google) */}
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} />
        <Route path="/publicar" element={session ? <Publicar session={session} /> : <Navigate to="/login" replace />} />

        {/* Fallback para URLs incorrectas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App