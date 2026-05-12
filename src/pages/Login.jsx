import { supabase } from '../supabaseClient'

function Login() {
  const iniciarSesion = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) console.error("Error en login:", error.message)
  }

  return (
    <div className="login-page">
      <div className="blob-1"></div>
      <div className="blob-2"></div>
      
      <div className="login-card">
        <header className="login-header">
          <div className="dog-avatar">
            <span role="img" aria-label="dog">🐶</span>
          </div>
          <h1>SOS Mascotas</h1>
          <p className="subtitle">Comunidad de Rescate · Vicuña</p>
        </header>

        <section className="login-body">
          <h2>¡Bienvenido de vuelta!</h2>
          <p>Ingresa para reportar una mascota perdida o ayudar a un vecino a encontrar a su compañero.</p>
          
          <button className="google-signin-btn" onClick={iniciarSesion}>
            <div className="google-icon-wrapper">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            </div>
            <span className="btn-text">Continuar con Google</span>
          </button>
        </section>

        <footer className="login-footer">
          <p>Tu privacidad es importante. Usamos Google para garantizar un entorno seguro y verificado.</p>
        </footer>
      </div>
    </div>
  )
}

export default Login