import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const iniciarSesion = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) console.error('Error en login:', error.message)
  }

  return (
    <div className="lp">
      {/* Panel izquierdo */}
      <div className="lp-left">
        <div className="bg-circle-1" />
        <div className="bg-circle-2" />

        <div className="lp-left-top">
          <div className="paw-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <ellipse cx="7" cy="7" rx="2.2" ry="3" fill="#FDF8F2" />
              <ellipse cx="17" cy="7" rx="2.2" ry="3" fill="#FDF8F2" />
              <ellipse cx="4.5" cy="12" rx="1.8" ry="2.5" fill="#FDF8F2" />
              <ellipse cx="19.5" cy="12" rx="1.8" ry="2.5" fill="#FDF8F2" />
              <path d="M12 10c-3.5 0-6 2-6 5.5 0 2.5 2 4.5 6 4.5s6-2 6-4.5c0-3.5-2.5-5.5-6-5.5z" fill="#FDF8F2" />
            </svg>
          </div>
          <span className="brand-name">
            SOS<span> Mascotas</span> Vicuña
          </span>
        </div>

        <div className="lp-left-mid">
          <h2 className="left-headline">
            La comunidad que<br /><em>nunca deja</em><br />de buscar.
          </h2>
          <p className="left-sub">
            Vecinos del Valle del Elqui unidos para encontrar a cada mascota perdida.
            Rápido, local y gratuito.
          </p>
        </div>

        <div className="left-stats">
          <div className="stat-item">
            <div className="stat-num">48h</div>
            <div className="stat-label">Tiempo crítico</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">100%</div>
            <div className="stat-label">Vecinal y local</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">∞</div>
            <div className="stat-label">Con amor</div>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="lp-right">
        <div className="login-card">
          <p className="card-eyebrow">Acceso a la red</p>
          <h1 className="card-title">
            Ingresar a<br />SOS Mascotas
          </h1>
          <p className="card-desc">
            Reporta una mascota perdida o ayuda a un vecino a reencontrarse
            con su compañero.
          </p>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Continúa con</span>
            <div className="divider-line" />
          </div>

          <button className="google-btn" onClick={iniciarSesion}>
            <svg className="google-logo" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.039l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            <span className="google-btn-text">Continuar con Google</span>
          </button>

          <div className="privacy-note">
            <span className="privacy-icon">🔒</span>
            <p className="privacy-text">
              Usamos Google para garantizar un entorno seguro y verificado.
              No compartimos tu información con terceros.
            </p>
          </div>

          <button className="back-link" onClick={() => navigate('/')}>
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login