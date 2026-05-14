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
  const [mensaje, setMensaje] = useState('Analizando llaves de Google... 🐾')

  useEffect(() => {
    // 1. Verificar si Cloudflare nos robó el token
    if (!window.location.hash.includes('access_token')) {
      setMensaje('❌ ERROR: El token de Google desapareció de la URL. Cloudflare lo bloqueó.')
      return
    }

    // 2. Verificar si olvidaste las variables de entorno en Cloudflare
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setMensaje('❌ ERROR: Faltan las variables de entorno (.env) en Cloudflare.')
      return
    }

    // 3. Procesar sesión
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) setMensaje(`❌ Error de Supabase: ${error.message}`)
      
      if (session) {
        setMensaje('✅ ¡Llave aceptada! Entrando...')
        navigate('/dashboard', { replace: true })
      } else {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            navigate('/dashboard', { replace: true })
          }
        })

        // Timeout
        setTimeout(() => {
          setMensaje('❌ Timeout: Supabase no reconoció las llaves de Google.')
        }, 6000)
      }
    })
  }, [navigate])

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FDF8F2', height: '100vh' }}>
      <h2 style={{ color: '#8B6E54' }}>{mensaje}</h2>
      <p style={{ color: 'gray', marginTop: '20px', fontSize: '12px', wordBreak: 'break-all' }}>
        <strong>URL actual detectada:</strong> {window.location.href}
      </p>
    </div>
  )
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