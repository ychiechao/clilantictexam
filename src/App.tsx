// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProblemPage from './pages/ProblemPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPage from './pages/AdminPage'
import { useAuthStore } from './stores/authStore'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const initialized = useAuthStore(s => s.initialized)
  if (!initialized) return null
  if (!user?.isAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="problem/:id" element={<ProblemPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="admin" element={
          <RequireAdmin><AdminPage /></RequireAdmin>
        } />
      </Route>
    </Routes>
  )
}
