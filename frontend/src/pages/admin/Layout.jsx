import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  const nav = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/teachers', label: 'Profesores', icon: '👨‍🏫' },
    { to: '/admin/courses', label: 'Cursos', icon: '🎓' },
    { to: '/admin/reports', label: 'Reportes', icon: '📈' },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 fixed top-0 left-0 h-full bg-slate-950 text-white flex flex-col z-40">
        <div className="p-5 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-bold text-sm">E</div>
            <div>
              <span className="font-display font-bold text-base block leading-tight">EduPlatform</span>
              <span className="text-xs text-slate-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition">
            {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
          </button>
          <div className="px-4 py-2">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  )
}
