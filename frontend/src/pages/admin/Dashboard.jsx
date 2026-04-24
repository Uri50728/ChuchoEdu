import { useEffect, useState } from 'react'
import api from '../../utils/api'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="font-display font-bold text-3xl">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/reports')
    ]).then(([statsRes, reportsRes]) => {
      setStats(statsRes.data)
      setRecent(reportsRes.data.recentRatings || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-3xl mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Resumen de la plataforma</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon="👥" label="Usuarios registrados" value={stats?.users || 0} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600" />
        <StatCard icon="🎓" label="Cursos activos" value={stats?.courses || 0} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600" />
        <StatCard icon="📋" label="Inscripciones totales" value={stats?.enrollments || 0} color="bg-green-100 dark:bg-green-900/30 text-green-600" />
        <StatCard icon="⭐" label="Rating promedio" value={stats?.avgRating ? stats.avgRating.toFixed(1) : '—'} color="bg-amber-100 dark:bg-amber-900/30 text-amber-600" />
      </div>

      <div className="card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Últimas calificaciones</h2>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm">Sin calificaciones aún</p>
        ) : (
          <div className="space-y-3">
            {recent.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-sm font-bold text-brand-700 dark:text-brand-300 shrink-0">
                  {r.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{r.user?.name}</span>
                    <span className="text-amber-400 text-sm">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">{r.course?.title}</p>
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
