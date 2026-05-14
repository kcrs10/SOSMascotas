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
// Zona de cuarentena: Extracción Manual de Tokens
function AuthCallback() {
  const navigate = useNavigate()
  const [mensaje, setMensaje] = useState('Analizando llaves de Google... 🐾')

  useEffect(() => {
    const forzarInicioSesion = async () => {
      const hash = window.location.hash;
      
      if (!hash.includes('access_token')) {
        setMensaje('❌ ERROR: El token no llegó a la URL.');
        return;
      }

      setMensaje('✅ Llaves detectadas en la URL. Forzando la cerradura...');

      try {
        // 1. Extraemos los parámetros de la URL nosotros mismos
        const parametros = new URLSearchParams(hash.substring(1)); // quitamos el '#'
        const accessToken = parametros.get('access_token');
        const refreshToken = parametros.get('refresh_token');

        if (accessToken && refreshToken) {
          // 2. Le inyectamos la sesión a Supabase a la fuerza
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            setMensaje(`❌ Error al forzar sesión: ${error.message}`);
          } else {
            setMensaje('✅ ¡Bóveda abierta! Entrando al Dashboard...');
            
            // 3. Limpiamos la URL por seguridad para no dejar los tokens visibles
            window.location.hash = '';
            
            // 4. Catapultamos al usuario al panel
            navigate('/dashboard', { replace: true });
          }
        } else {
          setMensaje('❌ La URL no contenía ambos tokens necesarios.');
        }
      } catch (err) {
        setMensaje(`❌ Error interno de React: ${err.message}`);
      }
    };

    forzarInicioSesion();
  }, [navigate]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#FDF8F2', height: '100vh' }}>
      <h2 style={{ color: '#8B6E54' }}>{mensaje}</h2>
      <p style={{ color: 'gray', marginTop: '20px', fontSize: '12px', wordBreak: 'break-all' }}>
        Extracción manual activada.
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