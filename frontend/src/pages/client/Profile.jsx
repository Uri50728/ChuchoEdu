import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState('profile')

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const saveProfile = async () => {
    setMsg(''); setError(''); setLoading(true)
    try {
      const { data } = await api.put('/users/profile', { name: profileForm.name, avatar: profileForm.avatar, theme })
      updateUser(data)
      setMsg('Perfil actualizado correctamente')
    } catch {
      setError('Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const savePassword = async () => {
    setMsg(''); setError('')
    if (pwForm.newPassword !== pwForm.confirm) return setError('Las contraseñas no coinciden')
    if (pwForm.newPassword.length < 6) return setError('Mínimo 6 caracteres')
    setLoading(true)
    try {
      await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setMsg('Contraseña actualizada')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="font-display font-bold text-3xl mb-8">Configuración de perfil</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
        {['profile', 'password', 'appearance'].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(''); setError('') }}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition border-b-2 -mb-px ${
              tab === t ? 'border-brand-600 text-brand-700 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'profile' ? 'Perfil' : t === 'password' ? 'Contraseña' : 'Apariencia'}
          </button>
        ))}
      </div>

      {msg && <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl mb-5 text-sm">{msg}</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>}

      {tab === 'profile' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-5 mb-2">
            <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-3xl overflow-hidden">
              {profileForm.avatar
                ? <img src={profileForm.avatar} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <label className="label">URL de imagen de perfil</label>
              <input className="input" placeholder="https://..." value={profileForm.avatar}
                onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Correo electrónico</label>
            <input className="input" value={user?.email} disabled className="opacity-60 cursor-not-allowed" />
          </div>
          <button onClick={saveProfile} disabled={loading} className="btn-primary">
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card p-6 space-y-5">
          <div>
            <label className="label">Contraseña actual</label>
            <input className="input" type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Nueva contraseña</label>
            <input className="input" type="password" value={pwForm.newPassword}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <input className="input" type="password" value={pwForm.confirm}
              onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <button onClick={savePassword} disabled={loading} className="btn-primary">
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Tema de la aplicación</h3>
          <div className="grid grid-cols-2 gap-4">
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => { if (theme !== t) toggle() }}
                className={`p-4 rounded-2xl border-2 transition ${theme === t ? 'border-brand-600' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className={`aspect-video rounded-xl mb-3 flex items-center justify-center text-3xl ${t === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  {t === 'dark' ? '🌙' : '☀️'}
                </div>
                <p className="font-semibold text-sm capitalize">{t === 'dark' ? 'Oscuro' : 'Claro'}</p>
                {theme === t && <p className="text-xs text-brand-600 mt-0.5">Activo</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
