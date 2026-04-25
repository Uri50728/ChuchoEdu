import { useEffect, useState, useRef } from 'react'
import api from '../../utils/api'

const emptyCourse = { title: '', description: '', thumbnail: '', teacherId: '' }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [lessonModal, setLessonModal] = useState(false)
  const [form, setForm] = useState(emptyCourse)
  const [lessons, setLessons] = useState([{ title: '', videoUrl: '', order: 1 }])
  const [editing, setEditing] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '', order: 1 })
  const [editingLesson, setEditingLesson] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const thumbRef = useRef()

  const load = () => {
    Promise.all([api.get('/admin/courses'), api.get('/admin/teachers')])
      .then(([cr, tr]) => { setCourses(cr.data); setTeachers(tr.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const uploadThumb = async (file) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const { data } = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, thumbnail: data.url }))
    } catch { setError('Error al subir imagen') }
    finally { setUploading(false) }
  }

  const openNew = () => { setForm(emptyCourse); setLessons([{ title: '', videoUrl: '', order: 1 }]); setEditing(null); setError(''); setModal(true) }
  const openEdit = (c) => { setForm({ title: c.title, description: c.description || '', thumbnail: c.thumbnail || '', teacherId: c.teacherId }); setEditing(c); setError(''); setModal(true) }
  const openLessons = (c) => { setSelectedCourse(c); setLessonForm({ title: '', videoUrl: '', order: (c.lessons?.length || 0) + 1 }); setEditingLesson(null); setError(''); setLessonModal(true) }

  const addLessonRow = () => setLessons(ls => [...ls, { title: '', videoUrl: '', order: ls.length + 1 }])
  const removeLessonRow = (i) => setLessons(ls => ls.filter((_, idx) => idx !== i))
  const updateLessonRow = (i, field, val) => setLessons(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  const save = async () => {
    if (!form.title || !form.teacherId) return setError('Titulo y profesor son obligatorios')
    setSaving(true); setError('')
    try {
      editing ? await api.put(`/admin/courses/${editing.id}`, form)
               : await api.post('/admin/courses', { ...form, lessons })
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  const saveLesson = async () => {
    if (!lessonForm.title || !lessonForm.videoUrl) return setError('Titulo y URL son obligatorios')
    setSaving(true); setError('')
    try {
      editingLesson ? await api.put(`/admin/lessons/${editingLesson.id}`, lessonForm)
                    : await api.post(`/admin/courses/${selectedCourse.id}/lessons`, lessonForm)
      setEditingLesson(null)
      setLessonForm({ title: '', videoUrl: '', order: (selectedCourse.lessons?.length || 0) + 2 })
      load()
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setSaving(false) }
  }

  const deleteLesson = async (lid) => {
    if (!confirm('Eliminar esta leccion?')) return
    await api.delete(`/admin/lessons/${lid}`); load()
  }

  const deleteCourse = async (id) => {
    if (!confirm('Eliminar este curso?')) return
    await api.delete(`/admin/courses/${id}`)
    setCourses(c => c.filter(x => x.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="page-title">Cursos</h1><p className="page-subtitle">Catalogo de cursos</p></div>
        <button onClick={openNew} className="btn-primary">Nuevo curso</button>
      </div>

      <div className="space-y-3">
        {courses.length === 0 ? (
          <div className="card p-10 text-center text-slate-400 text-sm">Sin cursos registrados</div>
        ) : courses.map(c => (
          <div key={c.id} className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
              {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{c.title}</p>
              <p className="text-xs text-slate-500">{c.teacher?.name} &mdash; {c.lessons?.length || 0} lecciones &mdash; {c._count?.enrollments || 0} inscritos</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openLessons(c)} className="btn-secondary text-xs">Lecciones</button>
              <button onClick={() => openEdit(c)} className="btn-secondary text-xs">Editar</button>
              <button onClick={() => deleteCourse(c.id)} className="btn-danger text-xs">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="card p-6 w-full max-w-xl bg-white dark:bg-slate-900">
            <h2 className="font-display font-bold text-lg mb-4">{editing ? 'Editar curso' : 'Nuevo curso'}</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-3">
              <div><label className="label">Titulo</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="label">Descripcion</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <label className="label">Portada</label>
                <div className="flex gap-3 items-start">
                  {form.thumbnail && <img src={form.thumbnail} alt="" className="w-20 h-12 object-cover rounded" />}
                  <div className="flex-1">
                    <button onClick={() => thumbRef.current?.click()} disabled={uploading} className="btn-secondary text-xs mb-1">
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                    </button>
                    <p className="text-xs text-slate-400">Se comprime automaticamente (aprox. 40KB)</p>
                    <input ref={thumbRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadThumb(e.target.files[0])} />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Profesor</label>
                <select className="input" value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Selecciona un profesor...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>)}
                </select>
              </div>
              {!editing && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Lecciones iniciales</label>
                    <button onClick={addLessonRow} className="text-xs text-brand-600 hover:underline font-semibold">+ Agregar</button>
                  </div>
                  <div className="space-y-2">
                    {lessons.map((l, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-500">Leccion {i + 1}</span>
                          {lessons.length > 1 && <button onClick={() => removeLessonRow(i)} className="text-xs text-red-500 hover:underline">Eliminar</button>}
                        </div>
                        <input className="input text-xs" placeholder="Titulo de la leccion" value={l.title} onChange={e => updateLessonRow(i, 'title', e.target.value)} />
                        <input className="input text-xs" placeholder="URL del video (YouTube recomendado)" value={l.videoUrl} onChange={e => updateLessonRow(i, 'videoUrl', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Modal */}
      {lessonModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="card p-6 w-full max-w-xl bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display font-bold text-lg">Lecciones: {selectedCourse.title}</h2>
              <button onClick={() => { setLessonModal(false); setError('') }} className="text-slate-400 hover:text-slate-600 text-lg">x</button>
            </div>

            <div className="space-y-2 mb-5">
              {(courses.find(c => c.id === selectedCourse.id)?.lessons || []).map(l => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">{l.order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.title}</p>
                    <p className="text-xs text-slate-400 truncate">{l.videoUrl}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditingLesson(l); setLessonForm({ title: l.title, videoUrl: l.videoUrl, order: l.order }) }} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => deleteLesson(l.id)} className="btn-danger text-xs">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-sm font-semibold mb-3">{editingLesson ? 'Editar leccion' : 'Nueva leccion'}</p>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3"><label className="label">Titulo</label><input className="input" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div><label className="label">Orden</label><input className="input" type="number" min={1} value={lessonForm.order} onChange={e => setLessonForm(f => ({ ...f, order: parseInt(e.target.value) }))} /></div>
                </div>
                <div><label className="label">URL del video (YouTube recomendado)</label><input className="input" placeholder="https://youtube.com/watch?v=..." value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3 mt-3">
                {editingLesson && <button onClick={() => { setEditingLesson(null); setLessonForm({ title: '', videoUrl: '', order: 1 }); setError('') }} className="btn-secondary">Cancelar</button>}
                <button onClick={saveLesson} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : editingLesson ? 'Actualizar' : 'Agregar leccion'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
