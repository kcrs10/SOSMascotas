import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <div className="logo">🐾 SOS Mascotas Vicuña</div>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Cada segundo cuenta cuando se pierden.</h1>
          <p>La red de apoyo vecinal más rápida del Valle del Elqui para encontrar a tus compañeros de cuatro patas.</p>
          
          <button className="btn-emergency" onClick={() => navigate('/login')}>
            INGRESAR AHORA
          </button>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <span>📍</span>
          <h3>Reportes Locales</h3>
          <p>Alertas específicas para Vicuña y sus alrededores.</p>
        </div>
        <div className="feature-card">
          <span>📸</span>
          <h3>Fotos Reales</h3>
          <p>Identificación visual inmediata en nuestra base de datos.</p>
        </div>
      </section>
    </div>
  )
}

export default Landing;