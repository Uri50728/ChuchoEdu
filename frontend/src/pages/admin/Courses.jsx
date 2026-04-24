import { useEffect, useState } from 'react'
import api from '../../utils/api'

const emptyCourse = { title: '', description: '', thumbnail: '', teacherId: '' }
const emptyLesson = { title: '', videoUrl: '', order: 1 }

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
  const [lessonForm, setLessonForm] = useState(emptyLesson)
  const [editingLesson, setEditingLesson] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([api.get('/admin/courses'), api.get('/admin/teachers')])
      .then(([cr, tr]) => { setCourses(cr.data); setTeachers(tr.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm(emptyCourse); setLessons([{ title: '', videoUrl: '', order: 1 }])
    setEditing(null); setError(''); setModal(true)
  }

  const openEdit = (c) => {
    setForm({ title: c.title, description: c.description || '', thumbnail: c.thumbnail || '', teacherId: c.teacherId })
    setEditing(c); setError(''); setModal(true)
  }

  const openLessons = (c) => {
    setSelectedCourse(c); setLessonForm({ title: '', videoUrl: '', order: (c.lessons?.length || 0) + 1 })
    setEditingLesson(null); setLessonModal(true)
  }

  const addLesson = () => setLessons(ls => [...ls, { title: '', videoUrl: '', order: ls.length + 1 }])
  const removeLesson = (i) => setLessons(ls => ls.filter((_, idx) => idx !== i))
  const updateLesson = (i, field, val) => setLessons(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  const save = async () => {
    if (!form.title || !form.teacherId) return setError('Título y profesor son obligatorios')
    setSaving(true); setError('')
    try {
      if (editing) {
        await api.put(`/admin/courses/${editing.id}`, form)
      } else {
        await api.post('/admin/courses', { ...form, lessons })
      }
      setModal(false); load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const saveLesson = async () => {
    if (!lessonForm.title || !lessonForm.videoUrl) return setError('Título y URL son obligatorios')
    setSaving(true); setError('')
    try {
      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, lessonForm)
      } else {
        await api.post(`/admin/courses/${selectedCourse.id}/lessons`, lessonForm)
      }
      setEditingLesson(null)
      setLessonForm({ title: '', videoUrl: '', order: (selectedCourse.lessons?.length || 0) + 2 })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error')
    } finally {
      setSaving(false)
    }
  }

  const deleteLesson = async (lessonId) => {
    if (!confirm('¿Eliminar esta lección?')) return
    await api.delete(`/admin/lessons/${lessonId}`)
    load()
  }

  const deleteCourse = async (id) => {
    if (!confirm('¿Eliminar este curso?')) return
    await api.delete(`/admin/courses/${id}`)
    setCourses(c => c.filter(x => x.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="font-display font-bold text-3xl">Cursos</h1><p className="text-slate-500">Gestiona el catálogo de cursos</p></div>
        <button onClick={openNew} className="btn-primary">+ Nuevo curso</button>
      </div>

      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="card p-10 text-center text-slate-400">Sin cursos registrados</div>
        ) : courses.map(c => (
          <div key={c.id} className="card p-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-slate-800 flex items-center justify-center text-2xl overflow-hidden shrink-0">
              {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : '🎓'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold truncate">{c.title}</h3>
              <p className="text-sm text-slate-500">{c.teacher?.name} · {c.teacher?.specialty}</p>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
                <span>📹 {c.lessons?.length || 0} lecciones</span>
                <span>👥 {c._count?.enrollments || 0} inscritos</span>
                <span>⭐ {c._count?.ratings || 0} calificaciones</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openLessons(c)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-100 dark:hover:bg-brand-900/30 text-slate-600 hover:text-brand-700 transition font-medium">📹 Lecciones</button>
              <button onClick={() => openEdit(c)} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 transition font-medium">Editar</button>
              <button onClick={() => deleteCourse(c.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 transition font-medium">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="card p-6 w-full max-w-2xl animate-slide-up">
            <h2 className="font-display font-bold text-xl mb-5">{editing ? 'Editar curso' : 'Nuevo curso'}</h2>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-4">
              <div><label className="label">Título del curso</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="label">Descripción</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="label">URL de portada (imagen)</label><input className="input" placeholder="https://..." value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} /></div>
              <div>
                <label className="label">Profesor</label>
                <select className="input" value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Selecciona un profesor...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.specialty}</option>)}
                </select>
              </div>

              {!editing && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="label mb-0">Lecciones</label>
                    <button onClick={addLesson} className="text-xs text-brand-600 hover:underline font-semibold">+ Agregar lección</button>
                  </div>
                  <div className="space-y-3">
                    {lessons.map((l, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Lección {i + 1}</span>
                          {lessons.length > 1 && <button onClick={() => removeLesson(i)} className="text-xs text-red-500 hover:underline">Eliminar</button>}
                        </div>
                        <input className="input text-sm" placeholder="Título de la lección" value={l.title} onChange={e => updateLesson(i, 'title', e.target.value)} />
                        <input className="input text-sm" placeholder="URL del video (YouTube o directa)" value={l.videoUrl} onChange={e => updateLesson(i, 'videoUrl', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons Modal */}
      {lessonModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="card p-6 w-full max-w-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl">Lecciones: {selectedCourse.title}</h2>
              <button onClick={() => { setLessonModal(false); setError('') }} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Existing lessons */}
            <div className="space-y-2 mb-6">
              {(courses.find(c => c.id === selectedCourse.id)?.lessons || []).map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">{l.order}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{l.title}</p>
                    <p className="text-xs text-slate-400 truncate">{l.videoUrl}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditingLesson(l); setLessonForm({ title: l.title, videoUrl: l.videoUrl, order: l.order }) }} className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-100">Editar</button>
                    <button onClick={() => deleteLesson(l.id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Edit lesson form */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="font-semibold text-sm mb-3">{editingLesson ? 'Editar lección' : 'Agregar nueva lección'}</h3>
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-3"><label className="label">Título</label><input className="input" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} /></div>
                  <div><label className="label">Orden</label><input className="input" type="number" min={1} value={lessonForm.order} onChange={e => setLessonForm(f => ({ ...f, order: parseInt(e.target.value) }))} /></div>
                </div>
                <div><label className="label">URL del video</label><input className="input" placeholder="https://youtube.com/... o URL directa" value={lessonForm.videoUrl} onChange={e => setLessonForm(f => ({ ...f, videoUrl: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3 mt-4">
                {editingLesson && <button onClick={() => { setEditingLesson(null); setLessonForm({ title: '', videoUrl: '', order: 1 }); setError('') }} className="btn-secondary">Cancelar</button>}
                <button onClick={saveLesson} disabled={saving} className="btn-primary flex-1">{saving ? 'Guardando...' : editingLesson ? 'Actualizar lección' : '+ Agregar lección'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
