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
      editing ? await api.put(`/admin/teachers/${editing.id}`, form)
               : await api.post('/admin/teachers', form)
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Eliminar este profesor?')) return
    try { await api.delete(`/admin/teachers/${id}`); setTeachers(t => t.filter(x => x.id !== id)) }
    catch { alert('No se puede eliminar, tiene cursos asignados') }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">Profesores</h1><p className="page-subtitle">Gestiona el cuerpo docente</p></div>
        <button onClick={openNew} className="btn-primary">Agregar profesor</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
              {['Nombre', 'Correo', 'Especialidad', 'Cursos', ''].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {teachers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Sin profesores registrados</td></tr>
            ) : teachers.map(t => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 text-slate-500">{t.email}</td>
                <td className="px-4 py-3"><span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.specialty}</span></td>
                <td className="px-4 py-3 text-slate-500">{t._count?.courses || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => remove(t.id)} className="btn-danger text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="card p-6 w-full max-w-sm bg-white dark:bg-slate-900">
            <h2 className="font-display font-bold text-lg mb-4">{editing ? 'Editar profesor' : 'Nuevo profesor'}</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-3">
              <div><label className="label">Nombre</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label">Correo</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="label">Especialidad</label><input className="input" placeholder="ej. Desarrollo Web" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
