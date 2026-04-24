import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-lg ${i <= Math.round(value) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</span>
      ))}
    </span>
  )
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/my-progress`).catch(() => null)
    ]).then(([courseRes, progressRes]) => {
      setCourse(courseRes.data)
      if (progressRes) setProgress(progressRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const enroll = async () => {
    setEnrolling(true)
    setError('')
    try {
      await api.post(`/courses/${id}/enroll`)
      navigate(`/app/courses/${id}/learn`)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al inscribirse')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
  if (!course) return <div className="text-center py-20 text-slate-400">Curso no encontrado</div>

  const isEnrolled = !!progress?.enrollment
  const lessonsWatched = progress?.progress?.filter(p => p.watched)?.length || 0
  const totalLessons = course.lessons?.length || 0

  return (
    <div className="max-w-4xl animate-fade-in">
      <Link to="/app" className="text-sm text-slate-500 hover:text-brand-600 mb-6 inline-flex items-center gap-1">← Volver a cursos</Link>

      <div className="card overflow-hidden mb-6">
        <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-300 dark:from-brand-900/40 dark:to-slate-800 flex items-center justify-center text-8xl">
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            : '🎓'}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">{course.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>👨‍🏫 {course.teacher?.name}</span>
              <span>· {course.teacher?.specialty}</span>
            </div>
          </div>

          {course.description && (
            <div className="card p-5">
              <h2 className="font-display font-bold text-lg mb-2">Descripción</h2>
              <p className="text-slate-600 dark:text-slate-400">{course.description}</p>
            </div>
          )}

          <div className="card p-5">
            <h2 className="font-display font-bold text-lg mb-4">Contenido del curso</h2>
            <div className="space-y-2">
              {course.lessons?.map((lesson, i) => {
                const watched = progress?.progress?.find(p => p.lessonId === lesson.id)?.watched
                return (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${watched ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {watched ? '✓' : i + 1}
                    </div>
                    <span className="flex-1 text-sm font-medium">{lesson.title}</span>
                    {!isEnrolled && i > 0 && <span className="text-slate-400 text-xs">🔒</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ratings */}
          {course.ratings?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-bold text-lg mb-4">Opiniones</h2>
              <div className="space-y-4">
                {course.ratings.map(r => (
                  <div key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm">{r.user?.name}</span>
                      <Stars value={r.stars} />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar CTA */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-8">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Stars value={course.avgRating} />
                <span className="font-bold">{course.avgRating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-slate-500">{course._count?.enrollments} alumnos inscritos</p>
            </div>

            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between"><span className="text-slate-500">Lecciones</span><span className="font-semibold">{totalLessons}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Instructor</span><span className="font-semibold">{course.teacher?.name}</span></div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {isEnrolled ? (
              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3">
                  <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${totalLessons ? (lessonsWatched / totalLessons) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-center text-slate-500 mb-3">{lessonsWatched}/{totalLessons} lecciones completadas</p>
                <Link to={`/app/courses/${id}/learn`} className="btn-primary block text-center">
                  {lessonsWatched === 0 ? '▶ Comenzar curso' : '▶ Continuar'}
                </Link>
                {progress?.enrollment?.completed && (
                  <Link to={`/app/certificates`} className="btn-secondary block text-center text-sm">🏆 Ver certificado</Link>
                )}
              </div>
            ) : (
              <button onClick={enroll} disabled={enrolling} className="btn-primary w-full text-center">
                {enrolling ? 'Inscribiendo...' : '🚀 Inscribirme gratis'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
