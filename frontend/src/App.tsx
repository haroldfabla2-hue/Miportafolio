import React from 'react';
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

import JoinPage from './admin/pages/JoinPage';
import OnboardingPage from './admin/pages/OnboardingPage';

// Admin (Iris CRM) imports
import AdminLayout from './admin/layouts/AdminLayout';
import LoginPage from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import AdminProjectsPage from './admin/pages/Projects';
import ProjectDetail from './admin/pages/ProjectDetail';
import AdminClientsPage from './admin/pages/Clients';
import AdminTasksPage from './admin/pages/Tasks';
import ChatPage from './admin/pages/Chat';
import AdminEmailPage from './admin/pages/Email';
import NotificationsPage from './admin/pages/Notifications';
import AdminFilesPage from './admin/pages/Files';
import AdminAssetsPage from './admin/pages/Assets';
import AdminSettingsPage from './admin/pages/Settings';
import AdminIrisPage from './admin/pages/Iris';
import AdminOraclePage from './admin/pages/Oracle';
import AdminPipelinePage from './admin/pages/Pipeline';
import AdminUsersPage from './admin/pages/Users';
import AdminFinancePage from './admin/pages/Finance';
import AdminTicketsPage from './admin/pages/Tickets';
import BillManager from './admin/pages/BillManager';
import InvoiceDesigner from './admin/pages/InvoiceDesigner';
import RoleManagement from './admin/pages/RoleManagement';
import ContentManager from './admin/pages/ContentManager';
import ContentEditor from './admin/pages/ContentEditor';
import ReportsHub from './admin/pages/ReportsHub';

import { SocketProvider } from './context/SocketContext';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInviteRoute = location.pathname.startsWith('/invite');

  // Admin and Invite routes - separate from public site
  if (isAdminRoute || isInviteRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/invite/:token" element={<JoinPage />} />
        <Route path="/admin" element={
          <SocketProvider>
            <AdminLayout />
          </SocketProvider>
        }>
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
          <Route path="cms" element={<ContentManager />} />
          <Route path="cms/new/:type" element={<ContentEditor />} />
          <Route path="cms/edit/:id" element={<ContentEditor />} />
        </Route>
      </Routes>
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
