import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <Link to="/app" className="font-display font-bold text-base">ChuchoEdu</Link>
        <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <div className="w-5 h-0.5 bg-slate-600 dark:bg-slate-300 mb-1" />
          <div className="w-5 h-0.5 bg-slate-600 dark:bg-slate-300 mb-1" />
          <div className="w-5 h-0.5 bg-slate-600 dark:bg-slate-300" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-64 bg-white dark:bg-slate-900 h-full flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-display font-bold text-base">ChuchoEdu</span>
              <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {nav.map(n => (
                <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${
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
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 fixed top-0 left-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col z-40">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <Link to="/app" className="font-display font-bold text-base">ChuchoEdu</Link>
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

        {/* Main content */}
        <main className="flex-1 lg:ml-56 p-4 md:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex z-40">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition ${
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'
              }`}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav spacer on mobile */}
      <div className="lg:hidden h-14" />
    </div>
  )
}
