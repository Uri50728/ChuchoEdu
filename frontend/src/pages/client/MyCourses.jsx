import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/my-courses').then(r => setEnrollments(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-3xl mb-2">Mis cursos</h1>
      <p className="text-slate-500 mb-8">Tu progreso de aprendizaje</p>

      {enrollments.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📚</div>
          <p className="font-semibold text-slate-600 dark:text-slate-400 mb-4">No estás inscrito en ningún curso</p>
          <Link to="/app" className="btn-primary">Explorar cursos</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(e => (
            <div key={e.id} className="card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-slate-800 flex items-center justify-center text-5xl">
                {e.course.thumbnail
                  ? <img src={e.course.thumbnail} alt={e.course.title} className="w-full h-full object-cover" />
                  : '🎓'}
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold mb-1 line-clamp-2">{e.course.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{e.course.teacher?.name}</p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{e.course._count?.lessons || e.course.lessons?.length || 0} lecciones</span>
                  {e.completed
                    ? <span className="badge bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">✓ Completado</span>
                    : <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">En progreso</span>
                  }
                </div>

                <Link to={`/app/courses/${e.courseId}/learn`} className="btn-primary block text-center text-sm">
                  {e.completed ? '▶ Revisar' : '▶ Continuar'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
