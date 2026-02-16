// React is auto-imported by JSX transform
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Noise from './components/Noise';
import Cursor from './components/Cursor';
import Preloader from './components/Preloader';
import { ReactLenis } from 'lenis/react';

import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import ProjectsPage from './components/ProjectsPage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import ScrollToTop from './components/ScrollToTop';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';

// Admin pages — lazy-loaded for code splitting
const JoinPage = lazy(() => import('./admin/pages/JoinPage'));
const OnboardingPage = lazy(() => import('./admin/pages/OnboardingPage'));
const AdminLayout = lazy(() => import('./admin/layouts/AdminLayout'));
const LoginPage = lazy(() => import('./admin/pages/Login'));
const Dashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminProjectsPage = lazy(() => import('./admin/pages/Projects'));
const ProjectDetail = lazy(() => import('./admin/pages/ProjectDetail'));
const AdminClientsPage = lazy(() => import('./admin/pages/Clients'));
const AdminTasksPage = lazy(() => import('./admin/pages/Tasks'));
const ChatPage = lazy(() => import('./admin/pages/Chat'));
const AdminEmailPage = lazy(() => import('./admin/pages/Email'));
const NotificationsPage = lazy(() => import('./admin/pages/Notifications'));
const AdminFilesPage = lazy(() => import('./admin/pages/Files'));
const AdminAssetsPage = lazy(() => import('./admin/pages/Assets'));
const AdminSettingsPage = lazy(() => import('./admin/pages/Settings'));
const AdminIrisPage = lazy(() => import('./admin/pages/Iris'));
const AdminOraclePage = lazy(() => import('./admin/pages/Oracle'));
const AdminPipelinePage = lazy(() => import('./admin/pages/PipelineView'));
const AdminUsersPage = lazy(() => import('./admin/pages/Users'));
const AdminCalendarPage = lazy(() => import('./admin/pages/CalendarView'));
const AdminFinancePage = lazy(() => import('./admin/pages/Finance'));
const AdminTicketsPage = lazy(() => import('./admin/pages/Tickets'));
const BillManager = lazy(() => import('./admin/pages/BillManager'));
const InvoiceDesigner = lazy(() => import('./admin/pages/InvoiceDesigner'));
const RoleManagement = lazy(() => import('./admin/pages/RoleManagement'));
const ContentManager = lazy(() => import('./admin/pages/ContentManager'));
const ContentEditor = lazy(() => import('./admin/pages/ContentEditor'));
const ReportsHub = lazy(() => import('./admin/pages/ReportsHub'));
const ActivityLogsPage = lazy(() => import('./admin/pages/ActivityLogs'));
const SystemHealthPage = lazy(() => import('./admin/pages/SystemHealth'));

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { StoreProvider } from './context/StoreContext';

// Loading fallback for lazy-loaded admin pages
const AdminLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0a0a0a', color: '#666', fontSize: '0.9rem'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 32, height: 32, border: '2px solid #333',
        borderTopColor: '#A3FF00', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
      }} />
      Loading...
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInviteRoute = location.pathname.startsWith('/invite');

  // Admin and Invite routes - separate from public site
  if (isAdminRoute || isInviteRoute) {
    return (
      <Suspense fallback={<AdminLoader />}>
        <AuthProvider>
          <SocketProvider>
            <StoreProvider>
              <Routes>
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/invite/:token" element={<JoinPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="onboarding" element={<OnboardingPage />} />
                  <Route path="projects" element={<AdminProjectsPage />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="clients" element={<AdminClientsPage />} />
                  <Route path="tasks" element={<AdminTasksPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="messages" element={<ChatPage />} />
                  <Route path="email" element={<AdminEmailPage />} />
                  <Route path="files" element={<AdminFilesPage />} />
                  <Route path="assets" element={<AdminAssetsPage />} />
                  <Route path="finance" element={<AdminFinancePage />} />
                  <Route path="finance/bills" element={<BillManager />} />
                  <Route path="finance/invoice-designer" element={<InvoiceDesigner />} />
                  <Route path="pipeline" element={<AdminPipelinePage />} />
                  <Route path="iris" element={<AdminIrisPage />} />
                  <Route path="oracle" element={<AdminOraclePage />} />
                  <Route path="reports" element={<ReportsHub />} />
                  <Route path="tickets" element={<AdminTicketsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="settings/roles" element={<RoleManagement />} />
                  <Route path="activity-logs" element={<ActivityLogsPage />} />
                  <Route path="calendar" element={<AdminCalendarPage />} />
                  <Route path="system-health" element={<SystemHealthPage />} />
                  <Route path="cms" element={<ContentManager />} />
                  <Route path="cms/new/:type" element={<ContentEditor />} />
                  <Route path="cms/edit/:id" element={<ContentEditor />} />
                </Route>
              </Routes>
            </StoreProvider>
          </SocketProvider>
        </AuthProvider>
      </Suspense>
    );
  }

  // Public portfolio site
  return (
    <ReactLenis root>
      <div className="app">
        <Preloader />
        <Noise />
        <Cursor />
        <Layout>
          <Navbar />
          <ScrollToTop />
          <main>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </Layout>
      </div>
    </ReactLenis>
  );
}

export default App;
