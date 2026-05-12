import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

// Import de Páginas
import Landing from './pages/Landing'
import Login from './pages/Login'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Verificamos sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchamos cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <Router>
      <Routes>
        {/* Ruta principal: Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Login: Si ya estás logueado, te manda al dashboard (que crearemos) */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Dashboard temporal para probar que entraste */}
        <Route path="/dashboard" element={session ? (
          <div style={{padding: '50px', textAlign: 'center'}}>
            <h1>Panel de Control</h1>
            <p>Bienvenido: {session.user.email}</p>
            <button onClick={() => supabase.auth.signOut()}>Cerrar Sesión</button>
          </div>
        ) : <Navigate to="/login" />} />

        {/* Fallback: Si escriben cualquier cosa, vuelve a la Landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App