import { useNavigate } from 'react-router-dom'
import './Landing.css'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="lw">
      <header className="lw-header">
        <div className="logo-mark">
          <div className="paw-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
        <div className="badge-valle">Valle del Elqui</div>
      </header>

      <div className="hero">
        <div className="hero-left">
          <div className="urgency-tag">
            <span className="urgency-dot" />
            Red activa ahora
          </div>
          <h1 className="hero-h1">
            Cada segundo<br />
            cuenta <em>cuando</em><br />
            se pierden.
          </h1>
          <p className="hero-sub">
            La red de apoyo vecinal más rápida del Valle del Elqui para encontrar
            a tus compañeros de cuatro patas.
          </p>
          <button className="btn-main" onClick={() => navigate('/login')}>
            Ingresar ahora <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="hero-right">
          <svg className="hero-illustration" viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="140" cy="130" r="90" fill="#D4C4B0" opacity="0.4" />
            <circle cx="140" cy="130" r="60" fill="#C4B09C" opacity="0.5" />
            <ellipse cx="128" cy="100" rx="14" ry="20" fill="#1A1009" opacity="0.85" />
            <ellipse cx="160" cy="100" rx="14" ry="20" fill="#1A1009" opacity="0.85" />
            <circle cx="140" cy="130" r="50" fill="#1A1009" opacity="0.9" />
            <ellipse cx="128" cy="110" rx="8" ry="12" fill="#3D2B1A" />
            <ellipse cx="160" cy="110" rx="8" ry="12" fill="#3D2B1A" />
            <circle cx="128" cy="114" r="4" fill="#FDF8F2" />
            <circle cx="160" cy="114" r="4" fill="#FDF8F2" />
            <circle cx="129.5" cy="113" r="1.5" fill="#1A1009" />
            <circle cx="161.5" cy="113" r="1.5" fill="#1A1009" />
            <ellipse cx="140" cy="138" rx="10" ry="7" fill="#3D2B1A" />
            <ellipse cx="140" cy="140" rx="7" ry="4" fill="#C94B1A" opacity="0.7" />
            <line x1="140" y1="145" x2="148" y2="155" stroke="#8B6E54" strokeWidth="1.5" />
            <line x1="140" y1="145" x2="140" y2="156" stroke="#8B6E54" strokeWidth="1.5" />
            <line x1="140" y1="145" x2="132" y2="155" stroke="#8B6E54" strokeWidth="1.5" />
            <circle cx="195" cy="75" r="20" fill="#C94B1A" />
            <path d="M195 65 L195 85 M185 75 L205 75" stroke="#FDF8F2" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="195" cy="75" r="14" stroke="#FDF8F2" strokeWidth="1.5" fill="none" />
            <circle cx="87" cy="170" r="16" fill="#F5A872" />
            <path d="M83 170 L87 174 L94 163" stroke="#1A1009" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="87" y1="154" x2="87" y2="148" stroke="#F5A872" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="195" y1="95" x2="195" y2="102" stroke="#C94B1A" strokeWidth="2" strokeDasharray="3 2" />
          </svg>

          <div className="hero-stat">
            <div className="hero-stat-num">48h</div>
            <div className="hero-stat-label">tiempo crítico de búsqueda</div>
          </div>
        </div>
      </div>

      <div className="divider-strip">
        <div className="divider-item">📍 Vicuña y alrededores</div>
        <div className="divider-sep" />
        <div className="divider-item">👥 Red vecinal</div>
        <div className="divider-sep" />
        <div className="divider-item">🔔 Alertas inmediatas</div>
        <div className="divider-sep" />
        <div className="divider-item">📸 Identificación visual</div>
        <div className="divider-sep" />
        <div className="divider-item">❤️ Gratuito para todos</div>
      </div>

      <section className="features-section">
        <p className="features-label">Cómo funciona</p>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon">📍</div>
            <div className="feat-title">Reportes locales</div>
            <p className="feat-desc">Alertas específicas para Vicuña y sus alrededores. Sin ruido de otras ciudades.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">📸</div>
            <div className="feat-title">Fotos reales</div>
            <p className="feat-desc">Identificación visual inmediata. Sube fotos de tu mascota y la comunidad las reconoce.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon">🔔</div>
            <div className="feat-title">Notificaciones</div>
            <p className="feat-desc">Recibe avisos al instante cuando alguien reporta una mascota cerca de tu zona.</p>
          </div>
        </div>
      </section>

      <div className="cta-strip">
        <div className="cta-copy">
          ¿Perdiste a tu mascota? <em>Actúa ahora.</em>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/login')}>
          Ingresar al sistema →
        </button>
      </div>

      <footer className="lw-footer">
        <span>© 2025 SOS Mascotas Vicuña — Valle del Elqui, Chile</span>
        <span>Hecho con amor por la comunidad 🐾</span>
      </footer>
    </div>
  )
}

export default Landing