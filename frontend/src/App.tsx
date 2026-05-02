import { Navigate, Route, Routes } from 'react-router-dom'
import { CharityDetailPage } from './pages/CharityDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { PaymentPage } from './pages/PaymentPage'
import { QuestionnairePage } from './pages/QuestionnairePage'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthed = localStorage.getItem('altru_authed') === 'true'
  return isAuthed ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/questionnaire"
        element={
          <ProtectedRoute>
            <QuestionnairePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/charity/:id"
        element={
          <ProtectedRoute>
            <CharityDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:id"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
