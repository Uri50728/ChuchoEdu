import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Public
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

// Client
import ClientLayout from './pages/client/Layout'
import ClientHome from './pages/client/Home'
import CourseDetail from './pages/client/CourseDetail'
import LearnCourse from './pages/client/LearnCourse'
import MyCourses from './pages/client/MyCourses'
import Profile from './pages/client/Profile'
import Certificates from './pages/client/Certificates'

// Admin
import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTeachers from './pages/admin/Teachers'
import AdminCourses from './pages/admin/Courses'
import AdminReports from './pages/admin/Reports'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function Spinner() {
  return (
    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Client */}
            <Route path="/app" element={<PrivateRoute><ClientLayout /></PrivateRoute>}>
              <Route index element={<ClientHome />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="courses/:id/learn" element={<LearnCourse />} />
              <Route path="my-courses" element={<MyCourses />} />
              <Route path="profile" element={<Profile />} />
              <Route path="certificates" element={<Certificates />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="reports" element={<AdminReports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
