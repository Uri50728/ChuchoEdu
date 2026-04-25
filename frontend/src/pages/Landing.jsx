import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-800">
        <span className="font-display font-bold text-lg tracking-tight">EduPlatform</span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to={user.role === 'ADMIN' ? '/admin' : '/app'} className="btn-primary">Mi cuenta</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-slate-300">Iniciar sesión</Link>
              <Link to="/register" className="btn-primary">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">Plataforma de educación en línea</p>
        <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight mb-5 max-w-3xl">
          Aprende nuevas habilidades a tu ritmo
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-8">
          Cursos en video, aprendizaje secuencial y certificados digitales.
        </p>
        <div className="flex gap-3">
          <Link to="/register" className="btn-primary px-6 py-2.5 text-base">Comenzar gratis</Link>
          <Link to="/login" className="btn bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 text-base">Ver cursos</Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-6">
        EduPlatform &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
