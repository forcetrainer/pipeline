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
import MySubmissionsPage from './pages/MySubmissionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PendingReviewsPage from './pages/admin/PendingReviewsPage';
import DeniedItemsPage from './pages/admin/DeniedItemsPage';
import MyAssessmentsPage from './pages/assessments/MyAssessmentsPage';
import NewAssessmentPage from './pages/assessments/NewAssessmentPage';
import AssessmentDetailPage from './pages/assessments/AssessmentDetailPage';
import AssessmentEvaluatePage from './pages/assessments/AssessmentEvaluatePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Login route - no sidebar/layout */}
            <Route path="/login" element={<LoginPage />} />

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

export default App;
