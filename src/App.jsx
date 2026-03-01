import { Routes, Route } from 'react-router-dom'
import Background from './components/Background'
import RegistrationPage from './pages/RegistrationPage'
import AssessmentPage from './pages/AssessmentPage'
import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import QuizPage from './pages/QuizPage'
import CareerPage from './pages/CareerPage'
import UploadPage from './pages/UploadPage'

export default function App() {
  return (
    <>
      <Background />
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </>
  )
}
