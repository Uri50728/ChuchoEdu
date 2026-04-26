import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

function Stars({ value }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(Math.round(value))}
      <span className="text-slate-300 dark:text-slate-600">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  )
}

function CourseCard({ course }) {
  return (
    <Link to={`/app/courses/${course.id}`} className="card hover:shadow-md transition-shadow overflow-hidden block">
      <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin portada</div>}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-sm mb-0.5 line-clamp-2">{course.title}</h3>
        <p className="text-xs text-slate-500 mb-2">{course.teacher?.name}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Stars value={course.avgRating} />
            <span>({course._count?.ratings || 0})</span>
          </span>
          <span>{course._count?.enrollments || 0} alumnos</span>
        </div>
      </div>
    </Link>
  )
}

export default function ClientHome() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teacher?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="page-title">Explorar cursos</h1>
      <p className="page-subtitle">Elige tu próxima habilidad</p>

      <input className="input max-w-full md:max-w-sm mb-5" placeholder="Buscar cursos o profesores..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="font-semibold text-sm">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  )
}
