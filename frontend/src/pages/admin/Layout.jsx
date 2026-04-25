import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/teachers', label: 'Profesores' },
  { to: '/admin/courses', label: 'Cursos' },
  { to: '/admin/reports', label: 'Reportes' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 fixed top-0 left-0 h-full bg-slate-900 text-white flex flex-col z-40">
        <div className="px-5 py-4 border-b border-slate-800">
          <Link to="/admin" className="font-display font-bold text-base">EduPlatform</Link>
          <p className="text-xs text-slate-500 mt-0.5">Panel de administración</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <button onClick={toggle} className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition">
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <div className="px-3 py-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="ml-56 flex-1 p-8 bg-slate-50 dark:bg-slate-950"><Outlet /></main>
    </div>
  )
}
