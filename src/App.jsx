import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

// Import de Páginas
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true) // <- 1. Añadimos el estado de carga

  useEffect(() => {
    // Verificamos sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false) // Ya sabemos si tiene llave o no
    })

    // Escuchamos cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Pantalla de espera de seguridad mientras Supabase lee el token
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#7c4a32' }}>
        <h2>Abriendo bóveda segura... 🐾</h2>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* 3. Landing Inteligente: Si YA tiene sesión, lo catapulta al Dashboard */}
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />

        {/* Login: Si ya estás logueado, te manda al dashboard */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Dashboard Real: Protegido por sesión */}
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} />

        {/* Fallback: Si escriben cualquier cosa, vuelve a la raíz */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App