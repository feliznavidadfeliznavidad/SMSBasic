import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ClassManagement from "./pages/ClassManagement";
import UserManagement from "./pages/UserManagement";
import Unauthorized from "./pages/Unauthorized";
import ClassesLecture from "./pages/ClassesLecture";
import ClassesStudent from "./pages/ClassesStudent";

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
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <ClassManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes_lecturer"
            element={
              <ProtectedRoute>
                <ClassesLecture />
              </ProtectedRoute>
            }
          />

          <Route
            path="/classes_student"
            element={
              <ProtectedRoute>
                <ClassesStudent />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;