import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const Loader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FDF8F2',
    fontFamily: 'DM Sans, sans-serif',
    color: '#8B6E54',
    fontSize: '14px'
  }}>
    Cargando...
  </div>
)

function ProtectedRoute({ session, children }) {
  if (session === undefined) return <Loader />
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    // Detectar el token de OAuth en el hash de la URL (#access_token=...)
    // Supabase lo procesa automáticamente con onAuthStateChange
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)

      // Cuando Google completa el login, redirigir al dashboard
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      }

      // Cuando cierra sesión, ir al inicio
      if (event === 'SIGNED_OUT') {
        navigate('/', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Mientras carga la sesión inicial, mostrar loader
  if (session === undefined) return <Loader />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          session
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session}>
            <Dashboard session={session} />
          </ProtectedRoute>
        }
      />

      {/* Ruta de callback OAuth — Supabase aterriza aquí con el token */}
      <Route
        path="/auth/callback"
        element={<Loader />}
      />

      {/* Catch-all: solo redirige si no hay sesión cargando */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}