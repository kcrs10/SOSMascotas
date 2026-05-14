import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

// Páginas
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Publicar from './pages/Publicar'

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
    Verificando credenciales seguras... 🐾
  </div>
)

// Zona de cuarentena para recibir el callback de Google
function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true })
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            navigate('/dashboard', { replace: true })
          }
        })
        // Timeout de seguridad: 6 segundos
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 6000)
      }
    })
  }, [navigate])

  return <Loader />
}

// Guardián de rutas protegidas
function ProtectedRoute({ session, children }) {
  if (session === undefined) return <Loader />
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
      if (event === 'SIGNED_OUT') {
        navigate('/', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (session === undefined) return <Loader />

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session}>
            <Dashboard session={session} />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/publicar"
        element={
          <ProtectedRoute session={session}>
            <Publicar session={session} />
          </ProtectedRoute>
        }
      />

      {/* El procesador del token de Google */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}