import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { seedUseCases, seedPrompts } from './data/seed';
import * as useCaseService from './services/useCaseService';
import * as promptService from './services/promptService';
import { AppLayout } from './components/layout';
import { ToastProvider } from './components/ui/ToastContainer';
import DashboardPage from './pages/DashboardPage';
import UseCasesPage from './pages/UseCasesPage';
import UseCaseDetailPage from './pages/UseCaseDetailPage';
import NewUseCasePage from './pages/NewUseCasePage';
import PromptsPage from './pages/PromptsPage';
import PromptDetailPage from './pages/PromptDetailPage';
import NewPromptPage from './pages/NewPromptPage';

function App() {
  useEffect(() => {
    if (!useCaseService.isSeeded()) {
      useCaseService.seedUseCases(seedUseCases);
    }
    if (!promptService.isSeeded()) {
      promptService.seedPrompts(seedPrompts);
    }
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            <Route path="/use-cases/new" element={<NewUseCasePage />} />
            <Route path="/use-cases/:id" element={<UseCaseDetailPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/prompts/new" element={<NewPromptPage />} />
            <Route path="/prompts/:id" element={<PromptDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
