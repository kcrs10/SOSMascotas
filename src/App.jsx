import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Revisar si ya hay una sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Escuchar en tiempo real si el usuario entra o sale
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Funciones disparadoras
  const iniciarSesion = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error("Error en login:", error.message)
  }

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error("Error al salir:", error.message)
  }

  return (
    <div className="container" style={{ padding: '50px', textAlign: 'center' }}>
      <h1>SOS Mascotas</h1>
      
      {!session ? (
        <div>
          <p>Ingresa para reportar o buscar mascotas.</p>
          <button onClick={iniciarSesion} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            Iniciar sesión con Google
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>¡Bienvenido, Guardián!</h2>
          <p>Estás conectado de forma segura con el correo:</p>
          <p><strong>{session.user.email}</strong></p>
          
          <button onClick={cerrarSesion} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#ff4444', color: 'white', border: 'none' }}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export default App