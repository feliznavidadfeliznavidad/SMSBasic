import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                {/* <AccountManagement /> */}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                {/* <ClassManagement /> */}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                {/* <AttendanceManagement /> */}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/grades"
            element={
              <ProtectedRoute>
                {/* <GradeManagement /> */}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;