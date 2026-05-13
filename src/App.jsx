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
    // 1. Detectamos si la URL trae el candado de Google (#access_token)
    const isAuthRedirect = window.location.hash.includes('access_token');

    // 2. Revisamos si ya había una sesión guardada en memoria local
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // CRÍTICO: Solo quitamos la carga si NO venimos rebotando de Google
      if (!isAuthRedirect) {
        setLoading(false)
      }
    })

    // 3. El oyente que atrapa el token en el aire cuando Google nos redirige
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false) // Ahora sí, token guardado, abrimos la puerta
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Pantalla de espera obligatoria
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
        {/* Rutas Públicas */}
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* Rutas Privadas Protegidas */}
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} />
        <Route path="/publicar" element={session ? <Publicar session={session} /> : <Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App