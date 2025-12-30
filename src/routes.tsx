import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import PortfolioPage from './pages/PortfolioPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AdminDashboardOverview from './pages/admin/DashboardOverview'
import AdminUserList from './pages/admin/UserList'
import ProjectList from './pages/admin/ProjectList'
import CreateProjectPage from './pages/admin/CreateProjectPage'
import EditProjectPage from './pages/admin/EditProjectPage'
import SettingsPage from './pages/admin/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardOverview />} />
        <Route path="users" element={<AdminUserList />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:id/edit" element={<EditProjectPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

