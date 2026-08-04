import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/router/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TrainingCompletionPage = lazy(() => import("@/pages/TrainingCompletionPage"));
const AssignedStudentsPage = lazy(() => import("@/pages/AssignedStudentsPage"));
const StudentDetailPage = lazy(() => import("@/pages/StudentDetailPage"));
const StartTrainingPage = lazy(() => import("@/pages/StartTrainingPage"));

const EvaluationPage = lazy(() => import("@/pages/EvaluationPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<AssignedStudentsPage />} />
            <Route
              path="/students/:studentId"
              element={<StudentDetailPage />}
            />
            <Route
              path="/students/:studentId/start-training"
              element={<StartTrainingPage />}
            />
            <Route
              path="/students/:studentId/evaluate"
              element={<EvaluationPage />}
            />
            <Route
              path="/students/:studentId/evaluation"
              element={<EvaluationPage />}
            />

            <Route path="/completion" element={<TrainingCompletionPage />} />
            <Route path="/training-completion" element={<TrainingCompletionPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
