import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const nav = [
  { to: '/app', label: 'Explorar', end: true },
  { to: '/app/my-courses', label: 'Mis cursos' },
  { to: '/app/certificates', label: 'Certificados' },
  { to: '/app/profile', label: 'Perfil' },
]

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/app" className="font-display font-bold text-base">EduPlatform</Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                           : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
          <button onClick={toggle} className="btn-ghost w-full justify-start text-xs px-3 py-2">
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <div className="px-3 py-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8"><Outlet /></main>
    </div>
  )
}
