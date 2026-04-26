import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-slate-800">
        <span className="font-display font-bold text-base md:text-lg">ChuchoEdu</span>
        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <Link to={user.role === 'ADMIN' ? '/admin' : '/app'} className="btn-primary text-sm">Mi cuenta</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-slate-300 text-sm">Iniciar sesión</Link>
              <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-5 md:px-8 text-center py-16">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Plataforma de educación en línea</p>
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 max-w-3xl">
          Aprende nuevas habilidades a tu ritmo
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-xl mb-8">
          Cursos en video, aprendizaje secuencial y certificados digitales.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/register" className="btn-primary px-6 py-3 text-base w-full sm:w-auto justify-center">Comenzar gratis</Link>
          <Link to="/login" className="btn bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 text-base w-full sm:w-auto justify-center">Ver cursos</Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-600 py-5 px-4">
        ChuchoEdu &mdash; Todos los derechos reservados
      </footer>
    </div>
  )
}
