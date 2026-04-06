import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { ToastProvider } from './components/ui/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import DashboardPage from './pages/DashboardPage';
import UseCasesPage from './pages/UseCasesPage';
import UseCaseDetailPage from './pages/UseCaseDetailPage';
import NewUseCasePage from './pages/NewUseCasePage';
import EditUseCasePage from './pages/EditUseCasePage';
import PromptsPage from './pages/PromptsPage';
import PromptDetailPage from './pages/PromptDetailPage';
import NewPromptPage from './pages/NewPromptPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SetupPage from './pages/SetupPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PendingReviewsPage from './pages/admin/PendingReviewsPage';
import DeniedItemsPage from './pages/admin/DeniedItemsPage';
import MyAssessmentsPage from './pages/assessments/MyAssessmentsPage';
import NewAssessmentPage from './pages/assessments/NewAssessmentPage';
import AssessmentDetailPage from './pages/assessments/AssessmentDetailPage';
import AssessmentEvaluatePage from './pages/assessments/AssessmentEvaluatePage';
import { getSetupStatus } from './services/setupService';

function AppInner() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSetupStatus()
      .then((result) => {
        if (!cancelled) setNeedsSetup(result.needsSetup);
      })
      .catch(() => {
        // If setup check fails, assume setup is done and let normal auth handle it
        if (!cancelled) setNeedsSetup(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Show loading screen while checking setup status
  if (needsSetup === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--nx-void-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            color: 'var(--nx-text-tertiary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  // If setup is needed, only show the setup page
  if (needsSetup) {
    return (
      <BrowserRouter>
        <ToastProvider>
          <Routes>
            <Route path="*" element={<SetupPage />} />
          </Routes>
        </ToastProvider>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Setup route — accessible but will redirect if already set up */}
            <Route path="/setup" element={<SetupPage />} />

            {/* Login route - no sidebar/layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/use-cases" element={<UseCasesPage />} />
                <Route path="/use-cases/new" element={<NewUseCasePage />} />
                <Route path="/use-cases/:id" element={<UseCaseDetailPage />} />
                <Route path="/use-cases/:id/edit" element={<EditUseCasePage />} />
                <Route path="/prompts" element={<PromptsPage />} />
                <Route path="/prompts/new" element={<NewPromptPage />} />
                <Route path="/prompts/:id" element={<PromptDetailPage />} />
                <Route path="/assessments" element={<MyAssessmentsPage />} />
                <Route path="/assessments/new" element={<NewAssessmentPage />} />
                <Route path="/assessments/:id" element={<AssessmentDetailPage />} />
                <Route path="/assessments/:id/evaluate" element={<AssessmentEvaluatePage />} />
                <Route path="/my-submissions" element={<MySubmissionsPage />} />

                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<UserManagementPage />} />
                  <Route path="/admin/pending" element={<PendingReviewsPage />} />
                  <Route path="/admin/denied" element={<DeniedItemsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  return <AppInner />;
}

export default App;
