import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import ClientLayout from './layouts/ClientLayout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import PortfolioPage from './pages/PortfolioPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import TrackingLandingPage from './pages/TrackingLandingPage'
import TrackingPage from './pages/TrackingPage'
import SetPasswordPage from './pages/SetPasswordPage'
import AdminDashboardOverview from './pages/admin/DashboardOverview'
import AdminUserList from './pages/admin/UserList'
import ProjectList from './pages/admin/ProjectList'
import CreateProjectPage from './pages/admin/CreateProjectPage'
import EditProjectPage from './pages/admin/EditProjectPage'
import ProjectTrackingPage from './pages/admin/ProjectTrackingPage'
import TrackingListPage from './pages/admin/TrackingListPage'
import SettingsPage from './pages/admin/SettingsPage'
import ClientDashboardHome from './pages/client/ClientDashboardHome'
import MyProjectsPage from './pages/client/MyProjectsPage'
import ClientProjectDetailPage from './pages/client/ClientProjectDetailPage'
import ClientPortfolioPage from './pages/client/ClientPortfolioPage'
import ClientSettingsPage from './pages/client/ClientSettingsPage'
import NotificationsPage from './pages/client/NotificationsPage'
import BillingPage from './pages/client/BillingPage'
import ClientInvoiceDetailPage from './pages/client/InvoiceDetailPage'
import ClientCreateProjectPage from './pages/client/CreateProjectPage'
import MyRequestsPage from './pages/client/MyRequestsPage'
import ReleaseNotesPage from './pages/admin/ReleaseNotesPage'
import CreateReleaseNotePage from './pages/admin/CreateReleaseNotePage'
import EditReleaseNotePage from './pages/admin/EditReleaseNotePage'
import ClientGroupsPage from './pages/admin/ClientGroupsPage'
import CreateClientGroupPage from './pages/admin/CreateClientGroupPage'
import EditClientGroupPage from './pages/admin/EditClientGroupPage'
import InvoiceListPage from './pages/admin/InvoiceListPage'
import CreateInvoicePage from './pages/admin/CreateInvoicePage'
import EditInvoicePage from './pages/admin/EditInvoicePage'
import AdminInvoiceDetailPage from './pages/admin/InvoiceDetailPage'
import ProcessRefundPage from './pages/admin/ProcessRefundPage'
import TaxRatesPage from './pages/admin/TaxRatesPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public tracking page (standalone, no layout) */}
      <Route path="/track/:code" element={<TrackingPage />} />

      {/* Set password page for invited users and password reset (standalone, no layout) */}
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/reset-password" element={<SetPasswordPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/track" element={<TrackingLandingPage />} />
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
        <Route path="projects/:projectId/tracking" element={<ProjectTrackingPage />} />
        <Route path="tracking" element={<TrackingListPage />} />
        <Route path="release-notes" element={<ReleaseNotesPage />} />
        <Route path="release-notes/new" element={<CreateReleaseNotePage />} />
        <Route path="release-notes/:id/edit" element={<EditReleaseNotePage />} />
        <Route path="client-groups" element={<ClientGroupsPage />} />
        <Route path="client-groups/new" element={<CreateClientGroupPage />} />
        <Route path="client-groups/:id/edit" element={<EditClientGroupPage />} />
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="invoices/new" element={<CreateInvoicePage />} />
        <Route path="invoices/:id" element={<AdminInvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<EditInvoicePage />} />
        <Route path="invoices/:id/refund" element={<ProcessRefundPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/tax-rates" element={<TaxRatesPage />} />
      </Route>

      {/* Client Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboardHome />} />
        <Route path="projects" element={<MyProjectsPage />} />
        <Route path="projects/new" element={<ClientCreateProjectPage />} />
        <Route path="projects/:id" element={<ClientProjectDetailPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="portfolio" element={<ClientPortfolioPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="billing/:id" element={<ClientInvoiceDetailPage />} />
        <Route path="settings" element={<ClientSettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  )
}

