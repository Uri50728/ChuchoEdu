import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

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
      onDone()
      navigate(`/app/certificates`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al calificar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
      <div className="card p-8 max-w-md w-full animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="font-display font-bold text-2xl">¡Felicitaciones!</h2>
          <p className="text-slate-500 mt-1">Completaste el curso. Califica tu experiencia para obtener tu certificado.</p>
        </div>

        <div className="mb-5">
          <label className="label">Calificación</label>
          <div className="flex gap-2 text-4xl">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setStars(n)}
                className={`transition-transform hover:scale-110 ${n <= stars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="label">Comentario <span className="text-red-400">*</span></label>
          <textarea className="input resize-none" rows={3} placeholder="¿Qué aprendiste? ¿Lo recomendarías?"
            value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button onClick={submit} disabled={loading} className="btn-primary w-full text-center">
          {loading ? 'Enviando...' : '🏆 Calificar y obtener certificado'}
        </button>
      </div>
    </div>
  )
}

export default function LearnCourse() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [progress, setProgress] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [enrollment, setEnrollment] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/my-progress`)
    ]).then(([courseRes, progressRes]) => {
      setCourse(courseRes.data)
      setLessons(progressRes.data.lessons || [])
      setProgress(progressRes.data.progress || [])
      setEnrollment(progressRes.data.enrollment)

      // Find current lesson: first unwatched
      const watched = progressRes.data.progress?.filter(p => p.watched).map(p => p.lessonId) || []
      const ls = progressRes.data.lessons || []
      const next = ls.find(l => !watched.includes(l.id))
      setCurrentLesson(next || ls[ls.length - 1] || null)
    }).finally(() => setLoading(false))
  }, [id])

  const isWatched = (lessonId) => progress.some(p => p.lessonId === lessonId && p.watched)

  const canWatch = (lesson) => {
    const idx = lessons.findIndex(l => l.id === lesson.id)
    if (idx === 0) return true
    return isWatched(lessons[idx - 1].id)
  }

  const markWatched = async () => {
    if (!currentLesson || marking) return
    setMarking(true)
    try {
      const { data } = await api.post(`/courses/lessons/${currentLesson.id}/watch`)
      setProgress(prev => {
        const filtered = prev.filter(p => p.lessonId !== currentLesson.id)
        return [...filtered, { lessonId: currentLesson.id, watched: true }]
      })
      if (data.completed) {
        setEnrollment(e => ({ ...e, completed: true }))
        setShowRating(true)
      } else {
        // Auto-advance
        const idx = lessons.findIndex(l => l.id === currentLesson.id)
        if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1])
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error')
    } finally {
      setMarking(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  const ytId = getYouTubeId(currentLesson?.videoUrl)
  const watchedCount = progress.filter(p => p.watched).length

  return (
    <div className="animate-fade-in -m-8">
      {showRating && <RatingModal courseId={id} onDone={() => setShowRating(false)} />}

      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <Link to={`/app/courses/${id}`} className="text-slate-500 hover:text-brand-600 text-sm">← Volver</Link>
        <h1 className="font-display font-bold text-lg flex-1 truncate">{course?.title}</h1>
        <span className="text-sm text-slate-500 font-medium">{watchedCount}/{lessons.length} completadas</span>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Video area */}
        <div className="flex-1 flex flex-col bg-black">
          <div className="flex-1 flex items-center justify-center">
            {currentLesson ? (
              ytId ? (
                <iframe
                  key={currentLesson.id}
                  src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video key={currentLesson.id} src={currentLesson.videoUrl} controls className="w-full max-h-full" />
              )
            ) : (
              <div className="text-white text-center"><p>Selecciona una lección</p></div>
            )}
          </div>

          {currentLesson && (
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">{currentLesson.title}</h2>
                <p className="text-slate-400 text-sm">Lección {lessons.findIndex(l => l.id === currentLesson.id) + 1} de {lessons.length}</p>
              </div>
              {isWatched(currentLesson.id) ? (
                <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">✓ Completada</span>
              ) : (
                <button onClick={markWatched} disabled={marking} className="btn-primary">
                  {marking ? 'Guardando...' : '✓ Marcar como vista'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lesson list */}
        <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-1">
              <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${lessons.length ? (watchedCount / lessons.length) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-slate-500">{Math.round(lessons.length ? (watchedCount / lessons.length) * 100 : 0)}% completado</p>
          </div>
          <div className="p-2 space-y-1">
            {lessons.map((l, i) => {
              const watched = isWatched(l.id)
              const unlocked = canWatch(l)
              const active = currentLesson?.id === l.id
              return (
                <button key={l.id} disabled={!unlocked}
                  onClick={() => unlocked && setCurrentLesson(l)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition text-sm ${
                    active ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : unlocked ? 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'opacity-40 cursor-not-allowed text-slate-500'
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    watched ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : active ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {watched ? '✓' : !unlocked ? '🔒' : i + 1}
                  </div>
                  <span className="flex-1 line-clamp-2">{l.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
