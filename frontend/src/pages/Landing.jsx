import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">E</div>
          <span className="font-display font-bold text-xl">EduPlatform</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to={user.role === 'ADMIN' ? '/admin' : '/app'} className="btn-primary">
              Ir a mi cuenta
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Iniciar sesión</Link>
              <Link to="/register" className="btn-primary">Registrarse gratis</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/30 rounded-full px-4 py-1.5 text-brand-300 text-sm font-semibold mb-8">
          <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-slow"></span>
          Plataforma de aprendizaje en línea
        </div>
        <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
          Aprende sin límites,<br />
          <span className="text-brand-400">a tu ritmo</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          Accede a cursos de alta calidad impartidos por expertos. Aprende, practica y obtén tu certificado digital.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 active:scale-95 shadow-lg shadow-brand-600/30">
            Comenzar gratis →
          </Link>
          <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all border border-white/20">
            Ver cursos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎓', title: 'Aprende a tu ritmo', desc: 'Videos estructurados en secuencia para un aprendizaje progresivo y efectivo.' },
            { icon: '🏆', title: 'Certificados digitales', desc: 'Obtén tu certificado al completar cada curso y compártelo con el mundo.' },
            { icon: '⭐', title: 'Calidad garantizada', desc: 'Cursos evaluados por la comunidad. Solo el mejor contenido llega a ti.' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
