import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginUser from "./pages/LoginUser";
import RegisterUser from "./pages/RegisterUser";
import LoginAdmin from "./pages/LoginAdmin";
import RegisterAdmin from "./pages/RegisterAdmin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserDashboard from "./pages/User/UserDashboard";
import StudyGroups from "./pages/User/StudyGroups";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminGroups from "./pages/Admin/AdminGroups";
import AdminContent from "./pages/Admin/AdminContent";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import UserNotes from "./pages/User/UserNotes";
import UserQuizzes from "./pages/User/UserQuizzes";
import UserResources from "./pages/User/UserResources";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/user" element={<LoginUser />} />
        <Route path="/register/user" element={<RegisterUser />} />
        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/register/admin" element={<RegisterAdmin />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute>
              <AdminGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute>
              <AdminContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <StudyGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <UserNotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <UserQuizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <UserResources />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
