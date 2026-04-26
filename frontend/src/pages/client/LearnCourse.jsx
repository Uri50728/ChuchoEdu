import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'

function getYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&?/]+)/)
  return m ? m[1] : null
}

function RatingModal({ courseId, onDone }) {
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async () => {
    if (!comment.trim()) return setError('El comentario es obligatorio')
    setLoading(true)
    try {
      await api.post(`/courses/${courseId}/rate`, { stars, comment })
      onDone(); navigate('/app/certificates')
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="card p-5 max-w-sm w-full bg-white dark:bg-slate-900">
        <h2 className="font-display font-bold text-lg mb-1">Curso completado</h2>
        <p className="text-slate-500 text-sm mb-4">Califica tu experiencia para obtener el certificado.</p>
        <div className="mb-4">
          <label className="label">Calificación</label>
          <div className="flex gap-2 text-3xl">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setStars(n)}
                className={`transition-transform active:scale-90 ${n <= stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="label">Comentario <span className="text-red-400 normal-case font-normal">(obligatorio)</span></label>
          <textarea className="input resize-none" rows={3} placeholder="Que aprendiste? Lo recomendarias?" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <button onClick={submit} disabled={loading} className="btn-primary w-full">
          {loading ? 'Enviando...' : 'Calificar y obtener certificado'}
        </button>
      </div>
    </div>
  )
}

export default function LearnCourse() {
  const { id } = useParams()
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/courses/${id}`), api.get(`/courses/${id}/my-progress`)])
      .then(([cr, pr]) => {
        setCourseTitle(cr.data.title)
        const ls = pr.data.lessons || []
        const prog = pr.data.progress || []
        setLessons(ls); setProgress(prog)
        const watched = prog.filter(p => p.watched).map(p => p.lessonId)
        const next = ls.find(l => !watched.includes(l.id))
        setCurrent(next || ls[ls.length - 1] || null)
      }).finally(() => setLoading(false))
  }, [id])

  const isWatched = lid => progress.some(p => p.lessonId === lid && p.watched)
  const canWatch = lesson => {
    const idx = lessons.findIndex(l => l.id === lesson.id)
    return idx === 0 || isWatched(lessons[idx - 1].id)
  }

  const markWatched = async () => {
    if (!current || marking) return
    setMarking(true)
    try {
      const { data } = await api.post(`/courses/lessons/${current.id}/watch`)
      setProgress(prev => [...prev.filter(p => p.lessonId !== current.id), { lessonId: current.id, watched: true }])
      if (data.completed) { setShowRating(true) }
      else {
        const idx = lessons.findIndex(l => l.id === current.id)
        if (idx < lessons.length - 1) setCurrent(lessons[idx + 1])
      }
    } catch (err) { alert(err.response?.data?.error || 'Error') }
    finally { setMarking(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  const ytId = getYouTubeId(current?.videoUrl)
  const watchedCount = progress.filter(p => p.watched).length
  const pct = lessons.length ? Math.round((watchedCount / lessons.length) * 100) : 0

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {showRating && <RatingModal courseId={id} onDone={() => setShowRating(false)} />}

      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link to={`/app/courses/${id}`} className="text-sm text-slate-500 hover:text-brand-600 shrink-0">← Volver</Link>
        <h1 className="font-semibold text-sm flex-1 truncate">{courseTitle}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline">{watchedCount}/{lessons.length}</span>
          {/* Mobile toggle list */}
          <button onClick={() => setShowList(o => !o)}
            className="lg:hidden text-xs btn-secondary px-2 py-1">
            {showList ? 'Video' : 'Lecciones'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Video area — hidden on mobile when list is open */}
        <div className={`flex-1 flex flex-col bg-black ${showList ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 flex items-center justify-center">
            {current ? (
              ytId
                ? <iframe key={current.id} src={`https://www.youtube.com/embed/${ytId}?rel=0`} className="w-full aspect-video max-h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                : <video key={current.id} src={current.videoUrl} controls className="w-full max-h-full" />
            ) : (
              <p className="text-white text-sm">Selecciona una lección</p>
            )}
          </div>

          {current && (
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0 gap-3">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{current.title}</p>
                <p className="text-slate-400 text-xs">Lección {lessons.findIndex(l => l.id === current.id) + 1} de {lessons.length}</p>
              </div>
              {isWatched(current.id) ? (
                <span className="badge bg-green-500/20 text-green-400 border border-green-500/20 text-xs shrink-0">Completada</span>
              ) : (
                <button onClick={markWatched} disabled={marking} className="btn-primary text-xs shrink-0">
                  {marking ? 'Guardando...' : 'Marcar como vista'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lesson list — full width on mobile when open, sidebar on desktop */}
        <div className={`bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden
          ${showList ? 'flex w-full lg:w-72' : 'hidden lg:flex lg:w-72'}`}>
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-1">
              <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-500">{pct}% completado &mdash; {watchedCount}/{lessons.length} lecciones</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {lessons.map((l, i) => {
              const watched = isWatched(l.id)
              const unlocked = canWatch(l)
              const active = current?.id === l.id
              return (
                <button key={l.id} disabled={!unlocked}
                  onClick={() => { if (unlocked) { setCurrent(l); setShowList(false) } }}
                  className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg transition text-xs ${
                    active ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : unlocked ? 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'opacity-40 cursor-not-allowed text-slate-500'
                  }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    watched ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : active ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {watched ? '✓' : !unlocked ? '-' : i + 1}
                  </span>
                  <span className="flex-1 line-clamp-2 leading-snug">{l.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
