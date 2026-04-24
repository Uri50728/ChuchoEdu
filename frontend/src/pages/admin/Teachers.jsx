import { useEffect, useState } from 'react'
import api from '../../utils/api'

const empty = { name: '', email: '', specialty: '' }

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [modal, setModal] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.get('/admin/teachers').then(r => setTeachers(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(empty); setEditing(null); setError(''); setModal(true) }
  const openEdit = (t) => { setForm({ name: t.name, email: t.email, specialty: t.specialty }); setEditing(t); setError(''); setModal(true) }

  const save = async () => {
    if (!form.name || !form.email || !form.specialty) return setError('Todos los campos son obligatorios')
    setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`/admin/teachers/${editing.id}`, form)
      } else {
        await api.post('/admin/teachers', form)
      }
      setModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar este profesor?')) return
    try {
      await api.delete(`/admin/teachers/${id}`)
      setTeachers(t => t.filter(x => x.id !== id))
    } catch {
      alert('No se puede eliminar, tiene cursos asignados')
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl">Profesores</h1>
          <p className="text-slate-500">Gestiona el cuerpo docente</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Agregar profesor</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {['Nombre', 'Correo', 'Especialidad', 'Cursos', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {teachers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Sin profesores registrados</td></tr>
            ) : teachers.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300">
                      {t.name[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">{t.email}</td>
                <td className="px-5 py-4"><span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{t.specialty}</span></td>
                <td className="px-5 py-4 text-sm text-slate-500">{t._count?.courses || 0} cursos</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(t)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-slate-600 dark:text-slate-400 hover:text-brand-700 transition font-medium">Editar</button>
                    <button onClick={() => remove(t.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 transition font-medium">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="font-display font-bold text-xl mb-5">{editing ? 'Editar profesor' : 'Nuevo profesor'}</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-4">
              <div><label className="label">Nombre completo</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label">Correo electrónico</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="label">Especialidad</label><input className="input" value={form.specialty} placeholder="ej. Desarrollo Web, Diseño UX..." onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
