import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import QuestionFormPage from './pages/QuestionFormPage';
import NotesPage from './pages/NotesPage';
import NoteDetailPage from './pages/NoteDetailPage';
import NoteFormPage from './pages/NoteFormPage';
import QnaPage from './pages/QnaPage';
import QnaDetailPage from './pages/QnaDetailPage';
import QnaFormPage from './pages/QnaFormPage';
import FlashcardsPage from './pages/FlashcardsPage';
import FlashcardFormPage from './pages/FlashcardFormPage';
import FlashcardStudyPage from './pages/FlashcardStudyPage';
import QuizSetupPage from './pages/QuizSetupPage';
import QuizPlayPage from './pages/QuizPlayPage';
import QuizResultPage from './pages/QuizResultPage';
import WrongAnswersPage from './pages/WrongAnswersPage';
import ProgressPage from './pages/ProgressPage';
import PlannerPage from './pages/PlannerPage';
import PomodoroPage from './pages/PomodoroPage';
import StatsPage from './pages/StatsPage';
import RankingPage from './pages/RankingPage';
import NotFoundPage from './pages/NotFoundPage';

const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-400 text-sm mt-2">다음 회차에서 개발 예정입니다</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/questions" element={<PrivateRoute><QuestionsPage /></PrivateRoute>} />
          <Route path="/questions/new" element={<PrivateRoute><QuestionFormPage /></PrivateRoute>} />
          <Route path="/questions/:id" element={<PrivateRoute><QuestionDetailPage /></PrivateRoute>} />
          <Route path="/questions/:id/edit" element={<PrivateRoute><QuestionFormPage /></PrivateRoute>} />
          <Route path="/notes" element={<PrivateRoute><NotesPage /></PrivateRoute>} />
          <Route path="/notes/new" element={<PrivateRoute><NoteFormPage /></PrivateRoute>} />
          <Route path="/notes/:id" element={<PrivateRoute><NoteDetailPage /></PrivateRoute>} />
          <Route path="/notes/:id/edit" element={<PrivateRoute><NoteFormPage /></PrivateRoute>} />
          <Route path="/qna" element={<PrivateRoute><QnaPage /></PrivateRoute>} />
          <Route path="/qna/new" element={<PrivateRoute><QnaFormPage /></PrivateRoute>} />
          <Route path="/qna/:id" element={<PrivateRoute><QnaDetailPage /></PrivateRoute>} />
          <Route path="/flashcards" element={<PrivateRoute><FlashcardsPage /></PrivateRoute>} />
          <Route path="/flashcards/new" element={<PrivateRoute><FlashcardFormPage /></PrivateRoute>} />
          <Route path="/flashcards/:id/edit" element={<PrivateRoute><FlashcardFormPage /></PrivateRoute>} />
          <Route path="/flashcards/:id/study" element={<PrivateRoute><FlashcardStudyPage /></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute><QuizSetupPage /></PrivateRoute>} />
          <Route path="/quiz/play" element={<PrivateRoute><QuizPlayPage /></PrivateRoute>} />
          <Route path="/quiz/result" element={<PrivateRoute><QuizResultPage /></PrivateRoute>} />
          <Route path="/wrong-answers" element={<PrivateRoute><WrongAnswersPage /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />
          <Route path="/planner" element={<PrivateRoute><PlannerPage /></PrivateRoute>} />
          <Route path="/pomodoro" element={<PrivateRoute><PomodoroPage /></PrivateRoute>} />
          <Route path="/ranking" element={<PrivateRoute><RankingPage /></PrivateRoute>} />
          <Route path="/stats" element={<PrivateRoute><StatsPage /></PrivateRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
