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
import PromptsPage from './pages/PromptsPage';
import PromptDetailPage from './pages/PromptDetailPage';
import NewPromptPage from './pages/NewPromptPage';
import LoginPage from './pages/LoginPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import PendingReviewsPage from './pages/admin/PendingReviewsPage';
import DeniedItemsPage from './pages/admin/DeniedItemsPage';

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
                <Route path="/prompts" element={<PromptsPage />} />
                <Route path="/prompts/new" element={<NewPromptPage />} />
                <Route path="/prompts/:id" element={<PromptDetailPage />} />
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
