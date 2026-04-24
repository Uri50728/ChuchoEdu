import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden')
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center font-bold text-white">E</div>
            <span className="font-display font-bold text-2xl text-white">EduPlatform</span>
          </Link>
          <h1 className="font-display font-bold text-3xl text-white">Crea tu cuenta</h1>
          <p className="text-slate-400 mt-2">Únete y comienza a aprender hoy</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" type="text" placeholder="Tu nombre" required
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" placeholder="tu@correo.com" required
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="Mínimo 6 caracteres" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input className="input" type="password" placeholder="Repite tu contraseña" required
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-center py-3 text-base mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
