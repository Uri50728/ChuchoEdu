import { useEffect, useState } from 'react'
import api from '../../utils/api'

function Stat({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display font-bold text-3xl">{value}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/reports')])
      .then(([s, r]) => { setStats(s.data); setRecent(r.data.recentRatings || []) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Resumen general de la plataforma</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Usuarios" value={stats?.users || 0} />
        <Stat label="Cursos" value={stats?.courses || 0} />
        <Stat label="Inscripciones" value={stats?.enrollments || 0} />
        <Stat label="Rating promedio" value={stats?.avgRating ? stats.avgRating.toFixed(1) : '—'} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-4">Ultimas calificaciones</h2>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm">Sin calificaciones aun</p>
        ) : (
          <div className="space-y-3">
            {recent.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">
                  {r.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{r.user?.name}</span>
                    <span className="text-amber-400 text-xs">{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-0.5">{r.course?.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
