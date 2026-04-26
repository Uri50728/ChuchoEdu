import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white sticky top-0 z-40">
        <div>
          <span className="font-display font-bold text-base">ChuchoEdu</span>
          <span className="text-xs text-slate-400 ml-2">Admin</span>
        </div>
        <button onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-lg hover:bg-slate-800 transition">
          <div className="w-5 h-0.5 bg-slate-300 mb-1" />
          <div className="w-5 h-0.5 bg-slate-300 mb-1" />
          <div className="w-5 h-0.5 bg-slate-300" />
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-display font-bold text-base">ChuchoEdu Admin</span>
              <button onClick={() => setMenuOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {nav.map(n => (
                <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${
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
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button onClick={logout} className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 fixed top-0 left-0 h-full bg-slate-900 text-white flex-col z-40">
          <div className="px-5 py-4 border-b border-slate-800">
            <Link to="/admin" className="font-display font-bold text-base">ChuchoEdu</Link>
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

        <main className="flex-1 lg:ml-56 p-4 md:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-40">
        {nav.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition ${
                isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              }`}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="lg:hidden h-14" />
    </div>
  )
}
