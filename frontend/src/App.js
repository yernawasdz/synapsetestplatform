import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import TakeTest from './pages/student/TakeTest';
import TestResult from './pages/student/TestResult';
import MyResults from './pages/student/MyResults';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TestManagement from './pages/teacher/TestManagement';
import TestEditor from './pages/teacher/TestEditor';
import StudentReview from './pages/teacher/StudentReview';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Student Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireRole="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/test/:testId" element={
                <ProtectedRoute requireRole="student">
                  <TakeTest />
                </ProtectedRoute>
              } />
              <Route path="/result/:testId" element={
                <ProtectedRoute requireRole="student">
                  <TestResult />
                </ProtectedRoute>
              } />
              <Route path="/my-results" element={
                <ProtectedRoute requireRole="student">
                  <MyResults />
                </ProtectedRoute>
              } />
              
              {/* Teacher Routes */}
              <Route path="/teacher/dashboard" element={
                <ProtectedRoute requireRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/teacher/tests" element={
                <ProtectedRoute requireRole="teacher">
                  <TestManagement />
                </ProtectedRoute>
              } />
              <Route path="/teacher/tests/:testId/edit" element={
                <ProtectedRoute requireRole="teacher">
                  <TestEditor />
                </ProtectedRoute>
              } />
              <Route path="/teacher/student/:studentId" element={
                <ProtectedRoute requireRole="teacher">
                  <StudentReview />
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;