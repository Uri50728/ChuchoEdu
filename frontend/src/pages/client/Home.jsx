import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(value) ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>★</span>
      ))}
    </span>
  )
}

function CourseCard({ course }) {
  return (
    <Link to={`/app/courses/${course.id}`} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden block">
      <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-slate-800 flex items-center justify-center text-5xl">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          : '🎓'}
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-base mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{course.teacher?.name}</p>
        {course.description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{course.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Stars value={course.avgRating} />
            <span className="text-xs text-slate-500">({course._count?.ratings || 0})</span>
          </div>
          <span className="text-xs text-slate-500">{course._count?.enrollments || 0} alumnos</span>
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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1">Explorar cursos</h1>
        <p className="text-slate-500">Elige tu próxima habilidad</p>
      </div>

      <div className="mb-6">
        <input
          className="input max-w-md"
          placeholder="🔍 Buscar cursos o profesores..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="aspect-video bg-slate-100 dark:bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="font-semibold">No se encontraron cursos</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  )
}
