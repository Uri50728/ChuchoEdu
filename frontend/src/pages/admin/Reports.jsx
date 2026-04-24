import { useEffect, useState } from 'react'
import api from '../../utils/api'

function Stars({ value }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(value) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>★</span>
      ))}
    </span>
  )
}

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState(null)

  useEffect(() => {
    api.get('/admin/reports').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  const sorted = data?.courses?.sort((a, b) => b.avgRating - a.avgRating) || []

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-3xl mb-2">Reportes</h1>
      <p className="text-slate-500 mb-8">Cursos más aceptados por la comunidad</p>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold font-display">{data?.totalUsers || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Usuarios totales</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold font-display">{data?.totalEnrollments || 0}</p>
          <p className="text-sm text-slate-500 mt-1">Inscripciones totales</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-3xl font-bold font-display">{sorted.length}</p>
          <p className="text-sm text-slate-500 mt-1">Cursos publicados</p>
        </div>
      </div>

      <div className="space-y-4">
        {sorted.map((course, idx) => (
          <div key={course.id} className="card overflow-hidden">
            <button
              onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                idx === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-800' :
                idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                'bg-slate-50 text-slate-400 dark:bg-slate-800/50'
              }`}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold truncate">{course.title}</h3>
                <p className="text-sm text-slate-500">{course.teacher?.name} · {course.teacher?.specialty}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-sm">
                <div className="text-center hidden sm:block">
                  <p className="font-bold">{course._count?.enrollments || 0}</p>
                  <p className="text-xs text-slate-400">Inscritos</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-bold">{course._count?.ratings || 0}</p>
                  <p className="text-xs text-slate-400">Reseñas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Stars value={course.avgRating} />
                    <span className="font-bold ml-1">{course.avgRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-slate-400">Promedio</p>
                </div>
                <span className="text-slate-400">{expandedCourse === course.id ? '▲' : '▼'}</span>
              </div>
            </button>

            {expandedCourse === course.id && course.ratings?.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/30">
                <h4 className="font-semibold text-sm mb-3 text-slate-600 dark:text-slate-400">Comentarios de estudiantes</h4>
                <div className="space-y-3">
                  {course.ratings.map(r => (
                    <div key={r.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">
                        {r.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm">{r.user?.name}</span>
                          <Stars value={r.stars} />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expandedCourse === course.id && course.ratings?.length === 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-5 text-center text-slate-400 text-sm bg-slate-50/50 dark:bg-slate-800/30">
                Sin calificaciones aún
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
