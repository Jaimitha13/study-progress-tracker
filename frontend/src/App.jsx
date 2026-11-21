
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

// Authentication pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layouts
import LearnerLayout from './layouts/LearnerLayout';
import MentorLayout from './layouts/MentorLayout';

// Learner pages
import Dashboard from './pages/learner/Dashboard';
import Goals from './pages/learner/Goals';
import GoalDetails from './pages/learner/GoalDetails';
import StudySessionForm from './pages/learner/StudySessionForm';
import StudyHistory from './pages/learner/StudyHistory';
import Profile from './pages/learner/Profile';

// Mentor pages
import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorStudents from './pages/mentor/MentorStudents';
import MentorStudentDetails from './pages/mentor/MentorStudentDetails';
import MentorSettings from './pages/mentor/MentorSettings';

// Application Routes
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* Home Route */}
      <Route
        path="/"
        element={
          <Navigate
            to={user ? `/${user.role}/dashboard` : '/login'}
            replace
          />
        }
      />

      {/* Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Register */}
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* ================= LEARNER ROUTES ================= */}

      <Route
        path="/learner"
        element={
          user?.role === 'learner' ? (
            <LearnerLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Learner Dashboard */}
        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        {/* My Goals */}
        <Route
          path="goals"
          element={<Goals />}
        />

        {/* Goal Details */}
        <Route
          path="goals/:goalId"
          element={<GoalDetails />}
        />

        {/* Create Study Session */}
        <Route
          path="study-session"
          element={<StudySessionForm />}
        />

        {/* Edit Study Session */}
        <Route
          path="study-session/:sessionId/edit"
          element={<StudySessionForm />}
        />

        {/* Study History */}
        <Route
          path="study-history"
          element={<StudyHistory />}
        />

        {/* Learner Profile */}
        <Route
          path="profile"
          element={<Profile />}
        />

      </Route>

      {/* ================= MENTOR ROUTES ================= */}

      <Route
        path="/mentor"
        element={
          user?.role === 'mentor' ? (
            <MentorLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />

        {/* Mentor Dashboard */}
        <Route
          path="dashboard"
          element={<MentorDashboard />}
        />

        {/* Assigned Students */}
        <Route
          path="students"
          element={<MentorStudents />}
        />

        {/* Individual Student Progress */}
        <Route
          path="students/:studentId"
          element={<MentorStudentDetails />}
        />

        {/* Mentor Application Settings */}
        <Route
          path="settings"
          element={<MentorSettings />}
        />

      </Route>

      {/* Invalid Routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
