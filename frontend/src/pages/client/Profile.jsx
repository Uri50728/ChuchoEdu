import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import api from '../../utils/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { theme, toggle } = useTheme()
  const [tab, setTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const reset = () => { setMsg(''); setError('') }

  const uploadAvatar = async (file) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      const { data: updated } = await api.put('/users/profile', { name: profileForm.name, avatar: data.url, theme })
      updateUser(updated)
      setMsg(`Avatar actualizado (${data.sizeKB} KB)`)
    } catch { setError('Error al subir imagen') }
    finally { setUploading(false) }
  }

  const saveProfile = async () => {
    reset(); setLoading(true)
    try {
      const { data } = await api.put('/users/profile', { name: profileForm.name, avatar: user?.avatar, theme })
      updateUser(data); setMsg('Perfil actualizado')
    } catch { setError('Error al guardar') }
    finally { setLoading(false) }
  }

  const savePassword = async () => {
    reset()
    if (pwForm.newPassword !== pwForm.confirm) return setError('Las contraseñas no coinciden')
    if (pwForm.newPassword.length < 6) return setError('Minimo 6 caracteres')
    setLoading(true)
    try {
      await api.put('/users/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setMsg('Contraseña actualizada')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setLoading(false) }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil' },
    { id: 'password', label: 'Contraseña' },
    { id: 'appearance', label: 'Apariencia' },
  ]

  return (
    <div className="max-w-lg">
      <h1 className="page-title">Configuración</h1>

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); reset() }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.id ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 py-2.5 rounded-lg mb-4 text-sm">{msg}</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2.5 rounded-lg mb-4 text-sm">{error}</div>}

      {tab === 'profile' && (
        <div className="card p-5 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center font-bold text-brand-700 dark:text-brand-300 text-xl overflow-hidden shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="btn-secondary text-xs">
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG. Se comprime automaticamente.</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files[0] && uploadAvatar(e.target.files[0])} />
            </div>
          </div>
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Correo</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
          </div>
          <button onClick={saveProfile} disabled={loading} className="btn-primary">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card p-5 space-y-4">
          <div><label className="label">Contraseña actual</label><input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} /></div>
          <div><label className="label">Nueva contraseña</label><input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
          <div><label className="label">Confirmar nueva contraseña</label><input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
          <button onClick={savePassword} disabled={loading} className="btn-primary">{loading ? 'Actualizando...' : 'Cambiar contraseña'}</button>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="card p-5">
          <p className="text-sm font-semibold mb-4">Tema de la aplicación</p>
          <div className="grid grid-cols-2 gap-3">
            {['light', 'dark'].map(t => (
              <button key={t} onClick={() => { if (theme !== t) toggle() }}
                className={`p-4 rounded-lg border-2 transition text-left ${theme === t ? 'border-brand-600' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className={`aspect-video rounded mb-2 ${t === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`} />
                <p className="text-sm font-medium">{t === 'dark' ? 'Oscuro' : 'Claro'}</p>
                {theme === t && <p className="text-xs text-brand-600 dark:text-brand-400">Activo</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
