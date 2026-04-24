import { Outlet, NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  const nav = [
    { to: '/app', label: 'Explorar', icon: '🏠', end: true },
    { to: '/app/my-courses', label: 'Mis cursos', icon: '📚' },
    { to: '/app/certificates', label: 'Certificados', icon: '🏆' },
    { to: '/app/profile', label: 'Perfil', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-40">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="font-display font-bold text-lg">EduPlatform</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`
              }>
              <span>{n.icon}</span>{n.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
          </button>
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-sm overflow-hidden">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  )
}
