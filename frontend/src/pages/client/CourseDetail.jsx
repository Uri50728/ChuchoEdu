import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'

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
    ]).then(([cr, pr]) => {
      setCourse(cr.data)
      if (pr) setProgress(pr.data)
    }).finally(() => setLoading(false))
  }, [id])

  const enroll = async () => {
    setEnrolling(true); setError('')
    try {
      await api.post(`/courses/${id}/enroll`)
      navigate(`/app/courses/${id}/learn`)
    } catch (err) { setError(err.response?.data?.error || 'Error') }
    finally { setEnrolling(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>
  if (!course) return <div className="text-center py-20 text-slate-400 text-sm">Curso no encontrado</div>

  const isEnrolled = !!progress?.enrollment
  const watched = progress?.progress?.filter(p => p.watched).length || 0
  const total = course.lessons?.length || 0
  const pct = total ? Math.round((watched / total) * 100) : 0

  return (
    <div>
      <Link to="/app" className="text-sm text-slate-500 hover:text-brand-600 mb-4 inline-block">← Volver</Link>

      {/* Mobile: stacked. Desktop: grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5">

        {/* Left / main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="aspect-video bg-slate-100 dark:bg-slate-800">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />}
            </div>
          </div>

          <div>
            <h1 className="font-display font-bold text-xl md:text-2xl mb-1">{course.title}</h1>
            <p className="text-sm text-slate-500">{course.teacher?.name} &mdash; {course.teacher?.specialty}</p>
          </div>

          {/* CTA on mobile (shown here, hidden on desktop) */}
          <div className="lg:hidden">
            <CtaBox course={course} isEnrolled={isEnrolled} watched={watched} total={total} pct={pct} error={error} enrolling={enrolling} enroll={enroll} progress={progress} courseId={id} />
          </div>

          {course.description && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-1">Descripción</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{course.description}</p>
            </div>
          )}

          <div className="card p-4">
            <p className="text-sm font-semibold mb-3">Contenido ({total} lecciones)</p>
            <div className="space-y-1.5">
              {course.lessons?.map((l, i) => {
                const done = progress?.progress?.find(p => p.lessonId === l.id)?.watched
                return (
                  <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${done ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="text-sm flex-1 line-clamp-1">{l.title}</span>
                    {!isEnrolled && i > 0 && <span className="text-xs text-slate-400 shrink-0">bloqueado</span>}
                  </div>
                )
              })}
            </div>
          </div>

          {course.ratings?.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold mb-3">Opiniones</p>
              <div className="space-y-3">
                {course.ratings.map(r => (
                  <div key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{r.user?.name}</span>
                      <span className="text-amber-400 text-xs">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop sidebar CTA */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <CtaBox course={course} isEnrolled={isEnrolled} watched={watched} total={total} pct={pct} error={error} enrolling={enrolling} enroll={enroll} progress={progress} courseId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CtaBox({ course, isEnrolled, watched, total, pct, error, enrolling, enroll, progress, courseId }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3 text-sm">
        <span className="text-slate-500">{course._count?.enrollments} alumnos</span>
        <span className="font-bold text-amber-500">{course.avgRating.toFixed(1)} ★</span>
      </div>
      <div className="text-xs text-slate-500 space-y-1.5 mb-4">
        <div className="flex justify-between"><span>Lecciones</span><span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span></div>
        <div className="flex justify-between"><span>Instructor</span><span className="font-semibold text-slate-700 dark:text-slate-300">{course.teacher?.name}</span></div>
      </div>
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      {isEnrolled ? (
        <div className="space-y-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
            <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-center text-slate-500">{watched}/{total} completadas</p>
          <Link to={`/app/courses/${courseId}/learn`} className="btn-primary w-full">
            {watched === 0 ? 'Comenzar' : 'Continuar'}
          </Link>
          {progress?.enrollment?.completed && (
            <Link to="/app/certificates" className="btn-secondary w-full text-xs">Ver certificado</Link>
          )}
        </div>
      ) : (
        <button onClick={enroll} disabled={enrolling} className="btn-primary w-full">
          {enrolling ? 'Inscribiendo...' : 'Inscribirme'}
        </button>
      )}
    </div>
  )
}
