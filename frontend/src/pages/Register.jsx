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
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden')
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-bold text-xl">EduPlatform</Link>
          <h1 className="font-display font-bold text-2xl mt-4">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Regístrate gratis y comienza a aprender</p>
        </div>
        <div className="card p-6">
          {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-lg mb-4 text-sm">{error}</div>}
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" placeholder="Tu nombre" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Correo electrónico</label>
              <input className="input" type="email" placeholder="correo@ejemplo.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input" type="password" placeholder="Mínimo 6 caracteres" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="label">Confirmar contraseña</label>
              <input className="input" type="password" placeholder="Repite tu contraseña" required value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Ya tienes cuenta? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
