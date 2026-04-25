import { useEffect, useState } from 'react'
import api from '../../utils/api'

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/admin/reports').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  const sorted = [...(data?.courses || [])].sort((a, b) => b.avgRating - a.avgRating)

  return (
    <div>
      <h1 className="page-title">Reportes</h1>
      <p className="page-subtitle">Cursos ordenados por calificacion de la comunidad</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4"><p className="label">Usuarios</p><p className="font-display font-bold text-2xl">{data?.totalUsers || 0}</p></div>
        <div className="card p-4"><p className="label">Inscripciones</p><p className="font-display font-bold text-2xl">{data?.totalEnrollments || 0}</p></div>
        <div className="card p-4"><p className="label">Cursos</p><p className="font-display font-bold text-2xl">{sorted.length}</p></div>
      </div>

      <div className="space-y-3">
        {sorted.map((course, idx) => (
          <div key={course.id} className="card overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === course.id ? null : course.id)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 shrink-0">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{course.title}</p>
                <p className="text-xs text-slate-500">{course.teacher?.name}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0 text-sm">
                <div className="text-center hidden sm:block">
                  <p className="font-bold">{course._count?.enrollments || 0}</p>
                  <p className="text-xs text-slate-400">Inscritos</p>
                </div>
                <div className="text-center hidden sm:block">
                  <p className="font-bold">{course._count?.ratings || 0}</p>
                  <p className="text-xs text-slate-400">Resenas</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-amber-500">{course.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-slate-400">Promedio</p>
                </div>
                <span className="text-slate-400 text-xs">{expanded === course.id ? 'cerrar' : 'ver'}</span>
              </div>
            </button>

            {expanded === course.id && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Comentarios</p>
                {course.ratings?.length === 0 ? (
                  <p className="text-slate-400 text-sm">Sin calificaciones aun</p>
                ) : (
                  <div className="space-y-3">
                    {course.ratings.map(r => (
                      <div key={r.id} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">
                          {r.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{r.user?.name}</span>
                            <span className="text-amber-400 text-xs">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
