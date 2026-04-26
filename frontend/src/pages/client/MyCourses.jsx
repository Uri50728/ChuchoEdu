import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/my-courses').then(r => setEnrollments(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="page-title">Mis cursos</h1>
      <p className="page-subtitle">Tu progreso de aprendizaje</p>

      {enrollments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm mb-4">No estás inscrito en ningún curso</p>
          <Link to="/app" className="btn-primary">Explorar cursos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(e => (
            <div key={e.id} className="card overflow-hidden">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800">
                {e.course.thumbnail && <img src={e.course.thumbnail} alt={e.course.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="font-semibold text-sm mb-0.5 line-clamp-2">{e.course.title}</p>
                <p className="text-xs text-slate-500 mb-3">{e.course.teacher?.name}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">{e.course.lessons?.length || 0} lecciones</span>
                  <span className={`badge text-xs ${e.completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {e.completed ? 'Completado' : 'En progreso'}
                  </span>
                </div>
                <Link to={`/app/courses/${e.courseId}/learn`} className="btn-primary w-full text-xs">
                  {e.completed ? 'Revisar' : 'Continuar'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
